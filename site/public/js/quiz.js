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
    partageTexte: (s, d) => `Je suis ${s} : « ${d} » Et toi, quelle centrale es-tu ?`,
    refaire: "Refaire le quiz",
    faire: "Faire le quiz",
    toutes: "Voir les huit centrales",
    scores: "Tes points",
    resultatDe: "Résultat partagé. Et toi ?",
    indispo: "Le quiz n'a pas pu charger les centrales. Recharge la page.",
  },
  en: {
    progression: (i, n) => `Question ${i} of ${n}`,
    retour: "← Previous question",
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
    lienCopie: "Link copied, camarade",
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
const etat = { i: 0, choix: [], centrales: null };

function poserQuestion({ focus = true } = {}) {
  const q = QUESTIONS[etat.i];
  const n = QUESTIONS.length;
  const titre = el("h2", { class: "quiz__question", id: "quiz-question", tabindex: "-1" }, q[LANG]);
  racine.replaceChildren(el("div", { class: "quiz__carte" },
    el("p", { class: "quiz__progression" }, Q.progression(etat.i + 1, n)),
    el("div", { class: "quiz__barre", role: "progressbar", "aria-valuemin": "0", "aria-valuemax": String(n), "aria-valuenow": String(etat.i), "aria-label": Q.progression(etat.i + 1, n) },
      el("span", { style: `width:${(etat.i / n) * 100}%` })),
    titre,
    el("ul", { class: "quiz__reponses", "aria-labelledby": "quiz-question" },
      q.reponses.map((r, k) => el("li", {},
        el("button", { type: "button", class: "quiz__reponse", "aria-pressed": String(etat.choix[etat.i] === k), onclick: () => repondre(k) }, r[LANG])))),
    etat.i > 0 && el("button", { type: "button", class: "quiz__retour", onclick: () => { etat.i -= 1; poserQuestion(); } }, Q.retour)));
  if (focus) titre.focus({ preventScroll: false });
}

function repondre(k) {
  etat.choix[etat.i] = k;
  etat.i += 1;
  if (etat.i < QUESTIONS.length) return poserQuestion();
  const scores = scorer(etat.choix);
  afficherResultat(gagnant(scores, etat.choix), scores);
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

function afficherResultat(cle, scores = null, { focus = true } = {}) {
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
      el("button", { type: "button", class: "bouton bouton--creux", onclick: recommencer }, scores ? Q.refaire : Q.faire),
      el("a", { class: "bouton bouton--creux", href: LANG === "en" ? "/en/skill/#centrales" : "/skill/#centrales" }, Q.toutes)),
    scores && el("div", { class: "quiz__scores" },
      el("h3", { class: "quiz__sous-titre" }, Q.scores),
      el("ul", {}, CENTRALES_QUIZ.map((k) => el("li", { class: k === cle ? "quiz__score--gagnant" : "" },
        el("span", { class: "quiz__score-nom" }, sigle(k)),
        el("span", { class: "quiz__score-barre", "aria-hidden": "true" }, el("span", { style: `width:${(scores[k] / max) * 100}%` })),
        el("span", { class: "quiz__score-pts" }, String(scores[k]))))))));
  if (focus) titre.focus();
}

function recommencer() {
  etat.i = 0;
  etat.choix = [];
  history.replaceState(null, "", location.pathname);
  poserQuestion();
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
  const demande = new URLSearchParams(location.search).get("c");
  if (CENTRALES_QUIZ.includes(demande)) afficherResultat(demande, null, { focus: false });
  else poserQuestion({ focus: false });
}

demarrer();
