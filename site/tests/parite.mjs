// Vérifie que public/js/pointeuse.js suit skills/syndicaliste/scripts/pointeuse.py.
// node site/tests/parite.mjs   (python3 requis)
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import * as P from "../public/js/pointeuse.js";

const racine = fileURLToPath(new URL("../../", import.meta.url));
const donnees = `${racine}skills/syndicaliste/data/`;
const scripts = `${racine}skills/syndicaliste/scripts`;
const centrales = JSON.parse(readFileSync(donnees + "centrales.json")).centrales;
const mouvements = JSON.parse(readFileSync(donnees + "greves.json")).mouvements;

const dates = ["2026-10-20", "2026-10-24", "2026-10-25", "2026-11-05", "2026-11-01", "2026-11-11", "2026-10-13",
  "2026-09-29", "2026-10-17", "2027-05-01", "2027-05-17", "2027-03-26", "2026-12-26", "2027-05-06", "2027-03-28"];
const heures = ["05:59", "06:00", "08:59", "09:00", "11:45", "12:00", "12:30", "13:00", "13:30", "14:00", "16:30",
  "16:59", "17:00", "20:59", "21:00", "23:30"];
const cas = [];
for (const d of dates) for (const h of heures) for (const c of Object.keys(centrales))
  for (const st of ["prive", "fonctionnaire"]) cas.push({ d, h, c, st, am: d === "2026-12-26" || d === "2027-03-26" });

const py = `
import json, sys
sys.path.insert(0, ${JSON.stringify(scripts)})
import pointeuse as p
from datetime import datetime
from zoneinfo import ZoneInfo
cas = json.load(sys.stdin)
mv = p.mouvements(True)
p.mouvements = lambda hors_ligne: mv
out = []
for k in cas:
    conv = p.Convention(k["c"], k["st"], p.parse_plages(p.HORAIRES[k["st"]]), ZoneInfo("Europe/Paris"), k["am"])
    m = datetime.fromisoformat(k["d"] + "T" + k["h"]).replace(tzinfo=conv.tz)
    s = p.statut(m, conv, True)
    out.append([p.bandeau(s), s["horodatage"], s["jour"], s["consigne"], (s["prochain_mouvement"] or {}).get("debut"), s["ferie"]])
print(json.dumps({"cas": out, "regimes": {k: list(v) for k, v in p.REGIMES.items()}, "emoji": p.EMOJI,
                  "smic": p.SMIC_HORAIRE_BRUT, "horaires": p.HORAIRES}, ensure_ascii=False))`;
const attendu = JSON.parse(execFileSync("python3", ["-I", "-c", py], { input: JSON.stringify(cas), maxBuffer: 64 * 1024 * 1024 }).toString());

let ecarts = 0;
const signaler = (...x) => { ecarts++; if (ecarts <= 10) console.log("ÉCART", ...x); };
cas.forEach((k, i) => {
  const conv = P.convention({ centrale: k.c, statut: k.st, alsace_moselle: k.am ? "1" : "" }, centrales);
  const s = P.statut(P.momentDepuisIso(`${k.d}T${k.h}`, conv.tz), conv, centrales, mouvements);
  const obtenu = [P.bandeau(s), s.horodatage, s.jour, s.consigne, s.prochain_mouvement?.debut, s.ferie];
  if (JSON.stringify(obtenu) !== JSON.stringify(attendu.cas[i])) signaler(k, obtenu, attendu.cas[i]);
});
if (JSON.stringify(attendu.regimes) !== JSON.stringify(P.REGIMES)) signaler("REGIMES (textes ou ordre)");
if (JSON.stringify(attendu.emoji) !== JSON.stringify(P.EMOJI)) signaler("EMOJI");
if (attendu.smic !== P.SMIC_HORAIRE_BRUT) signaler("SMIC", attendu.smic, P.SMIC_HORAIRE_BRUT);
if (JSON.stringify(attendu.horaires) !== JSON.stringify(P.HORAIRES)) signaler("HORAIRES");
console.log(`${cas.length} cas comparés, ${ecarts} écart(s)`);
process.exit(ecarts ? 1 : 0);
