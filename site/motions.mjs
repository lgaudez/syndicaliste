// Récupère les dernières motions de l'AG (GitHub Discussions de lgaudez/syndicaliste) au build, avec le gh local authentifié,
// et les écrit dans public/data/motions.json pour la page /ag/. Aucun jeton ne part dans le navigateur ni dans une Function.
// node site/motions.mjs   (lancé par sync.sh ; si gh échoue, la liste est vide et la page invite à déposer la première motion)
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export const DEPOT = { owner: "lgaudez", name: "syndicaliste" };

const REQUETE_CATEGORIES = "query($o:String!,$n:String!){repository(owner:$o,name:$n){discussionCategories(first:50){nodes{id name slug}}}}";
const REQUETE_MOTIONS = "query($o:String!,$n:String!,$c:ID!){repository(owner:$o,name:$n){discussions(first:30,categoryId:$c,orderBy:{field:CREATED_AT,direction:DESC})"
  + "{nodes{number title url createdAt closed body reactionGroups{content reactors{totalCount}}}}}}";

const sansAccents = (t) => t.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

// « Assemblée générale » si elle existe, sinon « General » : la même règle que skills/syndicaliste/scripts/ag.py.
export function choisirCategorie(categories) {
  return categories.find((c) => c.slug === "assemblee-generale" || sansAccents(c.name) === "assemblee generale")
    ?? categories.find((c) => c.slug === "general") ?? null;
}

const FR = new Set(["le", "la", "les", "des", "du", "une", "est", "et", "pour", "pas", "qui", "que", "avec", "dans", "sur", "nous", "aux", "sans"]);
const EN = new Set(["the", "and", "is", "to", "of", "for", "with", "that", "not", "we", "our", "are", "without", "on"]);
// Langue de la motion, si elle se voit : fr, en, ou null.
export function langue(texte) {
  const mots = texte.toLowerCase().match(/\p{L}+/gu) ?? [];
  const fr = mots.filter((m) => FR.has(m)).length;
  const en = mots.filter((m) => EN.has(m)).length;
  if (Math.max(fr, en) < 3 || fr === en) return null;
  return fr > en ? "fr" : "en";
}

export function motions(discussions) {
  return discussions.filter((d) => /^motion\b/i.test(d.title.trim())).map((d) => {
    const votes = Object.fromEntries((d.reactionGroups ?? []).map((g) => [g.content, g.reactors.totalCount]));
    return {
      numero: d.number,
      titre: d.title.trim(),
      url: d.url,
      date: d.createdAt.slice(0, 10),
      pour: votes.THUMBS_UP ?? 0,
      contre: votes.THUMBS_DOWN ?? 0,
      ouverte: !d.closed,
      langue: langue(`${d.title}\n${d.body ?? ""}`),
    };
  }).slice(0, 12);
}

function graphql(requete, variables) {
  const args = ["api", "graphql", "-f", `query=${requete}`, ...Object.entries(variables).flatMap(([k, v]) => ["-f", `${k}=${v}`])];
  const sortie = JSON.parse(execFileSync("gh", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], timeout: 20000 }));
  if (sortie.errors?.length) throw new Error(sortie.errors.map((e) => e.message).join("; "));
  return sortie.data;
}

export function recuperer() {
  const v = { o: DEPOT.owner, n: DEPOT.name };
  const categorie = choisirCategorie(graphql(REQUETE_CATEGORIES, v).repository.discussionCategories.nodes);
  if (!categorie) throw new Error("aucune catégorie « Assemblée générale » ni « General »");
  const discussions = graphql(REQUETE_MOTIONS, { ...v, c: categorie.id }).repository.discussions.nodes;
  return { categorie: categorie.name, motions: motions(discussions) };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const fichier = new URL("./public/data/motions.json", import.meta.url);
  let donnees;
  try {
    donnees = recuperer();
    console.log(`motions : ${donnees.motions.length} motion(s) dans « ${donnees.categorie} »`);
  } catch (e) {
    donnees = { categorie: null, motions: [] };
    console.warn(`motions : gh indisponible (${String(e.message).split("\n")[0]}), liste vide`);
  }
  writeFileSync(fichier, `${JSON.stringify(donnees, null, 2)}\n`);
}
