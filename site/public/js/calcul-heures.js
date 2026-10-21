// Calculateur d'heures sup pour humains. Tout en entiers : centimes, minutes, points de base (1 % = 100).
// Chaque ligne est arrondie au centime ROUND_HALF_UP, comme la pointeuse du skill (le demi-centime va au salarié).

export const SMIC_CENTIMES = 1231; // 12,31 € brut depuis le 1er juin 2026
export const DUREE_LEGALE_MINUTES = 35 * 60; // art. L3121-27
export const BANDE_25_MINUTES = 8 * 60; // art. L3121-36 : les 8 premières heures sup
export const MAXIMUM_SEMAINE_MINUTES = 48 * 60; // art. L3121-20

// Nombre décimal saisi par un humain : "12,31", "12.31", " 43 ". NaN si illisible ou négatif.
export function lireDecimal(texte) {
  const t = String(texte ?? "").trim().replace(/\s/g, "").replace(",", ".");
  if (!/^\d+(?:\.\d+)?$/.test(t)) return NaN;
  return Number(t);
}

export const versCentimes = (euros) => Math.round(euros * 100);
export const versMinutes = (heures) => Math.round(heures * 60);
export const versPointsDeBase = (pct) => Math.round(pct * 100);

// num / den arrondi au plus proche, demi vers le haut ; num et den entiers positifs.
const arrondi = (num, den) => Math.floor((2 * num + den) / (2 * den));

const montant = (minutes, centimes) => arrondi(minutes * centimes, 60);
const majore = (minutes, centimes, pdb) => arrondi(minutes * centimes * (10000 + pdb), 60 * 10000);
const majoration = (minutes, centimes, pdb) => arrondi(minutes * centimes * pdb, 60 * 10000);

function bande(minutes, centimes, pdb) {
  const total = majore(minutes, centimes, pdb);
  const base = montant(minutes, centimes);
  return { minutes, taux: pdb, base, majoration: total - base, total };
}

// Cass. soc. 22 mai 2019, n° 17-22.376 : les majorations de nuit et du dimanche entrent dans la base des heures sup.
// Une heure sup de nuit vaut donc taux × (1 + nuit) × (1 + 25 ou 50 %). Les bandes et la prime de nuit paient déjà
// taux × (1 + 25 ou 50 %) et taux × nuit ; il reste taux × nuit × (25 ou 50 %), la ligne « surSup ».
// Les entrées ne disent pas quelles heures sup tombent la nuit ou le dimanche : on compte les heures du dimanche, puis
// celles de nuit, comme les dernières de la semaine civile (le dimanche la clôt). C'est l'hypothèse la plus favorable :
// elles passent en heures sup, et à +50 %, en premier.
const surSup = (m25, m50, centimes, pdb) => {
  const num = BigInt(centimes) * BigInt(pdb) * BigInt(m25 * 2500 + m50 * 5000);
  const den = 60n * 10000n * 10000n;
  return Number((2n * num + den) / (2n * den));
};

// Tranche de `longueur` minutes sup qui finit `depuisFin` minutes avant la fin des heures sup : sa part à +50 %, puis à +25 %.
function tranche(depuisFin, longueur, m50) {
  const a50 = Math.max(0, Math.min(longueur, m50 - depuisFin));
  return { m25: longueur - a50, m50: a50 };
}

const conventionnelle = (minutes, pdb, centimes, { m25, m50 }) => ({
  minutes,
  taux: pdb,
  montant: majoration(minutes, centimes, pdb),
  minutesSup: m25 + m50,
  surSup: surSup(m25, m50, centimes, pdb),
});

// Entrées en unités entières. Les heures de nuit et du dimanche sont « dont » : comprises dans les minutes de la semaine.
export function calculer({ centimes, minutes, minutesNuit = 0, pdbNuit = 0, minutesDimanche = 0, pdbDimanche = 0 }) {
  const sup = Math.max(0, minutes - DUREE_LEGALE_MINUTES);
  const m25 = Math.min(sup, BANDE_25_MINUTES);
  const m50 = sup - m25;
  const b25 = bande(m25, centimes, 2500);
  const b50 = bande(m50, centimes, 5000);
  const supDimanche = Math.min(minutesDimanche, sup);
  const supNuit = Math.min(minutesNuit, sup - supDimanche);
  const dimanche = conventionnelle(minutesDimanche, pdbDimanche, centimes, tranche(0, supDimanche, m50));
  const nuit = conventionnelle(minutesNuit, pdbNuit, centimes, tranche(supDimanche, supNuit, m50));
  const normales = montant(Math.min(minutes, DUREE_LEGALE_MINUTES), centimes);
  const totalSup = b25.total + b50.total;
  const totalMajorationsConventionnelles = nuit.montant + dimanche.montant;
  const totalSurSup = nuit.surSup + dimanche.surSup;
  const alertes = [];
  if (minutes > MAXIMUM_SEMAINE_MINUTES) alertes.push("maximum");
  if (centimes < SMIC_CENTIMES) alertes.push("smic");
  if (minutesNuit > minutes || minutesDimanche > minutes) alertes.push("dont");
  return {
    minutes,
    minutesSup: sup,
    bande25: b25,
    bande50: b50,
    nuit,
    dimanche,
    normales,
    totalSup,
    totalMajorationsConventionnelles,
    totalSurSup,
    totalSemaine: normales + totalSup + totalMajorationsConventionnelles + totalSurSup,
    alertes,
  };
}

// Formats d'affichage, sans Intl pour rester identiques partout.
export function euros(centimes, lang = "fr") {
  const e = Math.floor(centimes / 100);
  const c = String(centimes % 100).padStart(2, "0");
  const milliers = (n, sep) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, sep);
  return lang === "en" ? `€${milliers(e, ",")}.${c}` : `${milliers(e, " ")},${c} €`;
}

export function heures(minutes, lang = "fr") {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (lang === "en") return m ? `${h} h ${m} min` : `${h} h`;
  return m ? `${h} h ${String(m).padStart(2, "0")}` : `${h} h`;
}

export function pourcent(pdb, lang = "fr") {
  const v = (pdb / 100).toString();
  return lang === "en" ? `${v}%` : `${v.replace(".", ",")} %`;
}
