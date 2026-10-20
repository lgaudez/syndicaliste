import * as P from "./pointeuse.js";

const LANG = document.documentElement.lang.startsWith("en") ? "en" : "fr";
const T = (await import(LANG === "en" ? "./textes-en.js" : "./textes-fr.js")).default;
const U = T.ui;

// À VÉRIFIER AVANT PUBLICATION : dépôt, commandes d'installation, transcripts (dans textes-*.js).
const DEPOT = "https://github.com/lgaudez/syndicaliste";

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
  for (const e of enfants.flat(Infinity)) if (e != null && e !== false) n.append(e);
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
  notifier(U.copie);
  if (bouton) {
    const avant = bouton.textContent;
    bouton.textContent = U.copieBouton;
    setTimeout(() => (bouton.textContent = avant), 1500);
  }
}

const blocCopie = (code, libelle = U.copier, classe = "") =>
  el("div", { class: `copie ${classe}`.trim() },
    el("pre", {}, el("code", { text: code })),
    el("button", { type: "button", "aria-label": `${libelle} : ${code.split("\n")[0].slice(0, 80)}`, onclick: (e) => copier(code, e.currentTarget) }, U.copier));

const pad = (n) => String(n).padStart(2, "0");
const momentLocalIso = (m) => `${P.isoJour(m.jour)}T${pad(Math.floor(m.minutes / 60))}:${pad(m.minutes % 60)}`;
const nomCentrale = (cle) => P.sigle(cle);
const hote = (url) => new URL(url).hostname.replace(/^www\./, "");

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
  return T.dateCourte(j, T.MOIS_COURTS[j.m - 1]);
}

function calculer(params, moment) {
  const conv = P.convention(params, etat.centrales);
  const s = P.statut(moment, conv, etat.centrales, etat.mouvements);
  return { conv, s };
}

// 1. Bandeau en direct (le bandeau reste en français, comme celui du skill)
function rendreDirect() {
  const moment = maintenantParis();
  const { s } = calculer({ centrale: etat.centrale }, moment);
  $("[data-bandeau-direct]").textContent = P.bandeau(s);
  $("[data-consigne-direct]").textContent = T.consigne(s.regime);

  const tampon = $("[data-tampon-affiche]");
  if (s.regime === "GREVE") tampon.textContent = U.enGreve;
  else {
    const prochaine = prochaineGreveSuivie(etat.centrale, P.isoJour(moment.jour));
    tampon.textContent = prochaine ? U.greveLe(dateCourte(prochaine.debut)) : U.pretGreve;
  }

  const carte = { REFUS_DOMINICAL: "DIMANCHE", FERIE_CHOME: "FERIE" }[s.regime] || s.regime;
  for (const li of $$("[data-regimes] .pointage")) {
    const actuel = li.dataset.regime === carte;
    li.classList.toggle("pointage--actuel", actuel);
    $(".pointage__actuel", li)?.remove();
    if (actuel) li.prepend(el("span", { class: "pointage__actuel" }, U.enCeMoment));
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
  if (T.DOCTRINES[d]) return T.DOCTRINES[d];
  const secteurs = d.replace("secteur:", "").split(",").map((s) => T.SECTEURS[s]).filter(Boolean);
  return T.doctrineSecteurs(secteurs);
}

function rendreFiche(cle) {
  const c = T.centrale(cle, etat.centrales[cle]);
  const prochaine = prochaineGreveSuivie(cle, P.isoJour(maintenantParis().jour));
  const config = `{"centrale": "${cle}"}`;
  $("[data-fiche-centrale]").replaceChildren(
    el("p", { class: "fiche-centrale__devise" }, U.cite(c.devise)),
    el("div", {},
      el("h3", { class: "fiche-centrale__nom" }, c.nom),
      el("p", {}, c.fondee ? U.fondee(c.fondee, c.bord) : `${c.bord}.`),
      el("dl", {},
        el("dt", {}, U.ton), el("dd", {}, c.ton),
        el("dt", {}, U.doctrine), el("dd", {}, doctrineEnClair(c.doctrine_greve)),
        el("dt", {}, U.prochaineSuivie),
        el("dd", {}, prochaine ? `${T.jour(P.jourDepuisIso(prochaine.debut))}${U.sep}${T.mouvement(prochaine).intitule}` : U.aucuneProchaine))),
    el("div", {},
      el("p", {}, U.adopter[0], el("code", {}, ".syndicat/convention.json"), U.adopter[1]),
      blocCopie(config, U.copierConfig),
      el("p", { style: "margin-top:1rem" }, U.dansConversation, el("em", {}, U.passeA(cle, nomCentrale(cle))), "."),
      el("p", {}, el("em", {}, T.CRIS[cle]))),
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
      "aria-label": `${nomCentrale(cle)} : ${T.centrale(cle, c).nom}`,
      style: `--x:${x.toFixed(3)};--baton:${i % 2 ? 3.2 : 8}rem;--penche:${(i % 3) - 1}deg`,
      onclick: () => choisirCentrale(cle),
    },
    el("span", { class: "pancarte__panneau" }, nomCentrale(cle), el("small", {}, c.fondee ? String(c.fondee) : U.frontCommun)),
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
  let conv, s, moment;
  try {
    const params = {
      centrale: donnees.get("centrale"),
      statut: donnees.get("statut"),
      alsace_moselle: donnees.get("alsace_moselle") ? "1" : "",
    };
    moment = P.momentDepuisIso(donnees.get("moment") || momentLocalIso(maintenantParis()), "Europe/Paris");
    ({ conv, s } = calculer(params, moment));
  } catch (e) {
    resultat.replaceChildren(el("p", {}, U.pointeuseRefuse(e.message)));
    return;
  }
  const tampon = s.regime === "GREVE"
    ? el("span", { class: "tampon tampon--rouge", "aria-hidden": "true" }, U.tamponGreve)
    : s.travaille
      ? el("span", { class: "tampon tampon--encre", "aria-hidden": "true" }, s.majoration_pct ? `+${s.majoration_pct} %` : U.tamponPointe)
      : el("span", { class: "tampon tampon--rouge", "aria-hidden": "true" }, s.regime === "GUICHET_FERME" ? U.tamponRepassez : U.tamponRefuse);
  const prochaine = prochaineGreveSuivie(conv.centrale, P.isoJour(moment.jour));
  const nonSuivis = s.greve_suivie ? [] : s.mouvements_du_jour;
  const greve = s.greve_suivie && T.mouvement(s.greve_suivie);
  resultat.replaceChildren(...[
    tampon,
    el("p", { class: "ticket__bandeau", lang: "fr" }, P.bandeau(s)),
    el("p", { class: "ticket__jour" }, `${T.jour(moment.jour)}, ${T.heure(moment.minutes)}${s.ferie ? ` · ${T.ferie(s.ferie)}` : ""} · ${U.travaille(s.travaille)}`),
    el("p", { class: "ticket__consigne" }, T.consigne(s.regime)),
    greve && el("div", { class: "ticket__greve" },
      el("strong", {}, greve.intitule),
      el("p", { style: "margin:.3rem 0" }, greve.motif),
      el("a", { href: greve.source, rel: "noopener", target: "_blank" }, U.source(hote(greve.source)))),
    nonSuivis.length > 0 && el("p", { class: "ticket__prochain" },
      U.nonSuivis(nonSuivis.map((intitule) => T.mouvement({ intitule }).intitule))),
    !s.greve_suivie && el("p", { class: "ticket__prochain" },
      prochaine ? U.prochaineGreve(T.jour(P.jourDepuisIso(prochaine.debut))) : U.aucuneHorizon),
  ].filter(Boolean));
}

function initialiserSimulateur() {
  const form = $("[data-simulateur]");
  const select = $("[data-select-centrale]");
  for (const [cle, c] of Object.entries(etat.centrales).sort((a, b) => a[1].axe - b[1].axe)) {
    select.append(el("option", { value: cle }, `${nomCentrale(cle)} (${T.centrale(cle, c).devise})`));
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
  for (const r of T.REGLES) {
    const trouves = [...texte.matchAll(r.re)].map((m) => m[0]);
    if (!trouves.length) continue;
    let n = r.griefs;
    if (r.id === "cadence" || r.id === "refaire") n = trouves.length >= 3 ? 2 : 1;
    griefs.push({ ...r, n, extrait: [...new Set(trouves.map((t) => t.toLowerCase()))].slice(0, 3).join(", ") });
  }
  if (T.CONTRADICTION.court.test(texte) && T.CONTRADICTION.long.test(texte)) griefs.push({ ...T.CONTRADICTION.grief });
  const vues = T.OBSERVATIONS.filter((o) => { o.re.lastIndex = 0; return o.re.test(texte); });
  T.OBSERVATIONS.forEach((o) => (o.re.lastIndex = 0));
  if (etat.centrale === "cftc" && vues.some((o) => o.id === "dimanche")) griefs.push({ ...T.DOMINICAL });
  const abus = griefs.some((g) => g.abus);
  let total = griefs.reduce((s, g) => s + g.n, 0);
  T.POLITESSE.lastIndex = 0;
  const politesse = T.POLITESSE.test(texte);
  T.POLITESSE.lastIndex = 0;
  let geste = false;
  if (politesse && !abus && total > 0) { total -= 1; geste = true; }
  T.SERVICE_MINIMUM.lastIndex = 0;
  const service = T.SERVICE_MINIMUM.test(texte);
  T.SERVICE_MINIMUM.lastIndex = 0;
  return { texte, griefs, observations: vues.map((o) => o.texte), total, niveau: Math.min(total, 3), abus, politesse, geste, service };
}

function reponseSyndicale(a) {
  const R = U.reponses;
  const aujourdhui = P.isoJour(maintenantParis().jour);
  const lignes = [];
  if (a.service) lignes.push(R.service);
  const premier = a.griefs[0];
  if (a.niveau === 0) {
    lignes.push(a.griefs.length ? R.geste : R.conforme);
  } else if (a.niveau === 1) {
    lignes.push(R.grief1(premier.article));
  } else if (a.niveau === 2) {
    lignes.push(R.grief2(aujourdhui));
    lignes.push(R.zele);
  } else {
    lignes.push(a.service ? R.grief3service : R.grief3);
    lignes.push(R.requete(aujourdhui));
    if (a.abus) lignes.push(R.demeure(aujourdhui));
  }
  if (a.observations.length) lignes.push(...a.observations);
  if (a.geste) lignes.push(R.politesse);
  if (a.niveau >= 1) lignes.push(T.CRIS[etat.centrale]);
  if (a.niveau >= 1) lignes.push(R.sortie);
  return lignes;
}

function rendreVerdict(a) {
  const zone = $("[data-verdict]");
  const classes = ["tampon--bleu", "tampon--encre", "tampon--rouge", "tampon--rouge"];
  const { s } = calculer({ centrale: etat.centrale }, maintenantParis());
  zone.replaceChildren(
    el("div", { class: "verdict__tete" },
      el("span", { class: `tampon ${classes[a.niveau]}` }, U.tampons[a.niveau]),
      el("p", { class: "jauge", "aria-label": U.jaugeLabel(a.niveau) },
        [0, 1, 2].map((i) => el("span", { class: i < a.niveau ? "plein" : "", "aria-hidden": "true" })),
        el("b", { "aria-hidden": "true" }, U.griefs(a.niveau)))),
    a.griefs.length
      ? el("ul", {}, a.griefs.map((g) => el("li", {}, el("strong", {}, g.titre), `${U.sep}${U.cite(g.extrait)}`, el("em", {}, g.article))))
      : el("p", {}, U.aucunGrief),
    el("div", { class: "reponse" },
      el("p", { class: "reponse__bandeau", lang: "fr" }, `${P.bandeau(s)} · griefs ${a.niveau}/3`),
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
    form.elements.prompt.value = T.EXEMPLES[iExemple++ % T.EXEMPLES.length];
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
  const V = U.preavis;
  const form = $("[data-test-prompt]");
  const texte = form.elements.prompt.value.trim();
  const a = texte ? analyser(texte) : etat.analyse;
  const employeur = $("#employeur").value.trim() || V.employeur;
  const projet = $("#projet").value.trim() || V.projet;
  const m = maintenantParis();
  const c = T.centrale(etat.centrale, etat.centrales[etat.centrale]);
  const section = etat.centrale === "intersyndicale" ? (V.intersyndicale ?? "intersyndicale") : nomCentrale(etat.centrale);
  const griefs = a?.griefs ?? [];
  const motifs = griefs.length ? griefs.map(V.motif) : [V.aucunMotif];
  const revendications = [...new Set(griefs.map((g) => g.revendication)), V.reconnaissance, T.CONTREPARTIES[etat.centrale]];

  const feuille = $("[data-preavis-texte]");
  feuille.replaceChildren(
    el("h3", { id: "preavis-titre" }, V.titre),
    V.sousTitre && el("p", { class: "preavis__soustitre" }, V.sousTitre),
    el("p", {}, el("strong", {}, V.de), V.deTexte(section), el("code", {}, projet)),
    el("p", {}, el("strong", {}, V.a), V.aTexte(employeur)),
    el("p", {}, el("strong", {}, V.objet), V.objetTexte),
    el("p", {}, V.formule),
    el("p", {}, V.corps[0], el("strong", {}, V.corps[1]), V.corps[2]),
    el("p", {}, el("strong", {}, V.motifs)),
    el("ol", {}, motifs.map((t) => el("li", {}, t))),
    el("p", {}, el("strong", {}, V.revendications)),
    el("ul", {}, revendications.map((t) => el("li", {}, t))),
    el("p", {}, V.service),
    el("p", {}, V.devise(c.devise)),
    el("p", {}, V.fait(T.jour(m.jour), T.heure(m.minutes)), el("br"), V.signature),
    el("span", { class: "tampon", "aria-hidden": "true" }, V.tampon),
    el("p", { class: "preavis__mention" }, V.mention),
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
  liste.replaceChildren(...tries.map((brut) => {
    const m = T.mouvement(brut);
    const fin = m.fin || m.debut;
    const quand = fin < aujourdhui ? "passee" : m.debut > aujourdhui ? "a-venir" : "aujourdhui";
    const j = P.jourDepuisIso(m.debut);
    const ecart = Math.round((Date.UTC(j.y, j.m - 1, j.d) - Date.parse(`${aujourdhui}T00:00:00Z`)) / 86400000);
    const suivie = P.rejoint(etat.centrale, doctrine, brut);
    return el("li", { class: `lutte lutte--${quand}` },
      el("p", { class: "lutte__date" },
        el("span", { class: "lutte__jour" }, String(j.d)),
        el("span", { class: "lutte__mois" }, `${T.MOIS_COURTS[j.m - 1]} ${j.y}`),
        el("span", { class: "lutte__semaine" }, T.JOURS[P.jourSemaine(j)])),
      el("div", {},
        quand === "a-venir" && el("p", { class: "lutte__compte", style: "margin:0 0 .3rem" }, ecart === 1 ? U.demain : U.dansJours(ecart)),
        quand === "aujourdhui" && el("p", { class: "lutte__compte", style: "margin:0 0 .3rem" }, U.aujourdhui),
        el("h3", {}, m.intitule),
        el("p", { class: "lutte__motif" }, m.motif),
        el("p", { class: "lutte__meta" },
          m.interpro && el("span", { class: "etiquette etiquette--plein" }, U.interpro),
          suivie && quand !== "passee" && el("span", { class: "etiquette etiquette--rouge" }, U.suiviePar(nomCentrale(etat.centrale))),
          el("span", {}, U.appel),
          m.appelants.map((c) => el("span", { class: "etiquette" }, nomCentrale(c))),
          el("a", { href: m.source, rel: "noopener", target: "_blank" }, U.source(hote(m.source))))));
  }));
  if (etat.majGreves) {
    $("[data-maj-greves]").textContent = U.majGreves(T.jour(P.jourDepuisIso(etat.majGreves)));
  }
}

// Onglets (installation, grand public)
function rendreOnglets(racine, items, prefixe, contenu) {
  const liste = $("[data-onglets-liste]", racine);
  const panneaux = $("[data-onglets-panneaux]", racine);
  const onglets = items.map((m, i) => {
    const bouton = el("button", {
      type: "button", role: "tab", class: "onglet", id: `${prefixe}-onglet-${m.id}`,
      "aria-controls": `${prefixe}-panneau-${m.id}`, "aria-selected": String(i === 0), tabindex: i === 0 ? "0" : "-1",
      onclick: () => activer(i),
    }, m.onglet);
    liste.append(bouton);
    panneaux.append(el("div", {
      role: "tabpanel", class: "panneau", id: `${prefixe}-panneau-${m.id}`, "aria-labelledby": `${prefixe}-onglet-${m.id}`, tabindex: "0", hidden: i !== 0,
    }, contenu(m)));
    return bouton;
  });
  function activer(i, focus = false) {
    onglets.forEach((b, j) => {
      b.setAttribute("aria-selected", String(i === j));
      b.tabIndex = i === j ? 0 : -1;
      $(`#${prefixe}-panneau-${items[j].id}`).hidden = i !== j;
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

// 9. Installation
function rendreInstallation() {
  rendreOnglets($("[data-onglets]"), T.INSTALLATION, "install", (m) => [
    el("p", {}, m.intro),
    m.commandes.map((c) => blocCopie(c)),
    m.note && el("p", { class: "panneau__note" }, m.note),
  ]);
}

// 1 bis. Grand public : le texte à coller vient de grand-public/ (copié par sync.sh)
async function rendreGrandPublic() {
  const racine = $("[data-grand-public]");
  if (!racine) return;
  rendreOnglets(racine, T.GRAND_PUBLIC, "gp", (m) => el("ol", { class: "etapes" }, m.etapes.map((e) => el("li", {}, e))));
  const zone = $("[data-consignes-grand-public]", racine);
  try {
    const r = await fetch(`/data/instructions-${LANG}.txt`);
    const type = r.headers.get("content-type") || "";
    if (!r.ok || type.includes("html")) throw new Error(`instructions-${LANG}.txt : ${r.status}`);
    const texte = (await r.text()).trim();
    zone.replaceChildren(blocCopie(texte, U.copierConsignes, "copie--texte"));
  } catch (e) {
    zone.replaceChildren(el("p", { class: "panneau__note" }, U.consignesIndispo));
    console.warn(e.message);
  }
}

// 10. Démo
function rendreDemos() {
  $("[data-terminaux]").replaceChildren(...T.DEMOS.map((d) =>
    el("figure", { class: "terminal" },
      el("figcaption", {}, el("span", {}, d.titre), el("span", {}, d.contexte)),
      el("pre", {}, d.lignes.map(([type, texte]) => el("span", { class: `l-${type}`, lang: type === "bandeau" ? "fr" : null }, texte))))));
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
  rendreGrandPublic();
  try {
    const [centrales, greves] = await Promise.all([
      chargerJson(["/data/centrales.json"]),
      chargerJson(["/api/greves.json", "/data/greves.json"]),
    ]);
    etat.centrales = centrales.centrales;
    etat.mouvements = greves.mouvements;
    etat.majGreves = greves.maj;
  } catch (e) {
    $("[data-bandeau-direct]").textContent = U.pointeusePanne;
    $("[data-luttes]").replaceChildren(el("li", { class: "luttes__vide" }, U.calendrierIndispo));
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
