// Régénère public/og.png (ou og-en.png avec l'argument en) : node og/capture.mjs [en] (Playwright requis, ex. NODE_PATH=~/.dev-browser/node_modules)
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const ici = fileURLToPath(new URL(".", import.meta.url));
const nom = process.argv[2] === "en" ? "og-en" : "og";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.goto(`file://${ici}${nom}.html`);
await page.evaluate(() => document.fonts.ready);
await page.locator(".og").screenshot({ path: `${ici}../public/${nom}.png` });
await browser.close();
console.log(`public/${nom}.png régénérée`);
