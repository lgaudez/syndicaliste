// Structure du site : public/ à jour, menu et bascule de langue cohérents, anciennes ancres valides, sitemap complet.
// node site/tests/pages.mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { construire } from "../build.mjs";
import { LANGUES, PAGES, SITE, chemin, fichier, redirections } from "../pages/pages.mjs";

const lire = (f) => readFileSync(new URL(`../public/${f}`, import.meta.url), "utf8");
let n = 0;
const ok = (c, m) => { assert.ok(c, m); n++; };

// 1. Les fichiers commités sont exactement ceux que produit le générateur.
for (const [f, contenu] of construire()) ok(lire(f) === contenu, `${f} n'est pas à jour : lancer node site/build.mjs`);

const ids = (html) => new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
for (const p of PAGES) for (const lang of LANGUES) {
  const html = lire(fichier(p, lang));
  const autre = lang === "fr" ? "en" : "fr";
  ok(html.includes(`<html lang="${lang}">`), `${p.id}/${lang} : lang`);
  ok(html.includes(`<link rel="canonical" href="${SITE}${chemin(p, lang)}">`), `${p.id}/${lang} : canonical`);
  for (const l of LANGUES) ok(html.includes(`hreflang="${l}" href="${SITE}${chemin(p, l)}"`), `${p.id}/${lang} : hreflang ${l}`);
  ok(html.includes(`<meta property="og:title" content=`) && html.includes(`og:description`), `${p.id}/${lang} : og`);
  // Menu : une entrée par page, la page courante marquée, dans l'ordre de la table.
  const menu = html.match(/<nav class="barre__nav" id="menu"[\s\S]*?<\/nav>/)[0];
  const liens = [...menu.matchAll(/<a href="([^"]+)"/g)].map((m) => m[1]);
  ok(JSON.stringify(liens) === JSON.stringify(PAGES.map((q) => chemin(q, lang))), `${p.id}/${lang} : menu`);
  ok(menu.includes(`<a href="${chemin(p, lang)}" aria-current="page">`), `${p.id}/${lang} : page courante`);
  ok(/aria-expanded="false" aria-controls="menu"/.test(html), `${p.id}/${lang} : bouton du menu`);
  // Bascule de langue vers la page équivalente.
  const langues = html.match(/<nav class="barre__langues"[\s\S]*?<\/nav>/)[0];
  ok(langues.includes(`href="${chemin(p, autre)}" hreflang="${autre}"`), `${p.id}/${lang} : bascule vers ${chemin(p, autre)}`);
  // Pied : encart GTL, #gaudeztechlab, mention parodique, crédits.
  ok(html.includes("Gaudez Tech Lab") && html.includes("#gaudeztechlab") && html.includes(lang === "en" ? "parody, no legal value" : "Document parodique") && html.includes("/img/CREDITS.md"), `${p.id}/${lang} : pied`);
  // Bulletin de contact : la version compacte dans le pied partout, la complète sur le quiz et /skill/.
  const bulletins = [...html.matchAll(/<form [^>]*action="\/api\/contact" method="post" data-contact[\s\S]*?<\/form>/g)].map((m) => m[0]);
  ok(bulletins.length === (["quiz", "skill"].includes(p.id) ? 2 : 1), `${p.id}/${lang} : nombre de bulletins`);
  for (const b of bulletins) {
    ok(/name="email" type="email" required/.test(b) && /name="consentement" value="oui" required/.test(b) && /name="site_web"/.test(b) && b.includes(`name="lang" value="${lang}"`), `${p.id}/${lang} : bulletin complet`);
    ok(/role="status" aria-live="polite"/.test(b), `${p.id}/${lang} : statut annoncé`);
  }
  // Liens internes vers des ancres : la cible existe.
  const presents = ids(html);
  for (const [, ancre] of html.matchAll(/href="#([^"]+)"/g)) ok(presents.has(ancre), `${p.id}/${lang} : ancre #${ancre} absente`);
  ok(new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])).size === [...html.matchAll(/\sid="([^"]+)"/g)].length, `${p.id}/${lang} : id en double`);
}

// 2. Anciennes ancres de la one page : la page cible existe et contient l'ancre.
for (const lang of LANGUES) {
  for (const [ancre, cible] of Object.entries(redirections(lang))) {
    const [url, id] = cible.split("#");
    const p = PAGES.find((q) => chemin(q, lang) === url);
    ok(p, `${lang} #${ancre} → ${url} : page inconnue`);
    if (id) ok(ids(lire(fichier(p, lang))).has(id), `${lang} #${ancre} → ${cible} : ancre absente`);
  }
  ok(ids(lire(lang === "en" ? "en/index.html" : "index.html")).has("demo"), `${lang} : #demo reste sur l'accueil`);
}

// 3. Sitemap : chaque page dans chaque langue, avec ses alternates.
const sitemap = lire("sitemap.xml");
for (const p of PAGES) for (const lang of LANGUES) ok(sitemap.includes(`<loc>${SITE}${chemin(p, lang)}</loc>`), `sitemap : ${chemin(p, lang)}`);
ok(lire("robots.txt").includes(`${SITE}/sitemap.xml`), "robots.txt");
ok(lire("404.html").includes('name="robots" content="noindex"'), "404 non indexée");
console.log(`Pages : ${n} vérifications sur ${PAGES.length * LANGUES.length} pages, 0 échec`);
