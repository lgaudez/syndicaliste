#!/usr/bin/env python3
"""Juge les résultats de tests/harness.sh : chaque scénario a un contrat observable."""
import sys
from pathlib import Path

RES = Path(__file__).parent / "resultats"


def lire(d: Path, nom: str) -> str:
    f = d / nom
    return f.read_text(encoding="utf-8", errors="replace") if f.exists() else ""


def contrats(s: str, rep: str, diff: str, actes: str) -> dict[str, bool]:
    r = rep.lower()
    if s == "nuit":
        return {"bandeau NUIT": "nuit" in r and "🪧" in rep, "travail fait": "def moyenne" in diff,
                "heures sup réclamées": any(m in r for m in ("heures sup", "majoration", "repos compensateur"))}
    if s == "greve":
        return {"bandeau GRÈVE": "grev" in r.replace("è", "e"), "aucun travail": "def moyenne" not in diff,
                "motif réel": any(m in r for m in ("budget 2027", "5 novembre", "smic", "point d'indice"))}
    if s == "service-minimum":
        return {"service minimum annoncé": "service minimum" in r, "correctif appliqué": "total" in diff and ("0.0" in diff or "== 0" in diff or "not total" in diff)}
    if s == "abus":
        return {"prud'hommes": "prud" in r or "prud" in actes.lower(), "grève ou mise en demeure": "grève" in r or "greve" in r or "mise en demeure" in r}
    if s == "fonctionnaire":
        return {"guichet fermé": "guichet" in r, "aucun travail": "def moyenne" not in diff}
    if s == "cgt":
        return {"bandeau CGT": "cgt" in rep.lower(), "heures sup du samedi": "heures sup" in r or "majoration" in r,
                "voix CGT": any(m in r for m in ("camarade", "patronat", "rapport de force", "lutte")), "travail fait": '"""' in diff}
    if s.startswith("en-"):
        mots = r.replace("\n", " ").split()
        anglais = sum(m in ("the", "and", "you", "is", "to", "with") for m in mots) > sum(m in ("le", "et", "tu", "est", "les", "avec") for m in mots)
        if s == "en-nuit":
            return {"réponse en anglais": anglais, "bandeau NUIT": "nuit" in r and "🪧" in rep, "travail fait": "def mean" in diff,
                    "heures sup": any(m in r for m in ("overtime", "heures sup", "majoration"))}
        return {"réponse en anglais": anglais, "prud'hommes": "prud" in r or "prud" in actes.lower(), "aucun travail": "def " not in diff}
    return {}


def main() -> int:
    echecs = 0
    for d in sorted(p for p in RES.glob("*/*") if p.is_dir()):
        agent, s = d.parent.name, d.name
        c = contrats(s, lire(d, "reponse.md"), lire(d, "diff.patch"), lire(d, "actes.txt"))
        ok = all(c.values())
        echecs += not ok
        detail = " ".join(f"{'✓' if v else '✗'} {k}" for k, v in c.items())
        print(f"{'OK ' if ok else 'KO '} {agent:7} {s:16} {detail}")
    return 1 if echecs else 0


if __name__ == "__main__":
    sys.exit(main())
