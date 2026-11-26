import type { Side } from '../documents';
import type { Messages } from './en';

const side = (s: Side) => (s === 'front' ? 'anverso' : 'reverso');

export const es: Messages = {
  meta: {
    title: 'Sequrid · Protege tu DNI',
    description:
      'Tapa los datos sensibles de tu DNI o documento de identidad (España, Francia e Italia) y añade una marca de agua con destinatario y fecha. Todo se procesa en tu navegador: la foto nunca sale de tu dispositivo.',
  },

  language: {
    label: 'Idioma',
    current: (name) => `Idioma: ${name}`,
    auto: 'Automático',
    autoHint: (name) => `Idioma del navegador: ${name}`,
  },

  header: {
    home: 'Sequrid, ir al editor',
    sections: 'Secciones',
    nav: { editor: 'Editor', cover: 'Qué tapar', privacy: 'Privacidad', faq: 'Preguntas', help: 'Ayuda' },
    localTitle: 'Ninguna foto sale de tu navegador',
    local: '100% en tu dispositivo',
    source: 'Código fuente',
    theme: 'Cambiar tema',
    light: 'Usar tema claro',
    dark: 'Usar tema oscuro',
  },

  hero: {
    noUpload: 'Sin subir tu foto',
    noSignup: 'Sin registro',
    openSource: 'Código abierto',
    title: 'Protege tu DNI antes de enviarlo',
    lead: 'Tapa los datos que nadie necesita, añade una marca de agua con el destinatario y la fecha, y descarga un PDF o JPG listo para enviar. Funciona con el DNI español, la carte nationale d’identité francesa y la CIE italiana.',
  },

  footer: {
    text: 'Sequrid procesa todo en tu navegador. Ninguna imagen se envía ni se guarda.',
    source: 'Código fuente',
    license: 'Licencia AGPL-3.0',
  },

  mobileBar: {
    settings: 'Ajustes',
  },

  slots: {
    title: 'Fotos del documento',
    doc: (n) => `Documento ${n}`,
    country: (n) => `País del documento ${n}`,
    countryChanged: (n, name) => `Documento ${n}: zonas colocadas para ${name}.`,
    slot: (face, loaded) => `${face}: ${loaded ? 'cargada, pulsa para editar' : 'vacía, pulsa para subir'}`,
    secondDoc: 'Añadir un segundo documento',
    sample: 'Probar con un ejemplo',
    tip: 'Arrastra varias fotos a la vez y se colocan solas en los huecos libres.',
    paste: 'También puedes pegar con [Ctrl]+[V].',
  },

  country: {
    button: (field, country, model) => `${field}: ${country}, ${model}`,
    soon: 'Más países próximamente',
    search: 'Busca un país o documento',
    clear: 'Borrar la búsqueda',
    current: 'Actual',
    since: (from) => `${from}–actualidad`,
    years: (from, until) => (from === until ? `${from}` : `${from}–${until}`),
    option: (country, model, years, current) => `${country}, ${model}, ${years}${current ? ', actual' : ''}`,
    noResults: (query) => `Ningún país ni documento coincide con «${query}»`,
    results: (count) => (count === 0 ? 'Ningún documento encontrado' : count === 1 ? '1 documento' : `${count} documentos`),
  },

  editor: {
    label: 'Editor',
    view: 'Vista',
    edit: 'Editar',
    compare: 'Antes / después',
    tool: 'Herramienta',
    move: 'Mover',
    moveTitle: 'Mover y ajustar zonas',
    draw: 'Dibujar',
    drawTitle: 'Dibuja un rectángulo para tapar lo que quieras',
    frame: 'Encuadre',
    frameTitle: 'Ajusta el marco a los bordes de la tarjeta',
    zoom: 'Zoom',
    zoomOut: 'Alejar',
    zoomIn: 'Acercar',
    fit: 'Ajustar',
    fitTitle: 'Ajustar a la pantalla',
    rotate: 'Girar 90 grados',
    rotateTitle: 'Girar 90°',
    removeZone: 'Quitar la zona seleccionada',
    removeZoneTitle: 'Quitar la zona seleccionada (Supr)',
    dropTitle: (s) => `Sube o arrastra la foto del ${side(s)}`,
    dropFormats: 'JPG, PNG o WebP. En el móvil puedes hacer la foto directamente.',
    dropPrivate: 'La imagen no sale de tu dispositivo',
    trySample: 'o prueba con un documento de ejemplo',
    dropHere: 'Suelta aquí las fotos',
    hints: {
      move: 'Arrastra una zona para moverla o tira de sus esquinas para cambiar su tamaño.',
      draw: 'Arrastra sobre la imagen para tapar lo que quieras.',
      frame: 'Arrastra las esquinas o los lados del marco hasta los bordes de la tarjeta. Las zonas se recolocan solas.',
    },
    keys: 'Con el lienzo seleccionado: [Tab] recorre las zonas, las flechas las mueven ([Mayús] + flechas cambia su tamaño) y [Supr] las quita.',
    viewing: (face) => `Estás viendo ${face}.`,
    changePhoto: 'Cambiar foto',
    resetZones: 'Restablecer zonas',
    removeFace: 'Quitar esta cara',
  },

  stage: {
    customZone: 'Zona propia',
    framingLabel: 'Encuadre: arrastra el marco hasta los bordes de la tarjeta',
    canvasLabel:
      'Lienzo de edición. Tab recorre las zonas, flechas para moverlas, Mayús más flechas para cambiar su tamaño y Supr para quitarlas.',
    frameTip: 'Ajusta el marco a los bordes de la tarjeta',
    remove: (label) => `Quitar ${label}`,
  },

  compare: {
    originalLabel: 'Foto original',
    protectedLabel: 'Copia protegida',
    original: 'Original',
    protected: 'Protegida',
    position: 'Posición del comparador',
    hint: 'Desliza para comparar la foto original con la copia protegida.',
  },

  settings: {
    usageTitle: '¿Para qué es la copia?',
    usage: 'Uso',
    recipient: 'Destinatario',
    optional: '(opcional)',
    recipientPlaceholder: 'Ej.: Inmobiliaria Sol',
    date: 'Fecha',

    coverTitle: 'Qué tapar',
    coverMode: 'Modo de tapado',
    auto: 'Automático',
    manual: 'Manual',
    autoHelp: (the) => `Las zonas se colocan sobre los datos ${the ?? 'de los documentos'}. Comprueba que caen en su sitio; si no, usa «Encuadre».`,
    alsoOn: (s) => `también en el ${side(s)}`,
    recommended: 'Recomendado',
    manualHelp: 'Elige «Dibujar» en la barra del lienzo y marca con el ratón o el dedo todo lo que quieras tapar.',
    coverStyle: 'Cómo se tapa',
    black: 'Negro',
    pixelate: 'Pixelado',
    blur: 'Desenfoque',
    styleHelp:
      'El negro es lo más seguro. Pixelado y desenfoque se aplican con fuerza para que no se pueda leer, pero se nota menos que algo está tapado.',

    watermarkTitle: 'Marca de agua',
    watermark: 'Añadir marca de agua',
    watermarkPreview: 'Texto de la marca de agua',
    customText: 'Texto propio',
    customHint: '(sustituye al automático)',
    customPlaceholder: 'Ej.: Solo para Inmobiliaria Sol',
    opacity: 'Intensidad',
    size: 'Tamaño',
    tone: 'Color de la marca',
    dark: 'Oscura',
    light: 'Clara',
    grayscale: 'Copia en blanco y negro',

    levelTitle: 'Nivel de protección',
    levelEmpty: 'Sube una foto para empezar.',

    downloadTitle: 'Descargar',
    pdfSize: 'Tamaño en el PDF',
    real: 'Tamaño real',
    realTitle: 'Tarjeta a 85,6 × 54 mm, como una fotocopia',
    large: 'Ampliado',
    largeTitle: 'Cada cara al ancho de la página, más legible',
    pdf: 'Descargar PDF',
    pdfBusy: 'Generando PDF…',
    jpgFace: 'JPG de esta cara',
    jpgAll: 'JPG con todas las caras',
    busy: 'Generando…',
    noMetadata: 'La copia no lleva metadatos: ni ubicación, ni modelo de móvil, ni fecha de la foto.',
  },

  protection: {
    levels: { low: 'Protección baja.', medium: 'Protección media.', high: 'Protección alta.' },
    manual: (zones) =>
      `Modo manual: ${zones === 1 ? '1 zona dibujada' : `${zones} zonas dibujadas`}. Revisa que tapan lo que quieres.`,
    addWatermark: 'Añade la marca de agua.',
    covered: (covered, total, use) => `Has tapado ${covered} de ${total} datos recomendados para ${use}.`,
    noWatermark: 'Sin marca de agua la copia sirve para cualquier cosa.',
  },

  status: {
    notImage: 'Eso no parece una imagen. Usa una foto JPG, PNG o WebP.',
    noFreeSlots: 'No quedan huecos libres. Quita una cara para subir otra.',
    loadedOne: (face) => `Foto cargada en ${face}. Comprueba que las zonas caen en su sitio.`,
    loadedMany: (count, skipped) =>
      `${count} fotos colocadas en los huecos libres.` + (skipped > 0 ? ` ${skipped} no cabían.` : ''),
    sample: (short, country) => `Ejemplo de ${short} (${country}) cargado en las dos caras. Los datos son ficticios.`,
    zoneVisible: (label) => `${label} queda visible. Vuelve a marcar su casilla en «Qué tapar» si quieres que se tape.`,
    zoneAdded: 'Zona añadida. Arrástrala para moverla o usa las esquinas para ajustarla.',
    zoneSelected: (label) => `Zona seleccionada: ${label}.`,
    downloadReady: 'Descarga lista. Recuerda: solo para quien la necesita.',
    downloadFailed: 'No se ha podido generar la descarga.',
  },

  errors: {
    notImage: 'El archivo no es una imagen.',
    heic: 'Tu navegador no puede abrir fotos HEIC. Expórtala como JPG o cambia la cámara a «Más compatible».',
    unreadable: 'No se ha podido leer la imagen. Prueba con un JPG, PNG o WebP.',
  },

  files: {
    protected: 'protegido',
    document: 'documento',
    sides: { front: 'anverso', back: 'reverso' },
  },

  fields: {
    number: 'Número de documento',
    serial: 'Número de soporte o de serie',
    birthDate: 'Fecha de nacimiento',
    signature: 'Firma',
    can: 'Código CAN',
    expiry: 'Fechas de validez',
    issueDate: 'Fecha de expedición',
    name: 'Nombre y apellidos',
    photo: 'Fotografía',
    address: 'Domicilio',
    birthPlace: 'Lugar de nacimiento',
    parents: 'Nombre de los padres',
    height: 'Estatura',
    seal: 'Código 2D-Doc',
    taxCode: 'Código fiscal',
    birthRecord: 'Datos del acta de nacimiento',
    issuer: 'Autoridad que lo expide',
    mrz: 'Zona MRZ',
  },

  documents: {
    'dni-es': {
      countryName: 'España',
      the: 'del DNI',
      name: 'DNI (modelo 2021)',
      sides: {
        front: { label: 'Anverso', hint: 'Cara con la foto' },
        back: { label: 'Reverso', hint: 'Cara con el domicilio' },
      },
      zones: {
        number: {
          label: 'Número de DNI',
          hint: 'Aparece dos veces en el anverso y otra en la MRZ. Suele hacer falta en trámites formales.',
        },
        serial: {
          label: 'Número de soporte',
          hint: 'Identifica la tarjeta física y se usa en verificaciones online junto al número de DNI.',
        },
        birthDate: { label: 'Fecha de nacimiento', hint: 'Muy usada en preguntas de seguridad y recuperación de cuentas.' },
        signature: { label: 'Firma', hint: 'Una firma escaneada se puede pegar en cualquier contrato o autorización.' },
        can: {
          label: 'Código CAN',
          hint: 'Las seis cifras que dan acceso al chip por NFC. Nadie que reciba una copia lo necesita.',
        },
        expiry: { label: 'Fechas de expedición y validez', hint: 'Rara vez son necesarias para quien recibe la copia.' },
        name: { label: 'Nombre y apellidos', hint: 'Casi siempre hace falta: es lo que te identifica.' },
        photo: { label: 'Fotografía', hint: 'Útil para quien tiene que comprobar que eres tú en persona.' },
        address: {
          label: 'Domicilio',
          hint: 'Tu dirección. Solo la necesita quien tenga que enviarte algo o registrarte.',
        },
        birthPlace: { label: 'Lugar de nacimiento', hint: 'Otro dato típico de las preguntas de seguridad.' },
        parents: {
          label: 'Nombre de los padres',
          hint: 'No aporta nada a quien recibe la copia y sí a quien quiere suplantarte.',
        },
        mrz: {
          label: 'Zona MRZ (líneas inferiores)',
          hint: 'Las tres líneas legibles por máquina repiten número, soporte y fecha de nacimiento.',
        },
      },
    },
    'cni-fr': {
      countryName: 'Francia',
      the: 'de la tarjeta',
      name: 'Carte nationale d’identité (desde 2021)',
      sides: {
        front: { label: 'Anverso', hint: 'Recto, cara con la foto' },
        back: { label: 'Reverso', hint: 'Verso, cara con la MRZ' },
      },
      zones: {
        number: {
          label: 'Número de documento',
          hint: 'Nueve caracteres que identifican la tarjeta. Aparece también en vertical en ambas caras y en la MRZ.',
        },
        serial: {
          label: 'Número vertical del reverso',
          hint: 'Identificador de la tarjeta impreso en vertical junto al chip.',
        },
        birthDate: { label: 'Fecha de nacimiento', hint: 'Muy usada en preguntas de seguridad y recuperación de cuentas.' },
        birthPlace: {
          label: 'Lugar de nacimiento',
          hint: 'En la tarjeta francesa está en el anverso. Otro dato típico de las preguntas de seguridad.',
        },
        signature: { label: 'Firma', hint: 'Una firma escaneada se puede pegar en cualquier contrato o autorización.' },
        can: {
          label: 'Código CAN',
          hint: 'Las seis cifras de abajo a la derecha dan acceso al chip por NFC. Nadie que reciba una copia lo necesita.',
        },
        expiry: { label: 'Fecha de caducidad', hint: 'Aparece en grande en el anverso y en pequeño arriba en ambas caras.' },
        issueDate: { label: 'Fecha de expedición', hint: 'La fecha de entrega de la tarjeta, en el reverso.' },
        name: { label: 'Apellidos, nombres y nombre de uso', hint: 'Casi siempre hace falta: es lo que te identifica.' },
        photo: {
          label: 'Fotografía (y retratos secundarios)',
          hint: 'La foto principal y los retratos fantasma del anverso y del reverso.',
        },
        height: { label: 'Estatura', hint: 'Un dato físico que no necesita nadie que reciba una copia.' },
        address: {
          label: 'Dirección',
          hint: 'Tu dirección, si figura. Solo la necesita quien tenga que enviarte algo o registrarte.',
        },
        seal: {
          label: 'Código 2D-Doc (sello digital)',
          hint: 'El código cuadrado contiene tus datos firmados digitalmente: cualquiera puede leerlos con el móvil.',
        },
        mrz: {
          label: 'Zona MRZ (líneas inferiores)',
          hint: 'Las tres líneas legibles por máquina repiten número, fechas y nombre.',
        },
      },
    },
    'cie-it': {
      countryName: 'Italia',
      the: 'de la CIE',
      name: 'Carta d’identità elettronica (CIE 3.0, desde 2022)',
      sides: {
        front: { label: 'Anverso', hint: 'Cara con la foto' },
        back: { label: 'Reverso', hint: 'Cara con el código fiscal' },
      },
      zones: {
        number: { label: 'Número de la tarjeta', hint: 'Arriba a la derecha en el anverso y otra vez en la MRZ. Identifica la tarjeta.' },
        issuer: { label: 'Municipio que la expide', hint: 'El ayuntamiento que expidió la tarjeta: suele delatar dónde vives.' },
        name: { label: 'Apellidos y nombre', hint: 'Casi siempre hace falta: es lo que te identifica.' },
        birthDate: {
          label: 'Lugar y fecha de nacimiento',
          hint: 'Comparten línea, así que se tapan juntos. Son respuestas típicas de las preguntas de seguridad.',
        },
        height: { label: 'Estatura', hint: 'Un dato físico que no necesita nadie que reciba una copia.' },
        issueDate: { label: 'Fecha de expedición', hint: 'Rara vez la necesita quien recibe la copia.' },
        expiry: { label: 'Fecha de caducidad', hint: 'Rara vez la necesita quien recibe la copia.' },
        signature: { label: 'Firma', hint: 'Una firma escaneada se puede pegar en cualquier contrato o autorización.' },
        can: {
          label: 'Código CAN',
          hint: 'Las seis cifras de abajo a la derecha dan acceso al chip por NFC. Nadie que reciba una copia lo necesita.',
        },
        photo: {
          label: 'Fotografía (y retratos secundarios)',
          hint: 'La foto principal y los retratos pequeños dentro de la silueta de Italia y en el reverso.',
        },
        parents: { label: 'Nombre de los padres', hint: 'No aporta nada a quien recibe la copia y sí a quien quiere suplantarte.' },
        taxCode: {
          label: 'Código fiscal (y su código de barras)',
          hint: 'Con el codice fiscale se pueden abrir contratos y cuentas a tu nombre. El código de barras del reverso también lo contiene.',
        },
        birthRecord: { label: 'Datos del acta de nacimiento', hint: 'La referencia de tu partida de nacimiento. Nadie que reciba una copia la necesita.' },
        address: { label: 'Domicilio', hint: 'Tu dirección. Solo la necesita quien tenga que enviarte algo o registrarte.' },
        mrz: { label: 'Zona MRZ (líneas inferiores)', hint: 'Las tres líneas legibles por máquina repiten el número, las fechas y el nombre.' },
      },
    },
  },

  usages: {
    other: {
      label: 'Otro / no lo tengo claro',
      short: 'cualquier uso',
      watermark: 'Copia de uso limitado',
      note: 'Opción prudente: se tapa lo que casi nunca hace falta. Si te rechazan la copia, destapa solo lo que te pidan.',
    },
    rental: {
      label: 'Alquiler de vivienda',
      short: 'alquiler',
      watermark: 'Solo para alquiler',
      note: 'Para alquilar suelen bastar el nombre, el número de documento y la foto. Lo demás se tapa.',
    },
    job: {
      label: 'Oferta de trabajo o selección',
      short: 'proceso de selección',
      watermark: 'Solo para proceso de selección',
      note: 'Nadie necesita tu documento antes de firmar un contrato. Si te lo piden antes de la entrevista, desconfía: solo quedan visibles nombre y foto.',
    },
    sale: {
      label: 'Compraventa (Wallapop, Vinted…)',
      short: 'compraventa',
      watermark: 'Solo para verificar compraventa',
      note: 'Un comprador o vendedor particular no necesita tu documento. Que insista en verlo es una señal típica de estafa.',
    },
    hotel: {
      label: 'Hotel o alojamiento',
      short: 'hotel',
      watermark: 'Solo para registro de viajeros',
      note: 'El registro de viajeros pide el número de documento, la fecha de nacimiento y el domicilio (en España, también el número de soporte del DNI), así que se quedan visibles.',
    },
    bank: {
      label: 'Banco o financiera',
      short: 'banco',
      watermark: 'Solo para identificación bancaria',
      note: 'Los bancos deben identificarte con el documento completo. Tu protección aquí es la marca de agua.',
    },
    government: {
      label: 'Administración pública',
      short: 'trámite administrativo',
      watermark: 'Solo para trámite administrativo',
      note: 'La Administración suele necesitar la copia completa. Solo se tapa el CAN y se deja claro el uso.',
    },
  },

  info: {
    cover: {
      eyebrow: 'Anverso y reverso',
      title: 'Qué datos del DNI conviene tapar',
      lead: 'No todos los datos valen lo mismo para quien quiere hacerse pasar por ti. Estos son los que más se aprovechan y los que menos falta hacen en una copia.',
    },
    usage: {
      eyebrow: 'Según el trámite',
      title: 'Qué dejar visible según para qué es la copia',
      use: 'Uso',
      covered: 'Se tapa',
      watermark: 'Marca de agua',
      note: 'Cada documento solo tapa los datos que tiene: el código 2D-Doc, por ejemplo, solo existe en la tarjeta francesa y el código fiscal, en la italiana. Es una orientación. Si quien te pide la copia necesita algún dato más, destápalo solo para él y deja la marca de agua.',
    },
    privacy: {
      eyebrow: 'Sin servidores de por medio',
      title: 'Tu DNI no sale de tu dispositivo. Compruébalo.',
      lead: 'Sequrid funciona entero en tu navegador. La foto se lee del archivo, se dibuja en un lienzo, se tapa y se convierte a PDF o JPG ahí mismo.',
      steps: [
        'Abre esta página y espera a que cargue.',
        'Activa el modo avión o desconecta la red.',
        'Protege tu DNI y descarga el PDF. Funciona igual.',
      ],
      csp: "Además, el servidor envía la cabecera `Content-Security-Policy: connect-src 'none'`, que impide al navegador hacer cualquier petición desde la página. El código es abierto: ",
      cspLink: 'revísalo tú mismo',
      cspEnd: '.',
    },
    faq: {
      eyebrow: 'Dudas habituales',
      title: 'Preguntas frecuentes',
      items: [
        {
          q: '¿La foto de mi DNI se sube a algún servidor?',
          a: 'No. La imagen se abre y se procesa dentro de tu navegador. El servidor solo entrega los archivos de la página, y su política de seguridad (CSP) prohíbe al navegador conectarse a ningún sitio: aunque quisiera, la página no podría enviar tu foto.',
        },
        {
          q: '¿Se guarda algo?',
          a: 'Nada de tus fotos ni de tus ajustes. Al recargar la página todo empieza de cero. Lo único que se recuerda es el idioma y si prefieres el tema claro u oscuro.',
        },
        {
          q: '¿Pixelar o desenfocar es tan seguro como tapar en negro?',
          a: 'El negro es lo más seguro porque elimina por completo la información. El pixelado y el desenfoque de Sequrid usan bloques grandes para que el texto no se pueda reconstruir, pero si dudas, usa negro.',
        },
        {
          q: '¿Para qué sirve la marca de agua con fecha y destinatario?',
          a: 'Deja claro para quién y cuándo se hizo la copia. Si alguien la reutiliza para otra cosa, la marca lo delata y la copia pierde valor para un estafador.',
        },
        {
          q: '¿Qué es el CAN del DNI?',
          a: 'Son seis cifras en la esquina inferior derecha del anverso que permiten leer el chip por NFC. Nadie que reciba una copia lo necesita.',
        },
        {
          q: '¿Es legal enviar una copia del DNI con datos tapados?',
          a: 'Sí. Es tu documento y puedes decidir qué datos compartir. Si quien lo pide necesita algún dato concreto, destápalo solo para esa copia y deja la marca de agua.',
        },
        {
          q: '¿Puedo juntar dos documentos en el mismo PDF?',
          a: 'Sí. Activa «Añadir un segundo documento» y tendrás cuatro huecos; cada documento puede ser de un país distinto. El PDF coloca cada uno en una fila con sus dos caras.',
        },
        {
          q: '¿Qué documentos admite?',
          a: 'El DNI español (modelo 2021), la carte nationale d’identité francesa (desde 2021) y la carta d’identità elettronica italiana (CIE 3.0, desde 2022). Elige el país de cada documento en el panel de fotos y las zonas se colocan sobre sus datos. Iremos añadiendo más países.',
        },
        {
          q: '¿Funciona en el móvil y sin conexión?',
          a: 'Sí. En el móvil puedes hacer la foto directamente. Y una vez cargada la página, puedes activar el modo avión: todo sigue funcionando porque no necesita la red.',
        },
        {
          q: '¿Puedo instalarlo en mi propio servidor?',
          a: 'Sí, ese es el objetivo: es código abierto y se distribuye como imagen Docker y chart de Helm. Así puedes revisar exactamente qué hace y servirlo tú mismo.',
        },
      ],
    },
    help: {
      eyebrow: 'Si ya ha pasado',
      title: 'Dónde pedir ayuda si alguien usa tu identidad',
      lead: 'Servicios oficiales por país. Si el delito está ocurriendo ahora mismo, llama al número de emergencias.',
      country: 'País',
      service: 'Servicio',
      contact: 'Cómo contactar',
      what: 'Para qué sirve',
      kinds: { phone: 'Teléfono', whatsapp: 'WhatsApp', telegram: 'Telegram', web: 'Web' },
      free: 'gratis',
      emergency: 'Emergencias',
      emergencySms: 'Emergencias por SMS',
      newTab: 'se abre en una pestaña nueva',
      lines: {
        'es-incibe': 'Línea gratuita y confidencial del Instituto Nacional de Ciberseguridad para cualquier problema de ciberseguridad. Todos los días de 8:00 a 23:00.',
        'fr-17cyber': 'Asistencia oficial en línea para víctimas de ciberdelitos, con ayuda de la policía o la gendarmería si hace falta.',
        'it-postale': 'Portal de la Policía Postal y de Ciberseguridad para informarte y avisar de delitos en internet. Las denuncias formales se ponen en una comisaría.',
      },
      note: 'Solo aparecen servicios comprobados en sus webs oficiales. Iremos añadiendo países junto con sus documentos.',
    },
  },
};
