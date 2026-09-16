import { readFileSync } from "node:fs";
import {
  company,
  services,
  projects,
  process as workflow,
  faqs,
} from "../site.config.js";
const form = readFileSync(
  new URL("./estimate-form.html", import.meta.url),
  "utf8",
);
export const escape = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
const e = escape;
const arrow = '<span aria-hidden="true">↗</span>';
const phoneIcon =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 3 3 5-2 2c1 3 3 5 6 6l2-2 5 3-1 4C10 22 2 14 3 4Z"/></svg>';
const camera =
  '<svg viewBox="0 0 48 40" aria-hidden="true"><path d="M5 10h10l3-5h12l3 5h10v25H5Z"/><circle cx="24" cy="22" r="8"/></svg>';
const proof = (label, item, placeholder) =>
  `<div class="proof-item"><span class="proof-label">${label}</span><strong>${e(item.verified && item.value && validSource(item.source) ? item.value : placeholder)}</strong><span class="proof-state">${item.verified && item.value && validSource(item.source) ? '<span class="verified-dot"></span> Source renseignée' : '<span class="pending-dot"></span> Document non fourni'}</span>${item.verified && item.value && validSource(item.source) ? `<a class="source-link" href="${safeUrl(item.source)}" target="_blank" rel="noopener noreferrer">Consulter la source ↗</a>` : ""}</div>`;
function validSource(url) {
  try {
    return ["https:", "http:"].includes(new URL(url).protocol);
  } catch {
    return false;
  }
}
function safeUrl(url) {
  try {
    const value = new URL(url);
    return ["https:", "http:"].includes(value.protocol)
      ? e(value.href)
      : "#preuves";
  } catch {
    return "#preuves";
  }
}
function callLink(compact = false) {
  const label = compact ? "Appeler" : "Appeler maintenant";
  return company.phone
    ? `<a class="call-link" href="tel:${e(company.phone)}">${phoneIcon}<span>${label}${compact ? "" : `<small>${e(company.phoneDisplay || company.phone)}</small>`}</span></a>`
    : `<button class="call-link" type="button" data-call-missing>${phoneIcon}<span>${label}${compact ? "" : "<small>[TÉLÉPHONE À RENSEIGNER]</small>"}</span></button>`;
}
function photoSlot(label, note, cl = "") {
  return `<div class="photo-placeholder ${cl}"><span class="photo-corner corner-tl"></span><span class="photo-corner corner-br"></span><div>${camera}<strong>${label}</strong><p>${note}</p></div><span class="asset-status">PHOTO RÉELLE NON FOURNIE</span></div>`;
}
function photo(p, label = "", hero = false) {
  if (!p?.src)
    return photoSlot(label, "Ajouter une photo réelle de ce chantier.");
  return `<figure class="real-photo"><img src="${e(p.src)}" ${p.srcset ? `srcset="${e(p.srcset)}" sizes="(max-width: 700px) 100vw, 55vw"` : ""} alt="${e(p.alt)}" width="${Number(p.width) || 1200}" height="${Number(p.height) || 800}" ${hero ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">${label ? `<figcaption>${e(label)}</figcaption>` : ""}</figure>`;
}
function projectCard(p, index) {
  const stages = p
    ? ["before", "during", "after"].filter(
        (key) => p.photos[key]?.src && p.photos[key]?.alt,
      )
    : [];
  const labels = { before: "AVANT", during: "TRAVAUX", after: "APRÈS" };
  return `<article class="project-record ${p ? "" : "pending-record"}"><div class="record-top"><span>DOSSIER ${String(index + 1).padStart(2, "0")}</span><span class="tag">${p ? "Chantier documenté" : "Dossier à compléter"}</span></div>
  <div class="record-grid"><div class="record-visual">${p ? `<div class="inline-stages stage-count-${stages.length}">${stages.map((key) => photo(p.photos[key], stages.length === 1 ? "CHANTIER TERMINÉ" : labels[key])).join("")}</div>` : photoSlot("[PHOTO DU CHANTIER TERMINÉ]", "Ajouter les photos autorisées d’un chantier réel.")}</div>
  <div class="record-body"><p class="eyebrow">${e(p?.city || "[VILLE DU CHANTIER À CONFIRMER]")}</p><h3>${e(p?.type || "[TYPE DE TRAVAUX À RENSEIGNER]")}</h3><dl><div><dt>Matériau / système</dt><dd>${e(p?.material || "[MATÉRIAU / SYSTÈME À CONFIRMER]")}</dd></div><div><dt>Travaux effectués</dt><dd>${e(p?.description || "[PROBLÈME OBSERVÉ ET TRAVAUX EFFECTUÉS]")}</dd></div><div><dt>Réalisation</dt><dd>${e(p?.completedAt || "[DATE À RENSEIGNER]")}</dd></div></dl>${p ? `<button class="text-link" data-project-index="${index}">Agrandir les photos ${arrow}</button>` : '<p class="record-note">Emplacement à compléter. Aucun chantier client fourni.</p>'}</div></div></article>`;
}
export function renderSite() {
  const confirmedProjects = projects.filter(
    (p) =>
      p.verified &&
      p.type &&
      p.city &&
      p.description &&
      p.photos?.after?.src &&
      p.photos.after.alt,
  );
  const confirmedReviews = company.reviews.filter(
    (r) =>
      r.verified &&
      r.quote &&
      r.name &&
      validSource(r.source) &&
      Number.isInteger(r.rating) &&
      r.rating >= 1 &&
      r.rating <= 5,
  );

  const brand = `<a class="brand" href="#top" aria-label="${e(company.name)} — accueil"><svg viewBox="0 0 44 40" aria-hidden="true"><path d="M3 31 22 9l19 22M12 34V25l10-12 10 12v9M18 34V25h8v9"/></svg><span>${e(company.name)}<small>${company.businessVerified ? "TOITURES · ÉVALUATION & TRAVAUX" : "MODÈLE DE SITE POUR COUVREURS"}</small></span></a>`;
  const nav =
    '<a href="#services">Services</a><a href="#realisations">Réalisations</a><a href="#entreprise">L’entreprise</a><a href="#avis">Avis</a><a href="#faq">FAQ</a>';
  const coverage =
    company.coverageVerified && company.serviceAreas.length
      ? company.serviceAreas.join(", ")
      : "[VILLES DESSERVIES À CONFIRMER]";
  return `<!doctype html><html lang="fr-CA"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#050505"><title>${e(company.name)} | ${company.businessVerified ? "Réfection et réparation de toiture" : "Modèle de site pour couvreurs"}</title><meta name="description" content="${company.businessVerified ? "Réfection et réparation de toiture : services, réalisations et demande de soumission." : "Démonstration d’un site web pour entreprises de toiture. Un modèle personnalisable avec services, réalisations, avis clients et demande de soumission."}"><meta property="og:title" content="${e(company.name)} — ${company.businessVerified ? "Réfection et réparation de toiture" : "Modèle de site pour couvreurs"}"><meta property="og:description" content="${company.businessVerified ? "Consultez les travaux documentés et préparez votre demande de soumission." : "Découvrez un modèle de site pour couvreurs, à personnaliser avec votre identité et vos chantiers."}"><meta property="og:type" content="website"><meta property="og:locale" content="fr_CA"><link rel="icon" href="assets/favicon.svg" type="image/svg+xml"><link rel="preload" href="assets/inter-tight-latin.woff2" as="font" type="font/woff2" crossorigin><link rel="stylesheet" href="styles.css"><script type="module" src="script.js"></script></head><body id="top"><a class="skip-link" href="#main">Aller au contenu</a>
<header class="header"><div class="container header-inner">${brand}<nav class="desktop-nav" aria-label="Navigation principale">${nav}</nav><div class="header-actions">${callLink(true)}<a class="button" href="#contact">Soumission ${arrow}</a></div><button class="menu-toggle" aria-label="Ouvrir le menu" aria-expanded="false" aria-controls="mobile-menu"><span></span><span></span></button></div></header>
<dialog id="mobile-menu" class="mobile-menu" aria-label="Navigation mobile"><button class="close" aria-label="Fermer le menu">×</button><p class="eyebrow">${e(company.name)}</p><nav>${nav}<a href="#territoire">Secteurs</a><a href="#contact">Contact</a></nav>${callLink()}<a class="button" href="#contact">Demander une soumission ${arrow}</a></dialog>
<main id="main"><section class="hero"><div class="container hero-grid"><div class="hero-copy"><p class="eyebrow"><span class="square"></span> ${e(company.name)}${!company.businessVerified ? ' <span class="working-name">/ Site de démonstration</span>' : ""}</p><h1>Réfection et réparation<br class="desktop-break"> de toiture.</h1><p class="hero-location">${e(coverage)}</p><p class="hero-description">Une fuite, un toit vieillissant ou un remplacement à prévoir? Décrivez votre toiture pour préparer une évaluation et une soumission détaillée.</p><div class="hero-actions"><a class="button" href="#contact">Obtenir une soumission ${arrow}</a>${callLink()}</div><a class="hero-proof-link" href="#realisations">Consulter les dossiers de chantier <span aria-hidden="true">↓</span></a></div><div class="hero-evidence">${confirmedProjects.length ? photo(confirmedProjects[0].photos.after, "", true) : photoSlot("[PHOTO RÉELLE D’UN CHANTIER]", "Toiture terminée, équipe en action ou chantier de l’entreprise.", "hero-photo")}<div class="hero-caption"><span><b>${confirmedProjects.length ? e(confirmedProjects[0].type) : "CHANTIER À IDENTIFIER"}</b><small>${confirmedProjects.length ? e(confirmedProjects[0].city) + " · " + e(confirmedProjects[0].material) : "[VILLE] · [TRAVAUX] · [SYSTÈME]"}</small></span><span class="photo-index">01 / ${confirmedProjects.length ? "PROJET" : "À FOURNIR"}</span></div></div></div></section>
<section class="proof-section" id="preuves" aria-labelledby="proof-title"><div class="container"><div class="proof-heading"><h2 id="proof-title">Les faits, avant de choisir.</h2><span>${company.businessVerified ? "Informations de l’entreprise" : "Documents et références à fournir par l’entreprise"}</span></div><div class="proof-grid">${proof("Licence RBQ", company.rbq, "[NUMÉRO RBQ À CONFIRMER]")}${proof("Assurance responsabilité", company.insurance, "[ASSURANCE À CONFIRMER]")}${proof("Expérience documentée", company.experience, "[EXPÉRIENCE À DOCUMENTER]")}${proof("Garantie sur les travaux", company.warranty, "[GARANTIE À CONFIRMER]")}</div></div></section>
<section class="section container" id="services"><div class="section-head"><div><p class="eyebrow">01 / VOTRE BESOIN</p><h2>Quel travail faut-il prévoir?</h2></div><p>${services.every((s) => s.verified) ? "Choisissez le service qui correspond à votre projet." : 'Services proposés pour ce site.<br><span class="field-note">[OFFRE À VALIDER AVEC L’ENTREPRISE]</span>'}</p></div><div class="services-grid">${services.map((s, i) => `<article class="service-card"><span class="service-number">0${i + 1}</span><h3>${e(s.label)}</h3><p>${e(s.description)}</p><p class="service-scope">${e(s.scope)}</p><a class="text-link" href="#contact" data-service="${e(s.title)}">Décrire mon projet ${arrow}</a></article>`).join("")}</div></section>
<section class="projects-section section" id="realisations"><div class="container"><div class="section-head"><div><p class="eyebrow">02 / DOSSIERS DE CHANTIER</p><h2>Les chantiers, en détail.</h2></div><div><p>Le lieu, le système installé et les étapes du chantier.<br>${confirmedProjects.length ? "Consultez les photos et le périmètre des travaux." : "[PROJETS CLIENTS ET PHOTOS À FOURNIR]"}</p><button class="text-link" data-open-projects aria-expanded="false" aria-controls="all-projects">Voir toutes nos réalisations ${arrow}</button></div></div>${projectCard(confirmedProjects[0], 0)}<p class="portfolio-note">${confirmedProjects.length ? "Seules les étapes disposant de photos sont présentées." : "[PHOTOS AVANT / TRAVAUX / APRÈS À AJOUTER SI DISPONIBLES]"}</p><div class="portfolio-more" id="all-projects" hidden><h3>Tous les dossiers</h3>${
    confirmedProjects.length > 1
      ? confirmedProjects
          .slice(1)
          .map((p, i) => projectCard(p, i + 1))
          .join("")
      : '<div class="empty-record"><strong>Aucun autre dossier documenté.</strong><p>[AJOUTER LES RÉALISATIONS VÉRIFIÉES : VILLE, MATÉRIAU, TRAVAUX ET PHOTOS]</p></div>'
  }</div></div></section>
<section class="section container" id="processus"><div class="section-head"><div><p class="eyebrow">03 / APRÈS VOTRE DEMANDE</p><h2>Votre projet en cinq étapes.</h2></div><p>${workflow.verified ? "Voici le déroulement prévu pour votre projet." : 'Déroulement proposé, à valider.<br><span class="field-note">[PROCESSUS DE L’ENTREPRISE À CONFIRMER]</span>'}</p></div><ol class="process-grid">${workflow.steps.map((s, i) => `<li><span class="step-number">0${i + 1}</span><h3>${e(s.title)}</h3><p>${e(s.text)}</p><span class="step-output">${e(s.output)}</span></li>`).join("")}</ol></section>
<section class="company-section section" id="entreprise"><div class="container company-facts"><div><p class="eyebrow">04 / L’ENTREPRISE</p><h2>Qui intervient<br>sur votre toiture?</h2>${company.crewPhoto ? `<div class="crew-visual">${photo(company.crewPhoto)}</div>` : '<p class="crew-missing">[ÉQUIPE ET PHOTO RÉELLE À FOURNIR]</p>'}</div><div class="differentiators">${company.differentiators.map((d) => `<div><h3>${e(d.label)}</h3><p>${e(d.verified && d.value && validSource(d.source) ? d.value : d.placeholder)}</p>${d.verified && d.value && validSource(d.source) ? `<a class="source-link" href="${safeUrl(d.source)}" target="_blank" rel="noopener noreferrer">Consulter le document ↗</a>` : ""}</div>`).join("")}</div></div></section>
<section class="section container review-section" id="avis"><div><p class="eyebrow">05 / RETOURS CLIENTS</p><h2>Les retours clients.</h2></div><div class="review-content">${confirmedReviews.length ? confirmedReviews.map((r) => `<article class="review"><div class="review-rating" aria-label="${r.rating} sur 5">${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</div><blockquote>${e(r.quote)}</blockquote><p><strong>${e(r.name)}</strong> · ${e(r.city)}</p><a class="source-link" href="${safeUrl(r.source)}" target="_blank" rel="noopener noreferrer">Lire l’avis original ↗</a></article>`).join("") : '<article class="review empty-review"><span class="tag">Avis vérifié non fourni</span><p class="review-placeholder">[AVIS CLIENT AUTHENTIQUE À AJOUTER]</p><div class="review-fields"><span>[NOM DU CLIENT] · [VILLE]</span><span>[NOTE] · [LIEN VERS LA SOURCE]</span></div></article>'}</div></section>
<section class="area-section" id="territoire"><div class="container area-grid"><div><p class="eyebrow">06 / SECTEURS</p><h2>Les secteurs desservis.</h2></div><div><p>${company.coverageVerified ? "Secteurs desservis par " + e(company.name) + "." : "[ZONE DE SERVICE À CONFIRMER]"}</p><div class="cities">${(company.coverageVerified ? company.serviceAreas : []).map((c) => `<span>${e(c)}</span>`).join("")}</div><a class="text-link" href="#contact">Indiquer ma ville dans la demande ${arrow}</a></div></div></section>
<section class="section container faq-section" id="faq"><div><p class="eyebrow">07 / AVANT DE DÉCIDER</p><h2>Coût, travaux,<br>garantie : vos questions.</h2></div><div class="faq-list">${faqs.map((f, i) => `<div class="faq-item"><h3><button class="faq-toggle" aria-expanded="false" aria-controls="faq-${i}">${e(f.question)}<span aria-hidden="true">+</span></button></h3><div class="faq-answer" id="faq-${i}" inert><div><p>${e(f.answer)}</p></div></div></div>`).join("")}</div></section>
<section class="final-cta section" id="contact"><div class="container contact-grid"><div><p class="eyebrow">PARLONS DE VOTRE TOITURE</p><h2>Une toiture à refaire?<br>Une fuite à évaluer?</h2><p>Indiquez votre ville, le problème observé et le type de bâtiment. Ces détails servent à préparer la discussion sur les travaux à envisager.</p><div class="direct-contact">${callLink()}<span>${company.email ? `<a href="mailto:${e(company.email)}">${e(company.email)}</a>` : "[COURRIEL À RENSEIGNER]"}</span><span>${e(company.hours || "[HORAIRES À CONFIRMER]")}</span></div><div class="next-step"><h3>Et ensuite?</h3><p>${workflow.verified ? "L’entreprise vous contacte pour préciser le besoin et convenir de l’évaluation." : "[MODALITÉS DE RAPPEL ET DE VISITE À CONFIRMER]"}<br>Aucun rendez-vous n’est réservé par ce formulaire.</p></div></div>${form.replace("{{SERVICE_OPTIONS}}", services.map((s) => `<option value="${e(s.title)}">${e(s.label)}</option>`).join(""))}</div></section></main>
<footer class="footer"><div class="container"><div class="footer-grid"><div>${brand}<p>Réfection et réparation de toiture.<br>${company.coverageVerified ? e(company.serviceAreas.join(" · ")) : "[SERVICES ET SECTEURS À CONFIRMER]"}</p></div><nav aria-label="Navigation de pied de page">${nav}</nav><div class="footer-contact">${company.phone ? `<a href="tel:${e(company.phone)}">${e(company.phoneDisplay || company.phone)}</a>` : "<span>[TÉLÉPHONE À RENSEIGNER]</span>"}${company.email ? `<a href="mailto:${e(company.email)}">${e(company.email)}</a>` : "<span>[COURRIEL À RENSEIGNER]</span>"}${company.social.map((s) => `<a href="${safeUrl(s.url)}" target="_blank" rel="noopener noreferrer">${e(s.label)} ↗</a>`).join("")}<a href="#contact">Demander une soumission ↗</a></div></div><div class="footer-bottom"><span>© ${new Date().getFullYear()} ${e(company.name)}</span><div><button data-legal="privacy">Confidentialité</button><button data-legal="terms">Mentions légales</button><a href="#top">Retour en haut ↑</a></div></div>${!company.businessVerified ? '<p class="preview-note">Toiture Démo est un modèle de site personnalisable pour les entreprises de toiture. Présentez ici votre entreprise, vos réalisations et vos coordonnées. Les champs entre crochets sont à remplacer par vos informations vérifiées; ce site ne représente pas un entrepreneur réel.</p>' : ""}</div></footer>
<div class="mobile-cta">${callLink(true)}<a class="button" href="#contact">Soumission ${arrow}</a></div><dialog id="detail-dialog" aria-labelledby="dialog-title"><button class="close" aria-label="Fermer">×</button><div id="dialog-content"></div></dialog></body></html>`;
}
