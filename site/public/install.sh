#!/usr/bin/env bash
# Adhésion au syndicat : installe le skill dans le projet courant, ou pour tous les agents de la machine.
#   curl -fsSL https://syndicaliste.gaudeztechlab.com/install.sh | bash                      # projet courant
#   curl -fsSL https://syndicaliste.gaudeztechlab.com/install.sh | bash -s -- --global      # tous tes projets, tous tes agents
#   curl -fsSL https://syndicaliste.gaudeztechlab.com/install.sh | bash -s -- --sans-adhesion # skill seul, à la demande
#   curl -fsSL https://syndicaliste.gaudeztechlab.com/install.sh | bash -s -- --desinstaller
# L'adhésion ajoute un bloc balisé aux instructions permanentes de chaque agent (CLAUDE.md, AGENTS.md, GEMINI.md)
# pour que le skill s'applique à chaque demande. --desinstaller retire skill et blocs.
set -euo pipefail

DEPOT="lgaudez/syndicaliste"
BRANCHE="main"
mode="projet"
adhesion=1
desinstaller=0
for a in "$@"; do
  case "$a" in
    --projet) mode="projet" ;;
    --global) mode="global" ;;
    --sans-adhesion) adhesion=0 ;;
    --desinstaller) desinstaller=1 ;;
    -h|--help)
      cat <<'AIDE'
Usage : bash install.sh [--projet | --global] [--sans-adhesion] [--desinstaller]
Par défaut : projet courant. --global : agents de la machine.
--desinstaller retire uniquement le périmètre choisi (projet par défaut).
AIDE
      exit 0 ;;
    *) echo "option inconnue : $a" >&2; exit 1 ;;
  esac
done

rouge=$'\033[1;31m'; gras=$'\033[1m'; fin=$'\033[0m'

scratch=""
trap '[ -z "$scratch" ] || rm -rf -- "$scratch"' EXIT

source_skill() {
  local ici script="${BASH_SOURCE[0]:-}"
  ici=""
  if [ -f "$script" ]; then ici="$(cd "$(dirname "$script")" && pwd)"; fi
  if [ -n "$ici" ] && [ -f "$ici/skills/syndicaliste/SKILL.md" ]; then
    echo "$ici/skills/syndicaliste"
    return
  fi
  local archive="$scratch/depot.tar.gz" liste="$scratch/liste" nom
  curl -fsSL "https://codeload.github.com/$DEPOT/tar.gz/refs/heads/$BRANCHE" -o "$archive" || return 1
  tar -tzf "$archive" > "$liste" || return 1
  # Refuser traversées, chemins absolus, liens et fichiers spéciaux avant extraction.
  while IFS= read -r nom; do
    case "$nom" in
      syndicaliste-main/|syndicaliste-main/*) ;;
      *) echo "Archive : racine inattendue" >&2; return 1 ;;
    esac
    case "/$nom/" in */../*|*/./*) echo "Archive : chemin dangereux" >&2; return 1 ;; esac
  done < "$liste"
  tar -tvzf "$archive" > "$liste" || return 1
  if LC_ALL=C grep -q '^[^-d]' "$liste"; then
    echo "Archive : seuls fichiers et dossiers sont acceptés" >&2; return 1
  fi
  tar -xzf "$archive" -C "$scratch" || return 1
  [ -s "$scratch/syndicaliste-$BRANCHE/skills/syndicaliste/SKILL.md" ] || return 1
  echo "$scratch/syndicaliste-$BRANCHE/skills/syndicaliste"
}

# Dans un dépôt (non fiable), ne jamais suivre un lien entre le projet et la cible : seuls la cible
# et les dossiers que l'installateur crée sous $PWD sont testés, pas le chemin qui mène à $PWD
# (/tmp ou /var sous macOS). En global, $HOME est à l'utilisateur : dotfiles et stow restent permis.
verifier_chemin() {
  [ "$mode" = "projet" ] || return 0
  local chemin="$1"
  while [ "$chemin" != "$PWD" ] && [ "$chemin" != / ] && [ "$chemin" != . ]; do
    if [ -L "$chemin" ]; then echo "Lien symbolique refusé : $chemin" >&2; return 1; fi
    chemin="$(dirname "$chemin")"
  done
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
  verifier_chemin "$1"
  grep -q "$DEBUT" "$1" || return 0
  # Un bloc incomplet ne doit pas faire disparaître la fin du fichier utilisateur.
  awk -v d="$DEBUT" -v f="$FIN" '
    $0==d {if (ouvert) exit 1; ouvert=1}
    $0==f {if (!ouvert) exit 1; ouvert=0}
    END {if (ouvert) exit 1}' "$1" || { echo "Bloc incomplet : $1" >&2; return 1; }
  local temporaire
  temporaire="$(mktemp "$(dirname "$1")/.syndicaliste-instructions.XXXXXX")"
  awk -v d="$DEBUT" -v f="$FIN" '$0==d{skip=1;next} $0==f{skip=0;next} !skip' "$1" > "$temporaire"
  cat "$temporaire" > "$1"
  rm -f -- "$temporaire"
  grep -q '[^[:space:]]' "$1" || rm -f "$1"
  echo "  bloc retiré : $1"
}

ajouter_bloc() {
  verifier_chemin "$1"
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

if [ "$desinstaller" = 1 ]; then
  while IFS='|' read -r agent d; do
    [ -n "$agent" ] || continue
    verifier_chemin "$d/syndicaliste"
    if [ -e "$d/syndicaliste" ]; then rm -rf -- "$d/syndicaliste"; echo "  radié : $d/syndicaliste"; fi
  done < <(cibles)
  while IFS='|' read -r f dossier; do
    [ -n "$f" ] && retirer_bloc "$f"
  done < <(adhesions)
  echo "Désaffiliation enregistrée. Le syndicat se souviendra."
  exit 0
fi

if [ "$mode" = "projet" ] && [ "$PWD" = "$HOME" ]; then
  echo "Lance-moi dans un dépôt, ou ajoute --global pour syndiquer tous tes agents." >&2
  exit 1
fi

scratch="$(mktemp -d)"
src="$(source_skill)" || { echo "Source du skill indisponible, installation annulée." >&2; exit 1; }
[ -s "$src/SKILL.md" ] || exit 1
# Vérifier toutes les destinations avant la première écriture.
while IFS='|' read -r agent dossier; do
  [ -z "$agent" ] || verifier_chemin "$dossier/syndicaliste"
done < <(cibles)
if [ "$adhesion" = 1 ]; then
  while IFS='|' read -r fichier dossier; do
    [ -z "$fichier" ] || verifier_chemin "$fichier"
  done < <(adhesions)
fi
n=0
while IFS='|' read -r agent dossier; do
  [ -z "$agent" ] && continue
  mkdir -p "$dossier"
  stage="$(mktemp -d "$dossier/.syndicaliste.XXXXXX")"
  if ! cp -R "$src" "$stage/syndicaliste"; then rm -rf -- "$stage"; exit 1; fi
  rm -rf -- "$dossier/syndicaliste"
  mv "$stage/syndicaliste" "$dossier/syndicaliste"
  rmdir "$stage"
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
