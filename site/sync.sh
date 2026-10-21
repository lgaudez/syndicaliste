#!/usr/bin/env bash
# Copie les données du skill, les instructions grand public et install.sh dans le site statique, puis assemble les pages (build.mjs).
set -euo pipefail
ici="$(cd "$(dirname "$0")" && pwd)"
racine="$(dirname "$ici")"
mkdir -p "$ici/public/data"
cp "$racine"/skills/syndicaliste/data/*.json "$ici/public/data/"
for f in "$racine"/grand-public/instructions-*.txt; do
  [ -f "$f" ] && cp "$f" "$ici/public/data/"
done
if [ -f "$racine/install.sh" ]; then
  cp "$racine/install.sh" "$ici/public/install.sh"
fi
echo "sync : $(ls "$ici/public/data" | tr '\n' ' ')$( [ -f "$ici/public/install.sh" ] && echo '+ install.sh')"
node "$ici/build.mjs"
