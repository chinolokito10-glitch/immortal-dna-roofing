import test from "node:test";
import assert from "node:assert/strict";
import { company, projects, services } from "../site.config.js";
import { renderSite } from "../scripts/render-site.js";
import { metadata, robots } from "../scripts/metadata.js";

test("unverified site exposes missing evidence and never publishes architectural photos or invented telephone links", () => {
  const html = renderSite();
  assert.ok(!html.includes("<img"));
  assert.ok(!html.includes('href="tel:'));
  assert.ok(!html.includes("Soumission gratuite"));
  assert.ok(!html.includes("Montréal · Laval · Montérégie"));
  assert.ok(!html.includes("Toiture commerciale"));
  assert.match(html, /\[NUMÉRO RBQ À CONFIRMER\]/);
  assert.match(html, /\[PHOTO RÉELLE D’UN CHANTIER\]/);
  assert.ok(html.indexOf('id="preuves"') < html.indexOf('id="services"'));
  assert.ok(html.indexOf('id="realisations"') < html.indexOf('id="processus"'));
  const rendered = metadata(html, "https://test.example");
  assert.match(rendered, /noindex, nofollow/);
  assert.ok(!rendered.includes('"@type":"RoofingContractor"'));
  assert.ok(!rendered.includes("og:image"));
  assert.match(robots("https://test.example"), /Disallow: \//);
});
test("verified content renders call links, actual photo stages, sourced reviews and confirmed service schema", () => {
  const backup = structuredClone(company);
  const serviceFlags = services.map((s) => s.verified);
  try {
    Object.assign(company, {
      businessVerified: true,
      phone: "+14505550123",
      phoneDisplay: "450 555-0123",
      coverageVerified: true,
      serviceAreas: ["Ville de test"],
    });
    company.rbq = {
      verified: true,
      value: "TEST-LICENCE",
      source: "https://test.example/licence",
    };
    company.reviews = [
      {
        verified: true,
        name: "Client de test",
        city: "Ville de test",
        rating: 5,
        quote: "AVIS DE TEST UNIQUEMENT",
        source: "https://test.example/avis",
      },
    ];
    projects.push({
      verified: true,
      type: "Chantier de test",
      city: "Ville de test",
      material: "Système de test",
      description: "Dossier de test uniquement",
      completedAt: "Date de test",
      photos: {
        after: {
          src: "assets/test-after.webp",
          alt: "Photo de test",
          width: 1200,
          height: 800,
        },
      },
    });
    services[0].verified = true;
    const html = renderSite();
    assert.match(html, /href="tel:\+14505550123"/);
    assert.match(html, /TEST-LICENCE/);
    assert.match(html, /AVIS DE TEST UNIQUEMENT/);
    assert.match(html, /assets\/test-after.webp/);
    assert.ok(!html.includes("test-before"));
    assert.ok(html.includes("CHANTIER TERMINÉ"));
    assert.ok(!html.includes(">AVANT</figcaption>"));
    projects[0].photos.before = {
      ...projects[0].photos.after,
      src: "assets/test-before.webp",
    };
    projects[0].photos.during = {
      ...projects[0].photos.after,
      src: "assets/test-during.webp",
    };
    projects[0].material = "";
    const progression = renderSite();
    assert.match(progression, /stage-count-3/);
    assert.ok(
      progression.indexOf('src="assets/test-before.webp"') <
        progression.indexOf('src="assets/test-during.webp"'),
    );
    assert.match(progression, /\[MATÉRIAU \/ SYSTÈME À CONFIRMER\]/);
    company.reviews[0].source = "javascript:alert(1)";
    company.rbq.source = "not a source";
    const unsourced = renderSite();
    assert.ok(!unsourced.includes("AVIS DE TEST UNIQUEMENT"));
    assert.ok(!unsourced.includes("TEST-LICENCE"));
    const rendered = metadata(
      metadata(html, "https://test.example"),
      "https://test.example",
    );
    assert.equal((rendered.match(/rel="canonical"/g) || []).length, 1);
    const data = JSON.parse(
      rendered.match(
        /<script type="application\/ld\+json">(.*?)<\/script>/s,
      )[1],
    );
    const contractor = data["@graph"].find(
      (n) => n["@type"] === "RoofingContractor",
    );
    assert.deepEqual(contractor.areaServed, ["Ville de test"]);
    assert.equal(contractor.hasOfferCatalog.itemListElement.length, 1);
    assert.ok(!rendered.includes("noindex"));
  } finally {
    for (const key of Object.keys(company)) delete company[key];
    Object.assign(company, backup);
    projects.length = 0;
    services.forEach((s, i) => (s.verified = serviceFlags[i]));
  }
});
