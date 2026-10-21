// Page du quiz : une question à la fois, puis le résultat, partageable par /quiz/?c=<centrale>.
import { sigle } from "./pointeuse.js";
import { CENTRALES_QUIZ, PORTRAITS, QUESTIONS, gagnant, scorer } from "./quiz-donnees.js";
import { $, blocCopie, chargerJson, copier, doctrineEnClair, el, langue, notifier, textes } from "./outils.js";

const LANG = langue();
const T = await textes(LANG);

const Q = {
  fr: {
    progression: (i, n) => `Question ${i} sur ${n}`,
    retour: "← Question précédente",
    aide: "Touche la réponse qui te ressemble le plus.",
    suivante: "Question suivante →",
    tuEs: "Tu es",
    tampon: "Adhérent",
    bord: "Bord (perception courante)",
    doctrine: "Doctrine de grève",
    fondee: "Fondée en",
    configurer: "Configure ton agent",
    configurerTexte: "Dans ton projet, ou dans ton dossier personnel pour tous tes projets :",
    copierConfig: "Copier la commande",
    ouDis: (s) => `Ou dis-lui simplement : « passe à ${s} ».`,
    partager: "Partager mon résultat",
    lienCopie: "Lien copié, camarade",
    partageTexte: (s, d) => `Je suis ${s} : « ${d} » Et toi, quel syndicat es-tu ?`,
    refaire: "Refaire le quiz",
    faire: "Faire le quiz",
    toutes: "Voir les huit syndicats",
    scores: "Tes points",
    resultatDe: "Résultat partagé. Et toi ?",
    indispo: "Le quiz n'a pas pu charger les syndicats. Recharge la page.",
  },
  en: {
    progression: (i, n) => `Question ${i} of ${n}`,
    retour: "← Previous question",
    aide: "Tap the answer that sounds most like you.",
    suivante: "Next question →",
    tuEs: "You are",
    tampon: "Member",
    bord: "Leaning (common perception)",
    doctrine: "Strike doctrine",
    fondee: "Founded in",
    configurer: "Configure your agent",
    configurerTexte: "In your project, or in your home folder for all your projects:",
    copierConfig: "Copy the command",
    ouDis: (s) => `Or just tell it: “switch to ${s}.”`,
    partager: "Share my result",
    lienCopie: "Link copied, comrade",
    partageTexte: (s, d) => `I'm ${s}: “${d}” Which French union are you?`,
    refaire: "Take the quiz again",
    faire: "Take the quiz",
    toutes: "See all eight unions",
    scores: "Your points",
    resultatDe: "A shared result. What about you?",
    indispo: "The quiz couldn't load the unions. Reload the page.",
  },
}[LANG];

const racine = $("[data-quiz]");
const etat = { i: 0, choix: [], centrales: null, enQuestion: false, attente: null };
const LETTRES = "ABCDEFGHIJ";

function poserQuestion({ focus = true } = {}) {
  clearTimeout(etat.attente);
  etat.enQuestion = true;
  bulletin(false);
  const q = QUESTIONS[etat.i];
  const dejaRepondue = etat.choix[etat.i] != null;
  const n = QUESTIONS.length;
  const titre = el("h2", { class: "quiz__question", id: "quiz-question", tabindex: "-1" }, q[LANG]);
  racine.replaceChildren(el("div", { class: "quiz__carte" },
    el("p", { class: "quiz__progression" }, Q.progression(etat.i + 1, n)),
    el("div", { class: "quiz__barre", role: "progressbar", "aria-valuemin": "0", "aria-valuemax": String(n), "aria-valuenow": String(etat.i), "aria-label": Q.progression(etat.i + 1, n) },
      el("span", { style: `width:${(etat.i / n) * 100}%` })),
    titre,
    el("p", { class: "quiz__aide", id: "quiz-aide" }, Q.aide),
    el("ul", { class: "quiz__reponses", "aria-labelledby": "quiz-question", "aria-describedby": "quiz-aide" },
      q.reponses.map((r, k) => el("li", {},
        el("button", { type: "button", class: "quiz__reponse", "aria-pressed": String(etat.choix[etat.i] === k), onclick: (e) => repondre(k, e.currentTarget) },
          el("span", { class: "quiz__lettre", "aria-hidden": "true" }, LETTRES[k]), el("span", {}, r[LANG]))))),
    el("div", { class: "quiz__navigation" },
      etat.i > 0 && el("button", { type: "button", class: "quiz__retour", onclick: () => { etat.i -= 1; poserQuestion(); } }, Q.retour),
      dejaRepondue && el("button", { type: "button", class: "bouton bouton--encre quiz__suivante", onclick: avancer }, Q.suivante))));
  if (focus) titre.focus({ preventScroll: false });
}

// La réponse choisie s'allume un instant, puis la question suivante arrive d'elle-même.
function repondre(k, bouton) {
  if (etat.attente) return;
  etat.choix[etat.i] = k;
  for (const b of racine.querySelectorAll(".quiz__reponse")) b.setAttribute("aria-pressed", String(b === bouton));
  etat.attente = setTimeout(avancer, 250);
}

function avancer() {
  clearTimeout(etat.attente);
  etat.attente = null;
  etat.i += 1;
  if (etat.i < QUESTIONS.length) return poserQuestion();
  const scores = scorer(etat.choix);
  afficherResultat(gagnant(scores, etat.choix), scores);
}

// Bouton « Commencer le quiz » de l'en-tête : amène la première question (ou relance après un résultat).
function commencer(e) {
  e.preventDefault();
  if (!etat.centrales) return;
  if (!etat.enQuestion) recommencer({ focus: false });
  racine.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  $("#quiz-question")?.focus({ preventScroll: true });
}

const urlResultat = (cle) => `${location.origin}${location.pathname}?c=${cle}`;

async function partager(cle, c, bouton) {
  const url = urlResultat(cle);
  const donnees = { title: `${Q.tuEs} ${sigle(cle)}`, text: Q.partageTexte(sigle(cle), c.devise), url };
  if (navigator.share) {
    try { await navigator.share(donnees); return; } catch (e) { if (e.name === "AbortError") return; }
  }
  await copier(url, bouton);
  notifier(Q.lienCopie);
}

// Le bulletin de contact de la page n'apparaît qu'avec un résultat.
const bulletin = (visible) => $("[data-contact-attente]")?.classList.toggle("contact--visible", visible);

function afficherResultat(cle, scores = null, { focus = true } = {}) {
  etat.enQuestion = false;
  bulletin(true);
  const c = T.centrale(cle, etat.centrales[cle]);
  const commande = `mkdir -p .syndicat && echo '{"centrale": "${cle}"}' > .syndicat/convention.json`;
  try { localStorage.setItem("syndicaliste.centrale", cle); } catch { /* navigation privée */ }
  history.replaceState(null, "", `?c=${cle}`);
  const max = scores ? Math.max(...Object.values(scores)) || 1 : 1;
  const titre = el("h2", { class: "quiz__sigle", tabindex: "-1", "data-resultat": cle }, sigle(cle));
  racine.replaceChildren(el("article", { class: "quiz__resultat", "aria-labelledby": "quiz-resultat-titre" },
    !scores && el("p", { class: "quiz__partage" }, Q.resultatDe),
    el("div", { class: "quiz__tete" },
      el("div", {},
        el("p", { class: "quiz__surtitre", id: "quiz-resultat-titre" }, Q.tuEs),
        titre,
        el("p", { class: "quiz__nom" }, c.nom)),
      el("span", { class: "tampon tampon--rouge", "aria-hidden": "true" }, Q.tampon)),
    el("p", { class: "quiz__devise" }, T.ui.cite(c.devise)),
    el("p", { class: "quiz__portrait" }, PORTRAITS[cle][LANG]),
    el("dl", { class: "quiz__fiche" },
      el("dt", {}, Q.bord), el("dd", {}, PORTRAITS[cle].bord[LANG]),
      el("dt", {}, Q.doctrine), el("dd", {}, doctrineEnClair(T, c.doctrine_greve)),
      c.fondee && [el("dt", {}, Q.fondee), el("dd", {}, String(c.fondee))]),
    el("h3", { class: "quiz__sous-titre" }, Q.configurer),
    el("p", {}, Q.configurerTexte),
    blocCopie(commande, Q.copierConfig, "copie--texte"),
    el("p", { class: "quiz__dis" }, Q.ouDis(sigle(cle))),
    el("div", { class: "affiche__actions" },
      el("button", { type: "button", class: "bouton bouton--rouge", "data-partager": "", onclick: (e) => partager(cle, c, e.currentTarget) }, Q.partager),
      el("button", { type: "button", class: "bouton bouton--creux", onclick: () => recommencer() }, scores ? Q.refaire : Q.faire),
      el("a", { class: "bouton bouton--creux", href: LANG === "en" ? "/en/skill/#centrales" : "/skill/#centrales" }, Q.toutes)),
    scores && el("div", { class: "quiz__scores" },
      el("h3", { class: "quiz__sous-titre" }, Q.scores),
      el("ul", {}, CENTRALES_QUIZ.map((k) => el("li", { class: k === cle ? "quiz__score--gagnant" : "" },
        el("span", { class: "quiz__score-nom" }, sigle(k)),
        el("span", { class: "quiz__score-barre", "aria-hidden": "true" }, el("span", { style: `width:${(scores[k] / max) * 100}%` })),
        el("span", { class: "quiz__score-pts" }, String(scores[k]))))))));
  if (focus) titre.focus();
}

function recommencer({ focus = true } = {}) {
  etat.i = 0;
  etat.choix = [];
  history.replaceState(null, "", location.pathname);
  poserQuestion({ focus });
}

async function demarrer() {
  if (!racine) return;
  try {
    etat.centrales = (await chargerJson(["/data/centrales.json"])).centrales;
  } catch (e) {
    racine.replaceChildren(el("p", {}, Q.indispo));
    console.error(e);
    return;
  }
  $("[data-quiz-commencer]")?.addEventListener("click", commencer);
  const demande = new URLSearchParams(location.search).get("c");
  if (CENTRALES_QUIZ.includes(demande)) afficherResultat(demande, null, { focus: false });
  else poserQuestion({ focus: false });
}

demarrer();
