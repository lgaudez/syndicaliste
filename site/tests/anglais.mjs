// Le site anglais est en anglais : aucun mot français hors exceptions justifiées, ni dans les pages EN générées,
// ni dans les textes que leurs scripts affichent. node site/tests/anglais.mjs (--tout pour lister sans échouer)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PAGES, fichier } from "../pages/pages.mjs";
import EN from "../public/js/textes-en.js";
import { PORTRAITS, QUESTIONS } from "../public/js/quiz-donnees.js";

const lire = (f) => readFileSync(new URL(`../${f}`, import.meta.url), "utf8");
const centrales = JSON.parse(lire("../skills/syndicaliste/data/centrales.json")).centrales;
const { mouvements } = JSON.parse(lire("../skills/syndicaliste/data/greves.json"));

// Exceptions, chacune pour une raison :
const AUTORISES = [
  // noms propres, marques, titre de la chanson
  "Syndicaliste", "Mon Ami", "mon ami", "Légifrance", "code.travail.gouv.fr", "Gaudez Tech Lab", "Marquis de Lafayette", "Lafayette", "Le Chat", "rue de Chazelles", "de facto",
  // crédits des œuvres (noms d'artistes et de musées)
  "Joseph-Désiré Court", "Jean-Jacques-François Le Barbier", "Musée Carnavalet",
  // noms officiels des syndicats, en VO, suivis de leur traduction
  ...Object.keys(centrales).map((k) => EN.centrale(k, centrales[k]).nom),
  // institutions et termes juridiques français, toujours glosés en anglais dans la phrase
  "conseil de prud'hommes", "conventions collectives", "forfait jours", "Smic", "point d'indice",
];

const ACCENTS = /[éèêëàâçîïôûùœÉÈÊÀÇÔ]/;
const MOTS = ["le", "la", "les", "des", "du", "de", "une", "est", "et", "avec", "pour", "dans", "sur", "pas", "aux", "ou", "au",
  "sans", "aucun", "aucune", "qui", "que", "cette", "mes", "tes", "nos", "vos", "leur", "fait", "faire", "être", "très", "chez",
  "grève", "greve", "heures", "heure", "syndicat", "syndicats", "ensemble", "tous", "ouais", "camarade", "camarades",
  "je", "tu", "nous", "vous", "il", "elle", "mais", "travail", "salaire", "repos", "férié", "ferie", "dimanche", "nuit",
  "majoration", "guichet", "fermé", "service minimum", "en service", "intersyndicale", "préavis", "pointeuse", "griefs",
  "tract", "manif", "patron", "centrale", "centrales", "fonctionnaire", "agent public", "bonjour", "merci", "oui", "non",
  "prud'hommes", "repassez", "camarade", "parodique", "valeur", "juridique", "accord", "salariés", "employeur"];
const motFr = new RegExp(`(?<![\\p{L}'’-])(?:${MOTS.map((m) => m.replace(" ", "\\s+")).join("|")})(?![\\p{L}'’-])|(?<!\\p{L})(?:[dlj]|qu)'\\p{Ll}`, "iu");

// Identifiants de code : chemins (.syndicat/…), URL et paramètres (?centrale=cgt), noms de fonctions (moyenne(liste)).
const CODE = /(?:\S*[/?=]\S*)|\b\w+\(\w*\)/g;
function nettoyer(texte) {
  let t = texte;
  for (const a of AUTORISES) t = t.replaceAll(a, " ");
  return t.replace(CODE, " ");
}
const fautes = [];
function verifier(origine, texte) {
  const t = nettoyer(String(texte)).replace(/\s+/g, " ").trim();
  if (!t) return;
  const m = t.match(ACCENTS) || t.match(motFr);
  if (m) fautes.push(`${origine} : « ${m[0]} » dans « ${t.slice(Math.max(0, m.index - 50), m.index + 60)} »`);
}

// 1. Pages EN générées : texte visible et attributs lus (alt, aria-label, title, placeholder, meta).
const entites = { "&nbsp;": " ", "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'" };
const decoder = (s) => s.replace(/&[a-z#0-9]+;/g, (e) => entites[e] ?? " ");
const pages = [...PAGES.map((p) => fichier(p, "en"))];
for (const f of pages) {
  let html = lire(`public/${f}`);
  html = html.replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(script|style|code)\b[\s\S]*?<\/\1>/g, " ")
    .replace(/<svg\b[\s\S]*?<\/svg>/g, (svg) => [...svg.matchAll(/aria-label="([^"]*)"|<title>([^<]*)<\/title>/g)].map((m) => m[1] ?? m[2]).join(" . "));
  for (const [, , v] of html.matchAll(/\s(alt|aria-label|title|placeholder|content)="([^"]*)"/g)) verifier(`${f} [attribut]`, decoder(v));
  const texte = decoder(html.replace(/<[^>]+>/g, "\n"));
  for (const ligne of texte.split("\n")) verifier(f, ligne);
}

// 2. Textes affichés par les scripts en anglais.
function parcourir(origine, v) {
  if (typeof v === "string") return verifier(origine, v);
  if (typeof v === "function") {
    for (const m of v.toString().matchAll(/"((?:[^"\\]|\\.)*)"|`((?:[^`\\]|\\.)*)`/g)) verifier(origine, (m[1] ?? m[2]).replace(/\$\{[^}]*\}/g, " "));
    return;
  }
  if (Array.isArray(v)) return v.forEach((x, i) => parcourir(`${origine}[${i}]`, x));
  if (v instanceof RegExp) return;
  // id, lang : identifiants techniques, jamais affichés.
  if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) if (k !== "id" && k !== "lang") parcourir(`${origine}.${k}`, x);
}
const { consigne, ferie, centrale, mouvement, bandeau, sigle, ...reste } = EN;
parcourir("textes-en", reste);
// Le bandeau en direct, pour chaque régime, syndicat et grève suivie.
const P = await import("../public/js/pointeuse.js");
for (const r of Object.keys(P.REGIMES)) {
  verifier(`textes-en consigne ${r}`, consigne(r));
  for (const cle of Object.keys(centrales)) {
    for (const greve of [null, ...mouvements]) {
      const s = { regime: r, heure: "23 h 10", majoration_pct: P.REGIMES[r][1], greve_suivie: greve, centrale: { cle } };
      verifier(`bandeau ${r} ${cle}`, bandeau(s));
    }
  }
}
for (const c of Object.keys(centrales)) {
  const t = centrale(c, centrales[c]);
  for (const k of ["devise", "bord", "ton", "doctrine_greve"]) if (typeof t[k] === "string") verifier(`textes-en centrale ${c}.${k}`, t[k]);
}
for (const m of mouvements) {
  const t = mouvement(m);
  for (const k of ["intitule", "motif"]) if (t[k]) verifier(`textes-en mouvement ${m.date ?? m.debut} ${k}`, t[k]);
}
for (const q of QUESTIONS) { verifier(`quiz ${q.id}`, q.en); q.reponses.forEach((r, i) => verifier(`quiz ${q.id}[${i}]`, r.en)); }
for (const [c, p] of Object.entries(PORTRAITS)) { verifier(`portrait ${c}`, p.en); verifier(`portrait ${c} bord`, p.bord.en); }

// Dictionnaires « en: { … } » des scripts de page et du générateur.
function blocEn(source) {
  const blocs = [];
  for (const m of source.matchAll(/\n\s*en: \{/g)) {
    let i = m.index + m[0].length, prof = 1;
    while (prof && i < source.length) { const c = source[i++]; if (c === "{") prof++; else if (c === "}") prof--; }
    blocs.push(source.slice(m.index, i));
  }
  return blocs.join("\n");
}
// public/data/motions.json est exclu à dessein : les motions sont du contenu écrit par les agents, dans la langue de leur humain.
for (const f of ["public/js/app.js", "public/js/quiz.js", "public/js/droits.js", "public/js/hymne.js", "public/js/contact.js", "public/js/ag.js", "build.mjs"]) {
  const bloc = blocEn(lire(f));
  for (const m of bloc.matchAll(/"((?:[^"\\]|\\.)*)"|`((?:[^`\\]|\\.)*)`/g)) verifier(`${f} (en)`, (m[1] ?? m[2]).replace(/\$\{[^}]*\}/g, " "));
}

if (process.argv.includes("--tout")) { console.log(fautes.join("\n") || "aucun mot français"); process.exit(0); }
assert.equal(fautes.length, 0, `Français sur le site anglais :\n${fautes.join("\n")}`);
console.log(`Anglais : ${pages.length} pages et leurs scripts, aucun mot français hors exceptions`);
