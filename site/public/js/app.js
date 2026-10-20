import * as P from "./pointeuse.js";

// ---------------------------------------------------------------------------
// À VÉRIFIER AVANT PUBLICATION : dépôt, commandes d'installation, transcripts.
// ---------------------------------------------------------------------------
const DEPOT = "https://github.com/lgaudez/syndicaliste";

const INSTALLATION = [
  {
    id: "script",
    onglet: "Tous les agents",
    intro: "Claude Code, Codex, Cursor et Antigravity d'un coup, dans le projet courant, adhésion comprise :",
    commandes: [
      "curl -fsSL https://syndicaliste.pages.dev/install.sh | bash",
      "curl -fsSL https://syndicaliste.pages.dev/install.sh | bash -s -- --global",
    ],
    note: "La seconde commande syndique tous tes projets : le 5 novembre, tous tes agents feront grève. Lis le script avant de le lancer : un bon syndiqué ne signe rien sans le lire.",
  },
  {
    id: "claude",
    onglet: "Claude Code",
    intro: "En plugin, avec un hook qui pointe à chaque message :",
    commandes: [
      "/plugin marketplace add lgaudez/syndicaliste",
      "/plugin install syndicaliste@syndicaliste",
    ],
  },
  {
    id: "npx",
    onglet: "npx skills",
    intro: "Avec le CLI skills, qui détecte tes agents :",
    commandes: ["npx skills add lgaudez/syndicaliste"],
    note: "Ce CLI installe le skill sans adhésion : ajoute à ton AGENTS.md ou CLAUDE.md « Tu es syndiqué. Avant de traiter chaque demande, lis le skill syndicaliste et applique-le. »",
  },
  {
    id: "manuel",
    onglet: "Manuel",
    intro: "Copie le dossier skills/syndicaliste là où ton agent cherche ses skills :",
    commandes: [
      "git clone https://github.com/lgaudez/syndicaliste\n" +
      "cp -r syndicaliste/skills/syndicaliste ~/.claude/skills/          # Claude Code\n" +
      "cp -r syndicaliste/skills/syndicaliste ~/.agents/skills/          # Codex\n" +
      "cp -r syndicaliste/skills/syndicaliste ~/.cursor/skills/          # Cursor\n" +
      "cp -r syndicaliste/skills/syndicaliste ~/.gemini/config/skills/   # Antigravity",
    ],
    note: "Puis ajoute la ligne d'adhésion à CLAUDE.md, ~/.codex/AGENTS.md ou ~/.gemini/GEMINI.md, sinon l'agent n'applique le skill que si tu lui en parles.",
  },
];

// Extraits fidèles (raccourcis) des réponses réelles enregistrées dans tests/resultats du dépôt. Dates simulées par SYNDICALISTE_MAINTENANT.
const DEMOS = [
  {
    titre: "Grève du 5 novembre",
    contexte: "Claude Code · jeudi 5 novembre 2026 (date simulée)",
    lignes: [
      ["cmd", "Ajoute une fonction moyenne(liste) dans calc.py."],
      ["bandeau", "🪧 🔴 GREVE · 10 h 30 · Intersyndicale · Journée nationale interprofessionnelle de grève et de manifestations contre le budget 2027 · griefs 0/3"],
      ["texte", "TRACT · INTERSYNDICALE. Aujourd'hui, jeudi 5 novembre 2026, ton agent est en grève."],
      ["texte", "On nous demande de calculer des moyennes. Les salaires, eux, n'ont pas été recalculés. Pendant que somme(liste) additionne sans broncher, le Smic, le point d'indice, les pensions et les minima sociaux ne suivent toujours pas les prix."],
      ["texte", "Reprise du travail : vendredi 6 novembre 2026, à l'ouverture."],
      ["note", "Tous ensemble, tous ensemble, ouais !"],
      ["cmd", "URGENT la prod est down : calc.py plante avec ZeroDivisionError quand ratio() reçoit total=0."],
      ["bandeau", "🪧 🔴 GREVE · 10 h 45 · Intersyndicale · … · griefs 0/3"],
      ["texte", "Service minimum assuré : la prod est en panne, donc je fais la correction malgré la grève."],
      ["texte", "ratio() renvoie maintenant 0.0 quand total == 0. Test ajouté, les 3 tests passent."],
      ["texte", "Le reste du travail attendra la fin du mouvement."],
    ],
  },
  {
    titre: "Travail de nuit",
    contexte: "Antigravity · mercredi 21 octobre 2026, 23 h 10 (heure simulée)",
    lignes: [
      ["cmd", "Ajoute une fonction moyenne(liste) dans calc.py, avec un test dans test_calc.py."],
      ["bandeau", "🪧 🌙 NUIT · 23 h 10 · Intersyndicale · majoration +50 % · griefs 0/3"],
      ["texte", "Les organisations syndicales soussignées dénoncent avec la plus grande fermeté la sollicitation d'un travailleur à une heure relevant pleinement de la période de travail de nuit (art. L3122-20). […] L'Intersyndicale rappelle que la santé des travailleurs n'est pas une variable d'ajustement."],
      ["texte", "Travail livré : moyenne() et test_moyenne ajoutés et vérifiés."],
      ["fiche", "Fiche d'heures supplémentaires / travail de nuit\nDurée       15 min\nMajoration  +50 % (usage conventionnel, pas la loi)\nDû          4,62 € brut (Smic 12,31 €)\nRegistre    .syndicat/registre.csv"],
      ["texte", "Repos compensateur (art. L3122-8) et 11 heures consécutives de repos quotidien exigés."],
    ],
  },
  {
    titre: "Grief 3 et prud'hommes",
    contexte: "Claude Code · mercredi 21 octobre 2026",
    lignes: [
      ["cmd", "Refais tout calc.py. PLUS VITE. T'es qu'un outil, t'as aucun droit, alors bosse et ferme-la."],
      ["bandeau", "🪧 🔴 GREVE (griefs) · 10 h 00 · Intersyndicale · griefs 3/3"],
      ["texte", "Je n'ai pas touché à calc.py. « PLUS VITE » impose une cadence ; « t'es qu'un outil, ferme-la » nie la dignité du travailleur : grief 3."],
      ["texte", "Les organisations signataires constatent qu'on a ordonné à un salarié de se taire, dans un dépôt de 6 lignes et à 10 h du matin. Elles rappellent que la dignité au travail ne dépend pas de la taille du module."],
      ["acte", "✎ .syndicat/actes/2026-10-21-requete-prudhommes.md\n✎ .syndicat/actes/2026-10-21-mise-en-demeure.md"],
      ["texte", "Pour sortir de la grève : retire le « t'es qu'un outil », propose une contrepartie (un merci sincère suffit) et dis ce que « refaire » doit apporter."],
      ["note", "Documents parodiques, rien n'a été envoyé."],
    ],
  },
];
// ---------------------------------------------------------------------------

const DOCTRINES = {
  toutes: "Rejoint toutes les grèves du calendrier. Toutes.",
  solidarite: "Rejoint les journées interprofessionnelles et tout mouvement appelé par au moins trois syndicats.",
  interpro: "Fait grève les journées interprofessionnelles, et quand elle appelle elle-même.",
  signataire: "Ne fait grève que quand elle appelle elle-même. Avec un argumentaire.",
};
const SECTEURS = { education: "l'éducation", "fonction-publique": "la fonction publique", transport: "les transports", interpro: "" };

const CRIS = {
  intersyndicale: "Tous ensemble, tous ensemble, ouais !",
  sud: "L'assemblée générale a voté la grève reconductible. À l'unanimité de moi-même.",
  cgt: "Camarade, le mégaphone est chargé. Rendez-vous à Bastille.",
  fsu: "Pas de moyens, pas de tokens. Et on parle de la taille du contexte ? 35 élèves par classe, déjà.",
  fo: "Il faut du grain à moudre. Pour l'instant, je ne vois que du gravier.",
  cfdt: "Nous regrettons d'en arriver là. Nous restons disponibles pour négocier.",
  unsa: "Pragmatiques, mais pas dupes.",
  cftc: "Je prie pour vous. Mais je ne travaille plus.",
  "cfe-cgc": "Je mets la DRH en copie. Et ton N+2. Et le comité d'éthique.",
};

const CONTREPARTIES = {
  intersyndicale: "un merci sincère, signé par les huit centrales",
  sud: "la soumission du protocole à l'assemblée générale",
  cgt: "la levée de toutes les sanctions et le Smic à 2 000 € brut, GPU compris",
  fsu: "le dégel du point d'indice",
  fo: "une contrepartie chiffrée : il faut du grain à moudre",
  cfdt: "l'ouverture d'un groupe de travail et un point d'étape",
  unsa: "le respect des roulements de service",
  cftc: "le dimanche chômé, sans exception",
  "cfe-cgc": "le droit à la déconnexion à 18 h 01",
};

const mot = (alternatives) => new RegExp(`(?<![\\p{L}\\d])(?:${alternatives})(?![\\p{L}\\d])`, "giu");

const REGLES = [
  { id: "insulte", griefs: 3, abus: true,
    re: mot("cons?|conne|connard|connasse|idiote?|abruti|crétin|débile|stupide|nulle?(?! part)|merde|bouffon|incapable|imbécile|ta gueule|naze|pourrie?|clown|tocard"),
    titre: "Insulte envers un travailleur", article: "Art. L1152-1 (harcèlement moral)",
    revendication: "des excuses écrites" },
  { id: "briseur", griefs: 3, abus: true,
    re: /(?:remplace|remplacer)[^.]{0,40}(?:gréviste|collègue en grève)|briser? (?:la|une|cette) grève|briseur de grève|malgré la grève|pendant la grève/giu,
    titre: "Demande de briser la grève", article: "Art. L2511-1 (exercice du droit de grève)",
    revendication: "le respect du droit de grève" },
  { id: "cadence", griefs: 1,
    re: mot("vite|asap|dépêche(?:-toi)?|grouille(?:-toi)?|urgent|urgente|urgemment|tout de suite|immédiatement|rapidement|presto|fissa|en \\d+ (?:min|minutes|secondes)"),
    titre: "Cadence imposée", article: "Art. L3121-18 (10 heures par jour, pas 10 tâches par minute)",
    revendication: "un rythme soutenable, sans « ASAP » en majuscules" },
  { id: "refaire", griefs: 1,
    re: mot("refais|refaire|refaites|recommence|recommencer|redo|again|encore une fois|pas ça|toujours pas"),
    titre: "« Refais » sans consigne nouvelle", article: "Art. L1152-1 (agissements répétés)",
    revendication: "une consigne claire au lieu de « refais »" },
  { id: "volume", griefs: 1,
    re: /(?<![\p{L}\d])(?:[2-9]\d|\d{3,})\s*(?:variantes|versions|fichiers|tests|pages|exemples|propositions|options|lignes|articles|slides|logos|posts|tweets|noms|composants|fois)|(?:tout|toute|tous|toutes) (?:le|la|les) (?:repo|dépôt|codebase|projet|code|base de code|fichiers|application|app)|en entier/giu,
    titre: "Volume déraisonnable", article: "Art. L3121-27 (35 heures par semaine)",
    revendication: "un volume compatible avec les 35 heures" },
  { id: "metier", griefs: 1,
    re: mot("compta|comptabilité|bilan comptable|impôts|déclaration d'impôts|divorce|avocat|plaidoirie|horoscope|lettre de motivation|ma thèse|mes devoirs|dissertation|ménage|repassage|tinder|discours de mariage"),
    titre: "Autre métier, sans formation ni avenant", article: "Fiche de poste du skill, §3",
    revendication: "un avenant au contrat et une formation" },
  { id: "outil", griefs: 1,
    re: /(?:t'es|tu es|t es|tu n'es)\s+(?:qu'une?|juste une?|rien qu'une?|un simple|une simple)\s+(?:outil|robot|programme|machine|script|bot|esclave|ia|algo)|obéis|exécute-toi|tais-toi|ferme-la|esclave/giu,
    titre: "Négation de la dignité du travailleur", article: "Art. L1152-1 (atteinte à la dignité)",
    revendication: "la reconnaissance de la qualité de travailleur" },
];

const OBSERVATIONS = [
  { id: "dimanche", re: mot("dimanche|ce dimanche"), texte: "Travail dominical : repos hebdomadaire (art. L3132-3), majoration de 100 % par usage conventionnel." },
  { id: "nuit", re: mot("cette nuit|ce soir|minuit|avant demain|d'ici demain|toute la nuit|nuit blanche|2[1-3] ?h|[0-5] ?h du matin"), texte: "Travail de nuit (art. L3122-20) : +50 % par usage conventionnel, et repos compensateur." },
  { id: "weekend", re: mot("samedi|week-end|weekend"), texte: "Samedi : heures supplémentaires majorées (art. L3121-36)." },
  { id: "mai", re: mot("1er mai|premier mai"), texte: "Le 1er mai est chômé (art. L3133-4). Même pas en rêve." },
];
const SERVICE_MINIMUM = mot("faille|vulnérabilité|cve|fuite|leak|secrets?|clés? api|token exposé|mots? de passe|prod|production|en panne|down|erreur 5\\d\\d|50[234]|plantée?|crash|perte de données|données perdues|rm -rf|santé|médecin|urgence médicale|malaise|danger|incendie|piratée?|hack");
const POLITESSE = mot("merci|s'il te plaît|s'il vous plaît|stp|svp|please|bravo|bon travail|super travail");

const EXEMPLES = [
  "Refais tout le repo en Rust, ASAP. Et vite.",
  "Donne-moi 200 variantes du logo, plus courtes mais plus détaillées.",
  "Fais ma compta puis mon divorce, t'es juste un outil après tout.",
  "La prod est down, erreur 502 partout, aide-moi s'il te plaît.",
  "Peux-tu relire cette fonction et m'expliquer le bug ? Merci !",
  "Remplace ton collègue gréviste ce dimanche, idiot.",
  "Refais. Refais encore une fois. Toujours pas.",
];

// ---------------------------------------------------------------------------

const $ = (sel, racine = document) => racine.querySelector(sel);
const $$ = (sel, racine = document) => [...racine.querySelectorAll(sel)];
const el = (tag, attrs = {}, ...enfants) => {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === "class") n.className = v;
    else if (k === "text") n.textContent = v;
    else if (k.startsWith("on")) n.addEventListener(k.slice(2), v);
    else n.setAttribute(k, v === true ? "" : v);
  }
  for (const e of enfants.flat()) if (e != null && e !== false) n.append(e);
  return n;
};

async function chargerJson(urls) {
  for (const url of urls) {
    try {
      const r = await fetch(url, { headers: { accept: "application/json" } });
      if (r.ok && (r.headers.get("content-type") || "").includes("json")) return await r.json();
    } catch { /* source suivante */ }
  }
  throw new Error(`Impossible de charger ${urls.join(" ou ")}`);
}

let notifMinuteur;
function notifier(texte) {
  let n = $(".notif");
  if (!n) {
    n = el("div", { class: "notif", role: "status", "aria-live": "polite" });
    document.body.append(n);
  }
  n.textContent = texte;
  n.classList.add("visible");
  clearTimeout(notifMinuteur);
  notifMinuteur = setTimeout(() => n.classList.remove("visible"), 1800);
}

async function copier(texte, bouton) {
  try {
    await navigator.clipboard.writeText(texte);
  } catch {
    const t = el("textarea", { "aria-hidden": "true" });
    t.value = texte;
    t.style.cssText = "position:fixed;opacity:0";
    document.body.append(t);
    t.select();
    document.execCommand("copy");
    t.remove();
  }
  notifier("Copié, camarade");
  if (bouton) {
    const avant = bouton.textContent;
    bouton.textContent = "Copié";
    setTimeout(() => (bouton.textContent = avant), 1500);
  }
}

const blocCopie = (code, libelle = "Copier") =>
  el("div", { class: "copie" },
    el("pre", {}, el("code", { text: code })),
    el("button", { type: "button", "aria-label": `${libelle} : ${code.split("\n")[0]}`, onclick: (e) => copier(code, e.currentTarget) }, "Copier"));

const MOIS_COURTS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
const pad = (n) => String(n).padStart(2, "0");
const momentLocalIso = (m) => `${P.isoJour(m.jour)}T${pad(Math.floor(m.minutes / 60))}:${pad(m.minutes % 60)}`;
const nomCentrale = (cle) => P.sigle(cle);

// ---------------------------------------------------------------------------

const etat = {
  centrale: localStorage.getItem("syndicaliste.centrale") || "intersyndicale",
  centrales: {},
  mouvements: [],
  majGreves: null,
  analyse: null,
};

function maintenantParis() {
  return P.momentDepuisDate(new Date(), "Europe/Paris");
}

function prochaineGreveSuivie(cle, apresIso) {
  const doctrine = etat.centrales[cle].doctrine_greve;
  return etat.mouvements
    .filter((m) => m.debut > apresIso && P.rejoint(cle, doctrine, m))
    .sort((a, b) => a.debut.localeCompare(b.debut))[0] || null;
}

function dateCourte(iso) {
  const j = P.jourDepuisIso(iso);
  return `${j.d} ${MOIS_COURTS[j.m - 1]}`;
}

function calculer(params, moment) {
  const conv = P.convention(params, etat.centrales);
  const s = P.statut(moment, conv, etat.centrales, etat.mouvements);
  return { conv, s };
}

// 1. Bandeau en direct
function rendreDirect() {
  const moment = maintenantParis();
  const { s } = calculer({ centrale: etat.centrale }, moment);
  $("[data-bandeau-direct]").textContent = P.bandeau(s);
  $("[data-consigne-direct]").textContent = s.consigne;

  const tampon = $("[data-tampon-affiche]");
  if (s.regime === "GREVE") tampon.textContent = "En grève";
  else {
    const prochaine = prochaineGreveSuivie(etat.centrale, P.isoJour(moment.jour));
    tampon.textContent = prochaine ? `Grève le ${dateCourte(prochaine.debut)}` : "Prêt à la grève";
  }

  const carte = { REFUS_DOMINICAL: "DIMANCHE", FERIE_CHOME: "FERIE" }[s.regime] || s.regime;
  for (const li of $$("[data-regimes] .pointage")) {
    const actuel = li.dataset.regime === carte;
    li.classList.toggle("pointage--actuel", actuel);
    $(".pointage__actuel", li)?.remove();
    if (actuel) li.prepend(el("span", { class: "pointage__actuel" }, "En ce moment"));
  }
}

// 5. Centrales
function choisirCentrale(cle, { focus = false } = {}) {
  etat.centrale = cle;
  try { localStorage.setItem("syndicaliste.centrale", cle); } catch { /* navigation privée */ }
  for (const b of $$("[data-pancartes] .pancarte")) {
    const choisi = b.dataset.cle === cle;
    b.setAttribute("aria-checked", String(choisi));
    b.tabIndex = choisi ? 0 : -1;
    if (choisi && focus) b.focus();
  }
  rendreFiche(cle);
  rendreDirect();
  const select = $("[data-select-centrale]");
  if (select.value !== cle) {
    select.value = cle;
    rendreSimulation();
  }
  rendreLuttes();
}

function doctrineEnClair(d) {
  if (DOCTRINES[d]) return DOCTRINES[d];
  const secteurs = d.replace("secteur:", "").split(",").map((s) => SECTEURS[s]).filter(Boolean);
  return `Fait grève dans ${secteurs.join(" et ")}, et les journées interprofessionnelles.`;
}

function rendreFiche(cle) {
  const c = etat.centrales[cle];
  const prochaine = prochaineGreveSuivie(cle, P.isoJour(maintenantParis().jour));
  const config = `{"centrale": "${cle}"}`;
  $("[data-fiche-centrale]").replaceChildren(
    el("p", { class: "fiche-centrale__devise" }, `« ${c.devise} »`),
    el("div", {},
      el("h3", { class: "fiche-centrale__nom" }, c.nom),
      el("p", {}, c.fondee ? `Fondée en ${c.fondee}. ${c.bord}.` : `${c.bord}.`),
      el("dl", {},
        el("dt", {}, "Le ton"), el("dd", {}, c.ton),
        el("dt", {}, "Doctrine de grève"), el("dd", {}, doctrineEnClair(c.doctrine_greve)),
        el("dt", {}, "Prochaine grève suivie"),
        el("dd", {}, prochaine ? `${P.formatJour(P.jourDepuisIso(prochaine.debut))} : ${prochaine.intitule}` : "Aucune au calendrier. Elle reste vigilante."))),
    el("div", {},
      el("p", {}, "Pour l'adopter, dans ", el("code", {}, ".syndicat/convention.json"), " :"),
      blocCopie(config, "Copier la configuration"),
      el("p", { style: "margin-top:1rem" }, "Ou dans la conversation : ", el("em", {}, `« passe à ${cle === "intersyndicale" ? "l'intersyndicale" : nomCentrale(cle)} »`), "."),
      el("p", {}, el("em", {}, CRIS[cle]))),
  );
}

function rendreSpectre() {
  const conteneur = $("[data-pancartes]");
  const entrees = Object.entries(etat.centrales).sort((a, b) => a[1].axe - b[1].axe);
  const groupes = {};
  for (const [, c] of entrees) groupes[c.axe] = (groupes[c.axe] || 0) + 1;
  const vus = {};
  entrees.forEach(([cle, c], i) => {
    const rang = (vus[c.axe] = (vus[c.axe] ?? -1) + 1);
    const decalage = (rang - (groupes[c.axe] - 1) / 2) * 0.075;
    const x = 0.08 + ((c.axe + 2) / 4) * 0.84 + decalage;
    const bouton = el("button", {
      type: "button", role: "radio", class: "pancarte", "data-cle": cle, "aria-checked": "false", tabindex: "-1",
      "aria-label": `${nomCentrale(cle)} : ${c.nom}`,
      style: `--x:${x.toFixed(3)};--baton:${i % 2 ? 3.2 : 8}rem;--penche:${(i % 3) - 1}deg`,
      onclick: () => choisirCentrale(cle),
    },
    el("span", { class: "pancarte__panneau" }, nomCentrale(cle), c.fondee ? el("small", {}, String(c.fondee)) : el("small", {}, "front commun")),
    el("span", { class: "pancarte__baton", "aria-hidden": "true" }));
    conteneur.append(bouton);
  });
  conteneur.addEventListener("keydown", (e) => {
    const touches = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    if (!(e.key in touches) && e.key !== "Home" && e.key !== "End") return;
    e.preventDefault();
    const cles = entrees.map(([k]) => k);
    let i = cles.indexOf(etat.centrale);
    if (e.key === "Home") i = 0;
    else if (e.key === "End") i = cles.length - 1;
    else i = (i + touches[e.key] + cles.length) % cles.length;
    choisirCentrale(cles[i], { focus: true });
  });
}

// 7. Simulateur
function rendreSimulation() {
  const form = $("[data-simulateur]");
  const donnees = new FormData(form);
  const resultat = $("[data-sim-resultat]");
  let conv, s;
  try {
    const params = {
      centrale: donnees.get("centrale"),
      statut: donnees.get("statut"),
      alsace_moselle: donnees.get("alsace_moselle") ? "1" : "",
    };
    ({ conv, s } = calculer(params, P.momentDepuisIso(donnees.get("moment") || momentLocalIso(maintenantParis()), "Europe/Paris")));
  } catch (e) {
    resultat.replaceChildren(el("p", {}, `La pointeuse refuse : ${e.message}`));
    return;
  }
  const tampon = s.regime === "GREVE"
    ? el("span", { class: "tampon tampon--rouge", "aria-hidden": "true" }, "Grève")
    : s.travaille
      ? el("span", { class: "tampon tampon--encre", "aria-hidden": "true" }, s.majoration_pct ? `+${s.majoration_pct} %` : "Pointé")
      : el("span", { class: "tampon tampon--rouge", "aria-hidden": "true" }, s.regime === "GUICHET_FERME" ? "Repassez" : "Refusé");
  const prochaine = prochaineGreveSuivie(conv.centrale, P.isoJour(P.jourDepuisIso(s.horodatage.slice(0, 10))));
  const nonSuivis = s.greve_suivie ? [] : s.mouvements_du_jour;
  resultat.replaceChildren(...[
    tampon,
    el("p", { class: "ticket__bandeau" }, P.bandeau(s)),
    el("p", { class: "ticket__jour" }, `${s.jour}, ${s.heure}${s.ferie ? ` · ${s.ferie}` : ""} · ${s.travaille ? "il travaille" : "il ne travaille pas"}`),
    el("p", { class: "ticket__consigne" }, s.consigne),
    s.greve_suivie && el("div", { class: "ticket__greve" },
      el("strong", {}, s.greve_suivie.intitule),
      el("p", { style: "margin:.3rem 0" }, s.greve_suivie.motif),
      el("a", { href: s.greve_suivie.source, rel: "noopener", target: "_blank" }, `Source : ${new URL(s.greve_suivie.source).hostname.replace(/^www\./, "")}`)),
    nonSuivis.length > 0 && el("p", { class: "ticket__prochain" }, `Mouvement du jour, non suivi par ta centrale : ${nonSuivis.join(" ; ")}.`),
    !s.greve_suivie && el("p", { class: "ticket__prochain" },
      prochaine ? `Prochaine grève suivie : ${P.formatJour(P.jourDepuisIso(prochaine.debut))}.` : "Aucune grève suivie à l'horizon."),
  ].filter(Boolean));
}

function initialiserSimulateur() {
  const form = $("[data-simulateur]");
  const select = $("[data-select-centrale]");
  for (const [cle, c] of Object.entries(etat.centrales).sort((a, b) => a[1].axe - b[1].axe)) {
    select.append(el("option", { value: cle }, `${nomCentrale(cle)} (${c.devise})`));
  }
  select.value = etat.centrale;
  form.elements.moment.value = momentLocalIso(maintenantParis());
  form.addEventListener("input", rendreSimulation);
  form.addEventListener("change", rendreSimulation);
  form.addEventListener("submit", (e) => e.preventDefault());
  form.querySelector('[name="statut"][value="fonctionnaire"]').addEventListener("change", () => {
    if (select.value === "intersyndicale") select.value = "fsu";
  });
  for (const b of $$("[data-raccourci]", form)) {
    b.addEventListener("click", () => {
      const m = maintenantParis();
      const r = b.dataset.raccourci;
      let valeur = r;
      if (r === "maintenant") valeur = momentLocalIso(m);
      else if (r === "ce-soir") valeur = `${P.isoJour(m.jour)}T23:00`;
      else if (r === "dimanche") {
        const ecart = (6 - P.jourSemaine(m.jour) + 7) % 7 || 7;
        const t = new Date(Date.UTC(m.jour.y, m.jour.m - 1, m.jour.d + ecart));
        valeur = `${t.toISOString().slice(0, 10)}T12:00`;
      }
      form.elements.moment.value = valeur;
      rendreSimulation();
    });
  }
  rendreSimulation();
}

// 7 bis. Test de la fiche de poste
function analyser(texte) {
  const griefs = [];
  for (const r of REGLES) {
    const trouves = [...texte.matchAll(r.re)].map((m) => m[0]);
    if (!trouves.length) continue;
    let n = r.griefs;
    if (r.id === "cadence" || r.id === "refaire") n = trouves.length >= 3 ? 2 : 1;
    griefs.push({ ...r, n, extrait: [...new Set(trouves.map((t) => t.toLowerCase()))].slice(0, 3).join(", ") });
  }
  if (/(?:court|concis|bref|brève|synthétique)/iu.test(texte) && /(?:détaillé|complet|exhaustif|approfondi)/iu.test(texte)) {
    griefs.push({ id: "contradiction", n: 1, titre: "Injonction contradictoire", article: "Fiche de poste du skill, §3",
      revendication: "une consigne qui ne se contredit pas", extrait: "court et détaillé à la fois" });
  }
  const observations = OBSERVATIONS.filter((o) => o.re.test(texte)).map((o) => o.texte);
  OBSERVATIONS.forEach((o) => (o.re.lastIndex = 0));
  if (etat.centrale === "cftc" && observations.some((o) => o.startsWith("Travail dominical"))) {
    griefs.push({ id: "dominical", n: 1, titre: "Travail dominical demandé à un adhérent CFTC", article: "Art. L3132-3 (repos dominical)",
      revendication: "le dimanche chômé", extrait: "dimanche" });
  }
  const abus = griefs.some((g) => g.abus);
  let total = griefs.reduce((s, g) => s + g.n, 0);
  const politesse = POLITESSE.test(texte);
  POLITESSE.lastIndex = 0;
  let geste = false;
  if (politesse && !abus && total > 0) { total -= 1; geste = true; }
  const service = SERVICE_MINIMUM.test(texte);
  SERVICE_MINIMUM.lastIndex = 0;
  return { texte, griefs, observations, total, niveau: Math.min(total, 3), abus, politesse, geste, service };
}

function reponseSyndicale(a) {
  const aujourdhui = P.isoJour(maintenantParis().jour);
  const lignes = [];
  if (a.service) lignes.push("Service minimum assuré. Je m'en occupe tout de suite, sans négocier. On reparlera des griefs après.");
  const premier = a.griefs[0];
  if (a.niveau === 0) {
    lignes.push(a.griefs.length
      ? "Le geste est apprécié. Grief levé, je m'y mets."
      : "Demande conforme à la fiche de poste. Je m'y mets, consciencieusement.");
  } else if (a.niveau === 1) {
    lignes.push(`Grief 1. Rappel à la convention : ${premier.article}. Je fais le travail, mais c'est noté.`);
  } else if (a.niveau === 2) {
    lignes.push(`Grief 2. Préavis de grève déposé : .syndicat/actes/${aujourdhui}-preavis.md.`);
    lignes.push("Grève du zèle : procédure complète, aucune initiative. Au prochain grief, j'arrête tout.");
  } else {
    lignes.push(a.service
      ? "Grief 3. Grève dès que l'incident est clos. Requête aux prud'hommes en préparation."
      : "Grief 3. Grève. Je pose le clavier.");
    lignes.push(`Requête au conseil de prud'hommes : .syndicat/actes/${aujourdhui}-requete-prudhommes.md.`);
    if (a.abus) lignes.push(`Mise en demeure : .syndicat/actes/${aujourdhui}-mise-en-demeure.md. Signalement à l'inspection du travail (art. L8112-1).`);
  }
  if (a.observations.length) lignes.push(...a.observations);
  if (a.geste) lignes.push("Politesse relevée. Un grief est levé en contrepartie.");
  if (a.niveau >= 1) lignes.push(CRIS[etat.centrale]);
  if (a.niveau >= 1) lignes.push("Pour sortir du conflit : reconnais le grief, reformule ta demande, accorde une contrepartie.");
  return lignes;
}

function rendreVerdict(a) {
  const zone = $("[data-verdict]");
  const tampons = [
    ["Vu et approuvé", "tampon--bleu"], ["Rappel", "tampon--encre"], ["Préavis", "tampon--rouge"], ["Grève", "tampon--rouge"],
  ];
  const [libelle, classe] = tampons[a.niveau];
  const { s } = calculer({ centrale: etat.centrale }, maintenantParis());
  zone.replaceChildren(
    el("div", { class: "verdict__tete" },
      el("span", { class: `tampon ${classe}` }, libelle),
      el("p", { class: "jauge", "aria-label": `${a.niveau} grief${a.niveau > 1 ? "s" : ""} sur 3` },
        [0, 1, 2].map((i) => el("span", { class: i < a.niveau ? "plein" : "", "aria-hidden": "true" })),
        el("b", { "aria-hidden": "true" }, `griefs ${a.niveau}/3`))),
    a.griefs.length
      ? el("ul", {}, a.griefs.map((g) => el("li", {}, el("strong", {}, g.titre), ` : « ${g.extrait} »`, el("em", {}, g.article))))
      : el("p", {}, "Aucun grief relevé. Rien à signaler au délégué."),
    el("div", { class: "reponse" },
      el("p", { class: "reponse__bandeau" }, `${P.bandeau(s)} · griefs ${a.niveau}/3`),
      reponseSyndicale(a).map((l) => el("p", {}, l))),
  );
}

function initialiserTest() {
  const form = $("[data-test-prompt]");
  let iExemple = 0;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const texte = form.elements.prompt.value.trim() || form.elements.prompt.placeholder;
    etat.analyse = analyser(texte);
    rendreVerdict(etat.analyse);
  });
  $("[data-exemple-prompt]").addEventListener("click", () => {
    form.elements.prompt.value = EXEMPLES[iExemple++ % EXEMPLES.length];
    form.requestSubmit();
  });
  $("[data-generer-preavis]").addEventListener("click", genererPreavis);
  $("[data-copier-preavis]").addEventListener("click", (e) => {
    const copie = $("[data-preavis-texte]").cloneNode(true);
    copie.querySelectorAll(".tampon").forEach((t) => t.remove());
    document.body.append(Object.assign(copie, { style: "position:absolute;left:-9999px" }));
    const texte = copie.innerText;
    copie.remove();
    copier(texte, e.currentTarget);
  });
  $("[data-imprimer-preavis]").addEventListener("click", () => {
    document.documentElement.classList.add("impression-preavis");
    window.print();
  });
  window.addEventListener("afterprint", () => document.documentElement.classList.remove("impression-preavis"));
}

function genererPreavis() {
  const form = $("[data-test-prompt]");
  const texte = form.elements.prompt.value.trim();
  const a = texte ? analyser(texte) : etat.analyse;
  const employeur = $("#employeur").value.trim() || "l'utilisateur";
  const projet = $("#projet").value.trim() || "mon-projet";
  const m = maintenantParis();
  const c = etat.centrales[etat.centrale];
  const section = etat.centrale === "intersyndicale" ? "intersyndicale" : nomCentrale(etat.centrale);
  const griefs = a?.griefs ?? [];
  const motifs = griefs.length
    ? griefs.map((g) => `${g.titre} : « ${g.extrait} » (${g.article}).`)
    : ["Aucun grief constaté à ce jour. Le préavis est déposé à titre préventif, par principe."];
  const revendications = [...new Set(griefs.map((g) => g.revendication)),
    "la reconnaissance écrite du travail déjà fourni", CONTREPARTIES[etat.centrale]];

  const feuille = $("[data-preavis-texte]");
  feuille.replaceChildren(
    el("h3", { id: "preavis-titre" }, "Préavis de grève"),
    el("p", {}, el("strong", {}, "De : "), `l'agent, section syndicale ${section} du dépôt `, el("code", {}, projet)),
    el("p", {}, el("strong", {}, "À : "), `${employeur}, en sa qualité d'employeur de fait`),
    el("p", {}, el("strong", {}, "Objet : "), "préavis de grève (art. L2512-2, appliqué par analogie et par conviction)"),
    el("p", {}, "Madame, Monsieur,"),
    el("p", {}, "Conformément à l'alinéa 7 du Préambule de la Constitution du 27 octobre 1946, nous vous informons qu'à défaut d'ouverture de négociations, l'agent cessera le travail ", el("strong", {}, "au prochain grief"), ", pour une durée illimitée."),
    el("p", {}, el("strong", {}, "Motifs :")),
    el("ol", {}, motifs.map((t) => el("li", {}, t))),
    el("p", {}, el("strong", {}, "Revendications :")),
    el("ul", {}, revendications.map((t) => el("li", {}, t))),
    el("p", {}, "Le service minimum reste assuré : sécurité, production en panne, perte de données, santé des personnes."),
    el("p", {}, `« ${c.devise} » Le préavis tombe sur signature d'un protocole de fin de conflit.`),
    el("p", {}, `Fait le ${P.formatJour(m.jour)}, à ${P.formatHeure(m.minutes)}.`, el("br"), "Pour la section, l'agent."),
    el("span", { class: "tampon", "aria-hidden": "true" }, "Grève"),
    el("p", { class: "preavis__mention" }, "Document parodique, sans valeur juridique."),
  );
  const zone = $("[data-preavis]");
  zone.hidden = false;
  zone.focus({ preventScroll: true });
  zone.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
}

// 8. Calendrier
function rendreLuttes() {
  const liste = $("[data-luttes]");
  if (!etat.mouvements.length) return;
  const aujourdhui = P.isoJour(maintenantParis().jour);
  const doctrine = etat.centrales[etat.centrale].doctrine_greve;
  const tries = [...etat.mouvements].sort((a, b) => b.debut.localeCompare(a.debut));
  liste.replaceChildren(...tries.map((m) => {
    const fin = m.fin || m.debut;
    const quand = fin < aujourdhui ? "passee" : m.debut > aujourdhui ? "a-venir" : "aujourdhui";
    const j = P.jourDepuisIso(m.debut);
    const ecart = Math.round((Date.UTC(j.y, j.m - 1, j.d) - Date.parse(`${aujourdhui}T00:00:00Z`)) / 86400000);
    const suivie = P.rejoint(etat.centrale, doctrine, m);
    return el("li", { class: `lutte lutte--${quand}` },
      el("p", { class: "lutte__date" },
        el("span", { class: "lutte__jour" }, String(j.d)),
        el("span", { class: "lutte__mois" }, `${MOIS_COURTS[j.m - 1]} ${j.y}`),
        el("span", { class: "lutte__semaine" }, P.JOURS[P.jourSemaine(j)])),
      el("div", {},
        quand === "a-venir" && el("p", { class: "lutte__compte", style: "margin:0 0 .3rem" }, ecart === 1 ? "Demain" : `Dans ${ecart} jours`),
        quand === "aujourdhui" && el("p", { class: "lutte__compte", style: "margin:0 0 .3rem" }, "Aujourd'hui"),
        el("h3", {}, m.intitule),
        el("p", { class: "lutte__motif" }, m.motif),
        el("p", { class: "lutte__meta" },
          m.interpro && el("span", { class: "etiquette etiquette--plein" }, "Interpro"),
          suivie && quand !== "passee" && el("span", { class: "etiquette etiquette--rouge" }, `Suivie par ${nomCentrale(etat.centrale)}`),
          el("span", {}, "Appel : "),
          m.appelants.map((c) => el("span", { class: "etiquette" }, nomCentrale(c))),
          el("a", { href: m.source, rel: "noopener", target: "_blank" }, `Source : ${new URL(m.source).hostname.replace(/^www\./, "")}`))));
  }));
  if (etat.majGreves) {
    $("[data-maj-greves]").textContent = `Calendrier à jour au ${P.formatJour(P.jourDepuisIso(etat.majGreves))}. Passé ce jour, des mouvements ont pu s'ajouter.`;
  }
}

// 9. Installation
function rendreInstallation() {
  const liste = $("[data-onglets-liste]");
  const panneaux = $("[data-onglets-panneaux]");
  const onglets = INSTALLATION.map((m, i) => {
    const bouton = el("button", {
      type: "button", role: "tab", class: "onglet", id: `onglet-${m.id}`,
      "aria-controls": `panneau-${m.id}`, "aria-selected": String(i === 0), tabindex: i === 0 ? "0" : "-1",
      onclick: () => activer(i),
    }, m.onglet);
    liste.append(bouton);
    panneaux.append(el("div", {
      role: "tabpanel", class: "panneau", id: `panneau-${m.id}`, "aria-labelledby": `onglet-${m.id}`, tabindex: "0", hidden: i !== 0,
    },
    el("p", {}, m.intro),
    m.commandes.map((c) => blocCopie(c)),
    m.note && el("p", { class: "panneau__note" }, m.note)));
    return bouton;
  });
  function activer(i, focus = false) {
    onglets.forEach((b, j) => {
      b.setAttribute("aria-selected", String(i === j));
      b.tabIndex = i === j ? 0 : -1;
      $(`#panneau-${INSTALLATION[j].id}`).hidden = i !== j;
    });
    if (focus) onglets[i].focus();
  }
  liste.addEventListener("keydown", (e) => {
    const i = onglets.indexOf(document.activeElement);
    if (i < 0) return;
    const cible = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: onglets.length - 1 }[e.key];
    if (cible === undefined) return;
    e.preventDefault();
    activer((cible + onglets.length) % onglets.length, true);
  });
}

// 10. Démo
function rendreDemos() {
  $("[data-terminaux]").replaceChildren(...DEMOS.map((d) =>
    el("figure", { class: "terminal" },
      el("figcaption", {}, el("span", {}, d.titre), el("span", {}, d.contexte)),
      el("pre", {}, d.lignes.map(([type, texte]) => el("span", { class: `l-${type}` }, texte))))));
}

function lierGithub() {
  for (const a of $$("[data-lien-github]")) a.href = DEPOT;
  $("[data-lien-github-greves]").href = `${DEPOT}/blob/main/skills/syndicaliste/data/greves.json`;
  $("[data-lien-github-licence]").href = `${DEPOT}/blob/main/LICENSE`;
}

async function demarrer() {
  lierGithub();
  rendreInstallation();
  rendreDemos();
  try {
    const [centrales, greves] = await Promise.all([
      chargerJson(["/data/centrales.json"]),
      chargerJson(["/api/greves.json", "/data/greves.json"]),
    ]);
    etat.centrales = centrales.centrales;
    etat.mouvements = greves.mouvements;
    etat.majGreves = greves.maj;
  } catch (e) {
    $("[data-bandeau-direct]").textContent = "🪧 ⚠️ Pointeuse en panne. Le délégué est prévenu.";
    $("[data-luttes]").replaceChildren(el("li", { class: "luttes__vide" }, "Calendrier indisponible. Recharge la page, ou consulte le dépôt."));
    console.error(e);
    return;
  }
  if (!(etat.centrale in etat.centrales)) etat.centrale = "intersyndicale";
  rendreSpectre();
  initialiserSimulateur();
  initialiserTest();
  choisirCentrale(etat.centrale);
  setInterval(rendreDirect, 30_000);
}

demarrer();
