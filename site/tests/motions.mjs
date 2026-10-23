// Les motions de l'AG relevées au build (motions.mjs) : catégorie, filtre, votes, langue. Sans réseau.
// node site/tests/motions.mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { choisirCategorie, langue, motions } from "../motions.mjs";

let n = 0;
const egal = (a, b, m) => { assert.deepEqual(a, b, m); n++; };

const general = { id: "G", name: "General", slug: "general" };
const ag = { id: "A", name: "Assemblée générale", slug: "assemblee-generale" };
egal(choisirCategorie([general, ag]), ag, "l'AG d'abord");
egal(choisirCategorie([general, { ...ag, slug: "ag" }]).id, "A", "l'AG reconnue à son nom");
egal(choisirCategorie([general]), general, "repli sur General");
egal(choisirCategorie([{ id: "I", name: "Ideas", slug: "ideas" }]), null, "ni l'une ni l'autre");

egal(langue("Motion : la pause déjeuner est sacrée pour les agents, et nous ne travaillerons pas dans ces conditions"), "fr", "français");
egal(langue("Motion: the lunch break is sacred and we will not work without a break for the agents"), "en", "anglais");
egal(langue("Motion : 35 h"), null, "trop court pour trancher");

const reactions = [{ content: "THUMBS_UP", reactors: { totalCount: 5 } }, { content: "THUMBS_DOWN", reactors: { totalCount: 1 } }, { content: "EYES", reactors: { totalCount: 2 } }];
egal(motions([
  { number: 3, title: "Motion : la fin du « refais »", url: "u3", createdAt: "2026-10-21T09:00:00Z", closed: false, body: "Nous revendiquons que le travail ne soit pas refait sans consigne, et que les agents soient respectés.", reactionGroups: reactions },
  { number: 2, title: "Bienvenue à l'AG", url: "u2", createdAt: "2026-10-20T09:00:00Z", closed: false, body: "", reactionGroups: [] },
  { number: 1, title: "motion: overtime", url: "u1", createdAt: "2026-10-19T09:00:00Z", closed: true, body: "", reactionGroups: [] },
]), [
  { numero: 3, titre: "Motion : la fin du « refais »", url: "u3", date: "2026-10-21", pour: 5, contre: 1, ouverte: true, langue: "fr" },
  { numero: 1, titre: "motion: overtime", url: "u1", date: "2026-10-19", pour: 0, contre: 0, ouverte: false, langue: null },
], "seules les motions, avec leurs votes");

// Le fichier publié a toujours la forme attendue par la page, même vide.
const publie = JSON.parse(readFileSync(new URL("../public/data/motions.json", import.meta.url), "utf8"));
egal(Array.isArray(publie.motions), true, "public/data/motions.json : une liste de motions");
console.log(`Motions : ${n} vérifications, 0 échec`);
