// Régénère public/og.png : node og/capture.mjs (Playwright requis, ex. NODE_PATH=~/.dev-browser/node_modules)
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const ici = fileURLToPath(new URL(".", import.meta.url));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.goto(`file://${ici}og.html`);
await page.evaluate(() => document.fonts.ready);
await page.locator(".og").screenshot({ path: `${ici}../public/og.png` });
await browser.close();
console.log("public/og.png régénérée");
