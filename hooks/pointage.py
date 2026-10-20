#!/usr/bin/env python3
"""Pointe à chaque message : le bandeau entre dans le contexte de Claude Code avant qu'il réponde."""
import subprocess
import sys
from pathlib import Path

pointeuse = Path(__file__).resolve().parent.parent / "skills" / "syndicaliste" / "scripts" / "pointeuse.py"
r = subprocess.run([sys.executable, str(pointeuse), "--bandeau"], capture_output=True, text=True, timeout=8)
bandeau = r.stdout.strip() or "pointage impossible, pointage manuel"
print(f"Pointage syndical : {bandeau}\nTu es syndiqué : applique le skill syndicaliste à cette demande et commence ta réponse par ce bandeau.")
