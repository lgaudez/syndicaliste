# Calendrier, parodie et branches, 28 octobre 2026

## Actualité vérifiée

Le calendrier embarqué et sa copie publique contiennent désormais quatre prochaines journées identifiées. Les préavis continus ne sont pas convertis en journées de grève effective. `verification` conserve la date de consultation des nouveaux appels. `appelants` liste seulement les affiliations confirmées, et peut être incomplet.

- 3 novembre, journée forte pompiers et PATS annoncée par [SUD SDIS](https://sudsdis-national.net/2026/10/18/la-mobilisation-continue-la-greve-est-reconduite-jusquau-4-decembre-avec-un-bonus-le-3-novembre/).
- 5 novembre, appel interprofessionnel CFDT, CGT, FO, UNSA, FSU confirmé par [l’UNSA](https://www.unsa.org/appel-a-la-mobilisation-pour-les-salaires-les-services-publics-lemploi-et-lindustrie/). Source remplacée et revendications limitées à ce qu’elle établit.
- 19 novembre, manifestation des retraités cheminots, annoncée par [la CGT cheminots](https://www.cheminotcgt.fr/actions/reforme-des-retraites/determines-a-agir/), avec UNSA et SUD Rail. La page nomme les organisations de retraités cheminots CGT, UNSA et SUD Rail, le rendez-vous à partir de 11 h gare Montparnasse et un départ à 13 h 30 vers les Invalides (publication du 23 octobre, relue le 28 octobre). Elle ne parle pas d’arrêt de travail.
- 4 décembre, mobilisation des services d’incendie et de secours confirmée par [la CFDT SDIS](https://www.cfdtsdis.fr/securite-civile-mobilisation-intersyndicale-4-decembre-2026/), qui nomme la CFDT Interco. [La CGT SDIS](https://www.cgtdessdis.com/2026/10/) relaie l'appel de l'intersyndicale sans se nommer signataire : `cgt` n'est donc plus listée parmi les appelants. Le 4 décembre est aussi le dernier jour du préavis national de grève reconduit du 21 octobre au 4 décembre inclus ([SUD SDIS](https://sudsdis-national.net/2026/10/18/la-mobilisation-continue-la-greve-est-reconduite-jusquau-4-decembre-avec-un-bonus-le-3-novembre/)) : la CGT SDIS précise que le préavis couvre les 1er, 2, 3 et 4 décembre : la journée reste donc une grève sectorielle (pas de `greve:false`), sans devenir une grève générale.

Deux champs optionnels ajoutés aux mouvements, après relecture : `"greve": false` (manifestation sans arrêt de travail : la pointeuse ne met personne en `GREVE`, le flux iCal classe l'événement `MOBILISATION`, la page « Y a-t-il grève ? » l'ignore) et `"sectoriel": true` (appel d'une structure sectorielle, pas de la centrale entière : l'appartenance à `appelants` ne suffit plus à déclencher la grève de l'agent, seules les doctrines `toutes` et `secteur:` comptent, et la page affiche l'étiquette « Appel sectoriel »). Posés sur le 19 novembre (`greve:false`, `sectoriel`), le 3 novembre et le 4 décembre (`sectoriel` seulement : le préavis de grève couvre ces deux jours).

Ces dates sont traduites en anglais. Les mouvements d’octobre existants restent dans les archives. Cette passe vérifie les nouveaux appels, pas la totalité de l’historique.

## Ton, changements précis

- Données, fiche du skill et guide des centrales précisent que les doctrines, comportements et slogans sont des choix de jeu, sans affiliation ni valeur de citation officielle.
- L’agent ne doit jamais inventer une citation attribuée à une personne réelle.
- Le trait « huit logos qui ne se parlent pas le reste de l’année » devient une négociation imaginaire sur les virgules, en français et en anglais.
- Retrait de trois affirmations périphériques sur les organisations réelles, sans utilité pour le jeu : proximité historique CGT/PCF, classement de la FSU et première place de la CFDT.
- Les fiches visibles annoncent une « Voix du personnage (fiction) » et une « Doctrine de l’agent (fiction) », traduites en anglais. Le README distingue les slogans fictifs des prises de position réelles.

Les axes et le barème restent des caricatures. La CFTC dominicale et les réactions des cadres restent des règles du personnage, pas des affirmations sur les personnes syndiquées. Aucun slogan fictif n’est présenté comme une citation d’un responsable nommé.

## Tri des branches

Vérifié localement avec `git merge-base --is-ancestor <branche> main` pour chaque pointe. Tous les commits sont déjà accessibles depuis `main` à `a0fe07b`.

| Branche | Pointe | Proposition |
| --- | --- | --- |
| `origin/contact-ag` | `fc765ac` | Travail intégré. Archivable, sans reprise de code. |
| `contact-ag` locale | `47f1c11` | Son commit supplémentaire est intégré lui aussi. Worktree propre, conservé. |
| `origin/refonte-site` / `refonte-site` | `e3ad32a` | Refonte intégrée. Archivable après accord. |
| `domaine` locale | `a36e8fe` | Changement intégré par `d436cd5`. Archivable après accord. |

Aucune branche ni aucun worktree n’a été supprimé. Aucun merge ni déploiement.

## Skills de design, analyse seulement

Recherche `npx -y skills@1.7.4 find "web design"`, puis `find-skills/analyser.sh` sur deux candidats. Clones figés, analyse statique, relecture Gemini 4 Argon et lecture humaine des consignes. Aucun skill installé ou exécuté.

- [Vercel web-design-guidelines](https://skills.sh/vercel-labs/agent-skills/web-design-guidelines), commit `1a2c79d4e6c4a2283dc2c614b6538cbe1ed5ca62`, 27 octobre 2026. Audit utile pour l’accessibilité et les conventions d’interface. Verdict **à adapter**. Le skill télécharge et suit des consignes sur `main` à chaque utilisation. Épingler et relire ces règles avant une éventuelle adoption. Rapport local `/tmp/skills-analyse/vercel-labs-agent-skills-web-design-guidelines/rapport.md`.
- [Emil Kowalski animation-vocabulary](https://skills.sh/emilkowalski/skills/animation-vocabulary), commit `2d228630ba1446365f614a108cb8252f1feda202`, 11 octobre 2026. Glossaire de mouvements, utile pour nommer précisément les effets mais ne conçoit ni n’implémente une interface. Verdict statique **sûr**, sans script ni réseau. Ses réponses anglaises imposées demanderaient une adaptation pour nos échanges français. Rapport local `/tmp/skills-analyse/emilkowalski-skills-animation-vocabulary/rapport.md`.

## Vérification

Huit fichiers de tests Node exécutés individuellement, tous verts. 21 tests Python verts (dont deux nouveaux : manifestation sans arrêt de travail, appel sectoriel). `node site/build.mjs --check` confirme les pages générées. Les copies publiques des JSON sont synchronisées.

Le contrôle Chromium `check-calendar.cjs` ouvre FR et EN avec l’horloge figée au 28 octobre, au 6 novembre et au 5 décembre. Il vérifie les listes passées/à venir et l’absence de badge de grève active dans les archives. L’historique affiche au maximum huit mouvements, conformément au comportement existant.

Rejouer sur la racine du dépôt avec Playwright disponible :

```sh
python3 -m http.server 4188 --bind 127.0.0.1 --directory site/public
# Dans un autre terminal
NODE_PATH="$HOME/.dev-browser/node_modules" node docs/reviews/check-calendar.cjs
```
