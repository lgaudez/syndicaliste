const assert = require('node:assert/strict');
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const [day, past, upcoming] of [['2026-10-28', 5, 4], ['2026-11-06', 7, 2], ['2026-12-05', 8, 0]]) {
      for (const language of ['fr', 'en']) {
        const page = await browser.newPage();
        await page.clock.install({ time: new Date(`${day}T12:00:00Z`) });
        await page.goto(`http://127.0.0.1:4188/${language === 'en' ? 'en/strikes' : 'greves'}/`);
        await page.waitForSelector('.lutte');
        assert.equal(await page.locator('[data-luttes="passees"] .lutte').count(), past, `${language} ${day} past`);
        assert.equal(await page.locator('[data-luttes="a-venir"] .lutte').count(), upcoming, `${language} ${day} upcoming`);
        assert.equal(await page.locator('[data-luttes="passees"] .etiquette--rouge').count(), 0, 'past events never carry a current strike badge');
        console.log(`${language} ${day}: ${past} past, ${upcoming} upcoming`);
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
