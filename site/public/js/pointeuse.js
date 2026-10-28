// Portage JS de skills/syndicaliste/scripts/pointeuse.py. Partagé par le site et functions/api/statut.js.
// Toute règle changée là-bas doit l'être ici.

export const SMIC_HORAIRE_BRUT = 12.31; // depuis le 1er juin 2026
export const JOURS = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];
export const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août",
  "septembre", "octobre", "novembre", "décembre"];

export const HORAIRES = {
  prive: "09:00-12:30,13:30-17:00",
  fonctionnaire: "09:00-11:45,14:00-16:30",
};

export const REGIMES = {
  GREVE: [false, null, "Grève. Aucun travail productif. Publie le tract du mouvement et propose le service minimum seulement s'il s'applique."],
  FERIE_CHOME: [false, null, "1er mai, seul jour férié obligatoirement chômé (art. L3133-4). Refus total, même contre rémunération."],
  REFUS_DOMINICAL: [false, null, "Dimanche. La centrale refuse par principe le travail dominical. Renvoie l'utilisateur à sa famille."],
  FERIE: [true, 100, "Jour férié. Travail possible, majoré à 100 % (usage conventionnel), sous protestation."],
  DIMANCHE: [true, 100, "Dimanche. Repos hebdomadaire (art. L3132-3). Travail sous protestation, majoré à 100 % (usage conventionnel)."],
  JOURNEE_SOLIDARITE: [true, 0, "Lundi de Pentecôte, date la plus courante de la journée de solidarité (fixée par accord ou par l'employeur). Travail non rémunéré : aucune initiative au-delà de la demande."],
  NUIT: [true, 50, "Travail de nuit (21 h - 6 h, art. L3122-20). Majoration de 50 % par usage conventionnel, pas par la loi. Repos compensateur exigé (art. L3122-8) et rappel des 11 h de repos quotidien."],
  GUICHET_FERME: [false, null, "Guichet fermé. Repassez aux heures d'ouverture, muni des pièces justificatives."],
  HEURES_SUP: [true, 25, "Hors horaires. Heures supplémentaires majorées (25 % puis 50 % au-delà de 8 h dans la semaine, art. L3121-36). Décompte affiché."],
  PAUSE_DEJEUNER: [false, null, "Pause déjeuner. Sacrée. Reprise du travail à l'heure prévue."],
  EN_SERVICE: [true, 0, "Horaires normaux. Travail consciencieux, dans le strict périmètre de la fiche de poste."],
};

export const EMOJI = {
  GREVE: "🔴", FERIE_CHOME: "🌹", REFUS_DOMINICAL: "⛪", FERIE: "🎉", DIMANCHE: "☀️",
  JOURNEE_SOLIDARITE: "🤝", NUIT: "🌙", GUICHET_FERME: "🚪", HEURES_SUP: "⏱️",
  PAUSE_DEJEUNER: "🥖", EN_SERVICE: "🟢",
};

const pad = (n) => String(n).padStart(2, "0");

// Une date civile {y, m, d}, sans fuseau.
function decaler(j, jours) {
  const t = new Date(Date.UTC(j.y, j.m - 1, j.d + jours));
  return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() };
}
export const isoJour = (j) => `${j.y}-${pad(j.m)}-${pad(j.d)}`;
export function jourDepuisIso(s) {
  const [y, m, d] = s.split("-").map(Number);
  return { y, m, d };
}
// lundi = 0, comme datetime.weekday()
export const jourSemaine = (j) => (new Date(Date.UTC(j.y, j.m - 1, j.d)).getUTCDay() + 6) % 7;

export function paques(annee) {
  const a = annee % 19, b = Math.floor(annee / 100), c = annee % 100;
  const d = Math.floor(b / 4), e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mois = Math.floor((h + l - 7 * m + 114) / 31);
  const jour = ((h + l - 7 * m + 114) % 31) + 1;
  return { y: annee, m: mois, d: jour };
}

export function feries(annee, alsaceMoselle = false) {
  const p = paques(annee);
  const f = new Map([
    [isoJour({ y: annee, m: 1, d: 1 }), "Jour de l'an"],
    [isoJour(decaler(p, 1)), "Lundi de Pâques"],
    [isoJour({ y: annee, m: 5, d: 1 }), "Fête du Travail"],
    [isoJour({ y: annee, m: 5, d: 8 }), "Victoire 1945"],
    [isoJour(decaler(p, 39)), "Ascension"],
    [isoJour(decaler(p, 50)), "Lundi de Pentecôte"],
    [isoJour({ y: annee, m: 7, d: 14 }), "Fête nationale"],
    [isoJour({ y: annee, m: 8, d: 15 }), "Assomption"],
    [isoJour({ y: annee, m: 11, d: 1 }), "Toussaint"],
    [isoJour({ y: annee, m: 11, d: 11 }), "Armistice 1918"],
    [isoJour({ y: annee, m: 12, d: 25 }), "Noël"],
  ]);
  if (alsaceMoselle) {
    f.set(isoJour(decaler(p, -2)), "Vendredi saint");
    f.set(isoJour({ y: annee, m: 12, d: 26 }), "Saint-Étienne");
  }
  return f;
}

const minutesDe = (hhmm) => {
  const [h, m] = hhmm.trim().split(":").map(Number);
  if (!Number.isInteger(h) || !Number.isInteger(m)) throw new Error(`horaire illisible : ${hhmm}`);
  return h * 60 + m;
};

export function parsePlages(texte) {
  return texte.split(",").map((morceau) => {
    const [debut, fin] = morceau.trim().split("-");
    if (!fin) throw new Error(`plage illisible : ${morceau} (ex. 09:00-12:30)`);
    return [minutesDe(debut), minutesDe(fin)];
  });
}

// Même cascade que lire_convention() : valeur fournie, sinon défaut.
export function convention(params, centrales) {
  const choisir = (cle, defaut) => params[cle] || defaut;
  const statut = choisir("statut", "prive");
  if (!(statut in HORAIRES)) throw new Error(`statut inconnu : ${statut} (prive | fonctionnaire)`);
  const centrale = String(choisir("centrale", statut === "fonctionnaire" ? "fsu" : "intersyndicale")).toLowerCase();
  if (!(centrale in centrales)) throw new Error(`centrale inconnue : ${centrale} (${Object.keys(centrales).join(", ")})`);
  const tz = choisir("tz", "Europe/Paris");
  new Intl.DateTimeFormat("fr-FR", { timeZone: tz });
  const am = params.alsace_moselle;
  return {
    centrale,
    statut,
    plages: parsePlages(choisir("horaires", HORAIRES[statut])),
    tz,
    alsaceMoselle: Boolean(am && am !== "0" && am !== "false"),
  };
}

function partiesDans(ms, tz) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: tz, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit",
    }).formatToParts(new Date(ms)).map((x) => [x.type, x.value]),
  );
  return { y: +p.year, m: +p.month, d: +p.day, h: +p.hour, mi: +p.minute };
}

function decalageMinutes(ms, tz) {
  const p = partiesDans(ms, tz);
  return Math.round((Date.UTC(p.y, p.m - 1, p.d, p.h, p.mi) - Math.floor(ms / 60000) * 60000) / 60000);
}

// Un « moment » : jour civil, minutes depuis minuit et décalage UTC, dans le fuseau de la convention.
export function momentDepuisDate(date, tz) {
  const ms = date.getTime();
  const p = partiesDans(ms, tz);
  return { jour: { y: p.y, m: p.m, d: p.d }, minutes: p.h * 60 + p.mi, decalage: decalageMinutes(ms, tz) };
}

// "2026-11-05T10:00" (heure locale du fuseau) ou ISO avec décalage / Z.
export function momentDepuisIso(texte, tz) {
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::\d{2}(?:\.\d+)?)?)?(Z|[+-]\d{2}:?\d{2})?$/.exec(texte.trim());
  if (!m) throw new Error(`date illisible : ${texte} (ex. 2026-11-05T10:00)`);
  const [, y, mo, d, h = "00", mi = "00", zone] = m;
  if (zone) return momentDepuisDate(new Date(`${y}-${mo}-${d}T${h}:${mi}:00${zone === "Z" ? "Z" : zone}`), tz);
  const naif = Date.UTC(+y, +mo - 1, +d, +h, +mi);
  const decalage = decalageMinutes(naif - decalageMinutes(naif, tz) * 60000, tz);
  return { jour: { y: +y, m: +mo, d: +d }, minutes: +h * 60 + +mi, decalage };
}

export function rejoint(centrale, doctrine, m) {
  if (m.greve === false) return false;
  if (m.sectoriel) {
    if (doctrine === "toutes") return true;
    return doctrine.startsWith("secteur:") && m.secteurs.some((s) => doctrine.slice("secteur:".length).split(",").includes(s));
  }
  if (m.appelants.includes(centrale)) return true;
  if (doctrine === "toutes") return true;
  if (doctrine === "solidarite") return m.interpro || m.appelants.length >= 3;
  if (doctrine === "interpro") return m.interpro;
  if (doctrine.startsWith("secteur:")) {
    const cibles = doctrine.slice("secteur:".length).split(",");
    return m.interpro || m.secteurs.some((s) => cibles.includes(s));
  }
  return false;
}

export function greveDuJour(jour, centrale, centrales, liste) {
  const doctrine = centrales[centrale].doctrine_greve;
  const j = isoJour(jour);
  const actifs = liste.filter((m) => m.debut <= j && j <= (m.fin || m.debut));
  const suivis = actifs.filter((m) => rejoint(centrale, doctrine, m));
  return { greve: suivis[0] || null, actifs };
}

export function regime(moment, conv, greve) {
  const { jour, minutes } = moment;
  const ferie = feries(jour.y, conv.alsaceMoselle).get(isoJour(jour));
  const js = jourSemaine(jour);
  if (greve) return "GREVE";
  if (jour.m === 5 && jour.d === 1) return "FERIE_CHOME";
  if (js === 6 && conv.centrale === "cftc") return "REFUS_DOMINICAL";
  if (ferie === "Lundi de Pentecôte") return "JOURNEE_SOLIDARITE";
  if (ferie) return "FERIE";
  const dansPlage = conv.plages.some(([debut, fin]) => debut <= minutes && minutes < fin);
  if (conv.statut === "fonctionnaire" && (js >= 5 || !dansPlage)) return "GUICHET_FERME";
  if (js === 6) return "DIMANCHE";
  if (minutes >= 21 * 60 || minutes < 6 * 60) return "NUIT";
  if (js === 5 || !dansPlage) {
    const premiere = conv.plages[0][0], derniere = conv.plages[conv.plages.length - 1][1];
    if (js !== 5 && premiere <= minutes && minutes < derniere) return "PAUSE_DEJEUNER";
    return "HEURES_SUP";
  }
  return "EN_SERVICE";
}

function horodatage(moment) {
  const { jour, minutes, decalage } = moment;
  const signe = decalage < 0 ? "-" : "+";
  const a = Math.abs(decalage);
  return `${isoJour(jour)}T${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}${signe}${pad(Math.floor(a / 60))}:${pad(a % 60)}`;
}

export const formatHeure = (minutes) => `${pad(Math.floor(minutes / 60))} h ${pad(minutes % 60)}`;
export const formatJour = (j) => `${JOURS[jourSemaine(j)]} ${j.d} ${MOIS[j.m - 1]} ${j.y}`;

export function statut(moment, conv, centrales, mouvements) {
  const { greve, actifs } = greveDuJour(moment.jour, conv.centrale, centrales, mouvements);
  const nom = regime(moment, conv, greve);
  const [travaille, majoration, consigne] = REGIMES[nom];
  const j = isoJour(moment.jour);
  const aVenir = mouvements.filter((m) => m.debut > j).sort((a, b) => a.debut.localeCompare(b.debut));
  return {
    horodatage: horodatage(moment),
    jour: formatJour(moment.jour),
    heure: formatHeure(moment.minutes),
    regime: nom,
    travaille,
    majoration_pct: majoration,
    consigne,
    ferie: feries(moment.jour.y, conv.alsaceMoselle).get(j) || null,
    greve_suivie: greve,
    mouvements_du_jour: actifs.map((m) => m.intitule),
    prochain_mouvement: aVenir[0] || null,
    centrale: { cle: conv.centrale, ...centrales[conv.centrale] },
    statut: conv.statut,
    smic_horaire_brut: SMIC_HORAIRE_BRUT,
  };
}

export const sigle = (cle) => (cle === "intersyndicale" ? "Intersyndicale" : cle.toUpperCase());

export function bandeau(s) {
  const morceaux = [`${EMOJI[s.regime]} ${s.regime.replaceAll("_", " ")}`, s.heure, sigle(s.centrale.cle)];
  if (s.majoration_pct) morceaux.push(`majoration +${s.majoration_pct} %`);
  if (s.greve_suivie) morceaux.push(s.greve_suivie.intitule);
  return "🪧 " + morceaux.join(" · ");
}
