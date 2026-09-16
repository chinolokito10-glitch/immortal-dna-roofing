import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const browser = await chromium.launch({headless:true,args:['--no-sandbox']});
try {
  for (const width of [1440, 1024, 768, 390, 320]) {
    const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto('http://localhost:3000',{waitUntil:'networkidle'});
    const texts=()=>page.evaluate(()=>{
      const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);const result=[];
      while(walker.nextNode())if(!walker.currentNode.parentElement.closest('script,style,noscript,.language-toggle'))result.push(walker.currentNode.textContent);
      return result;
    });
    const english=await texts();
    await page.locator('[name="name"]').fill('Émilie Test');
    await page.locator('[name="service"]').selectOption('Roof Repair');
    await page.locator('.language-toggle').click();
    assert.equal(await page.locator('html').getAttribute('lang'),'fr');
    assert.equal(await page.locator('[name="name"]').inputValue(),'Émilie Test');
    assert.equal(await page.locator('[name="service"]').inputValue(),'Roof Repair');
    assert.match(await page.locator('#hero-title').textContent(),/Un toit conçu/);
    assert.equal(await page.locator('[name="name"]').getAttribute('placeholder'),'Votre nom complet');
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`French overflow at ${width}`);
    if(width===1440){const fr=await texts();console.log('Unchanged text for review:',english.filter((s,i)=>s===fr[i]&&/[A-Za-z]{2,}\s+[A-Za-z]{2,}/.test(s)).map(s=>s.trim()));}
    await page.locator('.language-toggle').click();
    assert.deepEqual(await texts(),english,'English wording must be restored exactly');
    await page.locator('.language-toggle').click();
    await page.reload({waitUntil:'networkidle'});
    assert.equal(await page.locator('html').getAttribute('lang'),'fr','Preference survives reload');
    for(const service of ['replacement','repair','inspection','emergency']){
      await page.locator(`#service-grid [data-service="${service}"]`).click();
      assert.equal(await page.locator('#detail-dialog').evaluate(el=>el.scrollWidth>el.clientWidth),false,`Dialog overflow: ${width}/${service}`);
      assert.doesNotMatch(await page.locator('#dialog-content').textContent(),/When repairs|Whether you|A sudden|A targeted/);
      await page.keyboard.press('Escape');
    }
    await page.locator('#service-grid [data-service="repair"]').click();
    await page.locator('[data-estimate-service="Roof Repair"]').click();
    assert.equal(await page.locator('[name="service"]').inputValue(),'Roof Repair');
    await page.locator('[name="name"]').fill('Émilie Test');
    await page.locator('[name="phone"]').fill('4505550123');
    await page.locator('[name="email"]').fill('test@example.com');
    await page.locator('[name="city"]').fill('Brossard');
    await page.locator('[name="consent"]').check();
    await page.locator('button[type="submit"]').click();
    assert.match(await page.locator('.form-status').textContent(),/n’a pas été envoyée/);
    await page.locator('.site-footer [data-legal="privacy"]').click();
    assert.match(await page.locator('#dialog-title').textContent(),/Vos renseignements/);
    await page.keyboard.press('Escape');
    if(width<901){await page.locator('.menu-toggle').click();assert.match(await page.locator('#mobile-menu').textContent(),/Secteurs desservis/);await page.keyboard.press('Escape');}
    await page.evaluate(()=>scrollTo(0,0));
    await page.screenshot({path:`test-results/language-fr-${width}.png`});
    assert.deepEqual(errors,[]);
    console.log(`PASS EN/FR ${width}px: translation, restoration, persistence, form state, dialogs, no overflow`);
    await page.close();
  }
} finally {await browser.close();}
