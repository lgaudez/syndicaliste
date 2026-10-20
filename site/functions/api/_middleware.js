const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

export async function onRequest({ request, next }) {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  const brute = await next();
  const reponse = new Response(brute.body, brute);
  for (const [cle, valeur] of Object.entries(CORS)) reponse.headers.set(cle, valeur);
  return reponse;
}
