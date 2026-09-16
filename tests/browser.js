import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import assert from "node:assert/strict";
import { createApp } from "../server.js";
const server = createApp();
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox"],
});
try {
  for (const width of [1440, 1024, 768, 390, 320]) {
    const context = await browser.newContext({
      viewport: { width, height: 1000 },
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(`http://127.0.0.1:${server.address().port}`, {
      waitUntil: "networkidle",
    });
    await page.evaluate(async () => {
      await document.fonts.ready;
      document.querySelectorAll("img").forEach((i) => (i.loading = "eager"));
    });
    await page.waitForFunction(() =>
      [...document.images].every((i) => i.complete && i.naturalWidth),
    );
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
      `Overflow at ${width}`,
    );
    assert.equal(await page.locator("h1").count(), 1);
    assert.deepEqual(
      await page
        .locator('a[href^="#"]')
        .evaluateAll((links) =>
          links
            .filter((a) => !document.getElementById(a.hash.slice(1)))
            .map((a) => a.hash),
        ),
      [],
    );
    const faq = page.locator(".faq-toggle").first();
    await faq.click();
    await page.waitForTimeout(50);
    assert.equal(await faq.getAttribute("aria-expanded"), "true");
    await faq.click();
    assert.equal(
      await page.locator("img").count(),
      0,
      "No generated images presented as evidence",
    );
    await page.locator("[data-open-projects]").click();
    assert.equal(await page.locator("#all-projects").isVisible(), true);
    await page.locator("[data-open-projects]").click();
    await page.locator(".hero [data-call-missing]").click();
    assert.match(
      await page.locator("#dialog-content").textContent(),
      /numéro de l’entreprise n’a pas été fourni/,
    );
    await page.keyboard.press("Escape");
    if (width <= 950) {
      await page.locator(".menu-toggle").click();
      assert.equal(
        await page.locator("#mobile-menu").evaluate((d) => d.open),
        true,
      );
      await page.locator('#mobile-menu a[href="#services"]').click();
      assert.equal(
        await page.locator(".menu-toggle").getAttribute("aria-expanded"),
        "false",
      );
    }
    if (width === 1440 || width === 390) {
      const result = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      console.log(
        "Accessibility",
        width,
        JSON.stringify(
          result.violations.map((v) => ({
            id: v.id,
            nodes: v.nodes.map((n) => n.target),
          })),
        ),
      );
      assert.equal(result.violations.length, 0);
    }
    await page.evaluate(() => scrollTo(0, 0));
    await page.waitForTimeout(100);
    await page.screenshot({
      path: `test-results/evidence-${width}.png`,
      fullPage: true,
    });
    assert.deepEqual(errors, []);
    console.log(
      `Passed layout and interactions: ${width}px; page height ${await page.evaluate(() => document.body.scrollHeight)}px`,
    );
    if (width === 390) {
      await page.locator("[name=name]").fill("Test Client");
      await page.locator("[name=phone]").fill("5145550123");
      await page.locator("[name=email]").fill("test@example.com");
      await page.locator("[name=city]").fill("Montréal");
      await page.locator("[name=service]").selectOption("Roof Repair");
      await page.locator("[name=consent]").check();
      await page.locator("[type=submit]").click();
      assert.match(
        await page.locator("#form-status").textContent(),
        /n’a pas été envoyée/,
      );
      const download = page.waitForEvent("download");
      await page.locator("#download-request").click();
      assert.equal(
        (await download).suggestedFilename(),
        "demande-soumission-toiture-demo.txt",
      );
    }
    await context.close();
  }
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
