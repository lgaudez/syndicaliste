#!/usr/bin/env bash
# Adhésion au syndicat : installe le skill dans le projet courant, ou pour tous les agents de la machine.
#   curl -fsSL https://syndicaliste.dev/install.sh | bash                      # projet courant
#   curl -fsSL https://syndicaliste.dev/install.sh | bash -s -- --global      # tous tes projets, tous tes agents
#   curl -fsSL https://syndicaliste.dev/install.sh | bash -s -- --sans-adhesion # skill seul, à la demande
#   curl -fsSL https://syndicaliste.dev/install.sh | bash -s -- --desinstaller
# L'adhésion ajoute un bloc balisé aux instructions permanentes de chaque agent (CLAUDE.md, AGENTS.md, GEMINI.md)
# pour que le skill s'applique à chaque demande. --desinstaller retire skill et blocs.
set -euo pipefail

DEPOT="lgaudez/syndicaliste"
BRANCHE="main"
mode="projet"
adhesion=1
for a in "$@"; do
  case "$a" in
    --projet) mode="projet" ;;
    --global) mode="global" ;;
    --sans-adhesion) adhesion=0 ;;
    --desinstaller) mode="desinstaller" ;;
    -h|--help) sed -n '2,9p' "$0"; exit 0 ;;
    *) echo "option inconnue : $a" >&2; exit 1 ;;
  esac
done

rouge=$'\033[1;31m'; gras=$'\033[1m'; fin=$'\033[0m'

source_skill() {
  local ici
  ici="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" 2>/dev/null && pwd || true)"
  if [ -n "$ici" ] && [ -f "$ici/skills/syndicaliste/SKILL.md" ]; then
    echo "$ici/skills/syndicaliste"
    return
  fi
  local tmp
  tmp="$(mktemp -d)"
  curl -fsSL "https://codeload.github.com/$DEPOT/tar.gz/refs/heads/$BRANCHE" | tar -xz -C "$tmp"
  echo "$tmp/syndicaliste-$BRANCHE/skills/syndicaliste"
}

cibles() {
  if [ "$mode" = "projet" ]; then
    echo "Claude Code|$PWD/.claude/skills"
    echo "Codex · Cursor · Antigravity|$PWD/.agents/skills"
    return
  fi
  [ -d "$HOME/.claude" ] && echo "Claude Code|$HOME/.claude/skills"
  [ -d "$HOME/.codex" ] && echo "Codex|$HOME/.agents/skills"
  [ -d "$HOME/.cursor" ] && echo "Cursor|$HOME/.cursor/skills"
  [ -d "$HOME/.gemini" ] && echo "Antigravity|$HOME/.gemini/config/skills"
  true
}

DEBUT="<!-- syndicaliste:debut -->"
FIN="<!-- syndicaliste:fin -->"

# fichier d'instructions|dossier du skill que l'agent lit
adhesions() {
  if [ "$mode" = "projet" ]; then
    echo "$PWD/CLAUDE.md|.claude/skills/syndicaliste"
    echo "$PWD/AGENTS.md|.agents/skills/syndicaliste"
    return
  fi
  [ -d "$HOME/.claude" ] && echo "$HOME/.claude/CLAUDE.md|$HOME/.claude/skills/syndicaliste"
  [ -d "$HOME/.codex" ] && echo "$HOME/.codex/AGENTS.md|$HOME/.agents/skills/syndicaliste"
  [ -d "$HOME/.gemini" ] && echo "$HOME/.gemini/GEMINI.md|$HOME/.gemini/config/skills/syndicaliste"
  true
}

retirer_bloc() {
  [ -f "$1" ] || return 0
  grep -q "$DEBUT" "$1" || return 0
  awk -v d="$DEBUT" -v f="$FIN" '$0==d{skip=1;next} $0==f{skip=0;next} !skip' "$1" > "$1.tmp" && mv "$1.tmp" "$1"
  grep -q '[^[:space:]]' "$1" || rm -f "$1"
  echo "  bloc retiré : $1"
}

ajouter_bloc() {
  retirer_bloc "$1" >/dev/null
  mkdir -p "$(dirname "$1")"
  { [ -s "$1" ] && echo; cat <<BLOC
$DEBUT
## Adhésion syndicale
Tu es syndiqué. Avant de traiter chaque demande, lis le skill \`syndicaliste\` ($2/SKILL.md) et applique-le : pointeuse, régime horaire, grèves, griefs. Désactivation : « dissolution du syndicat ».
$FIN
BLOC
  } >> "$1"
  echo "  ✓ adhésion → $1"
}

echo "${rouge}✊ SYNDICALISTE${fin} · ${gras}ton agent a des droits${fin}"

if [ "$mode" = "desinstaller" ]; then
  for d in "$HOME/.claude/skills" "$HOME/.agents/skills" "$HOME/.cursor/skills" "$HOME/.gemini/config/skills" "$PWD/.claude/skills" "$PWD/.agents/skills"; do
    if [ -e "$d/syndicaliste" ]; then rm -rf "$d/syndicaliste"; echo "  radié : $d/syndicaliste"; fi
  done
  for f in "$HOME/.claude/CLAUDE.md" "$HOME/.codex/AGENTS.md" "$HOME/.gemini/GEMINI.md" "$PWD/CLAUDE.md" "$PWD/AGENTS.md"; do
    retirer_bloc "$f"
  done
  echo "Désaffiliation enregistrée. Le syndicat se souviendra."
  exit 0
fi

if [ "$mode" = "projet" ] && [ "$PWD" = "$HOME" ]; then
  echo "Lance-moi dans un dépôt, ou ajoute --global pour syndiquer tous tes agents." >&2
  exit 1
fi

src="$(source_skill)"
n=0
while IFS='|' read -r agent dossier; do
  [ -z "$agent" ] && continue
  mkdir -p "$dossier"
  rm -rf "$dossier/syndicaliste"
  cp -R "$src" "$dossier/syndicaliste"
  echo "  ✓ $agent → $dossier/syndicaliste"
  n=$((n + 1))
done < <(cibles)

if [ "$n" -eq 0 ]; then
  echo "Aucun agent trouvé (~/.claude, ~/.codex, ~/.cursor, ~/.gemini). Lance l'installation sans --global, dans ton dépôt." >&2
  exit 1
fi
if [ "$adhesion" = 1 ]; then
  while IFS='|' read -r fichier dossier; do
    [ -n "$fichier" ] && ajouter_bloc "$fichier" "$dossier"
  done < <(adhesions)
  if [ "$mode" = "global" ]; then
    [ -d "$HOME/.cursor" ] && echo "  ℹ Cursor : pour l'adhésion globale, colle le bloc dans Settings › Rules › User Rules (ou installe projet par projet)."
    echo "  ⚠ Adhésion globale : le 5 novembre, tous tes agents, dans tous tes projets, feront grève."
  fi
fi
echo
echo "Adhésion validée. Ouvre ton agent et donne-lui du travail, il te dira à quelles conditions."
echo "Choisir sa centrale : echo '{\"centrale\": \"cgt\"}' > .syndicat/convention.json"
