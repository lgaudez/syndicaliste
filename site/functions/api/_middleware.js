const HEADERS = {
  "Access-Control-Allow-Origin": "*", // API publique, sans cookies ni identifiants.
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
  "X-Content-Type-Options": "nosniff",
  "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
  "Referrer-Policy": "strict-origin-when-cross-origin",
};

export async function onRequest({ request, next }) {
  let brute;
  if (request.method === "OPTIONS") brute = new Response(null, { status: 204 });
  else if (!["GET", "HEAD"].includes(request.method)) {
    brute = Response.json({ erreur: "méthode non autorisée" }, { status: 405, headers: { Allow: "GET, HEAD, OPTIONS" } });
  } else {
    try {
      brute = await next();
    } catch {
      brute = Response.json({ erreur: "service indisponible" }, { status: 500, headers: { "Cache-Control": "no-store" } });
    }
  }
  const reponse = new Response(request.method === "HEAD" ? null : brute.body, brute);
  for (const [cle, valeur] of Object.entries(HEADERS)) reponse.headers.set(cle, valeur);
  return reponse;
}
