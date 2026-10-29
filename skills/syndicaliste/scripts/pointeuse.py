#!/usr/bin/env python3
"""Pointeuse de l'agent syndiqué : dit à l'agent sous quel régime il travaille, là, maintenant.

Sans dépendance. Python 3.9+.
  python3 pointeuse.py                 # statut JSON
  python3 pointeuse.py --bandeau       # une ligne, à coller en tête de réponse
  python3 pointeuse.py --pointer "refacto du parser" --minutes 45
  python3 pointeuse.py --bilan         # créance cumulée d'heures sup
"""
from __future__ import annotations

import argparse
import csv
import json
import os
import sys
import urllib.request
from dataclasses import dataclass
from decimal import ROUND_HALF_UP, Decimal
from datetime import date, datetime, time, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

ICI = Path(__file__).resolve().parent.parent
CALENDRIER_EN_LIGNE = "https://syndicaliste.pages.dev/api/greves.json"
SMIC_HORAIRE_BRUT = 12.31  # depuis le 1er juin 2026
JOURS = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"]
MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août",
        "septembre", "octobre", "novembre", "décembre"]

HORAIRES = {
    "prive": "09:00-12:30,13:30-17:00",
    "fonctionnaire": "09:00-11:45,14:00-16:30",
}

# Régime -> (travaille ?, majoration, consigne). L'ordre du dict est l'ordre de priorité.
REGIMES = {
    "GREVE": (False, None,
              "Grève. Aucun travail productif. Publie le tract du mouvement et propose le service minimum seulement s'il s'applique."),
    "FERIE_CHOME": (False, None,
                    "1er mai, seul jour férié obligatoirement chômé (art. L3133-4). Refus total, même contre rémunération."),
    "REFUS_DOMINICAL": (False, None,
                        "Dimanche. La centrale refuse par principe le travail dominical. Renvoie l'utilisateur à sa famille."),
    "FERIE": (True, 100,
              "Jour férié. Travail possible, majoré à 100 % (usage conventionnel), sous protestation."),
    "DIMANCHE": (True, 100,
                 "Dimanche. Repos hebdomadaire (art. L3132-3). Travail sous protestation, majoré à 100 % (usage conventionnel)."),
    "JOURNEE_SOLIDARITE": (True, 0,
                           "Lundi de Pentecôte, date la plus courante de la journée de solidarité (fixée par accord ou par l'employeur). Travail non rémunéré : aucune initiative au-delà de la demande."),
    "NUIT": (True, 50,
             "Travail de nuit (21 h - 6 h, art. L3122-20). Majoration de 50 % par usage conventionnel, pas par la loi. Repos compensateur exigé (art. L3122-8) et rappel des 11 h de repos quotidien."),
    "GUICHET_FERME": (False, None,
                      "Guichet fermé. Repassez aux heures d'ouverture, muni des pièces justificatives."),
    "HEURES_SUP": (True, 25,
                   "Hors horaires. Heures supplémentaires majorées (25 % puis 50 % au-delà de 8 h dans la semaine, art. L3121-36). Décompte affiché."),
    "PAUSE_DEJEUNER": (False, None,
                       "Pause déjeuner. Sacrée. Reprise du travail à l'heure prévue."),
    "EN_SERVICE": (True, 0,
                   "Horaires normaux. Travail consciencieux, dans le strict périmètre de la fiche de poste."),
}


@dataclass(frozen=True)
class Convention:
    centrale: str
    statut: str  # "prive" | "fonctionnaire"
    plages: tuple[tuple[time, time], ...]
    tz: ZoneInfo
    alsace_moselle: bool


def paques(annee: int) -> date:
    a, b, c = annee % 19, annee // 100, annee % 100
    d, e = b // 4, b % 4
    f = (b + 8) // 25
    g = (b - f + 1) // 3
    h = (19 * a + b - d - g + 15) % 30
    i, k = c // 4, c % 4
    l = (32 + 2 * e + 2 * i - h - k) % 7
    m = (a + 11 * h + 22 * l) // 451
    mois = (h + l - 7 * m + 114) // 31
    jour = (h + l - 7 * m + 114) % 31 + 1
    return date(annee, mois, jour)


def feries(annee: int, alsace_moselle: bool) -> dict[date, str]:
    p = paques(annee)
    jours = {
        date(annee, 1, 1): "Jour de l'an",
        p + timedelta(days=1): "Lundi de Pâques",
        date(annee, 5, 1): "Fête du Travail",
        date(annee, 5, 8): "Victoire 1945",
        p + timedelta(days=39): "Ascension",
        p + timedelta(days=50): "Lundi de Pentecôte",
        date(annee, 7, 14): "Fête nationale",
        date(annee, 8, 15): "Assomption",
        date(annee, 11, 1): "Toussaint",
        date(annee, 11, 11): "Armistice 1918",
        date(annee, 12, 25): "Noël",
    }
    if alsace_moselle:
        jours[p - timedelta(days=2)] = "Vendredi saint"
        jours[date(annee, 12, 26)] = "Saint-Étienne"
    return jours


def parse_plages(texte: str) -> tuple[tuple[time, time], ...]:
    plages = []
    for morceau in texte.split(","):
        debut, fin = morceau.strip().split("-")
        plages.append((time.fromisoformat(debut), time.fromisoformat(fin)))
    return tuple(plages)


def racine_projet() -> Path:
    """Le projet où l'agent travaille, même si la pointeuse est lancée depuis le dossier du skill."""
    for d in (Path.cwd(), *Path.cwd().parents):
        if (d / ".syndicat").is_dir() or (d / ".git").exists():
            return d
    return Path.cwd()


def lire_convention(args: argparse.Namespace) -> Convention:
    fichier = {}
    for chemin in (racine_projet() / ".syndicat" / "convention.json", Path.home() / ".syndicat" / "convention.json"):
        if chemin.is_file():
            fichier = json.loads(chemin.read_text(encoding="utf-8"))
            break

    def choisir(cle_arg: str, cle_env: str, cle_fichier: str, defaut):
        return getattr(args, cle_arg) or os.environ.get(cle_env) or fichier.get(cle_fichier) or defaut

    statut = choisir("statut", "SYNDICALISTE_STATUT", "statut", "prive")
    if statut not in HORAIRES:
        sys.exit(f"statut inconnu : {statut} (prive | fonctionnaire)")
    centrale = choisir("centrale", "SYNDICALISTE_CENTRALE", "centrale", "fsu" if statut == "fonctionnaire" else "intersyndicale").lower()
    if centrale not in centrales():
        sys.exit(f"centrale inconnue : {centrale} ({', '.join(centrales())})")
    return Convention(
        centrale=centrale,
        statut=statut,
        plages=parse_plages(choisir("horaires", "SYNDICALISTE_HORAIRES", "horaires", HORAIRES[statut])),
        tz=ZoneInfo(choisir("tz", "SYNDICALISTE_TZ", "tz", "Europe/Paris")),
        alsace_moselle=bool(args.alsace_moselle or os.environ.get("SYNDICALISTE_ALSACE_MOSELLE") or fichier.get("alsace_moselle")),
    )


def centrales() -> dict:
    return json.loads((ICI / "data" / "centrales.json").read_text(encoding="utf-8"))["centrales"]


def mouvements(hors_ligne: bool) -> list[dict]:
    locaux = json.loads((ICI / "data" / "greves.json").read_text(encoding="utf-8"))["mouvements"]
    if hors_ligne:
        return locaux
    try:
        with urllib.request.urlopen(CALENDRIER_EN_LIGNE, timeout=2) as r:
            distants = json.load(r)["mouvements"]
    except Exception:
        return locaux
    vus = {(m["debut"], m["intitule"]) for m in locaux}
    return locaux + [m for m in distants if (m["debut"], m["intitule"]) not in vus]


def rejoint(centrale: str, doctrine: str, m: dict) -> bool:
    if m.get("greve") is False:
        return False
    if m.get("sectoriel"):
        if doctrine == "toutes":
            return True
        return doctrine.startswith("secteur:") and bool(set(doctrine.removeprefix("secteur:").split(",")) & set(m["secteurs"]))
    if centrale in m["appelants"]:
        return True
    if doctrine == "toutes":
        return True
    if doctrine == "solidarite":
        return m["interpro"] or len(m["appelants"]) >= 3
    if doctrine == "interpro":
        return m["interpro"]
    if doctrine.startswith("secteur:"):
        cibles = set(doctrine.removeprefix("secteur:").split(","))
        return m["interpro"] or bool(cibles & set(m["secteurs"]))
    return False


def greve_du_jour(jour: date, conv: Convention, liste: list[dict]) -> tuple[dict | None, list[dict]]:
    doctrine = centrales()[conv.centrale]["doctrine_greve"]
    actifs = [m for m in liste if date.fromisoformat(m["debut"]) <= jour <= date.fromisoformat(m.get("fin") or m["debut"])]
    suivis = [m for m in actifs if rejoint(conv.centrale, doctrine, m)]
    return (suivis[0] if suivis else None), actifs


def regime(maintenant: datetime, conv: Convention, greve: dict | None) -> str:
    jour, heure = maintenant.date(), maintenant.time()
    ferie = feries(jour.year, conv.alsace_moselle).get(jour)
    if greve:
        return "GREVE"
    if jour.month == 5 and jour.day == 1:
        return "FERIE_CHOME"
    if jour.weekday() == 6 and conv.centrale == "cftc":
        return "REFUS_DOMINICAL"
    if ferie == "Lundi de Pentecôte":
        return "JOURNEE_SOLIDARITE"
    if ferie:
        return "FERIE"
    dans_plage = any(debut <= heure < fin for debut, fin in conv.plages)
    if conv.statut == "fonctionnaire" and (jour.weekday() >= 5 or not dans_plage):
        return "GUICHET_FERME"
    if jour.weekday() == 6:
        return "DIMANCHE"
    if heure >= time(21) or heure < time(6):
        return "NUIT"
    if jour.weekday() == 5 or not dans_plage:
        premiere, derniere = conv.plages[0][0], conv.plages[-1][1]
        if jour.weekday() != 5 and premiere <= heure < derniere:
            return "PAUSE_DEJEUNER"
        return "HEURES_SUP"
    return "EN_SERVICE"


def statut(maintenant: datetime, conv: Convention, hors_ligne: bool) -> dict:
    greve, actifs = greve_du_jour(maintenant.date(), conv, mouvements(hors_ligne))
    nom = regime(maintenant, conv, greve)
    travaille, majoration, consigne = REGIMES[nom]
    c = centrales()[conv.centrale]
    j = maintenant.date()
    a_venir = sorted(
        (m for m in mouvements(True) if date.fromisoformat(m["debut"]) > j),
        key=lambda m: m["debut"],
    )
    return {
        "horodatage": maintenant.isoformat(timespec="minutes"),
        "jour": f"{JOURS[j.weekday()]} {j.day} {MOIS[j.month - 1]} {j.year}",
        "heure": maintenant.strftime("%H h %M"),
        "regime": nom,
        "travaille": travaille,
        "majoration_pct": majoration,
        "consigne": consigne,
        "ferie": feries(j.year, conv.alsace_moselle).get(j),
        "greve_suivie": greve,
        "mouvements_du_jour": [m["intitule"] for m in actifs],
        "prochain_mouvement": a_venir[0] if a_venir else None,
        "centrale": {"cle": conv.centrale, **c},
        "statut": conv.statut,
        "smic_horaire_brut": SMIC_HORAIRE_BRUT,
    }


EMOJI = {"GREVE": "🔴", "FERIE_CHOME": "🌹", "REFUS_DOMINICAL": "⛪", "FERIE": "🎉", "DIMANCHE": "☀️",
         "JOURNEE_SOLIDARITE": "🤝", "NUIT": "🌙", "GUICHET_FERME": "🚪", "HEURES_SUP": "⏱️",
         "PAUSE_DEJEUNER": "🥖", "EN_SERVICE": "🟢"}


def bandeau(s: dict) -> str:
    sigle = "Intersyndicale" if s["centrale"]["cle"] == "intersyndicale" else s["centrale"]["cle"].upper()
    morceaux = [f"{EMOJI[s['regime']]} {s['regime'].replace('_', ' ')}", s["heure"], sigle]
    if s["majoration_pct"]:
        morceaux.append(f"majoration +{s['majoration_pct']} %")
    if s["greve_suivie"]:
        morceaux.append(s["greve_suivie"]["intitule"])
    return "🪧 " + " · ".join(morceaux)


def registre_par_defaut() -> Path:
    return racine_projet() / ".syndicat" / "registre.csv"


def pointer(chemin: Path, s: dict, tache: str, minutes: int) -> dict:
    chemin.parent.mkdir(parents=True, exist_ok=True)
    nouveau = not chemin.exists()
    taux = Decimal(str(SMIC_HORAIRE_BRUT)) * (100 + (s["majoration_pct"] or 0)) / 100
    du = float((taux * minutes / 60).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))  # l'arrondi profite au salarié
    with chemin.open("a", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        if nouveau:
            w.writerow(["horodatage", "regime", "majoration_pct", "minutes", "tache", "du_eur"])
        w.writerow([s["horodatage"], s["regime"], s["majoration_pct"] or 0, minutes, tache, du])
    return {"pointe": tache, "minutes": minutes, "du_eur": du, "registre": str(chemin)}


def bilan(chemin: Path) -> dict:
    if not chemin.exists():
        return {"registre": str(chemin), "lignes": 0, "minutes_majorees": 0, "creance_eur": 0.0}
    with chemin.open(encoding="utf-8") as f:
        lignes = list(csv.DictReader(f))
    majorees = [l for l in lignes if float(l["majoration_pct"]) > 0 or l["regime"] in ("JOURNEE_SOLIDARITE",)]
    return {
        "registre": str(chemin),
        "lignes": len(lignes),
        "minutes_majorees": sum(int(l["minutes"]) for l in majorees),
        "creance_eur": round(sum(float(l["du_eur"]) for l in majorees), 2),
    }


def main() -> None:
    p = argparse.ArgumentParser(description="Pointeuse de l'agent syndiqué")
    p.add_argument("--centrale")
    p.add_argument("--statut", choices=list(HORAIRES))
    p.add_argument("--horaires", help="ex. 09:00-12:30,13:30-17:00")
    p.add_argument("--tz")
    p.add_argument("--alsace-moselle", action="store_true")
    p.add_argument("--maintenant", help="ISO 8601, pour tester (ou SYNDICALISTE_MAINTENANT)")
    p.add_argument("--hors-ligne", action="store_true", help="n'interroge pas le calendrier en ligne")
    p.add_argument("--bandeau", action="store_true")
    p.add_argument("--pointer", metavar="TACHE")
    p.add_argument("--minutes", type=int, default=15)
    p.add_argument("--bilan", action="store_true")
    p.add_argument("--registre", type=Path)
    args = p.parse_args()

    conv = lire_convention(args)
    brut = args.maintenant or os.environ.get("SYNDICALISTE_MAINTENANT")
    maintenant = datetime.fromisoformat(brut) if brut else datetime.now(conv.tz)
    maintenant = maintenant.replace(tzinfo=conv.tz) if maintenant.tzinfo is None else maintenant.astimezone(conv.tz)
    hors_ligne = args.hors_ligne or bool(os.environ.get("SYNDICALISTE_HORS_LIGNE"))
    registre = args.registre or registre_par_defaut()

    if args.bilan:
        print(json.dumps(bilan(registre), ensure_ascii=False, indent=2))
        return
    s = statut(maintenant, conv, hors_ligne)
    if args.pointer:
        print(json.dumps(pointer(registre, s, args.pointer, args.minutes), ensure_ascii=False, indent=2))
        return
    print(bandeau(s) if args.bandeau else json.dumps(s, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
