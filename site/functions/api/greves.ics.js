// GET /api/greves.ics[?lang=en] : le calendrier des luttes en iCalendar, depuis public/data/greves.json (copié par sync.sh).
import { genererIcs } from "../../lib/ics.js";
import { MOUVEMENTS } from "../../public/js/textes-en.js";

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const lang = url.searchParams.get("lang") === "en" ? "en" : "fr";
  const fichier = await env.ASSETS.fetch(new URL("/data/greves.json", request.url));
  if (!fichier.ok) return new Response("calendrier introuvable, lancer site/sync.sh\n", { status: 500 });
  const { maj, mouvements } = await fichier.json();
  const corps = genererIcs(mouvements, { maj, lang, traductions: lang === "en" ? MOUVEMENTS : {}, site: url.origin });
  return new Response(corps, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="greves.ics"',
      "Cache-Control": "public, max-age=1800",
    },
  });
}

export const onRequestHead = onRequestGet;
