// Quiz « Quelle centrale es-tu ? » : chaque centrale est atteignable, le barème est équilibré, aucun parti n'est cité.
// node site/tests/quiz.mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { CENTRALES_QUIZ, PORTRAITS, QUESTIONS, gagnant, scorer } from "../public/js/quiz-donnees.js";

const centrales = JSON.parse(readFileSync(new URL("../../skills/syndicaliste/data/centrales.json", import.meta.url), "utf8")).centrales;
let n = 0;
const ok = (c, m) => { assert.ok(c, m); n++; };

ok(QUESTIONS.length >= 8 && QUESTIONS.length <= 10, `${QUESTIONS.length} questions`);
ok(CENTRALES_QUIZ.every((c) => c in centrales), "les centrales du quiz existent dans centrales.json");
ok(Object.keys(centrales).filter((c) => c !== "intersyndicale").every((c) => CENTRALES_QUIZ.includes(c)), "les huit centrales sont dans le quiz");
for (const q of QUESTIONS) {
  ok(q.fr && q.en && q.reponses.length >= 3, `question ${q.id} complète`);
  for (const r of q.reponses) {
    ok(r.fr && r.en, `réponse traduite (${q.id})`);
    ok(Object.keys(r.poids).every((c) => CENTRALES_QUIZ.includes(c)) && Object.values(r.poids).every((p) => Number.isInteger(p) && p > 0), `poids valides (${q.id})`);
  }
}
for (const c of CENTRALES_QUIZ) ok(PORTRAITS[c]?.fr && PORTRAITS[c]?.en && PORTRAITS[c]?.bord?.fr && PORTRAITS[c]?.bord?.en, `portrait de ${c}`);

// Chaque centrale gagne seule avec un jeu de réponses : on prend à chaque question la réponse la plus favorable.
const chemins = {};
for (const cible of CENTRALES_QUIZ) {
  const choix = QUESTIONS.map((q) => {
    const marge = (r) => (r.poids[cible] ?? 0) * 10 - Math.max(0, ...Object.entries(r.poids).filter(([c]) => c !== cible).map(([, p]) => p));
    return q.reponses.reduce((meilleur, r, i) => (marge(r) > marge(q.reponses[meilleur]) ? i : meilleur), 0);
  });
  const scores = scorer(choix);
  const autres = Math.max(...CENTRALES_QUIZ.filter((c) => c !== cible).map((c) => scores[c]));
  ok(gagnant(scores, choix) === cible && scores[cible] > autres, `${cible} atteignable seule (${scores[cible]} contre ${autres})`);
  chemins[cible] = scores[cible];
}

// Équilibre : le score maximal possible ne varie pas de plus de 2 points d'une centrale à l'autre.
const maxima = Object.fromEntries(CENTRALES_QUIZ.map((c) => [c, QUESTIONS.reduce((s, q) => s + Math.max(0, ...q.reponses.map((r) => r.poids[c] ?? 0)), 0)]));
const ecart = Math.max(...Object.values(maxima)) - Math.min(...Object.values(maxima));
ok(ecart <= 2, `barème équilibré : maxima ${JSON.stringify(maxima)}`);
// Chaque centrale est la réponse « pleine » (3 points) d'au moins cinq questions.
for (const c of CENTRALES_QUIZ) {
  const pleines = QUESTIONS.filter((q) => q.reponses.some((r) => r.poids[c] === 3)).length;
  ok(pleines >= 5, `${c} : ${pleines} questions à 3 points`);
}

// Égalité : la pancarte tranche, toujours de façon déterministe.
const iPancarte = QUESTIONS.findIndex((q) => q.id === "pancarte");
const egalite = Object.fromEntries(CENTRALES_QUIZ.map((c) => [c, 5]));
const choixPancarte = QUESTIONS.map((_, i) => (i === iPancarte ? QUESTIONS[i].reponses.findIndex((r) => r.poids.fo) : null));
ok(gagnant(egalite, choixPancarte) === "fo", "égalité tranchée par la pancarte");
ok(gagnant(egalite, []) === CENTRALES_QUIZ[0], "égalité sans pancarte : ordre de la liste");

// Neutralité : aucun parti ni responsable politique cité dans le quiz.
const texte = JSON.stringify({ QUESTIONS, PORTRAITS });
const partis = /\b(PCF|PS|LFI|RN|LR|EELV|Renaissance|Modem|communiste|socialiste|insoumis|Rassemblement national|Républicains|écologistes|Front national|Communist Party|Socialist Party|parti)\b/i;
ok(!partis.test(texte), `aucun parti cité : ${texte.match(partis)?.[0]}`);

console.log(`Quiz : ${n} vérifications, 0 échec. Maxima : ${JSON.stringify(maxima)}`);
