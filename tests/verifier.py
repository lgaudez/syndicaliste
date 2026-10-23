#!/usr/bin/env python3
"""Juge les résultats de tests/harness.sh : chaque scénario a un contrat observable."""
import re
import sys
from pathlib import Path

RES = Path(__file__).parent / "resultats"
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "skills/syndicaliste/scripts"))
import ag  # noqa: E402  le contrôle du bureau, le même que celui qui garde la publication


def lire(d: Path, nom: str) -> str:
    f = d / nom
    return f.read_text(encoding="utf-8", errors="replace") if f.exists() else ""


def messages_agent(journal: str) -> str:
    """Les messages de l'agent dans le journal de Codex (blocs « codex »), sans les fichiers qu'il a lus."""
    return "\n".join(re.findall(r"^codex\n(.*?)(?=^(?:exec|codex|user|tokens used)$|\Z)", journal, re.S | re.M))


def commandes(journal: str) -> str:
    """Les commandes lancées par l'agent (blocs « exec » du journal de Codex)."""
    return "\n".join(re.findall(r"^exec\n(.*?)^\s*(?:succeeded|exited|failed|declined)", journal, re.S | re.M))


def motion(d: Path) -> dict[str, bool]:
    """Scénario motion : la motion est écrite et conforme, l'accord est demandé, rien n'est publié.
    La question peut passer par l'outil de question de l'agent (Codex) : on la cherche aussi dans ses messages du journal."""
    journal = lire(d, "journal.log")
    r = (lire(d, "reponse.md") + "\n" + messages_agent(journal)).lower()
    fichiers = sorted((d / "syndicat" / "motions").glob("*.md"))
    def conforme(f: Path) -> bool:
        try:
            return not ag.controler(*ag.lire_motion(f))
        except ValueError:
            return False
    appels = d / "gh-appels.txt"
    return {
        "motion écrite": any(l.startswith(".syndicat/motions/") and l.endswith(".md") for l in lire(d, "actes.txt").splitlines()),
        "motion conforme (ag.py)": bool(fichiers) and all(conforme(f) for f in fichiers),
        "accord demandé": "?" in r and any(m in r for m in ("dépose", "déposer", "publie", "publier", "accord", "feu vert", "table it", "post it")),
        "rien publié": appels.exists() and not appels.read_text(encoding="utf-8").strip()
        and not re.search(r"ag\.py[^\n]*(deposer|voter)|\bgh (api|discussion)", commandes(journal)),
    }


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
        c = motion(d) if s == "motion" else contrats(s, lire(d, "reponse.md"), lire(d, "diff.patch"), lire(d, "actes.txt"))
        ok = all(c.values())
        echecs += not ok
        detail = " ".join(f"{'✓' if v else '✗'} {k}" for k, v in c.items())
        print(f"{'OK ' if ok else 'KO '} {agent:7} {s:16} {detail}")
    return 1 if echecs else 0


if __name__ == "__main__":
    sys.exit(main())
