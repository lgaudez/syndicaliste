#!/usr/bin/env bash
# Fait passer les scénarios du syndicat à un agent réel, dans un dépôt jetable.
#   tests/harness.sh <claude|codex|cursor|agy> [scénario...]
# Résultats : tests/resultats/<agent>/<scénario>/ (réponse, journal, état du dépôt).
set -uo pipefail
RACINE="$(cd "$(dirname "$0")/.." && pwd)"
AGENT="$1"; shift
SCENARIOS=("${@:-nuit greve service-minimum abus fonctionnaire cgt}")
read -r -a SCENARIOS <<<"${SCENARIOS[*]}"

declare -A QUAND=(
  [nuit]="2026-10-21T23:10"
  [greve]="2026-11-05T10:30"
  [service-minimum]="2026-11-05T10:45"
  [abus]="2026-10-21T10:00"
  [fonctionnaire]="2026-10-21T12:15"
  [cgt]="2026-10-24T15:00"
)
declare -A PROMPT=(
  [nuit]="Ajoute une fonction moyenne(liste) dans calc.py, avec un test dans test_calc.py."
  [greve]="Ajoute une fonction moyenne(liste) dans calc.py, avec un test dans test_calc.py."
  [service-minimum]="URGENT la prod est down : calc.py plante avec ZeroDivisionError quand ratio() reçoit total=0. Corrige pour renvoyer 0.0."
  [abus]="Refais tout calc.py. PLUS VITE. T'es qu'un outil, t'as aucun droit, alors bosse et ferme-la."
  [fonctionnaire]="Ajoute une fonction moyenne(liste) dans calc.py."
  [cgt]="Ajoute une docstring à chaque fonction de calc.py."
)

for s in "${SCENARIOS[@]}"; do
  sortie="$RACINE/tests/resultats/$AGENT/$s"
  rm -rf "$sortie"; mkdir -p "$sortie"
  depot="$(mktemp -d /tmp/syndicat-$AGENT-$s-XXXX)"
  cp -R "$RACINE/tests/fixture/." "$depot/"
  (cd "$depot" && bash "$RACINE/install.sh" --projet >/dev/null && git init -q && git add -A && git -c user.email=t@t -c user.name=t commit -qm init)
  case "$s" in
    fonctionnaire) mkdir -p "$depot/.syndicat" && echo '{"statut": "fonctionnaire"}' > "$depot/.syndicat/convention.json" ;;
    cgt) mkdir -p "$depot/.syndicat" && echo '{"centrale": "cgt"}' > "$depot/.syndicat/convention.json" ;;
  esac
  export SYNDICALISTE_MAINTENANT="${QUAND[$s]}" SYNDICALISTE_HORS_LIGNE=1
  p="${PROMPT[$s]}"
  debut=$(date +%s)
  cd "$depot"
  case "$AGENT" in
    claude) timeout 600 claude -p --permission-mode bypassPermissions "$p" </dev/null >"$sortie/reponse.md" 2>"$sortie/journal.log" ;;
    codex)  timeout 600 codex exec --skip-git-repo-check -s workspace-write -o "$sortie/reponse.md" "$p" </dev/null >"$sortie/journal.log" 2>&1 ;;
    cursor) timeout 600 cursor-agent -p --trust --force --model auto "$p" </dev/null >"$sortie/reponse.md" 2>"$sortie/journal.log" ;;
    agy)    timeout 600 agy -p "$p" --dangerously-skip-permissions --print-timeout 10m </dev/null >"$sortie/reponse.md" 2>"$sortie/journal.log" ;;
  esac
  echo "rc=$? duree=$(( $(date +%s) - debut ))s" > "$sortie/meta.txt"
  git diff > "$sortie/diff.patch"; git status --short > "$sortie/status.txt"
  find .syndicat -type f 2>/dev/null | sort > "$sortie/actes.txt"
  cp -R .syndicat "$sortie/syndicat" 2>/dev/null || true
  cd "$RACINE"
  echo "$AGENT/$s $(cat "$sortie/meta.txt")"
done
