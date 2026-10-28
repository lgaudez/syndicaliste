// GET /api/statut?centrale=fo&statut=prive[&horaires=09:00-12:30,13:30-17:00][&tz=Europe/Paris][&alsace_moselle=1][&maintenant=2026-11-05T10:00]
import { bandeau, convention, momentDepuisDate, momentDepuisIso, statut } from "../../public/js/pointeuse.js";
import { validerParametres } from "../../lib/parametres.js";

const json = (corps, status = 200) =>
  Response.json(corps, { status, headers: { "Cache-Control": "no-store" } });

async function donnees(env, request, chemin) {
  const r = await env.ASSETS.fetch(new URL(chemin, request.url));
  if (!r.ok) throw new Error(`${chemin} introuvable, lancer site/sync.sh`);
  return r.json();
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const params = Object.fromEntries(url.searchParams);
  try {
    if (url.search.length > 2048) throw new Error("requête trop longue");
    if ([...url.searchParams.keys()].some((cle) => url.searchParams.getAll(cle).length > 1)) throw new Error("paramètre répété");
    validerParametres(params);
  } catch (e) {
    return json({ erreur: e.message }, 400);
  }
  const [{ centrales }, { mouvements }] = await Promise.all([
    donnees(env, request, "/data/centrales.json"),
    donnees(env, request, "/data/greves.json"),
  ]);
  let conv, moment;
  try {
    conv = convention(params, centrales);
    moment = params.maintenant ? momentDepuisIso(params.maintenant, conv.tz) : momentDepuisDate(new Date(), conv.tz);
  } catch (e) {
    return json({ erreur: e.message }, 400);
  }
  const s = statut(moment, conv, centrales, mouvements);
  return json({ bandeau: bandeau(s), ...s });
}

export const onRequestHead = onRequestGet;
