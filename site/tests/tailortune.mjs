// Règle produit TailorTune : la page de l'hymne (FR et EN) ne contient aucun mot interdit, ni dans le texte, ni dans les attributs, ni dans les métadonnées.
// node site/tests/tailortune.mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PAGES, fichier } from "../pages/pages.mjs";

const INTERDITS = [
  [/(?<![\p{L}\d])(?:IA|AI|A\.I\.)(?![\p{L}\d])/u, "IA / AI"],
  [/intelligence artificielle|artificial intelligence/iu, "intelligence artificielle"],
  [/claude/iu, "Claude"],
  [/automation|automatis/iu, "automation"],
  [/g[ée]n[ée]r[ée]e?s?(?![\p{L}])|generat/iu, "généré / generated"],
];

const pages = PAGES.filter((p) => p.sansMotsInterdits);
assert.ok(pages.some((p) => p.id === "hymne"), "la page hymne est marquée sansMotsInterdits");
let n = 0;
for (const p of pages) for (const lang of ["fr", "en"]) {
  const chemin = fichier(p, lang);
  const html = readFileSync(new URL(`../public/${chemin}`, import.meta.url), "utf8");
  // Le symbole SVG décoratif et les scripts sont du code, pas du texte : on vérifie le document entier quand même.
  for (const [re, nom] of INTERDITS) {
    const trouve = html.match(re);
    assert.ok(!trouve, `${chemin} contient « ${trouve?.[0]} » (${nom}) près de : ${trouve && html.slice(Math.max(0, trouve.index - 60), trouve.index + 40)}`);
    n++;
  }
  assert.ok(html.includes("TailorTune") && html.includes("SYNDIQUE"), `${chemin} : encart TailorTune et code promo`);
  assert.ok(html.includes("https://tailortune.com/?utm_source=syndicaliste&amp;utm_medium=site&amp;utm_campaign=hymne"), `${chemin} : lien suivi`);
  n += 2;
}
// Le script de la page ne doit pas injecter de mot interdit non plus.
const script = readFileSync(new URL("../public/js/hymne.js", import.meta.url), "utf8").replace(/^\s*\/\/.*$/gm, "");
for (const [re, nom] of INTERDITS) { assert.ok(!re.test(script), `hymne.js contient ${nom}`); n++; }
console.log(`TailorTune : ${n} vérifications, aucun mot interdit sur ${pages.length * 2} pages`);
