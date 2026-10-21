// Page « Connais tes droits » : le calculateur d'heures sup.
import * as C from "./calcul-heures.js";
import { $, el, langue } from "./outils.js";

const LANG = langue();
const lien = (article) => el("a", { href: `https://code.travail.gouv.fr/code-du-travail/${article.toLowerCase()}`, rel: "noopener" }, `art. ${article}`);

const ARRET = "https://www.courdecassation.fr/recherche-judilibre?search_api_fulltext=17-22.376";

const TEXTES = {
  fr: {
    erreurs: {
      taux: "Le taux horaire doit être un nombre, par exemple 12,31.",
      heures: "Les heures doivent être un nombre, par exemple 43 ou 43,5.",
      nuit: "Les heures de nuit doivent être un nombre.",
      tauxNuit: "La majoration de nuit doit être un pourcentage, par exemple 25.",
      dimanche: "Les heures du dimanche doivent être un nombre.",
      tauxDimanche: "La majoration du dimanche doit être un pourcentage, par exemple 100.",
    },
    tamponRien: "Rien à réclamer",
    titre: (h) => `Heures sup : ${h}`,
    aucune: "35 heures ou moins : pas d'heures supplémentaires cette semaine. Profite.",
    ligne25: "Heures à +25 %",
    ligne50: "Heures à +50 %",
    nuit: (t) => `Majoration de nuit (convention, ${t})`,
    dimanche: (t) => `Majoration du dimanche (convention, ${t})`,
    surSup: (quoi) => `Heures sup ${quoi} : majoration sur la prime`,
    deNuit: "de nuit",
    duDimanche: "du dimanche",
    explication: "Les heures du dimanche, puis de nuit, sont comptées comme les dernières de la semaine : elles passent en heures sup en premier, sur le taux augmenté de leur prime, comme le veut la Cour de cassation (",
    arret: "Cass. soc., 22 mai 2019, n° 17-22.376",
    detail: (base, maj) => `${base} + ${maj} de majoration`,
    total: "Montant brut des heures sup",
    totalAvecConv: "Heures sup et majorations conventionnelles",
    semaine: (h, n, s) => `Semaine complète : ${h} normales payées ${n}, plus ${s}.`,
    semaineTotal: (t) => `Total brut de la semaine : ${t}.`,
    alertes: {
      maximum: "Au-delà de 48 heures sur une même semaine, l'employeur dépasse le maximum légal, sauf dérogation (art. L3121-20).",
      smic: "Ce taux est sous le Smic horaire brut (12,31 € depuis le 1er juin 2026). Vérifie ta fiche de paie.",
      dont: "Les heures de nuit ou du dimanche sont « dont » : elles ne peuvent pas dépasser le total de la semaine.",
    },
    articles: "Les textes : ",
  },
  en: {
    erreurs: {
      taux: "The hourly rate must be a number, like 12.31.",
      heures: "Hours must be a number, like 43 or 43.5.",
      nuit: "Night hours must be a number.",
      tauxNuit: "The night premium must be a percentage, like 25.",
      dimanche: "Sunday hours must be a number.",
      tauxDimanche: "The Sunday premium must be a percentage, like 100.",
    },
    tamponRien: "Nothing owed",
    titre: (h) => `Overtime: ${h}`,
    aucune: "35 hours or less: no overtime this week. Enjoy.",
    ligne25: "Hours at +25%",
    ligne50: "Hours at +50%",
    nuit: (t) => `Night premium (agreement, ${t})`,
    dimanche: (t) => `Sunday premium (agreement, ${t})`,
    surSup: (quoi) => `${quoi} overtime: premium on the premium`,
    deNuit: "Night",
    duDimanche: "Sunday",
    explication: "Sunday hours, then night hours, are counted as the last of the week: they become overtime first, at the rate raised by their premium, as France's top court requires (",
    arret: "Cass. soc., May 22, 2019, no. 17-22.376",
    detail: (base, maj) => `${base} + ${maj} premium`,
    total: "Gross overtime pay",
    totalAvecConv: "Overtime plus agreement premiums",
    semaine: (h, n, s) => `Full week: ${h} at the regular rate, ${n}, plus ${s}.`,
    semaineTotal: (t) => `Gross total for the week: ${t}.`,
    alertes: {
      maximum: "Beyond 48 hours in a single week, the employer exceeds the legal maximum, barring an exemption (art. L3121-20).",
      smic: "This rate is below the French gross minimum wage (€12.31 an hour since June 1, 2026). Check your payslip.",
      dont: "Night and Sunday hours are part of the week's total: they can't exceed it.",
    },
    articles: "The law: ",
  },
}[LANG];

function lire(form) {
  const v = Object.fromEntries(new FormData(form));
  const n = Object.fromEntries(Object.entries(v).map(([k, x]) => [k, C.lireDecimal(x === "" && k !== "taux" && k !== "heures" ? "0" : x)]));
  const fautive = Object.keys(TEXTES.erreurs).find((k) => Number.isNaN(n[k]));
  if (fautive) return { erreur: TEXTES.erreurs[fautive], champ: fautive };
  return {
    entrees: {
      centimes: C.versCentimes(n.taux),
      minutes: C.versMinutes(n.heures),
      minutesNuit: C.versMinutes(n.nuit),
      pdbNuit: C.versPointsDeBase(n.tauxNuit),
      minutesDimanche: C.versMinutes(n.dimanche),
      pdbDimanche: C.versPointsDeBase(n.tauxDimanche),
    },
  };
}

function rendre(form, sortie) {
  for (const champ of form.elements) champ.removeAttribute?.("aria-invalid");
  const { erreur, champ, entrees } = lire(form);
  if (erreur) {
    form.elements[champ].setAttribute("aria-invalid", "true");
    sortie.replaceChildren(el("p", { class: "ticket__erreur" }, erreur));
    return;
  }
  const r = C.calculer(entrees);
  const eur = (c) => C.euros(c, LANG);
  const h = (m) => C.heures(m, LANG);
  const pc = (p) => C.pourcent(p, LANG);
  const ligne = (libelle, minutes, detail, total) =>
    el("tr", {}, el("th", { scope: "row" }, libelle), el("td", {}, h(minutes)), el("td", {}, detail && el("small", {}, detail), el("strong", {}, total)));
  const conv = r.totalMajorationsConventionnelles > 0;
  const surPrime = r.totalSurSup > 0;
  const articles = ["L3121-27", "L3121-36"];
  if (r.alertes.includes("maximum")) articles.push("L3121-20");
  if (entrees.minutesNuit) articles.push("L3122-8");
  if (entrees.minutesDimanche) articles.push("L3132-3");
  const totalAffiche = r.totalSup + r.totalMajorationsConventionnelles + r.totalSurSup;

  sortie.replaceChildren(...[
    el("span", { class: `tampon ${r.minutesSup ? "tampon--rouge" : "tampon--bleu"}`, "aria-hidden": "true" },
      r.minutesSup ? `+${eur(totalAffiche)}` : TEXTES.tamponRien),
    el("h3", { class: "ticket__titre" }, TEXTES.titre(h(r.minutesSup))),
    !r.minutesSup && el("p", {}, TEXTES.aucune),
    el("table", { class: "ticket__table" },
      el("tbody", {},
        ligne(TEXTES.ligne25, r.bande25.minutes, r.bande25.minutes ? TEXTES.detail(eur(r.bande25.base), eur(r.bande25.majoration)) : null, eur(r.bande25.total)),
        ligne(TEXTES.ligne50, r.bande50.minutes, r.bande50.minutes ? TEXTES.detail(eur(r.bande50.base), eur(r.bande50.majoration)) : null, eur(r.bande50.total)),
        r.nuit.taux > 0 && r.nuit.minutes > 0 && ligne(TEXTES.nuit(pc(r.nuit.taux)), r.nuit.minutes, null, eur(r.nuit.montant)),
        r.dimanche.taux > 0 && r.dimanche.minutes > 0 && ligne(TEXTES.dimanche(pc(r.dimanche.taux)), r.dimanche.minutes, null, eur(r.dimanche.montant)),
        r.nuit.surSup > 0 && ligne(TEXTES.surSup(TEXTES.deNuit), r.nuit.minutesSup, null, eur(r.nuit.surSup)),
        r.dimanche.surSup > 0 && ligne(TEXTES.surSup(TEXTES.duDimanche), r.dimanche.minutesSup, null, eur(r.dimanche.surSup)))),
    el("p", { class: "ticket__total" }, el("span", {}, conv ? TEXTES.totalAvecConv : TEXTES.total), el("strong", { "data-total-sup": "" }, eur(totalAffiche))),
    el("p", { class: "ticket__prochain" },
      TEXTES.semaine(h(Math.min(r.minutes, C.DUREE_LEGALE_MINUTES)), eur(r.normales), eur(totalAffiche)), " ", TEXTES.semaineTotal(eur(r.totalSemaine))),
    surPrime && el("p", { class: "ticket__prochain", "data-explication-sursup": "" }, TEXTES.explication,
      el("a", { href: ARRET, rel: "noopener" }, TEXTES.arret), ")."),
    r.alertes.length > 0 && el("ul", { class: "ticket__alertes" }, r.alertes.map((a) => el("li", {}, TEXTES.alertes[a]))),
    el("p", { class: "ticket__prochain" }, TEXTES.articles, articles.flatMap((a, i) => [i ? ", " : "", lien(a)])),
  ].filter(Boolean));
}

const form = $("[data-calculateur]");
if (form) {
  const sortie = $("[data-calcul-resultat]");
  form.addEventListener("input", () => rendre(form, sortie));
  form.addEventListener("submit", (e) => e.preventDefault());
  rendre(form, sortie);
}
