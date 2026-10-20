# Contribuer à la lutte

## Ajouter une grève
La contribution la plus utile. Ajoute une entrée à `skills/syndicaliste/data/greves.json` :

- `debut`, `fin` : dates ISO.
- `interpro` : `true` pour une journée interprofessionnelle.
- `secteurs` : parmi `education`, `fonction-publique`, `transport`, `sante`, `energie`… (libre, mais réutilise l'existant).
- `appelants` : clés de `data/centrales.json` (`cgt`, `cfdt`, `fo`, `cfe-cgc`, `cftc`, `unsa`, `fsu`, `sud`).
- `motif` : une phrase, factuelle.
- `source` : un lien vers un communiqué syndical ou un article de presse. Sans source, pas de fusion.

Puis lance `python3 -m unittest tests/test_pointeuse.py`.

## Améliorer une centrale
`skills/syndicaliste/references/centrales.md` et `data/centrales.json`. Reste dans la caricature affectueuse, fondée sur des positions publiques. Pas d'attaque contre des personnes.

## Ajouter un article de loi
`skills/syndicaliste/references/droit.md`. Uniquement des articles réels, avec leur numéro exact.

## Tester sur un vrai agent
`tests/harness.sh <claude|codex|cursor|agy>` puis `python3 tests/verifier.py`. Joins le résultat à ta PR si tu touches `SKILL.md`.
