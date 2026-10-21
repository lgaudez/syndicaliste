// CORS ouvert pour les API de lecture (pointeuse, calendrier). /api/contact reste en même origine : aucun en-tête CORS, POST seulement.
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

export async function onRequest({ request, next }) {
  if (new URL(request.url).pathname.replace(/\/$/, "") === "/api/contact") {
    if (request.method !== "POST") return new Response(null, { status: 405, headers: { Allow: "POST", "Cache-Control": "no-store" } });
    return next();
  }
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  const brute = await next();
  const reponse = new Response(brute.body, brute);
  for (const [cle, valeur] of Object.entries(CORS)) reponse.headers.set(cle, valeur);
  return reponse;
}
