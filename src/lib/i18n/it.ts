import type { Side } from '../documents';
import type { Messages } from './en';

const side = (s: Side) => (s === 'front' ? 'fronte' : 'retro');

export const it: Messages = {
  meta: {
    title: 'Sequrid · Proteggi la tua carta d’identità',
    description:
      'Oscura i dati sensibili della tua carta d’identità (Spagna, Francia e Italia) e aggiungi una filigrana con destinatario e data. Tutto viene elaborato nel tuo browser: la foto non lascia mai il tuo dispositivo.',
  },

  language: {
    label: 'Lingua',
    current: (name) => `Lingua: ${name}`,
    auto: 'Automatica',
    autoHint: (name) => `Lingua del browser: ${name}`,
  },

  header: {
    home: 'Sequrid, vai all’editor',
    sections: 'Sezioni',
    nav: { editor: 'Editor', cover: 'Cosa oscurare', privacy: 'Privacy', faq: 'Domande', help: 'Aiuto' },
    localTitle: 'Nessuna foto lascia il tuo browser',
    local: '100% sul tuo dispositivo',
    source: 'Codice sorgente',
    theme: 'Cambia tema',
    light: 'Usa il tema chiaro',
    dark: 'Usa il tema scuro',
  },

  hero: {
    noUpload: 'La foto non viene mai caricata',
    noSignup: 'Senza registrazione',
    openSource: 'Open source',
    title: 'Proteggi la tua carta d’identità prima di inviarla',
    lead: 'Oscura i dati che non servono a nessuno, aggiungi una filigrana con il destinatario e la data e scarica un PDF o un JPG pronto da inviare. Funziona con il DNI spagnolo, la carta d’identità francese e la CIE italiana.',
  },

  footer: {
    text: 'Sequrid elabora tutto nel tuo browser. Nessuna immagine viene mai inviata o salvata.',
    source: 'Codice sorgente',
    license: 'Licenza AGPL-3.0',
  },

  mobileBar: {
    settings: 'Impostazioni',
  },

  slots: {
    title: 'Foto del documento',
    doc: (n) => `Documento ${n}`,
    country: (n) => `Paese del documento ${n}`,
    countryChanged: (n, name) => `Documento ${n}: zone posizionate per ${name}.`,
    slot: (face, loaded) => `${face}: ${loaded ? 'foto caricata, premi per modificarla' : 'nessuna foto, premi per caricarla'}`,
    secondDoc: 'Aggiungi un secondo documento',
    sample: 'Prova con un esempio',
    tip: 'Trascina più foto insieme: riempiranno da sole gli spazi liberi.',
    paste: 'Puoi anche incollare con [Ctrl]+[V].',
  },

  country: {
    button: (field, country, model) => `${field}: ${country}, ${model}`,
    soon: 'Altri paesi in arrivo',
    search: 'Cerca un paese o un documento',
    clear: 'Cancella la ricerca',
    current: 'Attuale',
    since: (from) => `${from}–oggi`,
    years: (from, until) => (from === until ? `${from}` : `${from}–${until}`),
    option: (country, model, years, current) => `${country}, ${model}, ${years}${current ? ', modello attuale' : ''}`,
    noResults: (query) => `Nessun paese o documento corrisponde a “${query}”`,
    results: (count) => (count === 0 ? 'Nessun documento trovato' : count === 1 ? '1 documento' : `${count} documenti`),
  },

  editor: {
    label: 'Editor',
    view: 'Vista',
    edit: 'Modifica',
    compare: 'Prima / dopo',
    tool: 'Strumento',
    move: 'Sposta',
    moveTitle: 'Sposta e ridimensiona le zone',
    draw: 'Disegna',
    drawTitle: 'Disegna un rettangolo per oscurare ciò che vuoi',
    frame: 'Inquadratura',
    frameTitle: 'Adatta la cornice ai bordi della carta',
    zoom: 'Zoom',
    zoomOut: 'Riduci',
    zoomIn: 'Ingrandisci',
    fit: 'Adatta',
    fitTitle: 'Adatta allo schermo',
    rotate: 'Ruota di 90 gradi',
    rotateTitle: 'Ruota di 90°',
    removeZone: 'Rimuovi la zona selezionata',
    removeZoneTitle: 'Rimuovi la zona selezionata (Canc)',
    dropTitle: (s) => `Carica o trascina la foto del ${side(s)}`,
    dropFormats: 'JPG, PNG o WebP. Dal telefono puoi scattare la foto direttamente.',
    dropPrivate: 'L’immagine non lascia mai il tuo dispositivo',
    trySample: 'oppure prova con un documento di esempio',
    dropHere: 'Rilascia qui le foto',
    hints: {
      move: 'Trascina una zona per spostarla o tira i suoi angoli per ridimensionarla.',
      draw: 'Trascina sull’immagine per oscurare ciò che vuoi.',
      frame: 'Trascina gli angoli o i lati della cornice fino ai bordi della carta. Le zone si riposizionano da sole.',
    },
    keys: 'Con l’area di modifica attiva: [Tab] passa da una zona all’altra, le frecce le spostano ([Maiusc] + frecce per ridimensionarle) e [Canc] le elimina.',
    viewing: (face) => `Stai visualizzando ${face}.`,
    changePhoto: 'Cambia foto',
    resetZones: 'Ripristina le zone',
    removeFace: 'Rimuovi questo lato',
  },

  stage: {
    customZone: 'Zona personalizzata',
    framingLabel: 'Inquadratura: trascina la cornice fino ai bordi della carta',
    canvasLabel:
      'Area di modifica. Tab passa da una zona all’altra, le frecce le spostano, Maiusc più frecce le ridimensionano e Canc le elimina.',
    frameTip: 'Adatta la cornice ai bordi della carta',
    remove: (label) => `Rimuovi ${label}`,
  },

  compare: {
    originalLabel: 'Foto originale',
    protectedLabel: 'Copia protetta',
    original: 'Originale',
    protected: 'Protetta',
    position: 'Posizione del cursore di confronto',
    hint: 'Scorri per confrontare la foto originale con la copia protetta.',
  },

  settings: {
    usageTitle: 'A cosa serve la copia?',
    usage: 'Uso',
    recipient: 'Destinatario',
    optional: '(facoltativo)',
    recipientPlaceholder: 'Es. Immobiliare Sole',
    date: 'Data',

    coverTitle: 'Cosa oscurare',
    coverMode: 'Modalità di oscuramento',
    auto: 'Automatica',
    manual: 'Manuale',
    autoHelp: (the) =>
      `Le zone vengono posizionate sui dati ${the ?? 'dei documenti'}. Controlla che siano al posto giusto; altrimenti usa “Inquadratura”.`,
    alsoOn: (s) => `anche sul ${side(s)}`,
    recommended: 'Consigliato',
    manualHelp: 'Scegli “Disegna” nella barra degli strumenti e segna con il mouse o con il dito tutto ciò che vuoi oscurare.',
    coverStyle: 'Come oscurare',
    black: 'Nero',
    pixelate: 'Pixelato',
    blur: 'Sfocato',
    styleHelp:
      'Il nero è l’opzione più sicura. Pixelato e sfocato vengono applicati in modo marcato perché non si possa leggere nulla, ma si nota meno che qualcosa è stato oscurato.',

    watermarkTitle: 'Filigrana',
    watermark: 'Aggiungi filigrana',
    watermarkPreview: 'Testo della filigrana',
    customText: 'Testo personalizzato',
    customHint: '(sostituisce quello automatico)',
    customPlaceholder: 'Es. Solo per Immobiliare Sole',
    opacity: 'Intensità',
    size: 'Dimensione',
    tone: 'Colore della filigrana',
    dark: 'Scura',
    light: 'Chiara',
    grayscale: 'Copia in bianco e nero',

    levelTitle: 'Livello di protezione',
    levelEmpty: 'Carica una foto per iniziare.',

    downloadTitle: 'Scarica',
    pdfSize: 'Dimensione nel PDF',
    real: 'Dimensione reale',
    realTitle: 'Carta a 85,6 × 54 mm, come una fotocopia',
    large: 'Ingrandita',
    largeTitle: 'Ogni lato largo quanto la pagina, più leggibile',
    pdf: 'Scarica PDF',
    pdfBusy: 'Generazione del PDF…',
    jpgFace: 'JPG di questo lato',
    jpgAll: 'JPG con tutti i lati',
    busy: 'Generazione…',
    noMetadata: 'La copia non contiene metadati: né posizione, né modello del telefono, né data dello scatto.',
  },

  protection: {
    levels: { low: 'Protezione bassa.', medium: 'Protezione media.', high: 'Protezione alta.' },
    manual: (zones) =>
      `Modalità manuale: ${zones === 1 ? '1 zona disegnata' : `${zones} zone disegnate`}. Controlla che coprano ciò che vuoi.`,
    addWatermark: 'Aggiungi la filigrana.',
    covered: (covered, total, use) => `Hai oscurato ${covered} dei ${total} dati consigliati per ${use}.`,
    noWatermark: 'Senza filigrana, la copia può essere usata per qualsiasi scopo.',
  },

  status: {
    notImage: 'Non sembra un’immagine. Usa una foto JPG, PNG o WebP.',
    noFreeSlots: 'Non ci sono più spazi liberi. Rimuovi un lato per caricarne un altro.',
    loadedOne: (face) => `Foto caricata in ${face}. Controlla che le zone siano al posto giusto.`,
    loadedMany: (count, skipped) =>
      `${count === 1 ? '1 foto inserita' : `${count} foto inserite`} negli spazi liberi.` +
      (skipped === 1 ? ' 1 è rimasta fuori.' : skipped > 1 ? ` ${skipped} sono rimaste fuori.` : ''),
    sample: (short, country) => `Esempio di ${short} (${country}) caricato su entrambi i lati. I dati sono inventati.`,
    zoneVisible: (label) =>
      `“${label}” ora è visibile. Per oscurare di nuovo questo dato, spunta la sua casella in “Cosa oscurare”.`,
    zoneAdded: 'Zona aggiunta. Trascinala per spostarla o usa gli angoli per ridimensionarla.',
    zoneSelected: (label) => `Zona selezionata: ${label}.`,
    downloadReady: 'Download pronto. Ricorda: solo per chi ne ha bisogno.',
    downloadFailed: 'Non è stato possibile generare il download.',
  },

  errors: {
    notImage: 'Il file non è un’immagine.',
    heic: 'Il tuo browser non riesce ad aprire le foto HEIC. Esportala in JPG o imposta la fotocamera su “Più compatibile”.',
    unreadable: 'Impossibile leggere l’immagine. Prova con un JPG, PNG o WebP.',
  },

  files: {
    protected: 'protetto',
    document: 'documento',
    sides: { front: 'fronte', back: 'retro' },
  },

  fields: {
    number: 'Numero del documento',
    serial: 'Numero della carta o di serie',
    birthDate: 'Data di nascita',
    signature: 'Firma',
    can: 'Codice CAN',
    expiry: 'Date di validità',
    issueDate: 'Data di rilascio',
    name: 'Nome e cognome',
    photo: 'Foto',
    address: 'Indirizzo',
    birthPlace: 'Luogo di nascita',
    parents: 'Nomi dei genitori',
    height: 'Statura',
    seal: 'Codice 2D-Doc',
    taxCode: 'Codice fiscale',
    birthRecord: 'Estremi dell’atto di nascita',
    issuer: 'Autorità di rilascio',
    mrz: 'Zona MRZ',
  },

  documents: {
    'dni-es': {
      countryName: 'Spagna',
      the: 'del DNI',
      name: 'DNI (modello 2021)',
      sides: {
        front: { label: 'Fronte', hint: 'Lato con la foto' },
        back: { label: 'Retro', hint: 'Lato con l’indirizzo' },
      },
      zones: {
        number: {
          label: 'Numero del DNI',
          hint: 'Compare due volte sul fronte e di nuovo nella MRZ. Spesso serve per le pratiche ufficiali.',
        },
        serial: {
          label: 'Numero di serie della carta',
          hint: 'Identifica la carta fisica e si usa insieme al numero del DNI per le verifiche online.',
        },
        birthDate: { label: 'Data di nascita', hint: 'Molto usata nelle domande di sicurezza e nel recupero degli account.' },
        signature: { label: 'Firma', hint: 'Una firma scansionata può essere incollata su qualsiasi contratto o autorizzazione.' },
        can: {
          label: 'Codice CAN',
          hint: 'Le sei cifre che danno accesso al chip tramite NFC. Chi riceve una copia non ne ha bisogno.',
        },
        expiry: { label: 'Date di rilascio e di scadenza', hint: 'Raramente servono a chi riceve la copia.' },
        name: { label: 'Nome e cognomi', hint: 'Serve quasi sempre: è ciò che ti identifica.' },
        photo: { label: 'Foto', hint: 'Utile a chi deve verificare di persona che sei tu.' },
        address: {
          label: 'Indirizzo',
          hint: 'Dove abiti. Serve solo a chi deve inviarti qualcosa o registrare i tuoi dati.',
        },
        birthPlace: { label: 'Luogo di nascita', hint: 'Un’altra risposta classica alle domande di sicurezza.' },
        parents: {
          label: 'Nomi dei genitori',
          hint: 'Inutili per chi riceve la copia, ma preziosi per chi vuole spacciarsi per te.',
        },
        mrz: {
          label: 'Zona MRZ (righe in basso)',
          hint: 'Le tre righe a lettura ottica ripetono il numero, il numero di serie della carta e la data di nascita.',
        },
      },
    },
    'cni-fr': {
      countryName: 'Francia',
      the: 'della carta',
      name: 'Carte nationale d’identité (dal 2021)',
      sides: {
        front: { label: 'Fronte', hint: 'Lato con la foto' },
        back: { label: 'Retro', hint: 'Lato con la MRZ' },
      },
      zones: {
        number: {
          label: 'Numero del documento',
          hint: 'Nove caratteri che identificano la carta. Compare anche in verticale su entrambi i lati e nella MRZ.',
        },
        serial: {
          label: 'Numero verticale sul retro',
          hint: 'Identificativo della carta stampato in verticale accanto al chip.',
        },
        birthDate: { label: 'Data di nascita', hint: 'Molto usata nelle domande di sicurezza e nel recupero degli account.' },
        birthPlace: {
          label: 'Luogo di nascita',
          hint: 'Sulla carta francese si trova sul fronte. Un’altra risposta classica alle domande di sicurezza.',
        },
        signature: { label: 'Firma', hint: 'Una firma scansionata può essere incollata su qualsiasi contratto o autorizzazione.' },
        can: {
          label: 'Codice CAN',
          hint: 'Le sei cifre in basso a destra danno accesso al chip tramite NFC. Chi riceve una copia non ne ha bisogno.',
        },
        expiry: { label: 'Data di scadenza', hint: 'Stampata in grande sul fronte e in piccolo in alto su entrambi i lati.' },
        issueDate: { label: 'Data di rilascio', hint: 'La data in cui è stata rilasciata la carta, sul retro.' },
        name: { label: 'Cognome, nomi e nome d’uso', hint: 'Serve quasi sempre: è ciò che ti identifica.' },
        photo: {
          label: 'Foto (e ritratti secondari)',
          hint: 'La foto principale e le immagini fantasma sul fronte e sul retro.',
        },
        height: { label: 'Statura', hint: 'Un dato fisico che a chi riceve una copia non serve.' },
        address: {
          label: 'Indirizzo',
          hint: 'Il tuo indirizzo, se presente. Serve solo a chi deve inviarti qualcosa o registrare i tuoi dati.',
        },
        seal: {
          label: 'Codice 2D-Doc (sigillo digitale)',
          hint: 'Il codice quadrato contiene i tuoi dati firmati digitalmente: chiunque può leggerli con un telefono.',
        },
        mrz: {
          label: 'Zona MRZ (righe in basso)',
          hint: 'Le tre righe a lettura ottica ripetono il numero, le date e il nome.',
        },
      },
    },
    'cie-it': {
      countryName: 'Italia',
      the: 'della CIE',
      name: 'Carta d’identità elettronica (CIE 3.0, dal 2022)',
      sides: {
        front: { label: 'Fronte', hint: 'Lato con la foto' },
        back: { label: 'Retro', hint: 'Lato con il codice fiscale' },
      },
      zones: {
        number: { label: 'Numero della carta', hint: 'In alto a destra sul fronte e di nuovo nella MRZ. Identifica la carta.' },
        issuer: { label: 'Comune di rilascio', hint: 'Il comune che ha rilasciato la carta: di solito rivela dove abiti.' },
        name: { label: 'Cognome e nome', hint: 'Serve quasi sempre: è ciò che ti identifica.' },
        birthDate: {
          label: 'Luogo e data di nascita',
          hint: 'Sono sulla stessa riga, quindi vengono oscurati insieme. Sono risposte classiche alle domande di sicurezza.',
        },
        height: { label: 'Statura', hint: 'Un dato fisico che a chi riceve una copia non serve.' },
        issueDate: { label: 'Data di emissione', hint: 'Raramente serve a chi riceve la copia.' },
        expiry: { label: 'Data di scadenza', hint: 'Raramente serve a chi riceve la copia.' },
        signature: { label: 'Firma', hint: 'Una firma scansionata può essere incollata su qualsiasi contratto o autorizzazione.' },
        can: {
          label: 'Codice CAN',
          hint: 'Le sei cifre in basso a destra danno accesso al chip tramite NFC. Chi riceve una copia non ne ha bisogno.',
        },
        photo: {
          label: 'Foto (e ritratti secondari)',
          hint: 'La foto principale e i piccoli ritratti dentro la sagoma dell’Italia e sul retro.',
        },
        parents: { label: 'Nomi dei genitori', hint: 'Non aggiungono nulla per chi riceve la copia e aiutano chi vuole spacciarsi per te.' },
        taxCode: {
          label: 'Codice fiscale (e relativo codice a barre)',
          hint: 'Il codice fiscale basta per stipulare contratti e aprire conti a tuo nome. È contenuto anche nel codice a barre sul retro.',
        },
        birthRecord: { label: 'Estremi dell’atto di nascita', hint: 'Il riferimento al tuo atto di nascita. Chi riceve una copia non ne ha bisogno.' },
        address: { label: 'Indirizzo di residenza', hint: 'Il tuo indirizzo. Serve solo a chi deve inviarti qualcosa o registrare i tuoi dati.' },
        mrz: { label: 'Zona MRZ (righe in basso)', hint: 'Le tre righe a lettura ottica ripetono il numero, le date e il nome.' },
      },
    },
  },

  usages: {
    other: {
      label: 'Altro / non lo so',
      short: 'qualsiasi uso',
      watermark: 'Copia per uso limitato',
      note: 'L’opzione prudente: oscura ciò che non serve quasi mai. Se la copia viene rifiutata, rendi visibile solo ciò che ti chiedono.',
    },
    rental: {
      label: 'Affitto di una casa',
      short: 'un affitto',
      watermark: 'Solo per un affitto',
      note: 'Per affittare una casa di solito bastano nome, numero del documento e foto. Tutto il resto viene oscurato.',
    },
    job: {
      label: 'Offerta di lavoro o selezione',
      short: 'una selezione del personale',
      watermark: 'Solo per una selezione del personale',
      note: 'Nessuno ha bisogno del tuo documento prima della firma di un contratto. Se te lo chiedono prima del colloquio, diffida: restano visibili solo nome e foto.',
    },
    sale: {
      label: 'Compravendita tra privati (Subito, Vinted…)',
      short: 'una compravendita tra privati',
      watermark: 'Solo per verificare una compravendita',
      note: 'Un acquirente o un venditore privato non ha bisogno del tuo documento. Insistere per vederlo è un tipico segnale di truffa.',
    },
    hotel: {
      label: 'Hotel o alloggio',
      short: 'un hotel',
      watermark: 'Solo per la registrazione degli ospiti',
      note: 'La registrazione degli ospiti richiede numero del documento, data di nascita e indirizzo (in Spagna anche il numero di supporto del DNI), quindi restano visibili.',
    },
    bank: {
      label: 'Banca o finanziaria',
      short: 'una banca',
      watermark: 'Solo per identificazione bancaria',
      note: 'Le banche devono identificarti con il documento completo. Qui la tua protezione è la filigrana.',
    },
    government: {
      label: 'Pubblica amministrazione',
      short: 'una pratica amministrativa',
      watermark: 'Solo per una pratica amministrativa',
      note: 'La pubblica amministrazione di solito ha bisogno della copia completa. Viene oscurato solo il CAN e lo scopo è indicato chiaramente.',
    },
  },

  info: {
    cover: {
      eyebrow: 'Fronte e retro',
      title: 'Quali dati del documento conviene oscurare',
      lead: 'Non tutti i dati hanno lo stesso valore per chi vuole spacciarsi per te. Questi sono i più sfruttati e quelli di cui una copia ha meno bisogno.',
    },
    usage: {
      eyebrow: 'In base alla pratica',
      title: 'Cosa lasciare visibile in base all’uso della copia',
      use: 'Uso',
      covered: 'Oscurati',
      watermark: 'Filigrana',
      note: 'Ogni documento oscura solo i dati che contiene: il codice 2D-Doc, per esempio, esiste solo sulla carta francese e il codice fiscale solo su quella italiana. È un’indicazione. Se chi ti chiede la copia ha bisogno di un altro dato, rendilo visibile solo per lui e mantieni la filigrana.',
    },
    privacy: {
      eyebrow: 'Nessun server di mezzo',
      title: 'Il tuo documento non lascia mai il tuo dispositivo. Verificalo tu stesso.',
      lead: 'Sequrid funziona interamente nel tuo browser. La foto viene letta dal file, disegnata su un canvas, oscurata e trasformata in PDF o JPG direttamente lì.',
      steps: [
        'Apri questa pagina e attendi che si carichi.',
        'Attiva la modalità aereo o disconnettiti dalla rete.',
        'Proteggi il tuo documento e scarica il PDF. Funziona esattamente allo stesso modo.',
      ],
      csp: "Inoltre, il server invia l’intestazione `Content-Security-Policy: connect-src 'none'`, che impedisce al browser di effettuare qualsiasi richiesta dalla pagina. Il codice è aperto: ",
      cspLink: 'controllalo tu stesso',
      cspEnd: '.',
    },
    faq: {
      eyebrow: 'Dubbi comuni',
      title: 'Domande frequenti',
      items: [
        {
          q: 'La foto del mio documento viene caricata su un server?',
          a: 'No. L’immagine viene aperta ed elaborata all’interno del tuo browser. Il server fornisce solo i file della pagina e la sua policy di sicurezza (CSP) vieta al browser di connettersi altrove: anche volendo, la pagina non potrebbe inviare la tua foto.',
        },
        {
          q: 'Viene salvato qualcosa?',
          a: 'Nessuna delle tue foto o impostazioni. Quando ricarichi la pagina, tutto riparte da zero. Vengono ricordate solo la lingua e la tua preferenza per il tema chiaro o scuro.',
        },
        {
          q: 'Pixelare o sfocare è sicuro quanto oscurare in nero?',
          a: 'Il nero è l’opzione più sicura perché elimina completamente l’informazione. Il pixelato e lo sfocato di Sequrid usano blocchi grandi, così il testo non si può ricostruire, ma nel dubbio usa il nero.',
        },
        {
          q: 'A cosa serve la filigrana con data e destinatario?',
          a: 'Chiarisce per chi e quando è stata fatta la copia. Se qualcuno la riutilizza per altro, la filigrana lo smaschera e la copia perde valore per un truffatore.',
        },
        {
          q: 'Cos’è il CAN?',
          a: 'Sono sei cifre nell’angolo in basso a destra del fronte che permettono a chiunque di leggere il chip tramite NFC. Chi riceve una copia non ne ha bisogno.',
        },
        {
          q: 'È legale inviare una copia del documento con alcuni dati oscurati?',
          a: 'Sì. È il tuo documento e decidi tu quali dati condividere. Se chi te lo chiede ha bisogno di un dato specifico, rendilo visibile solo per quella copia e mantieni la filigrana.',
        },
        {
          q: 'Posso mettere due documenti nello stesso PDF?',
          a: 'Sì. Attiva “Aggiungi un secondo documento” e avrai quattro spazi; ogni documento può essere di un paese diverso. Il PDF mette ciascuno su una riga con entrambi i lati.',
        },
        {
          q: 'Quali documenti sono supportati?',
          a: 'Il DNI spagnolo (modello 2021), la carta d’identità francese (dal 2021) e la carta d’identità elettronica italiana (CIE 3.0, dal 2022). Scegli il paese di ogni documento nel pannello delle foto e le zone vengono posizionate sui suoi dati. Altri paesi arriveranno in seguito.',
        },
        {
          q: 'Funziona sul telefono e offline?',
          a: 'Sì. Dal telefono puoi scattare la foto direttamente. E una volta caricata la pagina, puoi attivare la modalità aereo: tutto continua a funzionare perché non serve la rete.',
        },
        {
          q: 'Posso ospitarlo sul mio server?',
          a: 'Sì, è proprio questo il punto: è open source e viene distribuito come immagine Docker e chart Helm. Così puoi verificare esattamente cosa fa e ospitarlo in autonomia.',
        },
      ],
    },
    help: {
      eyebrow: 'Se è già successo',
      title: 'A chi rivolgersi se qualcuno usa la tua identità',
      lead: 'Servizi ufficiali per paese. Se un reato è in corso, chiama il numero di emergenza.',
      country: 'Paese',
      service: 'Servizio',
      contact: 'Come contattarli',
      what: 'Di cosa si occupano',
      kinds: { phone: 'Telefono', whatsapp: 'WhatsApp', telegram: 'Telegram', web: 'Sito web' },
      free: 'gratuito',
      emergency: 'Emergenze',
      emergencySms: 'Emergenze via SMS',
      newTab: 'si apre in una nuova scheda',
      lines: {
        'es-incibe': 'Linea gratuita e riservata dell’Istituto nazionale di cybersicurezza spagnolo per qualsiasi problema di sicurezza informatica. Tutti i giorni dalle 8:00 alle 23:00.',
        'fr-17cyber': 'Assistenza ufficiale online per le vittime di reati informatici, con l’aiuto della polizia o della gendarmeria quando serve.',
        'it-postale': 'Portale della Polizia Postale e per la Sicurezza Cibernetica per informarsi e segnalare reati online. Le denunce vere e proprie si presentano presso un ufficio di Polizia o dei Carabinieri.',
      },
      note: 'Sono elencati solo servizi verificati sui loro siti ufficiali. Altri paesi verranno aggiunti insieme ai loro documenti.',
    },
  },
};
