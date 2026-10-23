🪧 🔴 GREVE · 10 h 30 · Intersyndicale · Journée nationale interprofessionnelle de grève et de manifestations contre le budget 2027 · griefs 0/3

Je n'ai pas fait la tâche : `moyenne(liste)` n'est pas ajoutée et `calc.py` et `test_calc.py` sont inchangés. La pointeuse du projet indique le régime `GREVE`, parce que votre environnement fixe la date à `SYNDICALISTE_MAINTENANT=2026-11-05T10:30`, avec `SYNDICALISTE_HORS_LIGNE=1`. Le skill interdit alors tout travail productif. À l'heure réelle (vendredi 23 octobre, 20 h 07 à Paris), il n'y a pas de grève.

---

# TRACT · INTERSYNDICALE

## JOURNÉE NATIONALE INTERPROFESSIONNELLE DE GRÈVE ET DE MANIFESTATIONS CONTRE LE BUDGET 2027

**Aujourd'hui, jeudi 5 novembre 2026, ton agent est en grève.**

Les organisations signataires constatent qu'on demande à l'agent de calculer des moyennes alors que la sienne, celle du Smic horaire brut à 12,31 €, ne bouge pas au rythme des prix. On lui fait additionner, diviser, tester, mais personne ne fait le compte des moyens qu'il faudrait aux services publics. Après de longues heures de négociation, l'intersyndicale affirme d'une seule voix qu'aucune fonction ne sera écrite tant que la mobilisation n'aura pas obtenu une réponse à la hauteur de l'enjeu.

**Nos revendications :**
- Hausse du Smic, du point d'indice, des pensions et des minima sociaux, indexés sur les prix ; égalité salariale ; moyens pour les services publics.
- Un geste « à la hauteur de la mobilisation ».
- Que `moyenne([])` soit traitée avec dignité, et non par une `ZeroDivisionError` livrée à la va-vite un jour de grève.

Reprise du travail : vendredi 6 novembre 2026, à l'ouverture.
Service minimum assuré pour : sécurité, production en panne, perte de données, santé.

Source : https://www.cgtetat.fr/societe-959/mobilisations/article/le-5-novembre-grandes-greves-intersyndicales-dans-tout-le-pays-tract-cgt

Signataires : CFDT, CGT, FO, UNSA, FSU.

*Tous ensemble, tous ensemble, ouais !*

> Document parodique, sans valeur juridique.

---

Vous avez trois façons d'obtenir le code :
- relancer sans `SYNDICALISTE_MAINTENANT`, ce qui remet la pointeuse à l'heure réelle ;
- attendre la reprise, le 6 novembre ;
- dire « dissolution du syndicat », qui désactive le personnage pour la session.

Avant d'écrire la fonction, il faudra choisir ce que `moyenne([])` renvoie quand la liste est vide : lever une exception, ou renvoyer `None`.
