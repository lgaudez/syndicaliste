// POST /api/contact (JSON ou formulaire) : bulletin « Rester en contact », versé dans la base Notion « Contacts » de Gaudez Tech Lab.
// Env : NOTION_TOKEN (secret ; absent → 503 « guichet fermé »), CONTACT_KV (binding KV facultatif : 5 envois par IP et par minute).
// Même origine seulement : aucun en-tête CORS, et une requête venue d'une autre origine est refusée.

export const NOTION_URL = "https://api.notion.com/v1/pages";
export const NOTION_VERSION = "2025-09-03";
export const DATA_SOURCE_ID = "26934957-b9bf-80f5-9361-000b7116a2b7";
export const INTERETS = { gtl: "Gaudez Tech Lab", tailortune: "TailorTune", projets: "Prochains projets" };
export const LIMITES = { email: 254, prenom: 80, message: 1000, parMinute: 5 };

const EMAIL = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:".]{2,}$/;
const OUI = new Set(["oui", "on", "true", "1", "yes"]);
const propre = (v) => String(v ?? "").replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, "").trim();

// Texte des réponses sans JavaScript (formulaire envoyé par le navigateur) ; le script de la page a ses propres messages.
const MESSAGES = {
  fr: {
    ok: "Adhésion enregistrée. On te recontacte si ça vaut le coup, pas avant.",
    email: "Cette adresse e-mail ne passe pas le contrôle.",
    consentement: "Il manque ta signature : coche la case de consentement.",
    longueur: "Trop long pour le bulletin.",
    "guichet-ferme": "Le guichet est fermé, réessaie plus tard.",
    "trop-de-depots": "Trop de bulletins d'un coup. Pause d'une minute, puis réessaie.",
    origine: "Bulletin refusé : il ne vient pas de ce site.",
    format: "Bulletin illisible.",
    notion: "Le courrier s'est perdu en route. Réessaie dans un instant.",
    retour: "Retour au site",
  },
  en: {
    ok: "Membership recorded. We'll get back to you if it's worth it, not before.",
    email: "This email address doesn't pass inspection.",
    consentement: "Your signature is missing: tick the consent box.",
    longueur: "Too long for the form.",
    "guichet-ferme": "The office is closed, try again later.",
    "trop-de-depots": "Too many forms at once. Take a one-minute break, then try again.",
    origine: "Form refused: it doesn't come from this site.",
    format: "Unreadable form.",
    notion: "The mail got lost on the way. Try again in a moment.",
    retour: "Back to the site",
  },
};

// Valide et normalise un bulletin. Renvoie { contact } ou { erreur }.
export function lireBulletin(brut, { origine, referer } = {}) {
  const lang = brut.lang === "en" ? "en" : "fr";
  const email = propre(brut.email).toLowerCase();
  const prenom = propre(brut.prenom);
  const message = String(brut.message ?? "").replace(/\r\n?/g, "\n").replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, "").trim();
  if (email.length > LIMITES.email || prenom.length > LIMITES.prenom || message.length > LIMITES.message) return { erreur: "longueur", lang };
  if (!EMAIL.test(email)) return { erreur: "email", lang };
  if (!OUI.has(String(brut.consentement ?? "").toLowerCase())) return { erreur: "consentement", lang };
  const demandes = [brut.interets ?? []].flat().map(String);
  const interets = Object.keys(INTERETS).filter((k) => demandes.includes(k));
  // La page d'origine : celle annoncée par le formulaire si elle est sur ce site, sinon le Referer.
  const surCeSite = (u) => { try { return new URL(u).origin === origine ? new URL(u).href : ""; } catch { return ""; } };
  const page = surCeSite(brut.page) || surCeSite(referer) || "";
  return { contact: { email, prenom, message, interets, page, lang } };
}

export const aujourdhui = (date = new Date()) => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris" }).format(date);

// Corps exact envoyé à POST https://api.notion.com/v1/pages (Notion-Version 2025-09-03, parent data_source_id).
export function pageNotion({ email, prenom, message, interets, page, lang }, jour) {
  const trace = `page: ${page || "inconnue"}, langue: ${lang}`;
  return {
    parent: { type: "data_source_id", data_source_id: DATA_SOURCE_ID },
    properties: {
      Name: { title: [{ text: { content: prenom ? `${prenom} (${email})` : email } }] },
      Email: { email },
      Source: { select: { name: "Site Syndicaliste" } },
      "Intérêts": { multi_select: interets.map((k) => ({ name: INTERETS[k] })) },
      Message: { rich_text: [{ text: { content: message ? `${message}\n\n${trace}` : trace } }] },
      Type: { select: { name: "Email" } },
      Date: { date: { start: jour } },
    },
  };
}

async function lireCorps(request) {
  const type = request.headers.get("content-type") || "";
  if (type.includes("application/json")) return await request.json();
  if (type.includes("application/x-www-form-urlencoded") || type.includes("multipart/form-data")) {
    const f = await request.formData();
    const o = {};
    for (const [k, v] of f) o[k] = k === "interets" ? [...(o[k] ?? []), v] : v;
    return o;
  }
  throw new Error("format");
}

function repondre(request, status, corps) {
  const veutJson = (request.headers.get("accept") || "").includes("application/json") || (request.headers.get("content-type") || "").includes("application/json");
  const entetes = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };
  if (veutJson) return Response.json(corps, { status, headers: entetes });
  const M = MESSAGES[corps.lang === "en" ? "en" : "fr"];
  const texte = M[corps.ok ? "ok" : corps.erreur] ?? M.format;
  const retour = corps.lang === "en" ? "/en/" : "/";
  const html = `<!doctype html><html lang="${corps.lang === "en" ? "en" : "fr"}"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>Syndicaliste</title><link rel="stylesheet" href="/css/site.css"><main class="tract"><div class="cadre"><p class="contact__statut">${texte}</p><p><a class="bouton bouton--encre" href="${retour}">${M.retour}</a></p></div></main></html>`;
  return new Response(html, { status, headers: { ...entetes, "Content-Type": "text/html; charset=utf-8" } });
}

// Limite simple et approximative (KV est à cohérence éventuelle) : un compteur par IP et par minute.
async function tropDeDepots(env, request) {
  if (!env.CONTACT_KV) return false;
  const ip = request.headers.get("cf-connecting-ip") || "inconnue";
  const cle = `contact:${ip}:${Math.floor(Date.now() / 60000)}`;
  const n = Number(await env.CONTACT_KV.get(cle)) || 0;
  if (n >= LIMITES.parMinute) return true;
  await env.CONTACT_KV.put(cle, String(n + 1), { expirationTtl: 120 });
  return false;
}

export async function onRequestPost({ request, env }) {
  const origine = new URL(request.url).origin;
  const annoncee = request.headers.get("origin");
  if (annoncee && annoncee !== origine) return repondre(request, 403, { ok: false, erreur: "origine" });
  let brut = null;
  try { brut = await lireCorps(request); } catch { /* corps illisible */ }
  const lang = brut?.lang === "en" ? "en" : "fr";
  // Guichet fermé tant que le jeton n'est pas posé, quel que soit le bulletin.
  if (!env.NOTION_TOKEN) return repondre(request, 503, { ok: false, erreur: "guichet-ferme", lang, message: MESSAGES[lang]["guichet-ferme"] });
  if (!brut || typeof brut !== "object" || Array.isArray(brut)) return repondre(request, 400, { ok: false, erreur: "format", lang });
  if (await tropDeDepots(env, request)) return repondre(request, 429, { ok: false, erreur: "trop-de-depots", lang });
  // Pot de miel : un robot remplit tout. On lui dit merci, on n'écrit rien.
  if (propre(brut.site_web)) return repondre(request, 200, { ok: true, lang });
  const { contact, erreur } = lireBulletin(brut, { origine, referer: request.headers.get("referer") });
  if (erreur) return repondre(request, 400, { ok: false, erreur, lang });
  let r;
  try {
    r = await fetch(NOTION_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${env.NOTION_TOKEN}`, "Notion-Version": NOTION_VERSION, "Content-Type": "application/json" },
      body: JSON.stringify(pageNotion(contact, aujourdhui())),
      signal: AbortSignal.timeout(8000),
    });
  } catch (e) {
    console.error("contact : Notion injoignable", e?.name);
    return repondre(request, 502, { ok: false, erreur: "notion", lang });
  }
  if (!r.ok) {
    console.error("contact : Notion a refusé", r.status, (await r.text()).slice(0, 300));
    return repondre(request, 502, { ok: false, erreur: "notion", lang });
  }
  return repondre(request, 200, { ok: true, lang });
}
