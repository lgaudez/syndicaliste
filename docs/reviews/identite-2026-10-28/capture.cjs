// NODE_PATH=~/.dev-browser/node_modules node docs/reviews/identite-2026-10-28/capture.cjs
// Prérequis : site/public servi sur http://127.0.0.1:4317 (aucun déploiement).
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');

(async () => {
  const { PAGES, chemin } = await import('../../../site/pages/pages.mjs');
  const browser = await chromium.launch();
  const errors = [];
  let checked = 0;
  try {
    for (const width of [320, 390, 1440]) {
      const context = await browser.newContext({ viewport: { width, height: width === 1440 ? 1000 : 844 }, reducedMotion: 'reduce' });
      // Les intégrations tierces ne font pas partie de la vérification locale.
      await context.route('https://**/*', r => r.abort());
      const page = await context.newPage();
      page.on('pageerror', e => errors.push(e.message));
      for (const lang of ['fr', 'en']) for (const entry of PAGES) {
        await page.goto(`http://127.0.0.1:4317${chemin(entry, lang)}`, { waitUntil: 'networkidle' });
        await page.evaluate(() => document.fonts.ready);
        assert.equal(await page.locator('h1').count(), 1);
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${entry.id}/${lang}/${width}: débordement`);
        assert.equal(await page.evaluate(() => [...document.getAnimations()].filter(a => a.playState === 'running').length), 0, 'reduced-motion');
        if (width < 1180) {
          const menu = page.locator('[data-menu-bouton]');
          await menu.click();
          assert.equal(await menu.getAttribute('aria-expanded'), 'true');
          await page.keyboard.press('Escape');
          assert.equal(await menu.getAttribute('aria-expanded'), 'false');
          assert(await menu.evaluate(el => document.activeElement === el));
        }
        if (entry.id === 'accueil' && width !== 320) {
          const suffix = `${lang === 'en' ? 'en-' : ''}${width === 1440 ? 'desktop' : 'mobile'}`;
          await page.screenshot({ path: path.join(__dirname, `after-${suffix}.png`) });
          if (width === 390 && lang === 'fr') {
            await page.locator('.affiche__visuel').screenshot({ path: path.join(__dirname, 'after-mobile-poster.png') });
          }
        }
        checked++;
      }
      await context.close();
    }
    assert.deepEqual(errors, []);
    // Sans JS, le contenu et les liens de navigation restent disponibles.
    const nojs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const page = await nojs.newPage();
    await page.goto('http://127.0.0.1:4317/');
    assert(await page.locator('.barre__nav').isVisible());
    assert(await page.locator('noscript').isVisible());
    await nojs.close();
    console.log(`${checked} pages/largeurs : titres, débordement, reduced-motion, menu/Escape/focus OK ; navigation sans JS OK.`);
  } finally {
    await browser.close();
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
