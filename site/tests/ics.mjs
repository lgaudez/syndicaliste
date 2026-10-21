// Valide le flux iCal du calendrier des luttes (RFC 5545) : node site/tests/ics.mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { echapper, genererIcs, plier } from "../lib/ics.js";
import { onRequestGet } from "../functions/api/greves.ics.js";
import { MOUVEMENTS } from "../public/js/textes-en.js";

const brut = readFileSync(new URL("../../skills/syndicaliste/data/greves.json", import.meta.url), "utf8");
const { maj, mouvements } = JSON.parse(brut);
let verifs = 0;
const ok = (cond, message) => { assert.ok(cond, message); verifs++; };
const octets = (t) => Buffer.byteLength(t, "utf8");
const lendemain = (iso) => new Date(Date.parse(`${iso}T00:00:00Z`) + 86400000).toISOString().slice(0, 10).replaceAll("-", "");

// Défait l'échappement TEXT, pour comparer avec la source.
const desechapper = (v) => v.replace(/\\([\\;,nN])/g, (_, c) => (c === "n" || c === "N" ? "\n" : c));

function analyser(ics) {
  ok(ics.endsWith("\r\n"), "le flux finit par CRLF");
  ok(!/[^\r]\n/.test(ics) && !/\r(?!\n)/.test(ics), "aucun LF ni CR isolé : CRLF partout");
  const physiques = ics.slice(0, -2).split("\r\n");
  for (const l of physiques) ok(octets(l) <= 75, `ligne de ${octets(l)} octets > 75 : ${l}`);
  const logiques = ics.replace(/\r\n[ \t]/g, "").slice(0, -2).split("\r\n");
  ok(logiques[0] === "BEGIN:VCALENDAR" && logiques.at(-1) === "END:VCALENDAR", "VCALENDAR encadre le flux");
  for (const p of ["VERSION:2.0", "CALSCALE:GREGORIAN", "METHOD:PUBLISH"]) ok(logiques.includes(p), `${p} présent`);
  ok(logiques.some((l) => l.startsWith("PRODID:")), "PRODID présent");
  const evenements = [];
  let courant = null;
  for (const l of logiques) {
    if (l === "BEGIN:VEVENT") { ok(!courant, "VEVENT non imbriqués"); courant = {}; continue; }
    if (l === "END:VEVENT") { evenements.push(courant); courant = null; continue; }
    if (!courant) continue;
    const i = l.indexOf(":");
    courant[l.slice(0, i)] = l.slice(i + 1);
  }
  ok(!courant, "chaque BEGIN:VEVENT a son END:VEVENT");
  return evenements;
}

// 1. Le vrai calendrier
for (const lang of ["fr", "en"]) {
  const ics = genererIcs(mouvements, { maj, lang, traductions: lang === "en" ? MOUVEMENTS : {} });
  ok(ics === genererIcs(mouvements, { maj, lang, traductions: lang === "en" ? MOUVEMENTS : {} }), "sortie déterministe");
  const evts = analyser(ics);
  ok(evts.length === mouvements.length, `${evts.length} VEVENT pour ${mouvements.length} mouvements`);
  ok(new Set(evts.map((e) => e.UID)).size === evts.length, "UID uniques");
  for (const m of mouvements) {
    const e = evts.find((x) => x["DTSTART;VALUE=DATE"] === m.debut.replaceAll("-", "") && desechapper(x.DESCRIPTION).includes(m.source));
    ok(e, `événement du ${m.debut} trouvé`);
    ok(/^\d{8}T\d{6}Z$/.test(e.DTSTAMP), "DTSTAMP en UTC");
    ok(e["DTEND;VALUE=DATE"] === lendemain(m.fin || m.debut), `DTEND exclusif = fin + 1 jour (${m.debut})`);
    ok(/^[^@]+@syndicaliste\.pages\.dev$/.test(e.UID), "UID au format id@domaine");
    const titre = lang === "en" ? (MOUVEMENTS[m.intitule]?.intitule ?? m.intitule) : m.intitule;
    ok(desechapper(e.SUMMARY).endsWith(titre), `SUMMARY = intitulé (${lang})`);
    ok(e.URL === m.source, "URL = source");
    for (const champ of ["SUMMARY", "DESCRIPTION"]) {
      ok(!/(?<!\\)[,;]/.test(e[champ].replace(/\\\\/g, "")), `${champ} : virgules et points-virgules échappés`);
    }
  }
}

// 2. UID stables : ajouter un mouvement ne change pas ceux des autres
const avant = analyser(genererIcs(mouvements, { maj })).map((e) => e.UID);
const apres = analyser(genererIcs([...mouvements, { ...mouvements[0], debut: "2027-01-15", fin: "2027-01-15", intitule: "Autre" }], { maj })).map((e) => e.UID);
ok(avant.every((u) => apres.includes(u)), "UID stables");

// 3. Échappement et pliage sur un cas piège
ok(echapper("a,b;c\\d\ne") === "a\\,b\\;c\\\\d\\ne", "échappement , ; \\ et retour");
const piege = { debut: "2026-12-31", fin: "2027-01-02", intitule: "Grève, « reconductible » ; vraiment\\ ?", interpro: false, secteurs: ["energie"], appelants: ["cgt", "cfe-cgc"],
  motif: `Ligne 1, avec virgule ; point-virgule\nLigne 2 ${"éèàçœ€🪧".repeat(12)}`, source: "https://exemple.fr/a?b=1,2" };
const [e] = analyser(genererIcs([piege], { maj }));
ok(e["DTEND;VALUE=DATE"] === "20270103", "DTEND sur plusieurs jours, passage d'année");
ok(desechapper(e.SUMMARY) === `Grève · ${piege.intitule}`, "SUMMARY retrouvé après déséchappement");
ok(desechapper(e.DESCRIPTION).startsWith(piege.motif), "DESCRIPTION multiligne et multioctet retrouvée");
const long = `DESCRIPTION:${"🪧é".repeat(60)}`;
const plie = plier(long);
ok(plie.split("\r\n").every((l) => octets(l) <= 75), "pliage à 75 octets");
ok(plie.replace(/\r\n /g, "") === long, "le dépliage restitue la ligne");
ok(!plie.includes("�") && plie.split("\r\n").every((l) => Buffer.from(l, "utf8").toString("utf8") === l), "aucun caractère UTF-8 coupé");

// 4. La Function, avec un ASSETS factice
const env = { ASSETS: { fetch: async () => new Response(brut, { headers: { "content-type": "application/json" } }) } };
const reponse = await onRequestGet({ request: new Request("https://syndicaliste.pages.dev/api/greves.ics?lang=en"), env });
ok(reponse.status === 200, "Function : 200");
ok(reponse.headers.get("content-type") === "text/calendar; charset=utf-8", "Function : Content-Type text/calendar");
const corps = await reponse.text();
ok(analyser(corps).length === mouvements.length, "Function : flux valide");
ok(corps.includes("Strike in France"), "Function : version anglaise");

console.log(`ICS : ${verifs} vérifications, 0 échec`);
