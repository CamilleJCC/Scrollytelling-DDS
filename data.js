// ── PROJECT DATA (auto-saved) ──────────────────────────────────────────────
const CLIENT_NAME   = "Nombre del cliente";
const LAST_UPDATED  = "2026-10-23";
const LAUNCH_DATE   = "2026-12-14";
const HOURLY_RATE   = "60 €/h + IVA";
const PHASES = [
  {
    "id": 1,
    "name": "Fase 1: Revisión de Diseños y Planificación Técnica",
    "start": "2026-11-02",
    "end": "2026-11-06",
    "description": "Recepción de los diseños finales del cliente y revisión técnica de cada sección y animación. Se identifican los puntos complejos de construir en Gutenberg y se prepara la estructura base de la página. Los diseños deben estar aprobados por el cliente antes de entregarse.",
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
        "description": "Análisis de cada sección y de cada efecto de scroll para definir cómo se construye en Gutenberg (bloques nativos, CSS y JS). Se señalan al cliente los elementos que requieran ajustes antes de empezar."
      },
      {
        "id": "1c",
        "name": "Configuración de la página y estructura base",
        "done": false,
        "status": "todo",
        "dueDate": "4 – 6 de noviembre",
        "description": "Creación de la página en WordPress, estructura de secciones con bloques Group/Cover, clases e IDs para las animaciones y carga de las librerías necesarias."
      },
      {
        "id": "1e",
        "name": "Prototipo y diseños finales (entrega del cliente)",
        "done": false,
        "status": "todo",
        "dueDate": "2026-11-02",
        "deliverable": true,
        "deliverableType": "link",
        "description": "Entrega por parte del cliente del prototipo y los diseños finales aprobados (desktop y mobile), con las indicaciones de cada animación. Es el punto de partida del desarrollo: sin esta entrega no puede comenzar la construcción."
      },
      {
        "id": "1d",
        "name": "Plan técnico de construcción",
        "done": false,
        "status": "todo",
        "dueDate": "2026-11-06",
        "deliverable": true,
        "deliverableType": "pdf",
        "description": "Documento breve con el desglose de secciones, los efectos de scroll previstos y cualquier ajuste acordado sobre los diseños."
      }
    ]
  },
  {
    "id": 2,
    "name": "Fase 2: Maquetación en Gutenberg",
    "start": "2026-11-09",
    "end": "2026-11-13",
    "description": "Construcción de todas las secciones con bloques de Gutenberg y estilos CSS base: tipografía, colores, espaciados y layout según los diseños aprobados.",
    "tasks": [
      {
        "id": "2a",
        "name": "Construcción de secciones con bloques",
        "done": false,
        "status": "todo",
        "dueDate": "9 – 11 de noviembre",
        "description": "Maquetación de cada sección de la página con bloques nativos de Gutenberg, respetando la estructura del diseño."
      },
      {
        "id": "2b",
        "name": "Estilos CSS base",
        "done": false,
        "status": "todo",
        "dueDate": "11 – 13 de noviembre",
        "description": "Tipografía, colores, espaciados y ajustes del layout de Gutenberg (márgenes y contenedores) para que la página coincida con el diseño."
      },
      {
        "id": "2c",
        "name": "Entrega de textos e imágenes finales",
        "done": false,
        "status": "todo",
        "dueDate": "13 de noviembre",
        "clientInput": true,
        "description": "El cliente entrega todos los textos definitivos y las imágenes en alta resolución. El scrollytelling depende del contenido final: si llega tarde, se retrasan las animaciones y el lanzamiento."
      }
    ]
  },
  {
    "id": 3,
    "name": "Fase 3: Interacciones de Scroll y Responsive",
    "start": "2026-11-16",
    "end": "2026-11-27",
    "description": "Desarrollo de todas las animaciones e interacciones de scroll (CSS y JavaScript) y adaptación del comportamiento a tablet y móvil.",
    "tasks": [
      {
        "id": "3a",
        "name": "Animaciones e interacciones de scroll",
        "done": false,
        "status": "todo",
        "dueDate": "16 – 24 de noviembre",
        "description": "Implementación de los efectos de scroll definidos en el diseño: secciones fijas, apariciones, transiciones y animaciones ligadas al avance de la lectura."
      },
      {
        "id": "3b",
        "name": "Comportamiento responsive (tablet y móvil)",
        "done": false,
        "status": "todo",
        "dueDate": "23 – 27 de noviembre",
        "description": "Adaptación de las animaciones y del layout a tablet y móvil, según los diseños mobile entregados por el cliente."
      },
      {
        "id": "3c",
        "name": "Enlace Beta",
        "done": false,
        "status": "todo",
        "dueDate": "2026-11-27",
        "deliverable": true,
        "deliverableType": "link",
        "description": "Enlace privado a la página en desarrollo con todas las secciones e interacciones implementadas, lista para la revisión del cliente."
      }
    ]
  },
  {
    "id": 4,
    "name": "Fase 4: Revisión del Cliente y Ajustes",
    "start": "2026-11-30",
    "end": "2026-12-04",
    "description": "Revisión de la Beta por parte del cliente y ronda de ajustes. Los cambios sobre el diseño aprobado se consideran solicitudes de cambio y se presupuestan aparte.",
    "tasks": [
      {
        "id": "4a",
        "name": "Feedback consolidado del cliente",
        "done": false,
        "status": "todo",
        "dueDate": "1 de diciembre",
        "clientInput": true,
        "description": "El cliente envía todos los comentarios sobre la Beta en un solo documento o listado, para poder aplicarlos en una única ronda."
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
    "id": 5,
    "name": "Fase 5: Testing y Lanzamiento",
    "start": "2026-12-07",
    "end": "2026-12-14",
    "description": "Pruebas en distintos dispositivos y navegadores, optimización de rendimiento y versión accesible para usuarios con movimiento reducido. El 8 de diciembre es festivo. El lanzamiento incluye una garantía técnica de 20 días post-publicación.",
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
        "description": "Optimización de imágenes y scripts para una carga rápida, y versión sin animaciones para usuarios que tienen activada la opción de reducir movimiento en su dispositivo."
      },
      {
        "id": "5c",
        "name": "Sesión de entrega y tutorial (opcional)",
        "done": false,
        "status": "todo",
        "dueDate": "11 de diciembre",
        "description": "Opcional, a confirmar con el cliente. Sesión para mostrar cómo editar textos e imágenes de la página en Gutenberg sin afectar las animaciones."
      },
      {
        "id": "5d",
        "name": "Lanzamiento de la página",
        "done": false,
        "status": "todo",
        "dueDate": "2026-12-14",
        "deliverable": true,
        "deliverableType": "link",
        "description": "Publicación de la página de scrollytelling. Inicio de la garantía técnica de 20 días post-lanzamiento para ajustes."
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
