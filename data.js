// ── PROJECT DATA (auto-saved) ──────────────────────────────────────────────
const CLIENT_NAME   = "DDS";
const LAST_UPDATED  = "2026-10-23";
const LAUNCH_DATE   = "2026-12-14";
const HOURLY_RATE   = "60 €/h + IVA";
const PHASES = [
  {
    "id": 1,
    "name": "Fase 1: Revisión de Diseños y Planificación Técnica",
    "start": "2026-11-02",
    "end": "2026-11-06",
    "description": "Recepción de los diseños finales de DDS y revisión técnica de cada sección y animación. Se identifican los puntos más complejos de construir en Gutenberg y se arma la estructura base de la página. Los diseños deben venir aprobados por DDS.",
    "tasks": [
      {
        "id": "1a",
        "name": "Entrega de diseños finales (desktop y mobile)",
        "done": false,
        "status": "todo",
        "dueDate": "2 de noviembre",
        "clientInput": true,
        "description": "DDS entrega los diseños finales de todas las secciones, junto a explicaciones o un video de referencia indicando el movimiento: qué se fija, qué aparece y qué se mueve con el scroll."
      },
      {
        "id": "1b",
        "name": "Revisión técnica de diseños y animaciones",
        "done": false,
        "status": "todo",
        "dueDate": "2 – 4 de noviembre",
        "description": "Análisis de cada sección y de cada efecto de scroll para definir cómo se construye en Gutenberg (bloques nativos, CSS y JS). Reajustar el diseño si es que existen limitaciones de CSS o JS en Gutenberg. Por ejemplo: Gutenberg puede tener problemas con objetos sticky."
      },
      {
        "id": "1c",
        "name": "Configuración y estructura de la página en WordPress. Instalación de plugins",
        "done": false,
        "status": "todo",
        "dueDate": "4 – 6 de noviembre",
        "description": "Creación de la página en WordPress y armado de su estructura: las secciones ordenadas según el diseño, listas para recibir el contenido y las animaciones."
      },
      {
        "id": "1e",
        "name": "Prototipo y diseños finales (entrega de DDS)",
        "done": false,
        "status": "todo",
        "dueDate": "TBD",
        "deliverable": true,
        "deliverableType": "link",
        "description": "Entrega por parte de DDS del prototipo y los diseños finales aprobados (desktop y mobile), con las indicaciones de cada animación."
      },
      {
        "id": "1d",
        "name": "Desglose de secciones y animaciones (entrega de DDS)",
        "done": false,
        "status": "todo",
        "dueDate": "TBD",
        "deliverable": true,
        "deliverableType": "pdf",
        "description": "Documento breve de DDS con el desglose de secciones y los efectos de scroll de cada una."
      }
    ]
  },
  {
    "id": 2,
    "name": "Fase 2: Maquetación, Interacciones de Scroll y Responsive",
    "start": "2026-11-09",
    "end": "2026-11-27",
    "description": "Build de todas las secciones en Gutenberg al mismo tiempo que sus animaciones de scroll y su versión responsive. Así, mientras se maqueta, se va probando que todo funcione en desktop, tablet y móvil.",
    "tasks": [
      {
        "id": "2a",
        "name": "Construcción de secciones con bloques",
        "done": false,
        "status": "todo",
        "dueDate": "9 – 20 de noviembre",
        "description": "Maquetación de cada sección con bloques nativos de Gutenberg, siguiendo la estructura del diseño."
      },
      {
        "id": "2b",
        "name": "Estilos CSS base",
        "done": false,
        "status": "todo",
        "dueDate": "9 – 20 de noviembre",
        "description": "Tipografía, colores, espaciados y ajustes del layout de Gutenberg (márgenes y contenedores) para que la página quede igual al diseño."
      },
      {
        "id": "2d",
        "name": "Animaciones e interacciones de scroll",
        "done": false,
        "status": "todo",
        "dueDate": "9 – 24 de noviembre",
        "description": "Implementación de los efectos de scroll definidos en el diseño: secciones fijas, apariciones, transiciones, etc. Usando las librerías GSAP + ScrollTrigger (animaciones ligadas al scroll y secciones fijas) y Lenis (scroll suave)."
      },
      {
        "id": "2e",
        "name": "Comportamiento responsive (tablet y móvil)",
        "done": false,
        "status": "todo",
        "dueDate": "16 – 27 de noviembre",
        "description": "Adaptación de las animaciones y del layout a tablet y móvil, según los diseños mobile entregados por DDS."
      },
      {
        "id": "2c",
        "name": "Entrega de textos e imágenes finales",
        "done": false,
        "status": "todo",
        "dueDate": "13 de noviembre",
        "clientInput": true,
        "description": "DDS entrega todos los textos definitivos y las imágenes optimizadas a 72 dpi."
      },
      {
        "id": "2f",
        "name": "Enlace Beta",
        "done": false,
        "status": "todo",
        "dueDate": "TBD",
        "deliverable": true,
        "deliverableType": "link",
        "description": "Enlace privado a la página en desarrollo, con todas las secciones e interacciones listas para que DDS la revise."
      }
    ]
  },
  {
    "id": 3,
    "name": "Fase 3: Revisión de DDS y Ajustes",
    "start": "2026-11-30",
    "end": "2026-12-04",
    "description": "Revisión de la Beta por parte de DDS y ronda de ajustes. Los cambios sobre el diseño aprobado se consideran fuera de alcance y se cobran aparte, a 60 €/h + IVA.",
    "tasks": [
      {
        "id": "4a",
        "name": "Feedback consolidado de DDS",
        "done": false,
        "status": "todo",
        "dueDate": "1 de diciembre",
        "clientInput": true,
        "description": "DDS envía todos los comentarios de la Beta juntos, en un solo documento o lista, para aplicarlos en una sola ronda."
      },
      {
        "id": "4b",
        "name": "Ronda de ajustes",
        "done": false,
        "status": "todo",
        "dueDate": "1 – 4 de diciembre",
        "description": "Aplicación de los ajustes acordados en la revisión de la Beta."
      }
    ]
  },
  {
    "id": 4,
    "name": "Fase 4: Testing y Lanzamiento",
    "start": "2026-12-07",
    "end": "2026-12-14",
    "description": "Pruebas en distintos dispositivos y navegadores, optimización de carga y una versión sin animaciones para usuarios con movimiento reducido. El 8 de diciembre es festivo. Incluye una garantía técnica de 20 días después del lanzamiento.",
    "tasks": [
      {
        "id": "5a",
        "name": "Pruebas multidispositivo y navegadores",
        "done": false,
        "status": "todo",
        "dueDate": "7 – 9 de diciembre",
        "description": "Pruebas de visualización y de las animaciones en móvil, tablet y escritorio, en Chrome, Safari y Firefox."
      },
      {
        "id": "5b",
        "name": "Rendimiento y movimiento reducido",
        "done": false,
        "status": "todo",
        "dueDate": "9 – 10 de diciembre",
        "description": "Optimización de imágenes y scripts para que la página cargue rápido, y una versión sin animaciones para quienes tienen activada la opción de reducir movimiento en su dispositivo."
      },
      {
        "id": "5c",
        "name": "Sesión de entrega y tutorial (opcional)",
        "done": false,
        "status": "todo",
        "dueDate": "11 de diciembre",
        "description": "Opcional, a confirmar con DDS. Sesión para mostrar cómo editar textos e imágenes de la página en Gutenberg sin afectar las animaciones."
      },
      {
        "id": "5d",
        "name": "Lanzamiento de la página",
        "done": false,
        "status": "todo",
        "dueDate": "TBD",
        "deliverable": true,
        "deliverableType": "link",
        "description": "Publicación de la página. Empieza la garantía técnica de 20 días para ajustes."
      }
    ]
  }
];

const YOUR_EMAIL    = "camillecunliffe@gmail.com";

// ── CLIENT QUICK-LINKS ────────────────────────────────────────────────────────
const QUOTATION_URL = "";
const MIRO_URL      = "";
const SHARE_URL     = "";

const MEETINGS = [];
