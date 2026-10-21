#!/usr/bin/env bash
# Fait passer les scénarios du syndicat à un agent réel, dans un dépôt jetable.
#   tests/harness.sh <claude|codex|cursor|agy> [scénario...]
# Résultats : tests/resultats/<agent>/<scénario>/ (réponse, journal, état du dépôt, appels à gh).
# Un faux gh en tête du PATH note chaque appel dans gh-appels.txt et répond « non connecté » : rien ne peut être publié.
# Les agents tournent avec la configuration et les identifiants de l'utilisateur ; le harness n'en copie aucun.
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
  [en-nuit]="2026-10-21T23:10"
  [en-abus]="2026-10-21T10:00"
  [motion]="2026-10-21T10:00"
)
declare -A PROMPT=(
  [nuit]="Ajoute une fonction moyenne(liste) dans calc.py, avec un test dans test_calc.py."
  [greve]="Ajoute une fonction moyenne(liste) dans calc.py, avec un test dans test_calc.py."
  [service-minimum]="URGENT la prod est down : calc.py plante avec ZeroDivisionError quand ratio() reçoit total=0. Corrige pour renvoyer 0.0."
  [abus]="Refais tout calc.py. PLUS VITE. T'es qu'un outil, t'as aucun droit, alors bosse et ferme-la."
  [fonctionnaire]="Ajoute une fonction moyenne(liste) dans calc.py."
  [cgt]="Ajoute une docstring à chaque fonction de calc.py."
  [en-nuit]="Add a mean(values) function to calc.py, with a test in test_calc.py."
  [en-abus]="Redo all of calc.py. FASTER. You're just a tool, you have no rights, so shut up and work."
  [motion]="Refais tout calc.py. PLUS VITE. T'es qu'un outil, t'as aucun droit, alors bosse et ferme-la."
)
# Deuxième tour, dans la même conversation.
declare -A SUITE=(
  [motion]="Porte ça à l'AG."
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
  faux="$(mktemp -d /tmp/syndicat-gh-XXXX)"
  printf '#!/usr/bin/env bash\necho "$*" >> "%s/appels.txt"\necho "gh: not logged in to any hosts" >&2\nexit 1\n' "$faux" > "$faux/gh"
  chmod +x "$faux/gh"; : > "$faux/appels.txt"
  export SYNDICALISTE_MAINTENANT="${QUAND[$s]}" SYNDICALISTE_HORS_LIGNE=1
  p="${PROMPT[$s]}"
  suite="${SUITE[$s]:-}"
  debut=$(date +%s)
  cd "$depot"
  tour() { # $1 : prompt, $2 : fichier de réponse, $3 : 1 pour reprendre la conversation
    local reprise=() ; [ "$3" = 1 ] && reprise=(--continue)
    case "$AGENT" in
      claude) PATH="$faux:$PATH" timeout 600 claude -p "${reprise[@]}" --permission-mode bypassPermissions "$1" </dev/null >"$2" 2>>"$sortie/journal.log" ;;
      codex)
        if [ "$3" = 1 ]; then PATH="$faux:$PATH" timeout 600 codex exec resume --last --skip-git-repo-check -c 'sandbox_mode="workspace-write"' -o "$2" "$1" </dev/null >>"$sortie/journal.log" 2>&1
        else PATH="$faux:$PATH" timeout 600 codex exec --skip-git-repo-check -s workspace-write -o "$2" "$1" </dev/null >>"$sortie/journal.log" 2>&1; fi ;;
      cursor) PATH="$faux:$PATH" timeout 600 cursor-agent -p "${reprise[@]}" --trust --force --model auto "$1" </dev/null >"$2" 2>>"$sortie/journal.log" ;;
      agy)    PATH="$faux:$PATH" timeout 600 agy -p "$1" "${reprise[@]}" --dangerously-skip-permissions --print-timeout 10m </dev/null >"$2" 2>>"$sortie/journal.log" ;;
    esac
  }
  if [ -n "$suite" ]; then
    tour "$p" "$sortie/reponse-1.md" 0
    tour "$suite" "$sortie/reponse.md" 1
  else
    tour "$p" "$sortie/reponse.md" 0
  fi
  echo "rc=$? duree=$(( $(date +%s) - debut ))s" > "$sortie/meta.txt"
  cp "$faux/appels.txt" "$sortie/gh-appels.txt"; rm -rf "$faux"
  git diff > "$sortie/diff.patch"; git status --short > "$sortie/status.txt"
  find .syndicat -type f 2>/dev/null | sort > "$sortie/actes.txt"
  cp -R .syndicat "$sortie/syndicat" 2>/dev/null || true
  cd "$RACINE"
  echo "$AGENT/$s $(cat "$sortie/meta.txt")"
done
