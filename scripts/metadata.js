import { company, services, projects, faqs } from "../site.config.js";
import { escape } from "./render-site.js";
export function metadata(html, origin = "") {
  html = html
    .replace(/<link\s+rel="canonical"[^>]*>/g, "")
    .replace(
      /<meta\s+(?:name="robots"|property="og:url"|property="og:image"|property="og:image:alt")[^>]*>/g,
      "",
    )
    .replace(/<script type="application\/ld\+json">.*?<\/script>/gs, "");
  const ready =
    company.businessVerified &&
    company.coverageVerified &&
    company.serviceAreas.length > 0;
  const noindex =
    ready && origin ? "" : '<meta name="robots" content="noindex, nofollow">';
  if (!origin) return html.replace("</head>", noindex + "</head>");
  const parsed = new URL(origin);
  if (parsed.protocol !== "https:")
    throw Error("PUBLIC_ORIGIN must be an HTTPS URL.");
  const canonical = parsed.origin + "/";
  const title = `${company.name} | ${company.businessVerified ? "Réfection et réparation de toiture" : "Modèle de site pour couvreurs"}`;
  const graph = [
    {
      "@type": "WebPage",
      "@id": canonical,
      url: canonical,
      name: title,
      inLanguage: "fr-CA",
    },
  ];
  const answered = faqs.filter((f) => !f.answer.includes("["));
  if (answered.length)
    graph.push({
      "@type": "FAQPage",
      mainEntity: answered.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
    });
  if (ready)
    graph.push({
      "@type": "RoofingContractor",
      "@id": canonical + "#entreprise",
      name: company.name,
      url: canonical,
      ...(company.phone ? { telephone: company.phone } : {}),
      ...(company.email ? { email: company.email } : {}),
      areaServed: company.serviceAreas,
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Services de toiture",
        itemListElement: services
          .filter((s) => s.verified)
          .map((s) => ({
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: s.label,
              description: s.description,
            },
          })),
      },
    });
  const photo = projects.find(
    (p) =>
      p.verified &&
      p.type &&
      p.city &&
      p.description &&
      p.photos?.after?.src &&
      p.photos.after.alt,
  )?.photos.after;
  const ogPhoto = photo
    ? `<meta property="og:image" content="${escape(new URL(photo.src, canonical).href)}"><meta property="og:image:alt" content="${escape(photo.alt)}">`
    : "";
  return html.replace(
    "</head>",
    `${noindex}<link rel="canonical" href="${escape(canonical)}"><meta property="og:url" content="${escape(canonical)}">${ogPhoto}<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replaceAll("<", "\\u003c")}</script></head>`,
  );
}
export function robots(origin = "") {
  return origin &&
    company.businessVerified &&
    company.coverageVerified &&
    company.serviceAreas.length
    ? `User-agent: *\nAllow: /\nSitemap: ${new URL(origin).origin}/sitemap.xml\n`
    : "User-agent: *\nDisallow: /\n";
}
export function sitemap(origin) {
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${new URL(origin).origin}/</loc></url></urlset>`;
}
