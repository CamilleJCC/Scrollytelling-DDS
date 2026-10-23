// ── SHARED UTILITIES ──────────────────────────────────────────────────────────

// week width is dynamic — set by the Gantt zoom control
let WEEK_W = 56;

function pd(s) { const [y,m,d]=s.split('-').map(Number); return new Date(y,m-1,d); }
function fd(d) { return d.toLocaleDateString('es-ES',{day:'numeric',month:'short'}); }
function taskStatus(t){ return t.status||(t.done?'approved':t.inProgress?'in-progress':'todo'); }
function taskWeight(t){ const s=taskStatus(t); return s==='approved'?1:s==='in-review'?0.75:s==='in-progress'?0.5:0; }
function phasePct(p) { const ts=p.tasks.filter(t=>!t.deliverable); return ts.length ? Math.round(ts.reduce((sum,t)=>sum+taskWeight(t),0)/ts.length*100) : 0; }
function phaseStatus(p) { const c=phasePct(p); if(c===100)return'done'; if(c>0||p.tasks.some(t=>{const s=taskStatus(t);return s==='in-progress'||s==='in-review';}))return'in-progress'; return'todo'; }

function getBounds() {
  const all=PHASES.flatMap(p=>[pd(p.start),pd(p.end)]);
  if(typeof MEETINGS!=='undefined') MEETINGS.forEach(m=>all.push(pd(m.date)));
  const today=new Date(); today.setHours(0,0,0,0);
  let mn=new Date(Math.min(...all));
  if(mn<today) mn=new Date(today);
  let mx=new Date(Math.max(...all));
  const dow=mn.getDay(); mn.setDate(mn.getDate()-(dow===0?6:dow-1));
  mx.setDate(mx.getDate()+(7-(mx.getDay()||7))); return {mn,mx};
}
function getWeeks(mn,mx){
  const w=[]; let d=new Date(mn);
  while(d<=mx){w.push(new Date(d));d.setDate(d.getDate()+7);} return w;
}
function groupMonths(weeks){
  const m={};
  weeks.forEach((w,i)=>{
    const mid=new Date(w); mid.setDate(mid.getDate()+2);
    const k=mid.getFullYear()+'-'+mid.getMonth();
    if(!m[k])m[k]={label:mid.toLocaleDateString('es-ES',{month:'long',year:'numeric'}),indices:[]};
    m[k].indices.push(i);
  }); return Object.values(m);
}
function off(date,mn){ return ((date-mn)/(1000*60*60*24)/7)*WEEK_W; }

// ── AUTO-FIT WEEK WIDTH ───────────────────────────────────────────────────────
// Call once when gantt first loads to fill the available container width.
function autoFitWeekWidth(){
  const container = document.getElementById('ganttView') || document.querySelector('.gantt-outer');
  if (!container) return;
  const {mn,mx} = getBounds();
  const weeks = getWeeks(mn,mx);
  const labelW = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--label-w'))||280;
  const pad = window.innerWidth <= 640 ? 40 : 112; // 2×--pad
  const available = container.offsetWidth - labelW - pad;
  const fit = Math.floor(available / weeks.length);
  // clamp between 28 (tiny) and 120 (very large)
  WEEK_W = Math.max(28, Math.min(120, fit));
}

// ── TOOLTIP ───────────────────────────────────────────────────────────────────
let _tip=null;
function initTooltip(){
  _tip=document.getElementById('tooltip');
  if(!_tip){_tip=document.createElement('div');_tip.className='tooltip';_tip.id='tooltip';document.body.appendChild(_tip);}
}
function showTip(e,text){ if(!_tip)return; _tip.textContent=text; _tip.style.opacity='1'; moveTip(e); }
function moveTip(e){ if(!_tip)return; _tip.style.left=(e.clientX+14)+'px'; _tip.style.top=(e.clientY-36)+'px'; }
function hideTip(){ if(_tip)_tip.style.opacity='0'; }

// ── TOAST ─────────────────────────────────────────────────────────────────────
function showToast(msg){
  let t=document.getElementById('toast');
  if(!t){t=document.createElement('div');t.className='toast';t.id='toast';document.body.appendChild(t);}
  t.textContent=msg; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),3000);
}

// ── SIDE DOCK (phase detail) ──────────────────────────────────────────────────
function openDock(phase){
  if(typeof _dockInMeetingMode!=='undefined' && _dockInMeetingMode){ _restoreDockForPhase(); _dockInMeetingMode=false; }
  const pct=phasePct(phase), status=phaseStatus(phase);
  const PL={todo:'Pendiente','in-progress':'En progreso',done:'Completado'};
  const numMatch=phase.name.match(/^Fase\s*(\d+)/i) || phase.name.match(/^Phase\s*(\d+)/i);
  document.getElementById('dockPhaseNum').textContent = numMatch?'Fase 0'+numMatch[1]:'';
  document.getElementById('dockTitle').textContent    = phase.name.replace(/^Fase \d+:\s*/i,'').replace(/^Phase \d+:\s*/i,'');
  document.getElementById('dockDates').textContent    = fd(pd(phase.start))+' – '+fd(pd(phase.end));
  document.getElementById('dockBigPct').textContent   = pct+'%';
  document.getElementById('dockStatusPill').textContent = PL[status];
  document.getElementById('dockStatusPill').className = 'status-pill '+status;
  const fill=document.getElementById('dockFill'); fill.style.width='0%';
  setTimeout(()=>{ fill.style.width=pct+'%'; },60);
  // Phase description
  const prevDesc=document.getElementById('dockPhaseDesc'); if(prevDesc) prevDesc.remove();
  if(phase.description){
    const descEl=document.createElement('div'); descEl.id='dockPhaseDesc'; descEl.className='dock-phase-desc';
    descEl.textContent=phase.description;
    const statusRow=document.querySelector('.dock-status-row');
    if(statusRow) statusRow.after(descEl);
  }
  const list=document.getElementById('dockTaskList'); list.innerHTML='';
  const SL={'todo':'Pendiente','in-progress':'En progreso','in-review':'En revisión','approved':'Aprobado'};
  const regularTasks=phase.tasks.filter(t=>!t.deliverable);
  const deliverableTasks=phase.tasks.filter(t=>t.deliverable);
  regularTasks.forEach(t=>{
    const li=document.createElement('li'); li.className='dock-task-item';
    const s=taskStatus(t);
    const row=document.createElement('div'); row.className='icon-flex';
    const dot=document.createElement('div'); dot.className=taskDotClass(t);
    const nm=document.createElement('span'); nm.className='dock-task-name'+(s==='approved'?' done':''); nm.textContent=t.name;
    row.appendChild(dot); row.appendChild(nm);
    li.appendChild(row);
    const pill=document.createElement('span'); pill.className='task-pill '+s; pill.textContent=SL[s]||'Pending';
    li.appendChild(pill);
    if(t.clientInput){
      const badge=document.createElement('span'); badge.className='task-action-badge'; badge.textContent='Acción requerida';
      li.appendChild(badge);
    }
    if(t.description){
      const readBtn=document.createElement('button'); readBtn.className='task-read-btn'; readBtn.textContent='Leer descripción';
      const descEl=document.createElement('div'); descEl.className='task-desc-expand'; descEl.textContent=t.description;
      readBtn.addEventListener('click',()=>{ const open=descEl.classList.toggle('open'); readBtn.textContent=open?'Cerrar':'Leer descripción'; });
      li.appendChild(readBtn); li.appendChild(descEl);
    }
    list.appendChild(li);
  });
  if(deliverableTasks.length){
    const hdr=document.createElement('li'); hdr.className='dock-deliverables-header';
    hdr.textContent='Entregables';
    list.appendChild(hdr);
    deliverableTasks.forEach(d=>{
      const li=document.createElement('li'); li.className='dock-deliverable-item';
      const hasPdf=(!d.deliverableType||d.deliverableType==='pdf')&&!!d.deliverableUrl;
      // Outer flex: content left, thumbnail right
      const outer=document.createElement('div'); outer.style.cssText='display:flex;gap:10px;align-items:flex-start;';
      const content=document.createElement('div'); content.style.cssText='flex:1;min-width:0;';
      // Header row: name on left, date badge on right
      const itemHdr=document.createElement('div'); itemHdr.style.cssText='display:flex;align-items:flex-start;justify-content:space-between;gap:8px;';
      const nm=document.createElement('div'); nm.className='dock-deliverable-name';
      nm.textContent=d.name.replace(/^Deliverable:\s*/i,'');
      itemHdr.appendChild(nm);
      if(d.dueDate){
        const parsed=/^\d{4}-\d{2}-\d{2}$/.test(d.dueDate)?pd(d.dueDate):new Date(d.dueDate+' 2026');
        if(!isNaN(parsed.getTime())){
          const badgeWrap=document.createElement('div'); badgeWrap.style.cssText='flex-shrink:0;display:flex;flex-direction:column;align-items:flex-end;gap:3px;'+(hasPdf?'opacity:0.4;':'');
          const badgeLbl=document.createElement('div'); badgeLbl.style.cssText='font-size:9px;letter-spacing:.05em;text-transform:uppercase;color:gray;white-space:nowrap;'; badgeLbl.textContent=hasPdf?'Entregado':'Entrega prevista';
          const badge=document.createElement('div'); badge.className='dock-mc-date'; if(hasPdf)badge.style.textDecoration='line-through';
          const mo=document.createElement('div'); mo.className='dock-mc-month'; mo.textContent=parsed.toLocaleDateString('en-US',{month:'short'}).toUpperCase();
          const day=document.createElement('div'); day.className='dock-mc-day'; day.textContent=parsed.getDate();
          badge.appendChild(mo); badge.appendChild(day); badgeWrap.appendChild(badgeLbl); badgeWrap.appendChild(badge); itemHdr.appendChild(badgeWrap);
        } else {
          const due=document.createElement('div'); due.className='dock-deliverable-due'; due.textContent=(hasPdf?'Entregado: ':'Entrega prevista: ')+d.dueDate;
          if(hasPdf){ due.style.cssText='opacity:0.4;text-decoration:line-through;'; }
          itemHdr.appendChild(due);
        }
      }
      content.appendChild(itemHdr);
      if(d.description){
        const desc=document.createElement('div'); desc.className='dock-deliverable-desc'; desc.textContent=d.description;
        content.appendChild(desc);
      }
      if(d.deliverableUrl){
        const btnLabel=d.deliverableType==='link'?'Abrir enlace':'Ver PDF';
        const lnk=document.createElement('a'); lnk.className='mli-btn primary dock-deliverable-btn';
        lnk.href=d.deliverableUrl; lnk.target='_blank'; lnk.rel='noopener'; lnk.textContent=btnLabel;
        content.appendChild(lnk);
      } else {
        const pend=document.createElement('div'); pend.className='dock-deliverable-pending'; pend.textContent='Pendiente';
        content.appendChild(pend);
      }
      outer.appendChild(content);
      if(hasPdf){
        const thumbWrap=document.createElement('div'); thumbWrap.style.cssText='flex-shrink:0;width:56px;height:72px;overflow:hidden;border:1px solid var(--gray-200);border-radius:var(--r-sm);background:#f0f0f0;position:relative;';
        const canvas=document.createElement('canvas'); canvas.width=112; canvas.height=144; canvas.style.cssText='width:56px;height:auto;display:block;';
        thumbWrap.appendChild(canvas); outer.appendChild(thumbWrap);
        if(typeof pdfjsLib!=='undefined'){
          pdfjsLib.getDocument(d.deliverableUrl).promise.then(pdf=>pdf.getPage(1)).then(page=>{
            const vp=page.getViewport({scale:1});
            const scale=112/vp.width;
            const viewport=page.getViewport({scale});
            canvas.width=Math.round(viewport.width); canvas.height=Math.round(viewport.height);
            page.render({canvasContext:canvas.getContext('2d'),viewport});
          }).catch(()=>{});
        }
      }
      li.appendChild(outer);
      list.appendChild(li);
    });
  }
  // Remove any previous linked-meeting section
  const prevMeet=document.getElementById('dockLinkedMeeting'); if(prevMeet)prevMeet.remove();
  const meetingIds=phase.meetingIds||(phase.meetingId?[phase.meetingId]:[]);
  if(meetingIds.length && typeof MEETINGS!=='undefined'){
    const linkedMs=meetingIds.map(id=>MEETINGS.find(x=>x.id===id)).filter(Boolean);
    if(linkedMs.length){
      const sec=document.createElement('div'); sec.id='dockLinkedMeeting';
      const secTitle=document.createElement('div'); secTitle.className='dock-section-title';
      secTitle.textContent=linkedMs.length>1?'Reuniones vinculadas':'Reunión vinculada';
      sec.appendChild(secTitle);
      linkedMs.forEach(m=>{
        const [hh,mm2]=m.time.split(':').map(Number);
        const ampm=hh>=12?'pm':'am'; const h12=hh%12||12;
        const timeStr=h12+(mm2?':'+String(mm2).padStart(2,'0'):'')+ampm;
        const durStr=m.duration===60?'1 hr':m.duration===90?'1 hr 30 min':m.duration+' min';
        const mEnd=(function(){ const d=pd(m.date); d.setHours(hh,mm2+(m.duration||60),0,0); return d; })();
        const card=document.createElement('div'); card.className='dock-meeting-card'+(mEnd<new Date()?' past':'');
        const cardHead=document.createElement('div'); cardHead.className='dock-mc-header';
        const t1=document.createElement('div'); t1.className='dock-mc-title'; t1.textContent=m.title;
        const dateBadge=document.createElement('div'); dateBadge.className='dock-mc-date';
        const dayMo=document.createElement('div'); dayMo.className='dock-mc-month'; dayMo.textContent=pd(m.date).toLocaleDateString('es-ES',{month:'short'}).toUpperCase();
        const dayNum=document.createElement('div'); dayNum.className='dock-mc-day'; dayNum.textContent=pd(m.date).getDate();
        dateBadge.appendChild(dayMo); dateBadge.appendChild(dayNum);
        cardHead.appendChild(t1); cardHead.appendChild(dateBadge);
        card.appendChild(cardHead);
        const t2=document.createElement('div'); t2.className='dock-mc-meta'; t2.textContent=timeStr+' · '+durStr;
        card.appendChild(t2);
        if(m.description){const t3=document.createElement('div');t3.className='dock-mc-desc';t3.textContent=m.description;card.appendChild(t3);}
        const acts=document.createElement('div'); acts.style.cssText='display:flex;flex-direction:column;gap:6px;margin-top:10px;';
        const gcal=document.createElement('a'); gcal.className='gcal-btn'; gcal.href=gcalLink(m); gcal.target='_blank'; gcal.rel='noopener'; gcal.textContent='+ Añadir a Google Calendar';
        acts.appendChild(gcal);
        if(m.meetLink){const jn=document.createElement('a');jn.className='join-btn';jn.href=m.meetLink;jn.target='_blank';jn.rel='noopener';jn.textContent='Unirse a la reunión';acts.appendChild(jn);}
        card.appendChild(acts);
        sec.appendChild(card);
      });
      list.insertAdjacentElement('afterend',sec);
    }
  }
  document.getElementById('dockOverlay').classList.add('open');
}
function initDock(){
  const ov=document.getElementById('dockOverlay');
  document.getElementById('dockClose').addEventListener('click',()=>ov.classList.remove('open'));
  ov.addEventListener('click',e=>{ if(e.target===ov)ov.classList.remove('open'); });
  document.addEventListener('keydown',e=>{ if(e.key==='Escape') { ov.classList.remove('open'); const co=document.getElementById('crOverlay'); if(co)co.classList.remove('open'); }});
}

// ── SHARED DOT HELPER ─────────────────────────────────────────────────────────
function taskDotClass(t){
  const s=taskStatus(t);
  if(s==='approved')    return 'sub-dot done';
  if(s==='in-progress') return 'sub-dot in-progress';
  if(s==='in-review')   return 'sub-dot in-review';
  return 'sub-dot';
}

// ── GOOGLE CALENDAR LINK ──────────────────────────────────────────────────────
function gcalLink(meeting){
  const [yr,mo,dy]=meeting.date.split('-').map(Number);
  const [hh,mm]=meeting.time.split(':').map(Number);
  const start=new Date(yr,mo-1,dy,hh,mm);
  const end=new Date(start.getTime()+meeting.duration*60000);
  function fmt(d){
    return d.getFullYear()+String(d.getMonth()+1).padStart(2,'0')+String(d.getDate()).padStart(2,'0')
      +'T'+String(d.getHours()).padStart(2,'0')+String(d.getMinutes()).padStart(2,'0')+'00';
  }
  const details=meeting.meetLink ? meeting.description+'\n\nJoin: '+meeting.meetLink : meeting.description;
  const params=new URLSearchParams({action:'TEMPLATE',text:meeting.title,dates:fmt(start)+'/'+fmt(end),details,location:meeting.meetLink||''});
  return 'https://calendar.google.com/calendar/render?'+params.toString();
}

// ── CHANGE REQUEST ────────────────────────────────────────────────────────────
let _crMeeting=null;
function openChangeRequest(meeting){
  _crMeeting=meeting;
  document.getElementById('crMeetingName').textContent=meeting.title;
  document.getElementById('crDate').value=meeting.date;
  document.getElementById('crTime').value=meeting.time;
  document.getElementById('crNote').value='';
  document.getElementById('crOverlay').classList.add('open');
}
function initChangeRequest(){
  const ov=document.getElementById('crOverlay');
  document.getElementById('crClose').addEventListener('click',()=>ov.classList.remove('open'));
  document.getElementById('crCancel').addEventListener('click',()=>ov.classList.remove('open'));
  ov.addEventListener('click',e=>{ if(e.target===ov)ov.classList.remove('open'); });
  document.getElementById('crSend').addEventListener('click',()=>{
    if(!_crMeeting) return;
    const newDate=document.getElementById('crDate').value;
    const newTime=document.getElementById('crTime').value;
    const note=document.getElementById('crNote').value.trim();
    const email=typeof YOUR_EMAIL!=='undefined'?YOUR_EMAIL:'';
    const subject=encodeURIComponent('Solicitud de cambio de reunión: '+_crMeeting.title);
    const body=encodeURIComponent(
      'Hola,\n\nMe gustaría solicitar un cambio en la siguiente reunión:\n\n'
      +'Reunión: '+_crMeeting.title+'\n'
      +'Fecha actual: '+_crMeeting.date+' a las '+_crMeeting.time+'\n'
      +'Fecha solicitada: '+newDate+' a las '+newTime+'\n'
      +(note?'\nNota: '+note+'\n':'')+'\nGracias'
    );
    window.location.href='mailto:'+email+'?subject='+subject+'&body='+body;
    ov.classList.remove('open');
    showToast('Abriendo tu correo electrónico…');
  });
}

// ── MEETINGS VIEW ─────────────────────────────────────────────────────────────
function buildCalendar(viewMode='cards'){
  const wrap=document.getElementById('meetingsWrap'); if(!wrap) return; wrap.innerHTML='';
  const now=new Date();
  function meetingEnd(m){ const d=pd(m.date); const [hh,mm]=m.time.split(':').map(Number); d.setHours(hh,mm+(m.duration||60),0,0); return d; }

  const upcoming=MEETINGS.filter(m=>meetingEnd(m)>=now).sort((a,b)=>pd(a.date)-pd(b.date));
  const past=MEETINGS.filter(m=>meetingEnd(m)<now).sort((a,b)=>pd(b.date)-pd(a.date));
  const nextId=upcoming.length ? upcoming[0].id : null;

  function groupByMonth(list){
    const mo={}, order=[];
    list.forEach(m=>{
      const d=pd(m.date); const key=d.getFullYear()+'-'+d.getMonth();
      if(!mo[key]){mo[key]={label:d.toLocaleDateString('es-ES',{month:'long',year:'numeric'}),items:[]};order.push(key);}
      mo[key].items.push(m);
    });
    return order.map(k=>mo[k]);
  }

  // ── CARD VIEW ──────────────────────────────────────────────────────────────
  function makeCard(m, isPast){
    const d=pd(m.date); d.setHours(0,0,0,0);
    const [hh,mm]=m.time.split(':').map(Number);
    const ampm=hh>=12?'pm':'am', h12=hh%12||12;
    const timeStr=h12+(mm?':'+String(mm).padStart(2,'0'):'')+ampm;
    const durStr=m.duration===60?'1 hr':m.duration===90?'1 hr 30 min':m.duration+' min';

    const card=document.createElement('div');
    card.className='meeting-card'+(isPast?' past':'')+(m.id===nextId?' next-up':'');

    const dateHead=document.createElement('div'); dateHead.className='meeting-card-date-head';
    const dayNum=document.createElement('div'); dayNum.className='meeting-card-day-num'; dayNum.textContent=d.getDate();
    const dateLabel=document.createElement('div'); dateLabel.className='meeting-card-date-label';
    dateLabel.textContent=d.toLocaleDateString('es-ES',{weekday:'long',month:'long',day:'numeric'});
    dateHead.appendChild(dayNum); dateHead.appendChild(dateLabel); card.appendChild(dateHead);

    const title=document.createElement('div'); title.className='meeting-card-title'; title.textContent=m.title; card.appendChild(title);
    const time=document.createElement('div'); time.className='meeting-card-time'; time.textContent=timeStr+' · '+durStr; card.appendChild(time);
    if(m.description){const desc=document.createElement('div'); desc.className='meeting-card-desc'; desc.textContent=m.description; card.appendChild(desc);}

    const actions=document.createElement('div'); actions.className='meeting-card-actions';
    const gcal=document.createElement('a'); gcal.className='gcal-btn'; gcal.href=gcalLink(m); gcal.target='_blank'; gcal.rel='noopener'; gcal.textContent='+ Añadir a Google Calendar';
    actions.appendChild(gcal);
    if(m.meetLink){const join=document.createElement('a'); join.className='join-btn'; join.href=m.meetLink; join.target='_blank'; join.rel='noopener'; join.textContent='Unirse a la reunión'; actions.appendChild(join);}
    card.appendChild(actions);
    return card;
  }

  function renderCardGroup(list, isPast){
    groupByMonth(list).forEach(({label,items})=>{
      const section=document.createElement('div'); section.className='cal-month'+(isPast?' past-month':'');
      const heading=document.createElement('div'); heading.className='cal-month-heading'; heading.textContent=label;
      section.appendChild(heading);
      const grid=document.createElement('div'); grid.className='meeting-cards-grid';
      items.forEach(m=>grid.appendChild(makeCard(m, isPast)));
      section.appendChild(grid); wrap.appendChild(section);
    });
  }

  // ── LIST VIEW ──────────────────────────────────────────────────────────────
  function makeListItem(m, isPast){
    const d=pd(m.date); d.setHours(0,0,0,0);
    const [hh,mm]=m.time.split(':').map(Number);
    const ampm=hh>=12?'pm':'am', h12=hh%12||12;
    const timeStr=h12+(mm?':'+String(mm).padStart(2,'0'):'')+ampm;
    const durStr=m.duration===60?'1 hr':m.duration===90?'1 hr 30 min':m.duration+' min';

    const li=document.createElement('li');
    li.className='meeting-list-item'+(isPast?' past':'')+(m.id===nextId?' next-up':'');

    // Two-column layout: left = text, right = date badge + buttons
    const inner=document.createElement('div'); inner.style.cssText='display:flex;align-items:flex-start;gap:16px;';

    // Left column
    const left=document.createElement('div'); left.style.cssText='flex:1;min-width:0;';
    const title=document.createElement('div'); title.className='dock-mc-title'; title.textContent=m.title;
    left.appendChild(title);
    const meta=document.createElement('div'); meta.className='dock-mc-meta'; meta.textContent=timeStr+' · '+durStr;
    left.appendChild(meta);
    if(m.description){const desc=document.createElement('div');desc.className='dock-mc-desc';desc.textContent=m.description;left.appendChild(desc);}
    inner.appendChild(left);

    // Right column: date badge on top, buttons below
    const right=document.createElement('div'); right.style.cssText='display:flex;flex-direction:column;align-items:flex-end;gap:8px;flex-shrink:0;';
    const dateBadge=document.createElement('div'); dateBadge.className='dock-mc-date';
    const dayMo=document.createElement('div'); dayMo.className='dock-mc-month'; dayMo.textContent=d.toLocaleDateString('es-ES',{month:'short'}).toUpperCase();
    const dayNum=document.createElement('div'); dayNum.className='dock-mc-day'; dayNum.textContent=d.getDate();
    dateBadge.appendChild(dayMo); dateBadge.appendChild(dayNum);
    right.appendChild(dateBadge);

    const actions=document.createElement('div'); actions.className='list-item-actions';
    const gcal=document.createElement('a'); gcal.className='mli-btn primary'; gcal.href=gcalLink(m); gcal.target='_blank'; gcal.rel='noopener'; gcal.textContent='+Cal';
    actions.appendChild(gcal);
    if(m.meetLink){const join=document.createElement('a');join.className='mli-btn';join.href=m.meetLink;join.target='_blank';join.rel='noopener';join.textContent='Entrar';actions.appendChild(join);}
    right.appendChild(actions);
    inner.appendChild(right);
    li.appendChild(inner);
    return li;
  }

  function renderListGroup(list, isPast){
    groupByMonth(list).forEach(({label,items})=>{
      const section=document.createElement('div'); section.className='cal-month'+(isPast?' past-month':'');
      const heading=document.createElement('div'); heading.className='cal-month-heading'; heading.textContent=label;
      section.appendChild(heading);
      const ul=document.createElement('ul'); ul.className='meeting-list';
      items.forEach(m=>ul.appendChild(makeListItem(m, isPast)));
      section.appendChild(ul); wrap.appendChild(section);
    });
  }

  // ── RENDER ─────────────────────────────────────────────────────────────────
  if(viewMode==='list'){
    renderListGroup(upcoming, false);
    if(past.length){
      if(upcoming.length){
        const div=document.createElement('div'); div.className='past-divider';
        const span=document.createElement('span'); span.textContent='Pasadas';
        div.appendChild(span); wrap.appendChild(div);
      }
      renderListGroup(past, true);
    }
  } else {
    renderCardGroup(upcoming, false);
    if(past.length){
      if(upcoming.length){
        const div=document.createElement('div'); div.className='past-divider';
        const span=document.createElement('span'); span.textContent='Pasadas';
        div.appendChild(span); wrap.appendChild(div);
      }
      renderCardGroup(past, true);
    }
  }
}

// ── MEETING DETAIL DOCK ───────────────────────────────────────────────────────
function openMeetingDetail(m, isNext, isPast){
  const d=pd(m.date);
  const [hh,mm]=m.time.split(':').map(Number);
  const ampm=hh>=12?'pm':'am'; const h12=hh%12||12;
  const timeStr=h12+':'+(mm<10?'0':'')+mm+ampm+' · '+m.duration+(m.duration===60?' hr':m.duration===90?' hr 30 min':' min');
  const dateStr=d.toLocaleDateString('es-ES',{weekday:'long',month:'long',day:'numeric',year:'numeric'});

  // reuse the dock
  document.getElementById('dockPhaseNum').textContent = isNext ? '↗ Próxima reunión' : (isPast ? 'Pasada' : 'Próxima');
  document.getElementById('dockTitle').textContent    = m.title;
  document.getElementById('dockDates').textContent    = dateStr+' · '+timeStr;

  // replace progress block with meeting actions
  document.getElementById('dockBigPct').textContent='';
  document.getElementById('dockFill').style.width='0%';
  document.getElementById('dockStatusPill').textContent='';
  document.getElementById('dockStatusPill').className='';

  const list=document.getElementById('dockTaskList'); list.innerHTML='';

  // description
  if(m.description){
    const desc=document.createElement('li'); desc.className='dock-task-item';
    const tx=document.createElement('span'); tx.style.cssText='flex:1;line-height:1.55;color:var(--gray-600);font-size:13px;'; tx.textContent=m.description;
    desc.appendChild(tx); list.appendChild(desc);
  }

  // spacer
  const sp=document.createElement('li'); sp.style.height='16px'; list.appendChild(sp);

  // action buttons
  function actionBtn(label,cls,href,onClick){
    const li=document.createElement('li'); li.style.cssText='padding:4px 0;list-style:none;';
    const btn=document.createElement(href?'a':'button');
    btn.className=cls; btn.textContent=label;
    if(href){ btn.href=href; btn.target='_blank'; btn.rel='noopener'; btn.style.display='block'; btn.style.textAlign='center'; }
    else { btn.addEventListener('click',onClick); btn.style.width='100%'; }
    li.appendChild(btn); return li;
  }

  list.appendChild(actionBtn('+ Añadir a Google Calendar','gcal-btn',gcalLink(m)));
  if(m.meetLink) list.appendChild(actionBtn('Unirse a la reunión','join-btn',m.meetLink));

  // override the progress block — hide it
  if(typeof _dockInMeetingMode!=='undefined') _dockInMeetingMode=true;
  document.getElementById('dockBigPct').closest('.dock-progress-block').style.display='none';
  document.getElementById('dockStatusPill').closest('.dock-status-row').style.display='none';
  document.getElementById('dockTaskList').previousElementSibling.style.display='none'; // section title

  document.getElementById('dockOverlay').classList.add('open');
}

// Restore dock to phase mode after meeting detail
function _restoreDockForPhase(){
  const pb=document.getElementById('dockBigPct').closest('.dock-progress-block'); if(pb)pb.style.display='';
  const sr=document.getElementById('dockStatusPill').closest('.dock-status-row'); if(sr)sr.style.display='';
  const st=document.getElementById('dockTaskList').previousElementSibling; if(st)st.style.display='';
}
let _dockInMeetingMode=false;

// ── GANTT ZOOM TOOLBAR ────────────────────────────────────────────────────────
function buildZoomBar(phases, editable, onPhaseClick, onAddPhase=null){
  const existing=document.getElementById('zoomBar'); if(existing)existing.remove();
  const bar=document.createElement('div'); bar.id='zoomBar'; bar.className='zoom-bar';

  const lbl=document.createElement('span'); lbl.className='zoom-label'; lbl.textContent='Zoom';
  bar.appendChild(lbl);

  const slider=document.createElement('input'); slider.type='range';
  slider.min=24; slider.max=120; slider.step=4; slider.value=WEEK_W;
  slider.className='zoom-slider';
  slider.addEventListener('input',()=>{
    WEEK_W=parseInt(slider.value);
    buildGantt(phases,{editable,onPhaseClick,onAddPhase});
  });

  const fitBtn=document.createElement('button'); fitBtn.className='zoom-fit'; fitBtn.textContent='Ajustar';
  fitBtn.addEventListener('click',()=>{
    autoFitWeekWidth();
    slider.value=WEEK_W;
    buildGantt(phases,{editable,onPhaseClick,onAddPhase});
  });

  bar.appendChild(slider);
  bar.appendChild(fitBtn);

  // inject before chart
  const ganttOuter=document.querySelector('.gantt-outer')||document.getElementById('ganttView');
  if(ganttOuter) ganttOuter.parentNode.insertBefore(bar,ganttOuter);
}

// ── GANTT BUILDER ─────────────────────────────────────────────────────────────
function buildGantt(phases,{editable=false,onPhaseClick=null,onAddPhase=null,onReorder=null,hasDraft=false}={}){
  const wrap=document.getElementById('chartWrap'); wrap.innerHTML='';
  const{mn,mx}=getBounds(), weeks=getWeeks(mn,mx), months=groupMonths(weeks), totalW=weeks.length*WEEK_W;
  const todayOff=off(new Date(),mn);

  // remove chart-wrap min-width constraint so it fills naturally
  wrap.style.minWidth='unset';
  wrap.style.width=(totalW+parseInt(getComputedStyle(document.documentElement).getPropertyValue('--label-w'))||280)+'px';

  // header
  const hdr=document.createElement('div'); hdr.className='timeline-header';
  months.forEach(mg=>{
    const el=document.createElement('div'); el.className='month-group'; el.style.width=(mg.indices.length*WEEK_W)+'px';
    const ml=document.createElement('div'); ml.className='month-label'; ml.textContent=mg.label; el.appendChild(ml);
    const wr=document.createElement('div'); wr.className='weeks-row';
    mg.indices.forEach(i=>{const wc=document.createElement('div');wc.className='week-cell';wc.style.width=WEEK_W+'px';wc.textContent=weeks[i].getDate();wr.appendChild(wc);});
    el.appendChild(wr); hdr.appendChild(el);
  });
  wrap.appendChild(hdr);

  const body=document.createElement('div'); body.className='chart-body';

  phases.forEach((phase,idx)=>{
    const pct=phasePct(phase), status=phaseStatus(phase);
    const pastPhase=pd(phase.end)<mn;
    const row=document.createElement('div'); row.className='phase-row'+(phase.expanded?' expanded':'');
    const lbl=document.createElement('div'); lbl.className='phase-label';
    const chev=document.createElement('div'); chev.className='chevron'; chev.textContent='▶'; lbl.appendChild(chev);

    if(editable){
      const dh=document.createElement('div'); dh.className='phase-drag-handle'; dh.textContent='⠿';
      lbl.insertBefore(dh, lbl.firstChild);
      row.draggable=true;
      row.addEventListener('dragstart',e=>{e.dataTransfer.setData('text/plain',String(idx));row.classList.add('dragging');});
      row.addEventListener('dragend',()=>{row.classList.remove('dragging');document.querySelectorAll('.phase-row').forEach(r=>r.classList.remove('drag-over'));});
      row.addEventListener('dragover',e=>{e.preventDefault();row.classList.add('drag-over');});
      row.addEventListener('dragleave',e=>{if(!row.contains(e.relatedTarget))row.classList.remove('drag-over');});
      row.addEventListener('drop',e=>{
        e.preventDefault();row.classList.remove('drag-over');
        const from=parseInt(e.dataTransfer.getData('text/plain'));
        if(from===idx)return;
        phases.splice(idx,0,phases.splice(from,1)[0]);
        buildGantt(phases,{editable,onPhaseClick,onAddPhase,onReorder});
        if(onReorder)onReorder(phases);
      });
      const cbw=document.createElement('div'); cbw.className='phase-cb-wrap';
      const cb=document.createElement('input'); cb.type='checkbox'; cb.checked=pct===100;
      cb.addEventListener('click',e=>e.stopPropagation());
      cb.addEventListener('change',e=>{e.stopPropagation();phase.tasks.forEach(t=>t.done=cb.checked);buildGantt(phases,{editable,onPhaseClick,onReorder});renderSummary(phases);});
      cbw.appendChild(cb); lbl.appendChild(cbw);
    }

    const nw=document.createElement('div'); nw.className='phase-name-wrap';
    const numMatch=phase.name.match(/^Fase\s*(\d+)/i)||phase.name.match(/^Phase\s*(\d+)/i);
    if(numMatch){const pn=document.createElement('div'); pn.className='phase-num-label'; pn.textContent='Fase '+String(numMatch[1]).padStart(2,'0'); nw.appendChild(pn);}
    const nm=document.createElement('div'); nm.className='phase-name'+(status==='done'?' done':''); nm.textContent=phase.name.replace(/^Fase\s*\d+:\s*/i,'').replace(/^Phase\s*\d+:\s*/i,''); nw.appendChild(nm);
    const meta=document.createElement('div'); meta.className='phase-meta';
    const mt=document.createElement('div'); mt.className='mini-track';
    const mf=document.createElement('div'); mf.className='mini-fill'; mf.style.width=pct+'%'; mt.appendChild(mf); meta.appendChild(mt);
    const pp=document.createElement('span'); pp.className='phase-pct'; pp.textContent=pct+'%'; meta.appendChild(pp);
    nw.appendChild(meta); lbl.appendChild(nw);
    const pill=document.createElement('span'); pill.className='status-pill '+status;
    const PL={todo:'Pendiente','in-progress':'En progreso',done:'Completado'}; pill.textContent=PL[status]; lbl.appendChild(pill);
    if(editable&&hasDraft){const ud=document.createElement('span');ud.className='phase-unsaved-dot';lbl.appendChild(ud);}
    row.appendChild(lbl);

    const ba=document.createElement('div'); ba.className='bar-area'; ba.style.width=totalW+'px';
    weeks.forEach((w,i)=>{
      const gl=document.createElement('div'); gl.className='grid-line'+(w.getDate()<=7?' month-start':''); gl.style.left=(i*WEEK_W)+'px'; ba.appendChild(gl);
    });
    const sd=pd(phase.start), ed_d=pd(phase.end); ed_d.setDate(ed_d.getDate()+1);
    const left=off(sd,mn), width=off(ed_d,mn)-left;
    const bar=document.createElement('div'); bar.className='gantt-bar '+status;
    bar.style.left=left+'px'; bar.style.width=Math.max(width,6)+'px';
    if(status==='in-progress'&&pct>0){const f=document.createElement('div');f.className='bar-progress-fill';f.style.width=pct+'%';bar.appendChild(f);}
    bar.addEventListener('mouseenter',e=>showTip(e,phase.name+'  ·  '+fd(sd)+' – '+fd(pd(phase.end))+'  ·  '+pct+'% done'));
    bar.addEventListener('mousemove',moveTip);
    bar.addEventListener('mouseleave',hideTip);
    // ── Resize handles (editor only) ─────────────────────────────────────────
    if(editable){
      const fmt=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
      const rh=document.createElement('div'); rh.className='bar-resize-r';
      rh.addEventListener('mousedown',e=>{
        e.stopPropagation(); e.preventDefault();
        const startX=e.clientX, origW=parseFloat(bar.style.width), origEnd=pd(phase.end);
        const onMove=e2=>{bar.style.width=Math.max(WEEK_W*.5,origW+(e2.clientX-startX))+'px';};
        const onUp=e2=>{
          document.removeEventListener('mousemove',onMove); document.removeEventListener('mouseup',onUp);
          const ne=new Date(origEnd); ne.setDate(ne.getDate()+Math.round((e2.clientX-startX)/WEEK_W*7));
          phase.end=fmt(ne); buildGantt(phases,{editable,onPhaseClick});
        };
        document.addEventListener('mousemove',onMove); document.addEventListener('mouseup',onUp);
      });
      bar.appendChild(rh);

      const lhh=document.createElement('div'); lhh.className='bar-resize-l';
      lhh.addEventListener('mousedown',e=>{
        e.stopPropagation(); e.preventDefault();
        const startX=e.clientX, origL=parseFloat(bar.style.left), origW=parseFloat(bar.style.width), origStart=pd(phase.start);
        const onMove=e2=>{const dx=e2.clientX-startX;bar.style.left=(origL+dx)+'px';bar.style.width=Math.max(WEEK_W*.5,origW-dx)+'px';};
        const onUp=e2=>{
          document.removeEventListener('mousemove',onMove); document.removeEventListener('mouseup',onUp);
          const ns=new Date(origStart); ns.setDate(ns.getDate()+Math.round((e2.clientX-startX)/WEEK_W*7));
          phase.start=fmt(ns); buildGantt(phases,{editable,onPhaseClick});
        };
        document.addEventListener('mousemove',onMove); document.addEventListener('mouseup',onUp);
      });
      bar.appendChild(lhh);
    }
    if(!pastPhase) ba.appendChild(bar); row.appendChild(ba);

    // ── Row / label click ────────────────────────────────────────────────────
    if(editable && onPhaseClick){
      chev.addEventListener('click',e=>{e.stopPropagation();phase.expanded=!phase.expanded;buildGantt(phases,{editable,onPhaseClick});renderSummary(phases);});
      lbl.style.cursor='pointer';
      lbl.addEventListener('click',()=>onPhaseClick(phase,idx));
      bar.addEventListener('click',()=>onPhaseClick(phase,idx));
    } else if(editable){
      row.addEventListener('click',()=>{phase.expanded=!phase.expanded;buildGantt(phases,{editable});renderSummary(phases);});
    } else {
      // Chevron = quick expand dropdown; rest of row = open full dock
      chev.addEventListener('click',e=>{
        e.stopPropagation();
        phase.expanded=!phase.expanded;
        buildGantt(phases,{editable});
      });
      lbl.addEventListener('click',()=>openDock(phase));
      bar.addEventListener('click',()=>openDock(phase));
    }
    body.appendChild(row);

    if(editable){
      const drawer=document.createElement('div'); drawer.className='subtask-drawer'+(phase.expanded?' open':'');
      phase.tasks.forEach(task=>{
        const sr=document.createElement('div'); sr.className='subtask-row';
        const sl=document.createElement('div'); sl.className='subtask-label';
        const scb=document.createElement('input'); scb.type='checkbox'; scb.className='sub-cb'; scb.checked=task.done;
        scb.addEventListener('change',()=>{task.done=scb.checked;task.inProgress=false;buildGantt(phases,{editable,onPhaseClick});renderSummary(phases);}); sl.appendChild(scb);
        const sn=document.createElement('span'); sn.className='subtask-name'+(task.done?' done':''); sn.textContent=task.name; sl.appendChild(sn);
        sr.appendChild(sl);
        const sba=document.createElement('div'); sba.className='subtask-bar-area'; sba.style.width=totalW+'px';
        weeks.forEach((w,i)=>{const gl=document.createElement('div');gl.className='grid-line'+(w.getDate()<=7?' month-start':'');gl.style.left=(i*WEEK_W)+'px';sba.appendChild(gl);});
        sr.appendChild(sba); drawer.appendChild(sr);
      });
      body.appendChild(drawer);
    } else {
      // Read-only expandable drawer (client view)
      const drawer=document.createElement('div'); drawer.className='subtask-drawer'+(phase.expanded?' open':'');
      const SL_T={'todo':'Pendiente','in-progress':'En progreso','in-review':'En revisión','approved':'Aprobado'};
      phase.tasks.forEach(task=>{
        const sr=document.createElement('div'); sr.className='subtask-row';
        const sl=document.createElement('div'); sl.className='subtask-label readonly';
        const dot=document.createElement('div'); dot.className=taskDotClass(task);
        const ts=taskStatus(task);
        const sn=document.createElement('span'); sn.className='subtask-name'+(ts==='approved'?' done':''); sn.textContent=task.name;
        const tag=document.createElement('span'); tag.className='task-pill '+ts; tag.textContent=SL_T[ts]||'Pending';
        sl.appendChild(dot); sl.appendChild(sn); sl.appendChild(tag); sr.appendChild(sl);
        const sba=document.createElement('div'); sba.className='subtask-bar-area'; sba.style.width=totalW+'px';
        weeks.forEach((w,i)=>{const gl=document.createElement('div');gl.className='grid-line'+(w.getDate()<=7?' month-start':'');gl.style.left=(i*WEEK_W)+'px';sba.appendChild(gl);});
        sr.appendChild(sba); drawer.appendChild(sr);
      });
      body.appendChild(drawer);
    }
  });

  if(todayOff>=0&&todayOff<=totalW){
    const tl=document.createElement('div'); tl.className='today-line';
    tl.style.left='calc(var(--label-w) + '+todayOff+'px)';
    const tlb=document.createElement('div'); tlb.className='today-label'; tlb.textContent='Hoy'; tl.appendChild(tlb); body.appendChild(tl);
  }

  // ── Add Phase row (Notion-style, editor only) ──────────────────────────────
  if(editable && onAddPhase){
    const addRow=document.createElement('div'); addRow.className='phase-row add-phase-row';
    const addLbl=document.createElement('div'); addLbl.className='phase-label';
    const addChev=document.createElement('div'); addChev.className='chevron'; addChev.textContent='+';
    const addNw=document.createElement('div'); addNw.className='phase-name-wrap';
    const addNm=document.createElement('div'); addNm.className='phase-name'; addNm.textContent='Add Phase';
    addNw.appendChild(addNm); addLbl.appendChild(addChev); addLbl.appendChild(addNw);
    const addBa=document.createElement('div'); addBa.className='bar-area'; addBa.style.width=totalW+'px';
    weeks.forEach((w,i)=>{const gl=document.createElement('div');gl.className='grid-line'+(w.getDate()<=7?' month-start':'');gl.style.left=(i*WEEK_W)+'px';addBa.appendChild(gl);});
    addRow.appendChild(addLbl); addRow.appendChild(addBa);
    addRow.addEventListener('click',onAddPhase);
    body.appendChild(addRow);
  }

  // ── Meeting markers row ───────────────────────────────────────────────────
  if(typeof MEETINGS!=='undefined' && MEETINGS.length){
    const mRow=document.createElement('div'); mRow.className='phase-row meeting-marker-row';
    const mLbl=document.createElement('div'); mLbl.className='phase-label';
    const mNw=document.createElement('div'); mNw.className='phase-name-wrap';
    const mNm=document.createElement('div'); mNm.className='phase-name'; mNm.textContent='Reuniones';
    mNw.appendChild(mNm); mLbl.appendChild(mNw);
    const mBa=document.createElement('div'); mBa.className='bar-area'; mBa.style.width=totalW+'px';
    weeks.forEach((w,i)=>{const gl=document.createElement('div');gl.className='grid-line'+(w.getDate()<=7?' month-start':'');gl.style.left=(i*WEEK_W)+'px';mBa.appendChild(gl);});
    MEETINGS.forEach(m=>{
      const d=pd(m.date), x=off(d,mn);
      if(x<0||x>totalW) return;
      const mk=document.createElement('div'); mk.className='meeting-gantt-marker'; mk.style.left=x+'px';
      mk.addEventListener('mouseenter',e=>showTip(e,m.title+'  ·  '+fd(d)));
      mk.addEventListener('mousemove',moveTip);
      mk.addEventListener('mouseleave',hideTip);
      mk.addEventListener('click',()=>{
        if(!document.getElementById('dockOverlay')) return;
        const today=new Date(); today.setHours(0,0,0,0);
        const isPast=d<today;
        const nextId=MEETINGS.filter(x=>pd(x.date)>=today).sort((a,b)=>pd(a.date)-pd(b.date))[0]?.id;
        openMeetingDetail(m, m.id===nextId, isPast);
      });
      mBa.appendChild(mk);
    });
    mRow.appendChild(mLbl); mRow.appendChild(mBa);
    body.appendChild(mRow);
  }

  wrap.appendChild(body);
}

// ── MOBILE VERTICAL SCHEDULE ──────────────────────────────────────────────────
function buildMobileSchedule(phases, onPhaseClick=null){
  const wrap=document.getElementById('mobileSchedule'); if(!wrap)return; wrap.innerHTML='';
  phases.forEach((phase,idx)=>{
    const pct=phasePct(phase), status=phaseStatus(phase);
    const row=document.createElement('div'); row.className='ms-phase'+(onPhaseClick?' ms-phase-editable':'');
    if(onPhaseClick){ row.style.cursor='pointer'; row.addEventListener('click',()=>onPhaseClick(phase,idx)); }
    const lineCol=document.createElement('div'); lineCol.className='ms-line-col';
    const dot=document.createElement('div'); dot.className='ms-dot'+(status==='done'?' done':status==='in-progress'?' active':'');
    const connector=document.createElement('div'); connector.className='ms-connector';
    lineCol.appendChild(dot); lineCol.appendChild(connector); row.appendChild(lineCol);
    const content=document.createElement('div'); content.className='ms-content';
    const phHdr=document.createElement('div'); phHdr.className='ms-phase-header';
    const nameEl=document.createElement('div'); nameEl.className='ms-phase-name'+(status==='done'?' done':''); nameEl.textContent=phase.name; phHdr.appendChild(nameEl);
    const datesEl=document.createElement('div'); datesEl.className='ms-dates'; datesEl.textContent=fd(pd(phase.start))+' – '+fd(pd(phase.end)); phHdr.appendChild(datesEl);
    content.appendChild(phHdr);
    const barRow=document.createElement('div'); barRow.className='ms-bar-row';
    const track=document.createElement('div'); track.className='ms-track';
    const fill=document.createElement('div'); fill.className='ms-fill'; fill.style.width='0%'; track.appendChild(fill); barRow.appendChild(track);
    const pctEl=document.createElement('span'); pctEl.className='ms-pct'; pctEl.textContent=pct+'%'; barRow.appendChild(pctEl);
    content.appendChild(barRow);
    requestAnimationFrame(()=>requestAnimationFrame(()=>{fill.style.width=pct+'%';}));
    const ul=document.createElement('ul'); ul.className='ms-tasks';
    phase.tasks.forEach(t=>{
      const li=document.createElement('li'); li.className='ms-task';
      const dot2=document.createElement('div'); dot2.className=taskDotClass(t);
      const tn=document.createElement('span'); tn.className='ms-task-name'+(t.done?' done':''); tn.textContent=t.name;
      li.appendChild(dot2); li.appendChild(tn); ul.appendChild(li);
    });
    content.appendChild(ul); row.appendChild(content); wrap.appendChild(row);
  });
}

// ── CARDS ─────────────────────────────────────────────────────────────────────
function buildCards(phases){
  const grid=document.getElementById('cardGrid'); grid.innerHTML='';
  phases.forEach((phase,idx)=>{
    const pct=phasePct(phase), status=phaseStatus(phase);
    const card=document.createElement('div'); card.className='phase-card';
    const badge=document.createElement('div'); badge.className='card-status-badge';
    const pill=document.createElement('span'); pill.className='status-pill '+status;
    const PL={todo:'To-do','in-progress':'Active',done:'Done'}; pill.textContent=PL[status]; badge.appendChild(pill); card.appendChild(badge);
    const num=document.createElement('div'); num.className='card-num'; num.textContent='Fase 0'+(idx+1); card.appendChild(num);
    const title=document.createElement('div'); title.className='card-title'; title.textContent=phase.name.replace(/^Fase \d+:\s*/i,'').replace(/^Phase \d+:\s*/i,''); card.appendChild(title);
    const dates=document.createElement('div'); dates.className='card-dates'; dates.textContent=fd(pd(phase.start))+' – '+fd(pd(phase.end)); card.appendChild(dates);
    const pr=document.createElement('div'); pr.className='card-progress-row';
    const ct=document.createElement('div'); ct.className='card-track';
    const cf=document.createElement('div'); cf.className='card-fill'; cf.style.width='0%'; ct.appendChild(cf); pr.appendChild(ct);
    const pl=document.createElement('div'); pl.className='card-pct-label'; pl.textContent=pct+'%'; pr.appendChild(pl);
    card.appendChild(pr);
    requestAnimationFrame(()=>requestAnimationFrame(()=>{cf.style.width=pct+'%';}));
    const ul=document.createElement('ul'); ul.className='card-tasks';
    const SL_C={'todo':'Pendiente','in-progress':'En progreso','in-review':'En revisión','approved':'Aprobado'};
    phase.tasks.forEach(t=>{
      const li=document.createElement('li'); li.className='card-task-item';
      const dot=document.createElement('div'); dot.className=taskDotClass(t);
      const ts=taskStatus(t);
      const tn=document.createElement('span'); tn.className='card-task-name'+(ts==='approved'?' done':''); tn.textContent=t.name;
      const tpill=document.createElement('span'); tpill.className='task-pill '+ts; tpill.textContent=SL_C[ts]||'Pending';
      li.appendChild(dot); li.appendChild(tn); li.appendChild(tpill); ul.appendChild(li);
    });
    card.appendChild(ul);
    const footer=document.createElement('div'); footer.className='card-footer-bar'; footer.style.width='0%'; card.appendChild(footer);
    requestAnimationFrame(()=>requestAnimationFrame(()=>{footer.style.width=pct+'%';}));
    card.addEventListener('click',()=>openDock(phase));
    grid.appendChild(card);
  });
}

// ── STATUS STRIP (what's happening now / what's next) ─────────────────────────
function buildStatusStrip(phases){
  const hint=document.querySelector('.legend-hint'); if(!hint) return;
  const cur=phases.find(p=>phaseStatus(p)==='in-progress')||phases.find(p=>phaseStatus(p)==='todo');
  if(!cur){hint.textContent='Todas las fases completadas';return;}
  const next=phases.find((p,i)=>i>phases.indexOf(cur)&&phaseStatus(p)==='todo');
  const curName=cur.name.replace(/^Fase \d+:\s*/i,'').replace(/^Phase \d+:\s*/i,'');
  if(phaseStatus(cur)==='in-progress'){
    hint.textContent=next
      ?'En progreso: '+curName+'  →  Próxima: '+next.name.replace(/^Fase \d+:\s*/i,'').replace(/^Phase \d+:\s*/i,'')+' · '+fd(pd(next.start))
      :'En progreso: '+curName;
  } else {
    hint.textContent='Próxima: '+curName+' · '+fd(pd(cur.start));
  }
}

// ── SUMMARY ───────────────────────────────────────────────────────────────────
function renderSummary(phases){
  const el=document.getElementById('summary');
  const all=phases.flatMap(p=>p.tasks), done=all.filter(t=>t.done).length, total=all.length;
  const pct=Math.round(done/total*100), pdone=phases.filter(p=>phasePct(p)===100).length;
  el.innerHTML=`
    <div class="summary-item"><span class="summary-value">${phases.length}</span><span class="summary-label">Fases</span></div>
    <div class="summary-item"><span class="summary-value">${pdone}</span><span class="summary-label">Completadas</span></div>
    <div class="summary-item"><span class="summary-value">${done}/${total}</span><span class="summary-label">Tareas hechas</span></div>
    <div class="progress-bar-wrap">
      <div class="progress-label">Completado total — ${pct}%</div>
      <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
    </div>`;
}
