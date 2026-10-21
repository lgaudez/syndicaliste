// La Function /api/contact, avec un fetch simulé : aucun appel réel à Notion.
// node site/tests/contact.mjs
import assert from "node:assert/strict";
import { onRequestPost, aujourdhui, DATA_SOURCE_ID, NOTION_URL } from "../functions/api/contact.js";
import { onRequest as middleware } from "../functions/api/_middleware.js";

let n = 0;
const ok = (c, m) => { assert.ok(c, m); n++; };
const egal = (a, b, m) => { assert.deepEqual(a, b, m); n++; };

const SITE = "https://syndicaliste.pages.dev";
const appels = [];
globalThis.fetch = async (url, init) => {
  appels.push({ url: String(url), init });
  return new Response(JSON.stringify({ object: "page", id: "x" }), { status: 200, headers: { "content-type": "application/json" } });
};

function requete(corps, { type = "json", origine = SITE, ip = "203.0.113.7", accept = "application/json" } = {}) {
  const headers = { "cf-connecting-ip": ip };
  if (origine) headers.origin = origine;
  if (accept) headers.accept = accept;
  let body;
  if (type === "json") { headers["content-type"] = "application/json"; body = JSON.stringify(corps); }
  else {
    headers["content-type"] = "application/x-www-form-urlencoded";
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(corps)) for (const x of [v].flat()) p.append(k, x);
    body = p.toString();
  }
  return new Request(`${SITE}/api/contact`, { method: "POST", headers, body });
}
const ENV = { NOTION_TOKEN: "secret_test" };
async function poster(corps, options, env = ENV) {
  appels.length = 0;
  const r = await onRequestPost({ request: requete(corps, options), env });
  const texte = await r.text();
  let json = null;
  try { json = JSON.parse(texte); } catch { /* HTML */ }
  return { status: r.status, json, texte, headers: r.headers };
}

const VALIDE = {
  email: "Camarade@Exemple.fr", prenom: "Rosa", interets: ["gtl", "projets", "inconnu"],
  message: "Mes agents font n'importe quoi.", consentement: "oui", site_web: "",
  page: `${SITE}/quiz/?c=cgt`, lang: "fr",
};

// 1. Bulletin valide : la page Notion exacte.
{
  const r = await poster(VALIDE);
  egal([r.status, r.json], [200, { ok: true, lang: "fr" }], "valide : 200 ok");
  ok(appels.length === 1 && appels[0].url === NOTION_URL && appels[0].init.method === "POST", "valide : un seul POST vers Notion");
  egal(appels[0].init.headers, { Authorization: "Bearer secret_test", "Notion-Version": "2025-09-03", "Content-Type": "application/json" }, "valide : en-têtes Notion");
  egal(JSON.parse(appels[0].init.body), {
    parent: { type: "data_source_id", data_source_id: DATA_SOURCE_ID },
    properties: {
      Name: { title: [{ text: { content: "Rosa (camarade@exemple.fr)" } }] },
      Email: { email: "camarade@exemple.fr" },
      Source: { select: { name: "Site Syndicaliste" } },
      "Intérêts": { multi_select: [{ name: "Gaudez Tech Lab" }, { name: "Prochains projets" }] },
      Message: { rich_text: [{ text: { content: `Mes agents font n'importe quoi.\n\npage: ${SITE}/quiz/?c=cgt, langue: fr` } }] },
      Type: { select: { name: "Email" } },
      Date: { date: { start: aujourdhui() } },
    },
  }, "valide : corps exact envoyé à Notion");
  ok(/^\d{4}-\d{2}-\d{2}$/.test(aujourdhui()), "date au format AAAA-MM-JJ");
  ok(r.headers.get("access-control-allow-origin") === null, "valide : aucun en-tête CORS");
}

// 2. Version compacte du pied, en anglais, envoyée sans JavaScript (formulaire) : e-mail seul, réponse HTML.
{
  const r = await poster({ email: "a@b.io", consentement: "on", interets: "projets", lang: "en", site_web: "" },
    { type: "form", accept: "text/html", origine: SITE });
  ok(r.status === 200 && r.headers.get("content-type").startsWith("text/html") && r.texte.includes("Membership recorded"), "formulaire : 200 HTML en anglais");
  const corps = JSON.parse(appels[0].init.body);
  egal(corps.properties.Name, { title: [{ text: { content: "a@b.io" } }] }, "e-mail seul dans Name");
  egal(corps.properties["Intérêts"], { multi_select: [{ name: "Prochains projets" }] }, "intérêt par défaut du pied");
  ok(corps.properties.Message.rich_text[0].text.content === "page: inconnue, langue: en", "message vide : la ligne de trace seule");
}

// 3. Pot de miel rempli : 200, rien d'écrit.
{
  const r = await poster({ ...VALIDE, site_web: "https://spam.example" });
  egal([r.status, r.json?.ok, appels.length], [200, true, 0], "pot de miel : 200 et aucun appel");
}

// 4. Consentement absent ou faux : 400, rien d'écrit.
for (const consentement of [undefined, "", "non"]) {
  const r = await poster({ ...VALIDE, consentement });
  egal([r.status, r.json?.erreur, appels.length], [400, "consentement", 0], `consentement ${consentement} : 400`);
}

// 5. E-mail invalide : 400, rien d'écrit.
for (const email of ["", "camarade", "a@b", "a b@c.fr", "<a@b.fr>", "a@b.c"]) {
  const r = await poster({ ...VALIDE, email });
  egal([r.status, r.json?.erreur, appels.length], [400, "email", 0], `e-mail « ${email} » : 400`);
}

// 6. Longueurs.
{
  const r = await poster({ ...VALIDE, message: "x".repeat(1001) });
  egal([r.status, r.json?.erreur, appels.length], [400, "longueur", 0], "message de 1001 caractères : 400");
  const r2 = await poster({ ...VALIDE, message: "x".repeat(1000) });
  ok(r2.status === 200, "message de 1000 caractères accepté");
}

// 7. Jeton absent : 503 « guichet fermé », rien d'écrit.
{
  const r = await poster(VALIDE, {}, {});
  egal([r.status, r.json?.erreur, appels.length], [503, "guichet-ferme", 0], "sans jeton : 503");
  ok(r.json.message === "Le guichet est fermé, réessaie plus tard.", "sans jeton : message propre");
  const sansCorps = await onRequestPost({ request: new Request(`${SITE}/api/contact`, { method: "POST", headers: { "content-type": "application/json" }, body: "{}" }), env: {} });
  ok(sansCorps.status === 503, "sans jeton, même un corps vide : 503");
  const illisible = await onRequestPost({ request: new Request(`${SITE}/api/contact`, { method: "POST", body: "n'importe quoi" }), env: {} });
  ok(illisible.status === 503, "sans jeton, même un corps illisible : 503");
  const illisibleOuvert = await onRequestPost({ request: new Request(`${SITE}/api/contact`, { method: "POST", headers: { "content-type": "application/json" }, body: "{oups" }), env: ENV });
  ok(illisibleOuvert.status === 400, "avec jeton, corps illisible : 400");
}

// 8. Autre origine : 403, rien d'écrit.
{
  const r = await poster(VALIDE, { origine: "https://ailleurs.example" });
  egal([r.status, r.json?.erreur, appels.length], [403, "origine", 0], "autre origine : 403");
}

// 9. Limite par IP avec un KV factice : 5 envois par minute, le 6e est refusé.
{
  const stock = new Map();
  const env = { ...ENV, CONTACT_KV: { get: async (k) => stock.get(k) ?? null, put: async (k, v) => void stock.set(k, v) } };
  const statuts = [];
  for (let i = 0; i < 6; i++) statuts.push((await poster(VALIDE, { ip: "198.51.100.1" }, env)).status);
  egal(statuts, [200, 200, 200, 200, 200, 429], "KV : 6e envoi refusé");
  ok((await poster(VALIDE, { ip: "198.51.100.2" }, env)).status === 200, "KV : une autre IP passe");
}

// 10. Notion refuse : 502, sans fuite du détail.
{
  const avant = globalThis.fetch;
  const erreur = console.error;
  console.error = () => {};
  globalThis.fetch = async () => new Response('{"message":"bad"}', { status: 400 });
  const r = await poster(VALIDE);
  globalThis.fetch = avant;
  console.error = erreur;
  egal([r.status, r.json], [502, { ok: false, erreur: "notion", lang: "fr" }], "Notion refuse : 502");
}

// 11. Middleware : pas de CORS sur /api/contact, POST seulement ; CORS ouvert ailleurs.
{
  const suivant = async () => new Response("ok");
  const options = await middleware({ request: new Request(`${SITE}/api/contact`, { method: "OPTIONS", headers: { origin: "https://ailleurs.example" } }), next: suivant });
  ok(options.status === 405 && !options.headers.get("access-control-allow-origin"), "OPTIONS /api/contact : 405 sans CORS");
  const get = await middleware({ request: new Request(`${SITE}/api/contact`), next: suivant });
  ok(get.status === 405, "GET /api/contact : 405");
  const post = await middleware({ request: new Request(`${SITE}/api/contact`, { method: "POST" }), next: suivant });
  ok(post.status === 200 && !post.headers.get("access-control-allow-origin"), "POST /api/contact : sans CORS");
  const statut = await middleware({ request: new Request(`${SITE}/api/statut`), next: suivant });
  ok(statut.headers.get("access-control-allow-origin") === "*", "/api/statut garde son CORS ouvert");
}

console.log(`Contact : ${n} vérifications, 0 échec, aucun appel réel à Notion`);
