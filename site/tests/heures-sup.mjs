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

// Majorations conventionnelles : en plus, sur les heures concernées
const nuit = semaine("12,31", "43", { minutesNuit: 300, pdbNuit: 2500 });
egal(nuit.nuit.montant, 1539, "5 h de nuit à 25 % : 15,3875 → 15,39");
egal(nuit.totalSup + nuit.totalMajorationsConventionnelles, 13849, "43 h dont 5 h de nuit : 138,49 €");
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
