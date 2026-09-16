// Public, verified content only. See docs/CONTENT.md for field formats.
// Empty values render explicit placeholders; they never become claims.
export const company = {
  name: "Toiture Démo", // Template name; replace with the client’s company name.
  businessVerified: false,
  phone: "", // E.164. A real tel: link is rendered only when this is provided.
  phoneDisplay: "",
  email: "",
  hours: "",
  coverageVerified: false,
  serviceAreas: [], // Only confirmed cities. No proposed cities in business schema.
  rbq: { verified: false, value: "", source: "" },
  insurance: { verified: false, value: "", source: "" },
  experience: { verified: false, value: "", source: "" },
  warranty: { verified: false, value: "", source: "" },
  differentiators: [
    {
      verified: false,
      label: "Systèmes installés",
      value: "",
      source: "",
      placeholder: "[SYSTÈMES / FABRICANTS À CONFIRMER]",
    },
    {
      verified: false,
      label: "Équipe et spécialisation",
      value: "",
      source: "",
      placeholder: "[ÉQUIPE / SPÉCIALISATION À DOCUMENTER]",
    },
    {
      verified: false,
      label: "Protection et nettoyage du chantier",
      value: "",
      source: "",
      placeholder: "[MÉTHODE DE PROTECTION / NETTOYAGE À CONFIRMER]",
    },
  ],
  crewPhoto: null, // { src:'assets/crew.webp', alt:'...', width:1200, height:800 }
  reviews: [], // { verified:true, quote, name, city, rating:1..5, source:'https://...' }
  social: [], // { verified: false, label:'Facebook', url:'https://...' }
  privacyText: "",
  legalText: "",
};
export const services = [
  {
    id: "replacement",
    title: "Roof Replacement",
    label: "Réfection de toiture",
    verified: false,
    description:
      "Une toiture vieillissante ou des dommages étendus? L’évaluation doit distinguer le revêtement à remplacer et les réparations nécessaires au support.",
    scope: "À préciser : support, ventilation, solins et revêtement.",
  },
  {
    id: "repair",
    title: "Roof Repair",
    label: "Réparation de toiture",
    verified: false,
    description:
      "Infiltration, bardeaux déplacés ou solin endommagé : décrivez le problème et son emplacement pour déterminer l’intervention à envisager.",
    scope: "À préciser : cause observée, zone touchée et réparation proposée.",
  },
];
// Add only documented, permissioned jobs. Before/during are optional; never infer them.
export const projects = [];
// Format: { id, verified:true, type, city, material, description, completedAt,
// photos:{ after:{src,alt,width,height}, before:{...}, during:{...} } }
export const process = {
  verified: false,
  steps: [
    {
      title: "Inspection",
      text: "Évaluer l’état visible de la toiture, les zones touchées et les contraintes d’accès.",
      output: "Constats à expliquer",
    },
    {
      title: "Soumission",
      text: "Décrire les travaux, les matériaux proposés, le prix et les exclusions.",
      output: "Détail écrit à remettre",
    },
    {
      title: "Planification",
      text: "Confirmer l’échéancier, les accès au bâtiment et la préparation des lieux.",
      output: "Date et accès à convenir",
    },
    {
      title: "Travaux",
      text: "Réaliser le périmètre convenu et faire approuver tout changement nécessaire.",
      output: "Modifications à documenter",
    },
    {
      title: "Inspection finale",
      text: "Vérifier les travaux, faire le point sur les finitions et remettre les documents prévus.",
      output: "Vérifications à confirmer",
    },
  ],
};
export const faqs = [
  {
    question: "Combien coûte une réfection de toiture?",
    answer:
      "La superficie, la pente, l’accès, le revêtement et l’état du support influencent le prix. Une estimation utile distingue les matériaux, la main-d’œuvre et les réparations additionnelles possibles. Décrivez votre toit pour préparer une évaluation; aucun prix ne peut être confirmé sans les détails du bâtiment.",
  },
  {
    question: "Faut-il réparer ou remplacer ma toiture?",
    answer:
      "Une fuite localisée et un revêtement dégradé sur plusieurs versants ne demandent pas la même intervention. L’âge du toit, l’étendue des dommages, le support et les traces d’infiltration doivent être examinés. Des photos prises depuis un endroit accessible peuvent aider à préparer la visite.",
  },
  {
    question: "Quels matériaux et quelles garanties proposez-vous?",
    answer:
      "[SYSTÈMES, FABRICANTS ET GARANTIES À CONFIRMER AVEC L’ENTREPRISE]. La proposition doit identifier le produit, les exigences de pose applicables et distinguer la garantie du fabricant de celle sur les travaux. Aucune durée de garantie n’est confirmée ici.",
  },
  {
    question: "Combien de temps durent les travaux? Et en hiver?",
    answer:
      "La taille du toit, les réparations au support et la météo influencent le calendrier. En hiver, la faisabilité dépend aussi des exigences du système et des conditions d’accès. [DÉLAIS ET DISPONIBILITÉ HIVERNALE À CONFIRMER].",
  },
  {
    question: "Dans quelles villes intervenez-vous?",
    answer:
      "[ZONE DE SERVICE À CONFIRMER]. Indiquez votre ville dans la demande pour vérifier si le chantier peut être pris en charge.",
  },
];
