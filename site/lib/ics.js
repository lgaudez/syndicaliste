// Calendrier des luttes au format iCalendar (RFC 5545), depuis les mouvements de greves.json.
// Partagé par functions/api/greves.ics.js et tests/ics.mjs.
import { sigle } from "../public/js/pointeuse.js";

const CRLF = "\r\n";
const encodeur = new TextEncoder();
const octets = (t) => encodeur.encode(t).length;

// TEXT (RFC 5545 §3.3.11) : antislash, point-virgule, virgule et retours à la ligne échappés.
export const echapper = (t) => String(t)
  .replace(/\\/g, "\\\\")
  .replace(/;/g, "\\;")
  .replace(/,/g, "\\,")
  .replace(/\r\n|\r|\n/g, "\\n");

// Lignes pliées à 75 octets (§3.1), sans couper un caractère UTF-8 : la suite commence par une espace.
export function plier(ligne) {
  if (octets(ligne) <= 75) return ligne;
  const morceaux = [];
  let courant = "";
  let taille = 0;
  let limite = 75;
  for (const c of ligne) {
    const n = octets(c);
    if (taille + n > limite) {
      morceaux.push(courant);
      courant = "";
      taille = 0;
      limite = 74;
    }
    courant += c;
    taille += n;
  }
  morceaux.push(courant);
  return morceaux.join(`${CRLF} `);
}

const dateIcs = (iso) => iso.replaceAll("-", "");
function lendemain(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + 1)).toISOString().slice(0, 10);
}

// Empreinte FNV-1a de l'intitulé : l'UID ne change pas d'une requête à l'autre, ni quand on ajoute d'autres mouvements.
function empreinte(texte) {
  let h = 0x811c9dc5;
  for (const o of encodeur.encode(texte)) {
    h ^= o;
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

export const uid = (m) => `${m.debut}-${empreinte(m.intitule)}@syndicaliste.pages.dev`;

const TEXTES = {
  fr: {
    nom: "Calendrier des luttes · Syndicaliste",
    description: (site) => `Grèves et mobilisations nationales en France, sourcées. ${site}/greves/`,
    resume: (t) => `Grève · ${t}`,
    appel: "Appel : ",
    source: "Source : ",
    page: "Calendrier : ",
    chemin: "/greves/",
  },
  en: {
    nom: "French strike calendar · Syndicaliste",
    description: (site) => `National strikes and mobilizations in France, with sources. ${site}/en/strikes/`,
    resume: (t) => `Strike in France · ${t}`,
    appel: "Called by: ",
    source: "Source: ",
    page: "Calendar: ",
    chemin: "/en/strikes/",
  },
};

// traductions : { intitulé français → { intitule, motif } } (table MOUVEMENTS de textes-en.js).
export function genererIcs(mouvements, { maj, lang = "fr", traductions = {}, site = "https://syndicaliste.gaudeztechlab.com" } = {}) {
  const L = TEXTES[lang] ?? TEXTES.fr;
  const dtstamp = `${dateIcs(maj)}T000000Z`;
  const lignes = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//Syndicaliste//Calendrier des luttes//${lang.toUpperCase()}`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${echapper(L.nom)}`,
    `X-WR-CALDESC:${echapper(L.description(site))}`,
    "X-WR-TIMEZONE:Europe/Paris",
    "REFRESH-INTERVAL;VALUE=DURATION:PT6H",
    "X-PUBLISHED-TTL:PT6H",
  ];
  const tries = [...mouvements].sort((a, b) => a.debut.localeCompare(b.debut) || a.intitule.localeCompare(b.intitule));
  for (const brut of tries) {
    const m = { ...brut, ...traductions[brut.intitule] };
    const description = [
      m.motif,
      "",
      `${L.appel}${brut.appelants.map(sigle).join(", ")}`,
      `${L.source}${brut.source}`,
      `${L.page}${site}${L.chemin}`,
    ].join("\n");
    const categories = [brut.greve === false ? (lang === "en" ? "MOBILIZATION" : "MOBILISATION") : lang === "en" ? "STRIKE" : "GREVE", ...(brut.interpro ? ["INTERPRO"] : []), ...brut.secteurs.map((s) => s.toUpperCase())];
    lignes.push(
      "BEGIN:VEVENT",
      `UID:${uid(brut)}`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART;VALUE=DATE:${dateIcs(brut.debut)}`,
      `DTEND;VALUE=DATE:${dateIcs(lendemain(brut.fin || brut.debut))}`,
      `SUMMARY:${echapper(L.resume(m.intitule))}`,
      `DESCRIPTION:${echapper(description)}`,
      `URL:${brut.source}`,
      `CATEGORIES:${categories.map(echapper).join(",")}`,
      "TRANSP:TRANSPARENT",
      "STATUS:CONFIRMED",
      "END:VEVENT",
    );
  }
  lignes.push("END:VCALENDAR");
  return lignes.map(plier).join(CRLF) + CRLF;
}
