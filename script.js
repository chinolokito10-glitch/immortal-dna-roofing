import { company, projects } from "./site.config.js";
const header = document.querySelector(".header");
const updateHeader = () =>
  header.classList.toggle("scrolled", window.scrollY > 30);
window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();
const menu = document.querySelector("#mobile-menu");
const menuToggle = document.querySelector(".menu-toggle");
menuToggle.addEventListener("click", () => {
  menu.showModal();
  menuToggle.setAttribute("aria-expanded", "true");
});
menu.addEventListener("close", () =>
  menuToggle.setAttribute("aria-expanded", "false"),
);
menu
  .querySelectorAll("a")
  .forEach((link) => link.addEventListener("click", () => menu.close()));
document.querySelectorAll("dialog").forEach((dialog) => {
  dialog
    .querySelector(".close")
    .addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      const rect = dialog.getBoundingClientRect();
      if (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      )
        dialog.close();
    }
  });
});
window.matchMedia("(min-width: 951px)").addEventListener("change", (event) => {
  if (event.matches && menu.open) menu.close();
});
document.querySelectorAll(".faq-toggle").forEach((button) =>
  button.addEventListener("click", () => {
    const open = button.getAttribute("aria-expanded") !== "true";
    button.setAttribute("aria-expanded", String(open));
    const answer = document.getElementById(
      button.getAttribute("aria-controls"),
    );
    answer.classList.toggle("open", open);
    answer.inert = !open;
  }),
);
const form = document.querySelector("#estimate-form");
document.querySelectorAll("[data-service]").forEach((link) =>
  link.addEventListener("click", () => {
    form.elements.service.value = link.dataset.service;
  }),
);
const dialog = document.querySelector("#detail-dialog");
const content = document.querySelector("#dialog-content");
document
  .querySelector("[data-open-projects]")
  .addEventListener("click", (event) => {
    const gallery = document.querySelector("#all-projects");
    gallery.hidden = !gallery.hidden;
    event.currentTarget.setAttribute("aria-expanded", String(!gallery.hidden));
    event.currentTarget.textContent = gallery.hidden
      ? "Voir toutes nos réalisations ↗"
      : "Réduire les dossiers ↑";
  });
function openText(titleText, bodyText) {
  content.replaceChildren();
  const title = document.createElement("h2");
  title.id = "dialog-title";
  title.textContent = titleText;
  const body = document.createElement("p");
  body.textContent = bodyText;
  content.append(title, body);
  dialog.showModal();
}
document.querySelectorAll("[data-call-missing]").forEach((button) =>
  button.addEventListener("click", () => {
    if (menu.open) menu.close();
    openText(
      "Téléphone à renseigner",
      "Le numéro de l’entreprise n’a pas été fourni. Aucun appel ne peut être lancé pour le moment. Vous pouvez préparer votre demande avec le formulaire.",
    );
    const link = document.createElement("a");
    link.href = "#contact";
    link.className = "button";
    link.textContent = "Préparer ma demande ↗";
    link.addEventListener("click", () => dialog.close());
    content.append(link);
  }),
);
document.querySelectorAll("[data-project-index]").forEach((button) =>
  button.addEventListener("click", () => {
    const project = projects.filter(
      (p) =>
        p.verified &&
        p.type &&
        p.city &&
        p.description &&
        p.photos?.after?.src &&
        p.photos.after.alt,
    )[Number(button.dataset.projectIndex)];
    if (!project) return;
    openText(project.type + " — " + project.city, project.description);
    const stages = document.createElement("div");
    stages.className = "project-stages";
    for (const [key, label] of [
      ["before", "Avant"],
      ["during", "Travaux"],
      ["after", "Après"],
    ]) {
      const data = project.photos[key];
      if (!data?.src) continue;
      const figure = document.createElement("figure");
      const img = document.createElement("img");
      img.src = data.src;
      img.alt = data.alt;
      img.width = data.width || 1200;
      img.height = data.height || 800;
      const caption = document.createElement("figcaption");
      caption.textContent = label;
      figure.append(img, caption);
      stages.append(figure);
    }
    content.append(stages);
  }),
);
document.querySelectorAll("[data-legal]").forEach((button) =>
  button.addEventListener("click", () => {
    const privacy = button.dataset.legal === "privacy";
    openText(
      privacy ? "Confidentialité" : "Mentions légales",
      privacy
        ? company.privacyText ||
            "Version à compléter avant activation. Ce formulaire recueille vos coordonnées, votre ville et les détails de votre projet pour répondre à votre demande. Aucun outil publicitaire ou analytique n’est installé. Sans service de réception configuré, aucune demande n’est transmise; une copie peut être téléchargée sur votre appareil. [RESPONSABLE DE LA PROTECTION DES RENSEIGNEMENTS, COORDONNÉES, PRESTATAIRES ET CONSERVATION À RENSEIGNER]."
        : company.legalText ||
            "Site de démonstration pour entreprises de toiture. [IDENTITÉ LÉGALE, ADRESSE, LICENCE ET COORDONNÉES À CONFIRMER]. Les champs entre crochets signalent une information non fournie. Les emplacements de photos ne représentent pas des chantiers réalisés. Aucun avis client ni résultat de performance n’est inventé.",
    );
  }),
);
let enabled = false;
try {
  const response = await fetch("/api/config");
  if (response.ok) enabled = (await response.json()).estimatesEnabled === true;
} catch {}
const status = document.querySelector("#form-status");
if (!enabled)
  status.textContent =
    "Mode démonstration : l’envoi n’est pas encore activé. Vous pouvez préparer et télécharger votre demande.";
let draft;
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const submit = form.querySelector('[type="submit"]');
  draft = Object.fromEntries(new FormData(form));
  if (!enabled) {
    status.textContent =
      "Votre demande n’a pas été envoyée. Téléchargez-en une copie en attendant l’activation du service.";
    document.querySelector("#download-request").hidden = false;
    status.focus();
    return;
  }
  submit.disabled = true;
  status.textContent = "Envoi de votre demande…";
  try {
    const response = await fetch("/api/estimates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    const result = await response.json();
    if (!response.ok || !result.sent) throw new Error();
    status.textContent =
      "Merci! Votre demande a bien été transmise. Nous vous contacterons pour discuter de votre toiture.";
    form.reset();
    document.querySelector("#download-request").hidden = true;
  } catch {
    status.textContent =
      "La livraison de votre demande n’a pas pu être confirmée. Réessayez plus tard ou téléchargez votre demande pour la conserver.";
    document.querySelector("#download-request").hidden = false;
  } finally {
    submit.disabled = false;
    status.focus();
  }
});
document.querySelector("#download-request").addEventListener("click", () => {
  if (!draft) return;
  const service =
    [...form.elements.service.options].find(
      (option) => option.value === draft.service,
    )?.textContent || draft.service;
  const data = `DEMANDE DE SOUMISSION — NON ENVOYÉE\n\nNom : ${draft.name}\nTéléphone : ${draft.phone}\nCourriel : ${draft.email}\nVille : ${draft.city}\nService : ${service}\nProjet : ${draft.message || "Non précisé"}\n`;
  const url = URL.createObjectURL(
    new Blob([data], { type: "text/plain;charset=utf-8" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = "demande-soumission-toiture-demo.txt";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
const mobileCTA = document.querySelector(".mobile-cta");
new IntersectionObserver(
  (entries) =>
    entries.forEach((entry) =>
      mobileCTA.classList.toggle("suppressed", entry.isIntersecting),
    ),
  { threshold: 0 },
).observe(document.querySelector("#contact"));
