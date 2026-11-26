import type { Side } from '../documents';
import type { Messages } from './en';

// French typography: a no-break space goes before « : ; ? ! » and inside « guillemets ».

const side = (s: Side) => (s === 'front' ? 'recto' : 'verso');

export const fr: Messages = {
  meta: {
    title: 'Sequrid · Protégez votre carte d’identité',
    description:
      'Masquez les informations sensibles de votre carte d’identité (Espagne, France et Italie) et ajoutez un filigrane avec le destinataire et la date. Tout est traité dans votre navigateur : la photo ne quitte jamais votre appareil.',
  },

  language: {
    label: 'Langue',
    current: (name) => `Langue : ${name}`,
    auto: 'Automatique',
    autoHint: (name) => `Langue du navigateur : ${name}`,
  },

  header: {
    home: 'Sequrid, aller à l’éditeur',
    sections: 'Sections',
    nav: { editor: 'Éditeur', cover: 'Que masquer', privacy: 'Confidentialité', faq: 'Questions', help: 'Aide' },
    localTitle: 'Aucune photo ne quitte votre navigateur',
    local: '100 % sur votre appareil',
    source: 'Code source',
    theme: 'Changer de thème',
    light: 'Utiliser le thème clair',
    dark: 'Utiliser le thème sombre',
  },

  hero: {
    noUpload: 'Aucun envoi de votre photo',
    noSignup: 'Sans inscription',
    openSource: 'Open source',
    title: 'Protégez votre carte d’identité avant de l’envoyer',
    lead: 'Masquez les informations dont personne n’a besoin, ajoutez un filigrane avec le destinataire et la date, puis téléchargez un PDF ou un JPG prêt à envoyer. Compatible avec le DNI espagnol, la carte nationale d’identité française et la CIE italienne.',
  },

  footer: {
    text: 'Sequrid traite tout dans votre navigateur. Aucune image n’est envoyée ni enregistrée.',
    source: 'Code source',
    license: 'Licence AGPL-3.0',
  },

  mobileBar: {
    settings: 'Réglages',
  },

  slots: {
    title: 'Photos du document',
    doc: (n) => `Document ${n}`,
    country: (n) => `Pays du document ${n}`,
    countryChanged: (n, name) => `Document ${n} : zones placées pour ${name}.`,
    slot: (face, loaded) => `${face} : ${loaded ? 'chargée, appuyez pour modifier' : 'vide, appuyez pour importer'}`,
    secondDoc: 'Ajouter un second document',
    sample: 'Essayer avec un exemple',
    tip: 'Déposez plusieurs photos à la fois : elles se placent seules dans les emplacements libres.',
    paste: 'Vous pouvez aussi coller avec [Ctrl]+[V].',
  },

  country: {
    button: (field, country, model) => `${field} : ${country}, ${model}`,
    soon: 'D’autres pays bientôt',
    search: 'Rechercher un pays ou un document',
    clear: 'Effacer la recherche',
    current: 'Actuel',
    since: (from) => `${from}–aujourd’hui`,
    years: (from, until) => (from === until ? `${from}` : `${from}–${until}`),
    option: (country, model, years, current) => `${country}, ${model}, ${years}${current ? ', modèle actuel' : ''}`,
    noResults: (query) => `Aucun pays ni document ne correspond à « ${query} »`,
    results: (count) => (count === 0 ? 'Aucun document trouvé' : count === 1 ? '1 document' : `${count} documents`),
  },

  editor: {
    label: 'Éditeur',
    view: 'Vue',
    edit: 'Modifier',
    compare: 'Avant / après',
    tool: 'Outil',
    move: 'Déplacer',
    moveTitle: 'Déplacer et ajuster les zones',
    draw: 'Dessiner',
    drawTitle: 'Dessinez un rectangle pour masquer ce que vous voulez',
    frame: 'Cadrage',
    frameTitle: 'Ajustez le cadre aux bords de la carte',
    zoom: 'Zoom',
    zoomOut: 'Zoom arrière',
    zoomIn: 'Zoom avant',
    fit: 'Ajuster',
    fitTitle: 'Ajuster à l’écran',
    rotate: 'Pivoter de 90 degrés',
    rotateTitle: 'Pivoter de 90°',
    removeZone: 'Supprimer la zone sélectionnée',
    removeZoneTitle: 'Supprimer la zone sélectionnée (Suppr)',
    dropTitle: (s) => `Importez ou glissez la photo du ${side(s)}`,
    dropFormats: 'JPG, PNG ou WebP. Sur mobile, vous pouvez prendre la photo directement.',
    dropPrivate: 'L’image ne quitte pas votre appareil',
    trySample: 'ou essayez avec un document d’exemple',
    dropHere: 'Déposez les photos ici',
    hints: {
      move: 'Faites glisser une zone pour la déplacer, ou tirez sur ses coins pour la redimensionner.',
      draw: 'Faites glisser sur l’image pour masquer ce que vous voulez.',
      frame: 'Faites glisser les coins ou les côtés du cadre jusqu’aux bords de la carte. Les zones se replacent seules.',
    },
    keys: 'Quand l’image a le focus : [Tab] parcourt les zones, les flèches les déplacent ([Maj] + flèches les redimensionnent), [Suppr] les supprime.',
    viewing: (face) => `Affichage : ${face}.`,
    changePhoto: 'Changer de photo',
    resetZones: 'Réinitialiser les zones',
    removeFace: 'Retirer cette face',
  },

  stage: {
    customZone: 'Zone personnalisée',
    framingLabel: 'Cadrage : faites glisser le cadre jusqu’aux bords de la carte',
    canvasLabel:
      'Zone d’édition. Tab parcourt les zones, les flèches les déplacent, Maj plus flèches les redimensionnent et Suppr les supprime.',
    frameTip: 'Ajustez le cadre aux bords de la carte',
    remove: (label) => `Retirer « ${label} »`,
  },

  compare: {
    originalLabel: 'Photo originale',
    protectedLabel: 'Copie protégée',
    original: 'Originale',
    protected: 'Protégée',
    position: 'Position du curseur de comparaison',
    hint: 'Faites glisser pour comparer la photo originale et la copie protégée.',
  },

  settings: {
    usageTitle: 'À quoi sert la copie ?',
    usage: 'Usage',
    recipient: 'Destinataire',
    optional: '(facultatif)',
    recipientPlaceholder: 'Ex. : Agence Soleil',
    date: 'Date',

    coverTitle: 'Que masquer',
    coverMode: 'Mode de masquage',
    auto: 'Automatique',
    manual: 'Manuel',
    autoHelp: (the) =>
      `Les zones se placent sur les informations ${the ?? 'des documents'}. Vérifiez qu’elles tombent au bon endroit ; sinon, utilisez « Cadrage ».`,
    alsoOn: (s) => `aussi au ${side(s)}`,
    recommended: 'Recommandé',
    manualHelp: 'Choisissez « Dessiner » dans la barre de l’image et tracez à la souris ou au doigt tout ce que vous voulez masquer.',
    coverStyle: 'Type de masquage',
    black: 'Noir',
    pixelate: 'Pixellisation',
    blur: 'Flou',
    styleHelp:
      'Le noir est le plus sûr. La pixellisation et le flou sont appliqués fortement pour que rien ne reste lisible, mais on remarque moins qu’une information a été masquée.',

    watermarkTitle: 'Filigrane',
    watermark: 'Ajouter un filigrane',
    watermarkPreview: 'Texte du filigrane',
    customText: 'Texte personnalisé',
    customHint: '(remplace le texte automatique)',
    customPlaceholder: 'Ex. : Uniquement pour l’Agence Soleil',
    opacity: 'Intensité',
    size: 'Taille',
    tone: 'Couleur du filigrane',
    dark: 'Foncé',
    light: 'Clair',
    grayscale: 'Copie en noir et blanc',

    levelTitle: 'Niveau de protection',
    levelEmpty: 'Importez une photo pour commencer.',

    downloadTitle: 'Télécharger',
    pdfSize: 'Taille dans le PDF',
    real: 'Taille réelle',
    realTitle: 'Carte à 85,6 × 54 mm, comme une photocopie',
    large: 'Agrandie',
    largeTitle: 'Chaque face à la largeur de la page, plus lisible',
    pdf: 'Télécharger le PDF',
    pdfBusy: 'Création du PDF…',
    jpgFace: 'JPG de cette face',
    jpgAll: 'JPG de toutes les faces',
    busy: 'Création…',
    noMetadata: 'La copie ne contient aucune métadonnée : ni position, ni modèle de téléphone, ni date de la photo.',
  },

  protection: {
    levels: { low: 'Protection faible.', medium: 'Protection moyenne.', high: 'Protection élevée.' },
    manual: (zones) =>
      `Mode manuel : ${zones <= 1 ? `${zones} zone dessinée` : `${zones} zones dessinées`}. Vérifiez qu’elles masquent bien ce que vous voulez.`,
    addWatermark: 'Ajoutez le filigrane.',
    covered: (covered, total, use) => `Informations recommandées masquées pour ${use} : ${covered} sur ${total}.`,
    noWatermark: 'Sans filigrane, la copie peut servir à n’importe quoi.',
  },

  status: {
    notImage: 'Ce fichier ne semble pas être une image. Utilisez une photo JPG, PNG ou WebP.',
    noFreeSlots: 'Il ne reste aucun emplacement libre. Retirez une face pour en importer une autre.',
    loadedOne: (face) => `Photo chargée dans ${face}. Vérifiez que les zones tombent au bon endroit.`,
    loadedMany: (count, skipped) =>
      `${count} photos placées dans les emplacements libres.` +
      (skipped > 1 ? ` ${skipped} n’ont pas trouvé de place.` : skipped === 1 ? ' 1 n’a pas trouvé de place.' : ''),
    sample: (short, country) => `Exemple de ${short} (${country}) chargé sur les deux faces. Les données sont fictives.`,
    zoneVisible: (label) =>
      `« ${label} » reste visible. Cochez de nouveau la case dans « Que masquer » pour masquer cette information.`,
    zoneAdded: 'Zone ajoutée. Faites-la glisser pour la déplacer ou utilisez ses coins pour l’ajuster.',
    zoneSelected: (label) => `Zone sélectionnée : ${label}.`,
    downloadReady: 'Téléchargement prêt. Rappel : uniquement pour qui en a besoin.',
    downloadFailed: 'Impossible de créer le téléchargement.',
  },

  errors: {
    notImage: 'Le fichier n’est pas une image.',
    heic: 'Votre navigateur ne peut pas ouvrir les photos HEIC. Exportez-la en JPG ou réglez l’appareil photo sur « Le plus compatible ».',
    unreadable: 'Impossible de lire l’image. Essayez avec un JPG, PNG ou WebP.',
  },

  files: {
    protected: 'protege',
    document: 'document',
    sides: { front: 'recto', back: 'verso' },
  },

  fields: {
    number: 'Numéro du document',
    serial: 'Numéro de support ou de série',
    birthDate: 'Date de naissance',
    signature: 'Signature',
    can: 'Code CAN',
    expiry: 'Dates de validité',
    issueDate: 'Date de délivrance',
    name: 'Nom et prénoms',
    photo: 'Photo',
    address: 'Adresse',
    birthPlace: 'Lieu de naissance',
    parents: 'Noms des parents',
    height: 'Taille',
    seal: 'Code 2D-Doc',
    taxCode: 'Code fiscal',
    birthRecord: 'Références de l’acte de naissance',
    issuer: 'Autorité de délivrance',
    mrz: 'Zone MRZ',
  },

  documents: {
    'dni-es': {
      countryName: 'Espagne',
      the: 'du DNI',
      name: 'DNI (modèle 2021)',
      sides: {
        front: { label: 'Recto', hint: 'Face avec la photo' },
        back: { label: 'Verso', hint: 'Face avec l’adresse' },
      },
      zones: {
        number: {
          label: 'Numéro de DNI',
          hint: 'Il figure deux fois au recto et une fois dans la zone MRZ. Souvent demandé pour les démarches officielles.',
        },
        serial: {
          label: 'Numéro de support',
          hint: 'Il identifie la carte physique et sert aux vérifications en ligne avec le numéro de DNI.',
        },
        birthDate: {
          label: 'Date de naissance',
          hint: 'Très utilisée dans les questions de sécurité et la récupération de comptes.',
        },
        signature: {
          label: 'Signature',
          hint: 'Une signature scannée peut être collée sur n’importe quel contrat ou autorisation.',
        },
        can: {
          label: 'Code CAN',
          hint: 'Les six chiffres qui donnent accès à la puce par NFC. Personne qui reçoit une copie n’en a besoin.',
        },
        expiry: { label: 'Dates de délivrance et de validité', hint: 'Rarement utiles à qui reçoit la copie.' },
        name: { label: 'Nom et prénoms', hint: 'Presque toujours nécessaire : c’est ce qui vous identifie.' },
        photo: { label: 'Photo', hint: 'Utile à qui doit vérifier en personne que c’est bien vous.' },
        address: {
          label: 'Adresse',
          hint: 'Votre domicile. Seule une personne qui doit vous envoyer quelque chose ou vous inscrire en a besoin.',
        },
        birthPlace: { label: 'Lieu de naissance', hint: 'Une autre réponse classique aux questions de sécurité.' },
        parents: {
          label: 'Noms des parents',
          hint: 'Inutiles à qui reçoit la copie, mais précieux pour qui veut usurper votre identité.',
        },
        mrz: {
          label: 'Zone MRZ (lignes du bas)',
          hint: 'Les trois lignes lisibles par machine répètent le numéro, le support et la date de naissance.',
        },
      },
    },
    'cni-fr': {
      countryName: 'France',
      the: 'de la carte',
      name: 'Carte nationale d’identité (depuis 2021)',
      sides: {
        front: { label: 'Recto', hint: 'Face avec la photo' },
        back: { label: 'Verso', hint: 'Face avec la zone MRZ' },
      },
      zones: {
        number: {
          label: 'Numéro du document',
          hint: 'Neuf caractères qui identifient la carte. Il figure aussi à la verticale sur les deux faces et dans la zone MRZ.',
        },
        serial: {
          label: 'Numéro vertical du verso',
          hint: 'Identifiant de la carte imprimé à la verticale à côté de la puce.',
        },
        birthDate: {
          label: 'Date de naissance',
          hint: 'Très utilisée dans les questions de sécurité et la récupération de comptes.',
        },
        birthPlace: {
          label: 'Lieu de naissance',
          hint: 'Sur la carte française, il figure au recto. Une autre réponse classique aux questions de sécurité.',
        },
        signature: {
          label: 'Signature',
          hint: 'Une signature scannée peut être collée sur n’importe quel contrat ou autorisation.',
        },
        can: {
          label: 'Code CAN',
          hint: 'Les six chiffres en bas à droite donnent accès à la puce par NFC. Personne qui reçoit une copie n’en a besoin.',
        },
        expiry: { label: 'Date d’expiration', hint: 'Elle figure en grand au recto et en petit en haut des deux faces.' },
        issueDate: { label: 'Date de délivrance', hint: 'La date de remise de la carte, au verso.' },
        name: { label: 'Nom, prénoms et nom d’usage', hint: 'Presque toujours nécessaire : c’est ce qui vous identifie.' },
        photo: {
          label: 'Photo (et portraits secondaires)',
          hint: 'La photo principale et les portraits fantômes du recto et du verso.',
        },
        height: { label: 'Taille', hint: 'Une caractéristique physique dont personne n’a besoin sur une copie.' },
        address: {
          label: 'Adresse',
          hint: 'Votre adresse, si elle figure. Seule une personne qui doit vous envoyer quelque chose ou vous inscrire en a besoin.',
        },
        seal: {
          label: 'Code 2D-Doc (cachet électronique)',
          hint: 'Le code carré contient vos données signées électroniquement : n’importe qui peut les lire avec un téléphone.',
        },
        mrz: {
          label: 'Zone MRZ (lignes du bas)',
          hint: 'Les trois lignes lisibles par machine répètent le numéro, les dates et le nom.',
        },
      },
    },
    'cie-it': {
      countryName: 'Italie',
      the: 'de la CIE',
      name: 'Carte d’identité électronique italienne (CIE 3.0, depuis 2022)',
      sides: {
        front: { label: 'Recto', hint: 'Face avec la photo' },
        back: { label: 'Verso', hint: 'Face avec le code fiscal' },
      },
      zones: {
        number: { label: 'Numéro de la carte', hint: 'En haut à droite au recto et à nouveau dans la MRZ. Il identifie la carte.' },
        issuer: { label: 'Commune de délivrance', hint: 'La commune qui a délivré la carte : elle indique souvent où vous habitez.' },
        name: { label: 'Nom et prénom', hint: 'Presque toujours nécessaire : c’est ce qui vous identifie.' },
        birthDate: {
          label: 'Lieu et date de naissance',
          hint: 'Ils partagent une ligne, ils sont donc masqués ensemble. Ce sont des réponses classiques aux questions de sécurité.',
        },
        height: { label: 'Taille', hint: 'Une donnée physique dont personne qui reçoit une copie n’a besoin.' },
        issueDate: { label: 'Date de délivrance', hint: 'Rarement utile à qui reçoit la copie.' },
        expiry: { label: 'Date d’expiration', hint: 'Rarement utile à qui reçoit la copie.' },
        signature: { label: 'Signature', hint: 'Une signature numérisée peut être collée sur n’importe quel contrat ou autorisation.' },
        can: {
          label: 'Code CAN',
          hint: 'Les six chiffres en bas à droite donnent accès à la puce par NFC. Personne qui reçoit une copie n’en a besoin.',
        },
        photo: {
          label: 'Photo (et portraits secondaires)',
          hint: 'La photo principale et les petits portraits dans la silhouette de l’Italie et au verso.',
        },
        parents: { label: 'Nom des parents', hint: 'N’apporte rien à qui reçoit la copie, mais aide qui veut usurper votre identité.' },
        taxCode: {
          label: 'Code fiscal (et son code-barres)',
          hint: 'Le codice fiscale suffit pour ouvrir des contrats et des comptes à votre nom. Le code-barres du verso le contient aussi.',
        },
        birthRecord: { label: 'Références de l’acte de naissance', hint: 'La référence de votre acte de naissance. Personne qui reçoit une copie n’en a besoin.' },
        address: { label: 'Adresse', hint: 'Votre adresse. Seule une personne qui doit vous envoyer quelque chose ou vous enregistrer en a besoin.' },
        mrz: { label: 'Zone MRZ (lignes du bas)', hint: 'Les trois lignes lisibles par machine reprennent le numéro, les dates et le nom.' },
      },
    },
  },

  usages: {
    other: {
      label: 'Autre / je ne sais pas',
      short: 'tout usage',
      watermark: 'Copie à usage limité',
      note: 'Option prudente : on masque ce qui n’est presque jamais nécessaire. Si la copie est refusée, ne démasquez que ce qu’on vous demande.',
    },
    rental: {
      label: 'Location d’un logement',
      short: 'une location',
      watermark: 'Uniquement pour une location',
      note: 'Pour louer, le nom, le numéro du document et la photo suffisent généralement. Le reste est masqué.',
    },
    job: {
      label: 'Offre d’emploi ou recrutement',
      short: 'un recrutement',
      watermark: 'Uniquement pour un recrutement',
      note: 'Personne n’a besoin de votre pièce d’identité avant la signature d’un contrat. Si on vous la demande avant l’entretien, méfiez-vous : seuls le nom et la photo restent visibles.',
    },
    sale: {
      label: 'Vente entre particuliers (Leboncoin, Vinted…)',
      short: 'une vente entre particuliers',
      watermark: 'Uniquement pour vérifier une vente',
      note: 'Un acheteur ou un vendeur particulier n’a pas besoin de votre pièce d’identité. S’il insiste pour la voir, c’est un signe classique d’arnaque.',
    },
    hotel: {
      label: 'Hôtel ou hébergement',
      short: 'un hôtel',
      watermark: 'Uniquement pour l’enregistrement des voyageurs',
      note: 'L’enregistrement des voyageurs demande le numéro du document, la date de naissance et l’adresse (en Espagne, aussi le numéro de support du DNI) : ils restent donc visibles.',
    },
    bank: {
      label: 'Banque ou organisme de crédit',
      short: 'une banque',
      watermark: 'Uniquement pour une identification bancaire',
      note: 'Les banques doivent vous identifier avec le document complet. Ici, votre protection, c’est le filigrane.',
    },
    government: {
      label: 'Administration',
      short: 'une démarche administrative',
      watermark: 'Uniquement pour une démarche administrative',
      note: 'L’administration a généralement besoin de la copie complète. Seul le CAN est masqué et l’usage est clairement indiqué.',
    },
  },

  info: {
    cover: {
      eyebrow: 'Recto et verso',
      title: 'Quelles informations de votre carte masquer',
      lead: 'Toutes les informations n’ont pas la même valeur pour qui veut se faire passer pour vous. Voici celles qui sont le plus exploitées et dont une copie a le moins besoin.',
    },
    usage: {
      eyebrow: 'Selon la démarche',
      title: 'Que laisser visible selon l’usage de la copie',
      use: 'Usage',
      covered: 'Masqué',
      watermark: 'Filigrane',
      note: 'Chaque document ne masque que les informations qu’il contient : le code 2D-Doc, par exemple, n’existe que sur la carte française et le code fiscal, que sur la carte italienne. Ce n’est qu’une indication. Si la personne qui demande la copie a besoin d’une autre information, démasquez-la uniquement pour elle et gardez le filigrane.',
    },
    privacy: {
      eyebrow: 'Aucun serveur entre vous et votre copie',
      title: 'Votre carte ne quitte pas votre appareil. Vérifiez-le.',
      lead: 'Sequrid fonctionne entièrement dans votre navigateur. La photo est lue depuis le fichier, dessinée sur un canevas, masquée puis convertie en PDF ou en JPG sur place.',
      steps: [
        'Ouvrez cette page et attendez qu’elle se charge.',
        'Activez le mode avion ou coupez le réseau.',
        'Protégez votre carte et téléchargez le PDF. Tout fonctionne pareil.',
      ],
      csp: "De plus, le serveur envoie l’en-tête `Content-Security-Policy: connect-src 'none'`, qui interdit au navigateur toute requête depuis la page. Le code est ouvert : ",
      cspLink: 'vérifiez-le vous-même',
      cspEnd: '.',
    },
    faq: {
      eyebrow: 'Questions courantes',
      title: 'Foire aux questions',
      items: [
        {
          q: 'La photo de ma carte d’identité est-elle envoyée sur un serveur ?',
          a: 'Non. L’image est ouverte et traitée dans votre navigateur. Le serveur ne fait que fournir les fichiers de la page, et sa politique de sécurité (CSP) interdit au navigateur de se connecter où que ce soit : même si elle le voulait, la page ne pourrait pas envoyer votre photo.',
        },
        {
          q: 'Est-ce que quelque chose est enregistré ?',
          a: 'Rien de vos photos ni de vos réglages. Quand vous rechargez la page, tout repart de zéro. Seuls la langue et votre préférence pour le thème clair ou sombre sont mémorisés.',
        },
        {
          q: 'Pixelliser ou flouter est-il aussi sûr que masquer en noir ?',
          a: 'Le noir est le plus sûr, car il supprime complètement l’information. La pixellisation et le flou de Sequrid utilisent de gros blocs pour que le texte ne puisse pas être reconstitué, mais en cas de doute, choisissez le noir.',
        },
        {
          q: 'À quoi sert le filigrane avec la date et le destinataire ?',
          a: 'Il indique clairement pour qui et quand la copie a été faite. Si quelqu’un la réutilise pour autre chose, le filigrane le trahit et la copie perd sa valeur pour un escroc.',
        },
        {
          q: 'Qu’est-ce que le code CAN ?',
          a: 'Ce sont les six chiffres en bas à droite du recto, qui permettent de lire la puce par NFC. Personne qui reçoit une copie n’en a besoin.',
        },
        {
          q: 'Est-il légal d’envoyer une copie de sa pièce d’identité avec des informations masquées ?',
          a: 'Oui. C’est votre document et vous décidez des informations que vous partagez. Si la personne qui la demande a besoin d’une information précise, démasquez-la uniquement pour cette copie et gardez le filigrane.',
        },
        {
          q: 'Puis-je réunir deux documents dans le même PDF ?',
          a: 'Oui. Activez « Ajouter un second document » pour obtenir quatre emplacements ; chaque document peut venir d’un pays différent. Le PDF place chacun sur une ligne avec ses deux faces.',
        },
        {
          q: 'Quels documents sont pris en charge ?',
          a: 'Le DNI espagnol (modèle 2021), la carte nationale d’identité française (depuis 2021) et la carte d’identité électronique italienne (CIE 3.0, depuis 2022). Choisissez le pays de chaque document dans le panneau des photos et les zones se placent sur ses informations. D’autres pays suivront.',
        },
        {
          q: 'Est-ce que ça fonctionne sur mobile et hors connexion ?',
          a: 'Oui. Sur mobile, vous pouvez prendre la photo directement. Et une fois la page chargée, vous pouvez activer le mode avion : tout continue de fonctionner, car le réseau n’est pas nécessaire.',
        },
        {
          q: 'Puis-je l’installer sur mon propre serveur ?',
          a: 'Oui, c’est tout l’intérêt : le code est ouvert et distribué sous forme d’image Docker et de chart Helm. Vous pouvez ainsi vérifier exactement ce qu’il fait et l’héberger vous-même.',
        },
      ],
    },
    help: {
      eyebrow: 'Si c’est déjà arrivé',
      title: 'Où trouver de l’aide si quelqu’un utilise votre identité',
      lead: 'Services officiels par pays. Si une infraction est en cours, appelez le numéro d’urgence.',
      country: 'Pays',
      service: 'Service',
      contact: 'Comment les joindre',
      what: 'À quoi ça sert',
      kinds: { phone: 'Téléphone', whatsapp: 'WhatsApp', telegram: 'Telegram', web: 'Site web' },
      free: 'gratuit',
      emergency: 'Urgences',
      emergencySms: 'Urgences par SMS',
      newTab: 's’ouvre dans un nouvel onglet',
      lines: {
        'es-incibe': 'Ligne gratuite et confidentielle de l’Institut national de cybersécurité espagnol pour tout problème de cybersécurité. Tous les jours de 8 h à 23 h.',
        'fr-17cyber': 'Assistance officielle en ligne pour les victimes de cybermalveillance, avec l’aide d’un policier ou d’un gendarme si nécessaire.',
        'it-postale': 'Portail de la police postale et de la cybersécurité italienne pour s’informer et signaler des délits en ligne. Les plaintes se déposent dans un commissariat.',
      },
      note: 'Seuls les services vérifiés sur leurs sites officiels sont listés. D’autres pays seront ajoutés avec leurs documents.',
    },
  },
};
