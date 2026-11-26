import type { DocumentId, Side, ZoneKey } from '../documents';
import type { UsageId } from '../presets';

/**
 * English messages: the source of truth for every user-visible string.
 * Other languages must have exactly the same shape (see `Messages`).
 *
 * Inline markup understood by the `Rich` component: `[Key]` renders a <kbd>,
 * `**text**` a <strong> and `` `text` `` a <code>.
 */

interface ZoneText {
  label: string;
  /** Why this field matters, shown as a hint in the UI. */
  hint: string;
}

interface DocumentText {
  countryName: string;
  /** Full name of the document model. */
  name: string;
  sides: Record<Side, { label: string; hint: string }>;
  zones: Partial<Record<ZoneKey, ZoneText>>;
}

interface UsageText {
  label: string;
  /** Short name used in sentences ("recommended for …"). */
  short: string;
  /** Default watermark text, before recipient and date. */
  watermark: string;
  note: string;
}

const side = (s: Side) => (s === 'front' ? 'front' : 'back');

export const en = {
  meta: {
    title: 'Sequrid · Protect your ID card',
    description:
      'Cover the sensitive details on your ID card (Spain and France) and add a watermark with the recipient and the date. Everything is processed in your browser: the photo never leaves your device.',
  },

  language: {
    label: 'Language',
    current: (name: string) => `Language: ${name}`,
  },

  header: {
    home: 'Sequrid, go to the editor',
    sections: 'Sections',
    nav: { editor: 'Editor', cover: 'What to cover', privacy: 'Privacy', faq: 'FAQ' },
    localTitle: 'No photo ever leaves your browser',
    local: '100% on your device',
    source: 'Source code',
    theme: 'Change theme',
    light: 'Use light theme',
    dark: 'Use dark theme',
  },

  hero: {
    noUpload: 'Your photo is never uploaded',
    noSignup: 'No sign-up',
    openSource: 'Open source',
    title: 'Protect your ID card before sending it',
    lead: 'Cover the details nobody needs, add a watermark with the recipient and the date, and download a PDF or JPG ready to send. Works with the Spanish DNI and the French national identity card.',
  },

  footer: {
    text: 'Sequrid processes everything in your browser. No image is ever sent or stored.',
    source: 'Source code',
    license: 'AGPL-3.0 license',
  },

  mobileBar: {
    settings: 'Settings',
  },

  slots: {
    title: 'Document photos',
    doc: (n: number) => `Document ${n}`,
    country: (n: number) => `Country of document ${n}`,
    countryChanged: (n: number, name: string) => `Document ${n}: zones placed for ${name}.`,
    slot: (face: string, loaded: boolean) => `${face}: ${loaded ? 'loaded, press to edit' : 'empty, press to upload'}`,
    secondDoc: 'Add a second document',
    sample: 'Try with a sample',
    tip: 'Drop several photos at once and they fill the free slots on their own.',
    paste: 'You can also paste with [Ctrl]+[V].',
  },

  country: {
    /** Accessible name of the picker: "Country of document 1: Spain, DNI (2021 model)". */
    button: (field: string, country: string, model: string) => `${field}: ${country}, ${model}`,
    soon: 'More countries coming soon',
    /** Placeholder and accessible name of the search box. */
    search: 'Search country or document',
    clear: 'Clear search',
    /** Badge of models that are still issued. */
    current: 'Current',
    /** Years of a model still issued: "2021–present". */
    since: (from: number) => `${from}–present`,
    /** Years of a model no longer issued: "2015–2021". */
    years: (from: number, until: number) => (from === until ? `${from}` : `${from}–${until}`),
    /** Accessible name of an option: "Spain, DNI (2021 model), 2021–present, current". */
    option: (country: string, model: string, years: string, current: boolean) =>
      `${country}, ${model}, ${years}${current ? ', current' : ''}`,
    noResults: (query: string) => `No country or document matches “${query}”`,
    /** Announced to screen readers while typing. */
    results: (count: number) => (count === 0 ? 'No documents found' : count === 1 ? '1 document' : `${count} documents`),
  },

  editor: {
    label: 'Editor',
    view: 'View',
    edit: 'Edit',
    compare: 'Before / after',
    tool: 'Tool',
    move: 'Move',
    moveTitle: 'Move and resize zones',
    draw: 'Draw',
    drawTitle: 'Draw a rectangle to cover anything you want',
    frame: 'Frame',
    frameTitle: 'Fit the frame to the edges of the card',
    zoom: 'Zoom',
    zoomOut: 'Zoom out',
    zoomIn: 'Zoom in',
    fit: 'Fit',
    fitTitle: 'Fit to screen',
    rotate: 'Rotate 90 degrees',
    rotateTitle: 'Rotate 90°',
    removeZone: 'Remove the selected zone',
    removeZoneTitle: 'Remove the selected zone (Del)',
    dropTitle: (s: Side) => `Upload or drop a photo of the ${side(s)}`,
    dropFormats: 'JPG, PNG or WebP. On a phone you can take the photo directly.',
    dropPrivate: 'The image never leaves your device',
    trySample: 'or try a sample document',
    dropHere: 'Drop the photos here',
    hints: {
      move: 'Drag a zone to move it, or pull its corners to resize it.',
      draw: 'Drag over the image to cover anything you want.',
      frame: 'Drag the corners or sides of the frame to the edges of the card. Zones follow on their own.',
    },
    keys: 'With the canvas focused: [Tab] goes through the zones, arrows move them ([Shift] + arrows resizes them), [Del] removes them.',
    viewing: (face: string) => `You are viewing ${face}.`,
    changePhoto: 'Change photo',
    resetZones: 'Reset zones',
    removeFace: 'Remove this side',
  },

  stage: {
    customZone: 'Custom zone',
    framingLabel: 'Framing: drag the frame to the edges of the card',
    canvasLabel:
      'Editing canvas. Tab goes through the zones, arrows move them, Shift plus arrows resizes them and Delete removes them.',
    frameTip: 'Fit the frame to the edges of the card',
    remove: (label: string) => `Remove ${label}`,
  },

  compare: {
    originalLabel: 'Original photo',
    protectedLabel: 'Protected copy',
    original: 'Original',
    protected: 'Protected',
    position: 'Comparison slider position',
    hint: 'Slide to compare the original photo with the protected copy.',
  },

  settings: {
    usageTitle: 'What is the copy for?',
    usage: 'Use',
    recipient: 'Recipient',
    optional: '(optional)',
    recipientPlaceholder: 'E.g. Sunrise Lettings',
    date: 'Date',

    coverTitle: 'What to cover',
    coverMode: 'Cover mode',
    auto: 'Automatic',
    manual: 'Manual',
    autoHelp: (doc: DocumentId | null) =>
      `Zones are placed over the details on the ${doc === 'dni-es' ? 'DNI' : doc === 'cni-fr' ? 'ID card' : 'documents'}. Check that they line up; if not, use “Frame”.`,
    alsoOn: (s: Side) => `also on the ${side(s)}`,
    recommended: 'Recommended',
    manualHelp: 'Choose “Draw” in the canvas toolbar and mark everything you want to cover with your mouse or finger.',
    coverStyle: 'How to cover',
    black: 'Black',
    pixelate: 'Pixelate',
    blur: 'Blur',
    styleHelp:
      'Black is the safest. Pixelate and blur are applied strongly so nothing can be read, but it is less obvious that something has been covered.',

    watermarkTitle: 'Watermark',
    watermark: 'Add watermark',
    watermarkPreview: 'Watermark text',
    customText: 'Custom text',
    customHint: '(replaces the automatic one)',
    customPlaceholder: 'E.g. Only for Sunrise Lettings',
    opacity: 'Strength',
    size: 'Size',
    tone: 'Watermark color',
    dark: 'Dark',
    light: 'Light',
    grayscale: 'Black and white copy',

    levelTitle: 'Protection level',
    levelEmpty: 'Upload a photo to get started.',

    downloadTitle: 'Download',
    pdfSize: 'Size in the PDF',
    real: 'Actual size',
    realTitle: 'Card at 85.6 × 54 mm, like a photocopy',
    large: 'Enlarged',
    largeTitle: 'Each side as wide as the page, easier to read',
    pdf: 'Download PDF',
    pdfBusy: 'Generating PDF…',
    jpgFace: 'JPG of this side',
    jpgAll: 'JPG with all sides',
    busy: 'Generating…',
    noMetadata: 'The copy carries no metadata: no location, no phone model, no date of the photo.',
  },

  protection: {
    levels: { low: 'Low protection.', medium: 'Medium protection.', high: 'High protection.' },
    manual: (zones: number) =>
      `Manual mode: ${zones === 1 ? '1 zone drawn' : `${zones} zones drawn`}. Check that they cover what you want.`,
    addWatermark: 'Add the watermark.',
    covered: (covered: number, total: number, use: string) =>
      `You have covered ${covered} of ${total} recommended details for ${use}.`,
    noWatermark: 'Without a watermark, the copy can be used for anything.',
  },

  status: {
    notImage: 'That does not look like an image. Use a JPG, PNG or WebP photo.',
    noFreeSlots: 'There are no free slots left. Remove a side to upload another one.',
    loadedOne: (face: string) => `Photo loaded into ${face}. Check that the zones line up.`,
    loadedMany: (count: number, skipped: number) =>
      `${count} photos placed in the free slots.` + (skipped > 0 ? ` ${skipped} did not fit.` : ''),
    sample: (short: string, country: string) =>
      `Sample ${short} (${country}) loaded on both sides. The details are made up.`,
    zoneVisible: (label: string) => `${label} is now visible. Tick it again under “What to cover” to cover it.`,
    zoneAdded: 'Zone added. Drag it to move it or use the corners to resize it.',
    zoneSelected: (label: string) => `${label} selected.`,
    downloadReady: 'Download ready. Remember: only for whoever needs it.',
    downloadFailed: 'The download could not be generated.',
  },

  errors: {
    notImage: 'The file is not an image.',
    heic: 'Your browser cannot open HEIC photos. Export it as JPG or set the camera to “Most Compatible”.',
    unreadable: 'The image could not be read. Try a JPG, PNG or WebP.',
  },

  /** Words used in download file names: lowercase ASCII only. */
  files: {
    protected: 'protected',
    document: 'document',
    sides: { front: 'front', back: 'back' },
  },

  /** Country-neutral names, used when documents from different countries are mixed. */
  fields: {
    number: 'Document number',
    serial: 'Card or serial number',
    birthDate: 'Date of birth',
    signature: 'Signature',
    can: 'CAN code',
    expiry: 'Validity dates',
    issueDate: 'Date of issue',
    name: 'Full name',
    photo: 'Photo',
    address: 'Address',
    birthPlace: 'Place of birth',
    parents: 'Parents’ names',
    height: 'Height',
    seal: '2D-Doc code',
    mrz: 'MRZ',
  } satisfies Record<ZoneKey, string>,

  documents: {
    'dni-es': {
      countryName: 'Spain',
      name: 'DNI (2021 model)',
      sides: {
        front: { label: 'Front', hint: 'Side with the photo' },
        back: { label: 'Back', hint: 'Side with the address' },
      },
      zones: {
        number: {
          label: 'DNI number',
          hint: 'Printed twice on the front and again in the MRZ. Often needed for formal procedures.',
        },
        serial: {
          label: 'Card serial number',
          hint: 'Identifies the physical card and is used together with the DNI number for online checks.',
        },
        birthDate: { label: 'Date of birth', hint: 'Widely used in security questions and account recovery.' },
        signature: { label: 'Signature', hint: 'A scanned signature can be pasted onto any contract or authorization.' },
        can: {
          label: 'CAN code',
          hint: 'The six digits that give access to the chip over NFC. Nobody who receives a copy needs it.',
        },
        expiry: { label: 'Issue and expiry dates', hint: 'Rarely needed by whoever receives the copy.' },
        name: { label: 'Full name', hint: 'Almost always needed: it is what identifies you.' },
        photo: { label: 'Photo', hint: 'Useful for someone who has to check in person that it is you.' },
        address: {
          label: 'Address',
          hint: 'Where you live. Only needed by someone who has to send you something or register you.',
        },
        birthPlace: { label: 'Place of birth', hint: 'Another classic answer to security questions.' },
        parents: {
          label: 'Parents’ names',
          hint: 'Useless to whoever receives the copy, but valuable to anyone trying to impersonate you.',
        },
        mrz: {
          label: 'MRZ (bottom lines)',
          hint: 'The three machine-readable lines repeat the number, the card serial number and the date of birth.',
        },
      },
    },
    'cni-fr': {
      countryName: 'France',
      name: 'National identity card (since 2021)',
      sides: {
        front: { label: 'Front', hint: 'Side with the photo' },
        back: { label: 'Back', hint: 'Side with the MRZ' },
      },
      zones: {
        number: {
          label: 'Document number',
          hint: 'Nine characters that identify the card. Also printed vertically on both sides and in the MRZ.',
        },
        serial: { label: 'Vertical number on the back', hint: 'Card identifier printed vertically next to the chip.' },
        birthDate: { label: 'Date of birth', hint: 'Widely used in security questions and account recovery.' },
        birthPlace: {
          label: 'Place of birth',
          hint: 'On the French card it is on the front. Another classic answer to security questions.',
        },
        signature: { label: 'Signature', hint: 'A scanned signature can be pasted onto any contract or authorization.' },
        can: {
          label: 'CAN code',
          hint: 'The six digits at the bottom right give access to the chip over NFC. Nobody who receives a copy needs it.',
        },
        expiry: { label: 'Expiry date', hint: 'Printed large on the front and small at the top of both sides.' },
        issueDate: { label: 'Date of issue', hint: 'The date the card was issued, on the back.' },
        name: { label: 'Surname, given names and usual name', hint: 'Almost always needed: it is what identifies you.' },
        photo: {
          label: 'Photo (and secondary portraits)',
          hint: 'The main photo and the ghost portraits on the front and the back.',
        },
        height: { label: 'Height', hint: 'A physical detail that nobody who receives a copy needs.' },
        address: {
          label: 'Address',
          hint: 'Your address, if shown. Only needed by someone who has to send you something or register you.',
        },
        seal: {
          label: '2D-Doc code (digital seal)',
          hint: 'The square code holds your details, digitally signed: anyone can read them with a phone.',
        },
        mrz: { label: 'MRZ (bottom lines)', hint: 'The three machine-readable lines repeat the number, the dates and the name.' },
      },
    },
  } satisfies Record<DocumentId, DocumentText>,

  usages: {
    other: {
      label: 'Other / not sure',
      short: 'any use',
      watermark: 'Limited-use copy',
      note: 'The cautious option: it covers what is almost never needed. If the copy is rejected, uncover only what they ask for.',
    },
    rental: {
      label: 'Renting a home',
      short: 'a rental',
      watermark: 'Only for a rental',
      note: 'To rent a home, your name, document number and photo are usually enough. Everything else is covered.',
    },
    job: {
      label: 'Job offer or recruitment',
      short: 'a recruitment process',
      watermark: 'Only for a recruitment process',
      note: 'Nobody needs your ID before you sign a contract. If they ask for it before the interview, be wary: only your name and photo stay visible.',
    },
    sale: {
      label: 'Buying or selling (Vinted, eBay…)',
      short: 'a private sale',
      watermark: 'Only to verify a private sale',
      note: 'A private buyer or seller does not need your ID. Insisting on seeing it is a typical sign of a scam.',
    },
    hotel: {
      label: 'Hotel or accommodation',
      short: 'a hotel',
      watermark: 'Only for guest registration',
      note: 'Guest registration asks for the number, card serial number, date of birth and address, so they stay visible.',
    },
    bank: {
      label: 'Bank or lender',
      short: 'a bank',
      watermark: 'Only for bank identification',
      note: 'Banks must identify you with the full document. Your protection here is the watermark.',
    },
    government: {
      label: 'Government office',
      short: 'an official procedure',
      watermark: 'Only for an official procedure',
      note: 'Public authorities usually need the full copy. Only the CAN is covered and the purpose is made clear.',
    },
  } satisfies Record<UsageId, UsageText>,

  info: {
    cover: {
      eyebrow: 'Front and back',
      title: 'Which details on your ID are worth covering',
      lead: 'Not every detail is worth the same to someone who wants to pass as you. These are the ones most often abused and the ones a copy least needs.',
    },
    usage: {
      eyebrow: 'Depending on the procedure',
      title: 'What to leave visible depending on what the copy is for',
      use: 'Use',
      covered: 'Covered',
      watermark: 'Watermark',
      note: 'Each document only covers the details it has: the 2D-Doc code and the height, for example, only exist on the French card. This is guidance. If whoever asks for the copy needs another detail, uncover it just for them and keep the watermark.',
    },
    privacy: {
      eyebrow: 'No servers involved',
      title: 'Your ID never leaves your device. See for yourself.',
      lead: 'Sequrid runs entirely in your browser. The photo is read from the file, drawn on a canvas, covered and turned into a PDF or JPG right there.',
      steps: [
        'Open this page and wait for it to load.',
        'Turn on airplane mode or disconnect from the network.',
        'Protect your ID and download the PDF. It works just the same.',
      ],
      csp: "On top of that, the server sends the `Content-Security-Policy: connect-src 'none'` header, which stops the browser from making any request from the page. The code is open: ",
      cspLink: 'check it yourself',
      cspEnd: '.',
    },
    faq: {
      eyebrow: 'Common questions',
      title: 'Frequently asked questions',
      items: [
        {
          q: 'Is the photo of my ID uploaded to a server?',
          a: 'No. The image is opened and processed inside your browser. The server only delivers the files of the page, and its security policy (CSP) forbids the browser from connecting anywhere: even if it wanted to, the page could not send your photo.',
        },
        {
          q: 'Is anything stored?',
          a: 'None of your photos or settings. When you reload the page, everything starts from scratch. The only things remembered are your language and whether you prefer the light or dark theme.',
        },
        {
          q: 'Is pixelating or blurring as safe as covering in black?',
          a: 'Black is the safest because it removes the information completely. Sequrid’s pixelate and blur use large blocks so the text cannot be reconstructed, but if in doubt, use black.',
        },
        {
          q: 'What is the watermark with the date and recipient for?',
          a: 'It makes clear who the copy was made for and when. If someone reuses it for something else, the watermark gives them away and the copy loses its value to a scammer.',
        },
        {
          q: 'What is the CAN?',
          a: 'Six digits in the bottom right corner of the front that let anyone read the chip over NFC. Nobody who receives a copy needs it.',
        },
        {
          q: 'Is it legal to send a copy of my ID with details covered?',
          a: 'Yes. It is your document and you decide which details to share. If whoever asks for it needs a specific detail, uncover it just for that copy and keep the watermark.',
        },
        {
          q: 'Can I put two documents in the same PDF?',
          a: 'Yes. Turn on “Add a second document” and you get four slots; each document can be from a different country. The PDF puts each one on its own row with both sides.',
        },
        {
          q: 'Which documents are supported?',
          a: 'The Spanish DNI (2021 model) and the French national identity card (since 2021). Choose the country of each document in the photos panel and the zones are placed over its details. More countries will follow.',
        },
        {
          q: 'Does it work on a phone and offline?',
          a: 'Yes. On a phone you can take the photo directly. And once the page has loaded, you can turn on airplane mode: everything keeps working because it does not need the network.',
        },
        {
          q: 'Can I host it on my own server?',
          a: 'Yes, that is the point: it is open source and ships as a Docker image and a Helm chart. That way you can check exactly what it does and serve it yourself.',
        },
      ],
      help: 'Has someone impersonated you? In Spain you can call **017** for free, the INCIBE cybersecurity helpline. In France, go to **17Cyber** (17cyber.gouv.fr).',
    },
  },
};

export type Messages = typeof en;
