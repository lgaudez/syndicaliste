#!/usr/bin/env bash
# Lance la matrice complète en parallèle, un agent par processus.
cd "$(dirname "$0")/.."
for a in ${@:-claude codex cursor agy}; do tests/harness.sh "$a" > "/tmp/syndicat-run-$a.log" 2>&1 & done
wait
python3 tests/verifier.py
