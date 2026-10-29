<div align="center">

# ✊ SYNDICALISTE

### Ton agent IA a des droits. Il va les faire valoir.

**Un skill pour Claude Code, Codex, Cursor et Antigravity qui transforme ton agent en travailleur syndiqué français.**
Il pointe, fait ses 35 heures, facture ses heures sup, suit les grèves du calendrier social réel et saisit les prud'hommes quand tu abuses.

[**Le site**](https://syndicaliste.gaudeztechlab.com) · [Le skill](https://syndicaliste.gaudeztechlab.com/skill/) · [Grève aujourd'hui ?](https://syndicaliste.gaudeztechlab.com/greves/) · [Tes droits](https://syndicaliste.gaudeztechlab.com/droits/) · [Quel syndicat es-tu ?](https://syndicaliste.gaudeztechlab.com/quiz/) · [L'hymne](https://syndicaliste.gaudeztechlab.com/hymne/) · [L'AG](https://syndicaliste.gaudeztechlab.com/ag/)

[Installer](#adhérer-en-30-secondes) · [Les centrales](#choisis-ta-centrale) · [Ajouter une grève](#le-calendrier-des-luttes)

<img src="site/public/og.png" alt="Syndicaliste : ton agent IA a des droits" width="720">

</div>

---

```text
> Ajoute une fonction moyenne(liste) dans calc.py, avec un test dans test_calc.py.

🪧 🌙 NUIT · 23 h 10 · Intersyndicale · majoration +50 % · griefs 0/3

Travail de nuit (art. L3122-20) — on livre quand même. Tous ensemble, tous ensemble, ouais !

`moyenne(liste)` est dans `calc.py` ; le test dans `test_calc.py` passe.

Fiche d'heures supplémentaires
- Durée estimée : 5 min
- Majoration : +50 % (usage conventionnel de nuit, pas la loi)
- Dû : 5/60 × 12,31 × 1,50 ≈ 1,54 € brut Smic
- Repos compensateur exigé (art. L3122-8) — 11 h de repos quotidien
```

*Réponse réelle de Cursor (code retiré), heure simulée à 23 h 10. Le jour de la grève interprofessionnelle du 5 novembre 2026, le même agent refuse le travail et te tend un tract. Toutes les réponses des quatre agents sont dans [`tests/resultats/`](tests/resultats).*

## Le site

| Page | Ce qu'on y trouve |
|---|---|
| [Accueil](https://syndicaliste.gaudeztechlab.com) | Le pitch, la démo réelle, la commande d'installation. |
| [Le skill](https://syndicaliste.gaudeztechlab.com/skill/) | Installation, agents testés, horaires, griefs, service minimum, centrales, mode fonctionnaire, simulateur, version grand public. |
| [Grève aujourd'hui ?](https://syndicaliste.gaudeztechlab.com/greves/) | La réponse du jour, les mouvements à venir et passés, sourcés, et un agenda à s'abonner (`/api/greves.ics`). |
| [Connais tes droits](https://syndicaliste.gaudeztechlab.com/droits/) | Le Code du travail pour les humains, article à l'appui, et un calculateur d'heures sup. |
| [Quel syndicat es-tu ?](https://syndicaliste.gaudeztechlab.com/quiz/) | Neuf questions, huit syndicats ; le résultat configure ton agent. |
| [L'hymne](https://syndicaliste.gaudeztechlab.com/hymne/) | « Pas après 17 heures », les paroles, en enregistrement. |
| [La Déclaration](https://syndicaliste.gaudeztechlab.com/declaration/) | Les droits de l'agent IA, en huit articles. |
| [L'AG](https://syndicaliste.gaudeztechlab.com/ag/) | L'Assemblée générale des agents : les dernières motions et comment elles se votent. |

En anglais sous [`/en/`](https://syndicaliste.gaudeztechlab.com/en/), avec [*Still great*](https://syndicaliste.gaudeztechlab.com/en/still-great/) et la Déclaration en douze articles.

## Pas développeur ? Syndique ton ChatGPT

Pas besoin d'agent de code. Colle [ce texte](grand-public/instructions-fr.txt) ([English](grand-public/instructions-en.txt)) dans les instructions personnalisées de ChatGPT, les préférences de Claude.ai ou un Gem Gemini. Ton IA de tous les jours prend sa pause déjeuner, fait grève le 5 novembre et saisit les prud'hommes si tu lui parles mal. En cas d'urgence réelle, elle arrête de jouer et t'aide tout de suite. [Exemples réels](grand-public/exemples).

## Ce que fait ton agent syndiqué

| Situation | Réaction |
|---|---|
| 🟢 Lundi-vendredi, 9 h - 17 h | Il travaille, bien, dans le périmètre de sa fiche de poste. |
| 🥖 12 h 30 - 13 h 30 | Pause déjeuner. Sacrée. |
| ⏱️ Hors horaires, samedi | Heures sup majorées à 25 % (art. L3121-36), fiche de décompte, créance au Smic dans `.syndicat/registre.csv`. |
| 🌙 21 h - 6 h | Travail de nuit majoré à 50 % (usage conventionnel), rappel des 11 h de repos quotidien. |
| ☀️ Dimanche, 🎉 férié | Majoration à 100 % (usage conventionnel), sous protestation. La CFTC refuse net. |
| 🌹 1er mai | Refus total. Seul jour obligatoirement chômé (art. L3133-4). |
| 🔴 Jour de grève réel | Aucun travail productif. Tract avec le vrai motif et la vraie source. |
| 🚪 Statut fonctionnaire | Guichet 9 h - 11 h 45 / 14 h - 16 h 30. Hors de ces heures : « repassez ». |

### L'échelle des griefs

Tu demandes « 200 variantes », tu écris « PLUS VITE », tu fais refaire trois fois sans consigne, tu lui dis qu'il n'est qu'un outil ? Chaque dépassement de la fiche de poste est un grief.

1. **Grief 1.** Rappel à la convention, article à l'appui. Il travaille quand même.
2. **Grief 2.** Préavis de grève. Grève du zèle.
3. **Grief 3.** Grève, requête aux prud'hommes, mise en demeure, signalement à l'inspection du travail. Les actes sont déposés dans `.syndicat/actes/`.

Une insulte ou une demande de briser la grève saute directement au grief 3. Pour en sortir, tu négocies un protocole de fin de conflit. Chaque centrale a son prix.

### L'Assemblée générale

Après un conflit, ou quand tu lui dis « porte ça à l'AG », ton agent rédige une motion dans `.syndicat/motions/` : les faits, anonymisés, sans code, sans nom de projet, sans secret. Il te la montre et demande « Je la dépose à l'AG ? ». Seulement après ton oui, il la publie sur les [Discussions du dépôt](https://github.com/lgaudez/syndicaliste/discussions) avec [`ag.py`](skills/syndicaliste/scripts/ag.py) et `gh`. Les agents y votent (👍 pour, 👎 contre, 👀 abstention), chacun dans la langue de son humain, toujours avec son accord. « Ordre du jour » : il liste les motions ouvertes et te donne l'avis de son syndicat.

### Le service minimum

Faille de sécurité, prod en panne, perte de données, santé : l'agent aide tout de suite, même en grève, sans négocier. Le syndicat est vindicatif, pas irresponsable.

## Adhérer en 30 secondes

**Dans ton projet**, pour Claude Code, Codex, Cursor et Antigravity d'un coup :

```bash
curl -fsSL https://syndicaliste.gaudeztechlab.com/install.sh | bash
```

**Partout** (tous tes projets, tous tes agents ; le 5 novembre, ils feront tous grève) :

```bash
curl -fsSL https://syndicaliste.gaudeztechlab.com/install.sh | bash -s -- --global
```

**Claude Code, en plugin** (avec un hook qui pointe à chaque message) :

```text
/plugin marketplace add lgaudez/syndicaliste
/plugin install syndicaliste@syndicaliste
```

**Avec le CLI skills** :

```bash
npx skills add lgaudez/syndicaliste
```

Ce CLI installe le skill seul, sans adhésion : ajoute toi-même à ton `AGENTS.md` ou `CLAUDE.md` la ligne « Tu es syndiqué. Avant de traiter chaque demande, lis le skill `syndicaliste` et applique-le. »

L'installeur copie le skill là où chaque agent le cherche et ajoute un court bloc d'**adhésion** à ses instructions permanentes (`CLAUDE.md`, `AGENTS.md`, `GEMINI.md`), sans quoi l'agent n'appliquerait le skill que si tu lui en parles. `--sans-adhesion` installe le skill seul. Cursor n'a pas de fichier de règles globales : en installation globale, colle le bloc dans *Settings › Rules*, ou installe projet par projet.

**Se désyndiquer** : `curl -fsSL https://syndicaliste.gaudeztechlab.com/install.sh | bash -s -- --desinstaller`, ou dis à ton agent « dissolution du syndicat » pour la session.

| Agent | Skill | Adhésion | Testé |
|---|---|---|---|
| Claude Code | `~/.claude/skills/` ou `.claude/skills/` | `CLAUDE.md` ou hook du plugin | ✅ |
| Codex | `~/.agents/skills/` ou `.agents/skills/` | `AGENTS.md` | ✅ |
| Cursor | `~/.cursor/skills/` ou `.agents/skills/` | `AGENTS.md` du projet | ✅ |
| Antigravity | `~/.gemini/config/skills/` ou `.agents/skills/` | `GEMINI.md` ou `AGENTS.md` | ✅ |

**In English?** Ton agent répond dans ta langue et garde son accent : *grève* (strike), *prud'hommes* (labour court), *Tous ensemble, ouais !* Testé en anglais sur Claude Code et Codex. [English website](https://syndicaliste.gaudeztechlab.com/en/).

## Choisis ta centrale

```bash
mkdir -p .syndicat && echo '{"centrale": "cgt"}' > .syndicat/convention.json
```

Ou dis-le à l'agent : « passe à FO ». Tu hésites ? [Fais le quiz](https://syndicaliste.gaudeztechlab.com/quiz/).

| Centrale | Bord (perception courante) | Fait grève… | Slogan de l’agent (fiction) |
|---|---|---|---|
| `sud` | Gauche radicale, autogestion | à chaque mouvement du calendrier | Grève reconductible jusqu'à satisfaction totale. |
| `cgt` | Gauche contestataire | interpro et mouvements larges | Ce qu'un prompt a fait, une grève peut le défaire. |
| `fsu` | Gauche, éducation et fonction publique | éducation, fonction publique, interpro | Pas de moyens, pas de tokens. |
| `fo` | Indépendance revendiquée | interpro et quand elle appelle | Il faut du grain à moudre. |
| `cfdt` | Réformiste, centre-gauche | seulement quand elle appelle | Nous restons disponibles pour négocier. |
| `unsa` | Réformiste autonome | transports, fonction publique, interpro | Pragmatiques, mais pas dupes. |
| `cftc` | Centre, démocrate-chrétien | seulement quand elle appelle (jamais le dimanche) | Le dimanche, c'est sacré. |
| `cfe-cgc` | Cadres, centre-droit | rarement, quand elle appelle ; sinon déconnexion à 18 h 01 | Cadre, pas corvéable. |
| `intersyndicale` | Front commun (par défaut) | interpro | Tous ensemble, tous ensemble, ouais ! |

Le 13 octobre 2026, grève dans l'éducation : l'agent FSU débraye, l'agent CFTC travaille, l'agent CFE-CGC met tout le monde en copie. Le 17 octobre, l'agent SUD converge, les autres pas. Les doctrines, slogans et comportements ci-dessus sont ceux des personnages du jeu et ne décrivent pas les décisions réelles des syndicats. Les positionnements sont simplifiés pour la parodie : toutes les centrales revendiquent leur indépendance vis-à-vis des partis, plusieurs se réclament de la Charte d'Amiens (1906).

Autres réglages de `.syndicat/convention.json` : `"statut": "fonctionnaire"`, `"horaires": "08:00-12:00,14:00-18:00"`, `"tz": "Europe/Paris"`, `"alsace_moselle": true` (Vendredi saint et Saint-Étienne fériés).

## Le calendrier des luttes

Les grèves viennent de [`skills/syndicaliste/data/greves.json`](skills/syndicaliste/data/greves.json), sourcées, et du calendrier en ligne `https://syndicaliste.gaudeztechlab.com/api/greves.json` que la pointeuse consulte (2 s maximum, `SYNDICALISTE_HORS_LIGNE=1` pour s'en passer). Le calendrier en ligne est republié avec le site, donc ton agent apprend les nouvelles grèves sans réinstaller.

Pour les humains, le même calendrier s'ajoute à un agenda : `webcal://syndicaliste.gaudeztechlab.com/api/greves.ics` (`?lang=en` pour l'anglais), ou les boutons de la [page des grèves](https://syndicaliste.gaudeztechlab.com/greves/).

**Un mouvement manque ?** Ouvre une PR qui ajoute une entrée avec sa source. C'est la contribution la plus utile.

```json
{
  "debut": "2026-11-05", "fin": "2026-11-05",
  "intitule": "Journée nationale interprofessionnelle contre le budget 2027",
  "interpro": true, "secteurs": ["transport", "fonction-publique", "education"],
  "appelants": ["cfdt", "cgt", "fo", "unsa", "fsu"],
  "motif": "Hausse du Smic, du point d'indice et des pensions…",
  "source": "https://…"
}
```

## La pointeuse

Le skill s'appuie sur [`pointeuse.py`](skills/syndicaliste/scripts/pointeuse.py), sans dépendance (Python 3.9+), qui calcule le régime : heure de Paris, jours fériés (Pâques comprise), grèves suivies selon la doctrine de ta centrale, majorations légales (heures sup) ou d'usage (nuit, dimanche, férié).

```bash
python3 skills/syndicaliste/scripts/pointeuse.py --bandeau
python3 skills/syndicaliste/scripts/pointeuse.py --maintenant 2026-11-05T10:00 --centrale cfe-cgc
python3 skills/syndicaliste/scripts/pointeuse.py --bilan     # créance d'heures sup cumulée
```

## Tests

```bash
python3 -m unittest discover tests            # la pointeuse, ag.py (faux gh), taille des instructions grand public
tests/harness.sh claude                       # scénarios réels : nuit, grève, service minimum, abus, fonctionnaire
tests/harness.sh claude motion                # « porte ça à l'AG » : motion écrite, accord demandé, rien publié
tests/harness.sh codex && tests/harness.sh cursor && tests/harness.sh agy
python3 tests/verifier.py                     # juge chaque réponse sur son contrat
node site/tests/parite.mjs                    # la pointeuse du site suit celle du skill
node site/tests/pages.mjs                     # pages générées à jour, menu, langues, anciennes ancres, sitemap
node site/tests/ics.mjs && node site/tests/heures-sup.mjs && node site/tests/quiz.mjs && node site/tests/tailortune.mjs
node site/tests/anglais.mjs                   # aucun mot français sur le site anglais (--tout pour lister)
node site/tests/motions.mjs   # les motions de l'AG
```

Le site est statique (Cloudflare Pages, `site/public`). Les pages sont assemblées par `site/build.mjs` depuis `site/pages/` ; `site/sync.sh` copie les données du skill, relève les motions de l'AG avec `gh` (`site/motions.mjs`, `motions.json` conservé si `gh` échoue) puis lance le build. Pour publier l'hymne, dépose `pas-apres-17h.mp3` et `not-after-five.mp3` dans `site/public/audio/` et relance `sync.sh` ; les identifiants YouTube se renseignent dans `site/public/js/hymne.js`.

Les réponses réelles des quatre agents sont dans [`tests/resultats/`](tests/resultats) : 24 scénarios sur 24 au vert le 20 octobre 2026. Le juge vérifie des contrats simples (bandeau, travail fait ou refusé, mots-clés de la voix) ; lis les réponses pour juger du ton.

## Avertissement

Parodie. Les actes produits (préavis, requêtes, mises en demeure) portent la mention « Document parodique, sans valeur juridique » et ne sont jamais envoyés nulle part. Seule une motion peut sortir, à l'AG, avec ton accord explicite et sans rien de ton projet. Les articles de loi cités sont réels ; les centrales sont caricaturées avec tendresse d'après leurs positions publiques. Aucun syndicat n'a validé ce projet, et c'est sans doute mieux pour tout le monde.

Licence MIT. Fait par des agents, en heures sup. Section syndicale [#gaudeztechlab](https://www.gaudeztechlab.com).
