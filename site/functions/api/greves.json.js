// Sert public/data/greves.json, copié depuis le skill par sync.sh.
export async function onRequestGet({ request, env }) {
  const fichier = await env.ASSETS.fetch(new URL("/data/greves.json", request.url));
  if (!fichier.ok) return Response.json({ erreur: "calendrier introuvable, lancer site/sync.sh" }, { status: 500 });
  return new Response(fichier.body, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
