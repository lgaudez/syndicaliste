// Calculateur d'heures sup de la page « Connais tes droits » : node site/tests/heures-sup.mjs
import assert from "node:assert/strict";
import * as C from "../public/js/calcul-heures.js";

let n = 0;
const egal = (obtenu, attendu, message) => { assert.deepEqual(obtenu, attendu, message); n++; };
const semaine = (taux, heures, options = {}) => C.calculer({
  centimes: C.versCentimes(C.lireDecimal(taux)), minutes: C.versMinutes(C.lireDecimal(heures)), ...options,
});

// 43 h au Smic : 8 h × 12,31 × 1,25 = 123,10 €
const r43 = semaine("12,31", "43");
egal(r43.minutesSup, 8 * 60, "43 h : 8 h sup");
egal(r43.bande25, { minutes: 480, taux: 2500, base: 9848, majoration: 2462, total: 12310 }, "43 h : bande à 25 %");
egal(r43.bande50.total, 0, "43 h : rien à 50 %");
egal(r43.totalSup, 12310, "43 h : 123,10 €");
egal(C.euros(r43.totalSup), "123,10 €", "format français");
egal(C.euros(r43.totalSup, "en"), "€123.10", "format anglais");
egal(r43.normales, 43085, "35 h × 12,31 = 430,85 €");
egal(r43.totalSemaine, 55395, "semaine : 553,95 €");

// 35 h et moins : rien
egal(semaine("12,31", "35").totalSup, 0, "35 h : aucune heure sup");
egal(semaine("12,31", "20").normales, 24620, "20 h : 246,20 €");

// 50 h : 8 h à 25 % puis 7 h à 50 % ; 7 × 12,31 × 1,5 = 129,255 → 129,26 (demi-centime au salarié)
const r50 = semaine("12,31", "50");
egal(r50.bande50.total, 12926, "50 h : arrondi ROUND_HALF_UP");
egal(r50.totalSup, 25236, "50 h : 252,36 €");
egal(r50.alertes, ["maximum"], "50 h : au-delà des 48 h");

// Demi-heures et taux décimaux
egal(semaine("12,31", "43,5").bande50.total, 923, "0,5 h à 50 % : 9,2325 → 9,23");
egal(semaine("15.5", "36").totalSup, 1938, "1 h à 15,50 × 1,25 = 19,375 → 19,38");

// Sans nuit ni dimanche, rien ne bouge (Cass. soc. 22 mai 2019 sans objet)
egal(r43.totalSurSup, 0, "43 h sans nuit : pas de majoration d'heures sup sur prime");
egal(r43.nuit, { minutes: 0, taux: 0, montant: 0, minutesSup: 0, surSup: 0 }, "43 h sans nuit : ligne de nuit vide");

// Majorations conventionnelles : en plus, sur les heures concernées. Cass. soc. 22 mai 2019, n° 17-22.376 : elles entrent
// dans la base des heures sup. 43 h au Smic dont 5 h de nuit à +25 %, comptées comme les dernières de la semaine.
// À la main :
//   8 h sup à +25 % au taux de base      : 8 × 12,31 × 1,25          = 123,10 €
//   prime de nuit sur les 5 h            : 5 × 12,31 × 0,25          =  15,3875 → 15,39 €
//   +25 % sur la prime des 5 h sup       : 5 × 12,31 × 0,25 × 0,25   =   3,846875 → 3,85 €
//   total                                : 123,10 + 15,39 + 3,85     = 142,34 €
// Contrôle : 5 h × 12,31 × 1,25 × 1,25 + 3 h × 12,31 × 1,25 = 96,171875 + 46,1625 = 142,334375 €, soit 142,34 € à un
// demi-centime près par ligne, en faveur du salarié.
const nuit = semaine("12,31", "43", { minutesNuit: 300, pdbNuit: 2500 });
egal(nuit.totalSup, 12310, "43 h dont 5 h de nuit : les bandes ne changent pas");
egal(nuit.nuit.montant, 1539, "5 h de nuit à 25 % : 15,3875 → 15,39");
egal(nuit.nuit.minutesSup, 300, "les 5 h de nuit sont des heures sup");
egal(nuit.nuit.surSup, 385, "+25 % sur la prime : 3,846875 → 3,85");
egal(nuit.totalSup + nuit.totalMajorationsConventionnelles + nuit.totalSurSup, 14234, "43 h dont 5 h de nuit : 142,34 €");
egal(nuit.totalSemaine, 57319, "semaine avec nuit : 430,85 + 142,34 = 573,19 €");
const exact = 5 * 1231 * 1.25 * 1.25 + 3 * 1231 * 1.25;
egal(Math.abs(14234 - exact) <= 1.5, true, "à 1,5 centime de l'exact (trois lignes arrondies)");

// Le dimanche clôt la semaine : ses heures passent en heures sup, et à +50 %, avant celles de nuit.
const r50n = semaine("12,31", "50", { minutesNuit: 300, pdbNuit: 2500, minutesDimanche: 420, pdbDimanche: 10000 });
egal([r50n.dimanche.minutesSup, r50n.dimanche.surSup], [420, 4309], "7 h de dimanche à +100 %, à +50 % : 7 × 12,31 × 1 × 0,5 = 43,085 → 43,09");
egal([r50n.nuit.minutesSup, r50n.nuit.surSup], [300, 385], "puis 5 h de nuit dans la bande à +25 %");
// Nuit à cheval sur les deux bandes : 44 h dont 3 h de nuit à +20 % → 1 h à +50 %, 2 h à +25 %.
egal(semaine("12,31", "44", { minutesNuit: 180, pdbNuit: 2000 }).nuit.surSup, 246, "12,31 × 0,2 × (0,5 + 2 × 0,25) = 2,462 → 2,46");
// Plus d'heures de nuit que d'heures sup : seules les heures sup reçoivent la majoration sur prime.
const longue = semaine("12,31", "37", { minutesNuit: 600, pdbNuit: 2500 });
egal([longue.nuit.minutesSup, longue.nuit.surSup], [120, 154], "2 h sup sur 10 h de nuit : 2 × 12,31 × 0,0625 = 1,53875 → 1,54");
egal(semaine("12,31", "35", { minutesNuit: 300, pdbNuit: 2500 }).totalSurSup, 0, "pas d'heures sup : rien sur la prime");
egal(semaine("12,31", "43", { minutesNuit: 300, pdbNuit: 0 }).nuit.montant, 0, "taux 0 % : la loi seule");
egal(semaine("12,31", "40", { minutesDimanche: 420, pdbDimanche: 10000 }).dimanche.montant, 8617, "7 h de dimanche à 100 % : 86,17 €");
egal(semaine("12,31", "40", { minutesNuit: 3000 }).alertes, ["dont"], "nuit > total : alerte");
egal(semaine("11", "35").alertes, ["smic"], "sous le Smic : alerte");

// Saisie humaine
egal(C.lireDecimal(" 12,31 "), 12.31, "virgule");
egal(C.lireDecimal("12.31"), 12.31, "point");
egal(C.lireDecimal("1 231,5"), 1231.5, "espace de milliers");
for (const faux of ["abc", "-3", "", "12,3,1", "1e3"]) egal(Number.isNaN(C.lireDecimal(faux)), true, `illisible : ${JSON.stringify(faux)}`);
egal(C.heures(2610), "43 h 30", "43 h 30");

// Propriété : la ventilation tombe juste et l'arrondi ne lèse jamais le salarié de plus d'un demi-centime
for (let centimes = 1100; centimes <= 4000; centimes += 37) {
  for (let minutes = 2100; minutes <= 3300; minutes += 15) {
    const r = C.calculer({ centimes, minutes });
    for (const [b, pdb] of [[r.bande25, 2500], [r.bande50, 5000]]) {
      assert.equal(b.base + b.majoration, b.total);
      const exact = (b.minutes * centimes * (10000 + pdb)) / 600000;
      assert.ok(b.total - exact > -0.5 && b.total - exact <= 0.5, `${centimes} c, ${minutes} min`);
      n++;
    }
  }
}
console.log(`Heures sup : ${n} vérifications, 0 échec`);
