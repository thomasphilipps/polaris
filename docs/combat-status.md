# État du combat — Polaris pour FoundryVTT

Dernière mise à jour : 2026-10-04 (branche `combat`).
Fichier importé par `CLAUDE.md`. Mets-le à jour dès qu'une phase avance ou qu'une décision est prise.

## 1. Avancement

| Phase | Contenu | Statut |
|---|---|---|
| A | Tir simple : cible unique, portée automatique (canvas + `hitDistance`) | ✅ fait, testé |
| — | `bodyTemplate` + zones de blessure dynamiques (`TypedObjectField`) | ✅ fait, testé |
| C | Dommages + localisation (Auto d20 / Manuelle) | ✅ fait, testé |
| B | Contact : Test d'opposition, défense via socket, Allonge automatique | ✅ fait, testé |
| — | Modificateurs automatiques (blessures) + ad hoc sur touche **et** dégâts | ✅ fait, testé |
| D | Rafales, tir à répétition, tir visé, deux armes | ⏳ à faire |
| E | Arts martiaux / Techniques / Lutte | 🔶 volontairement limité (voir §4) |
| F | Aveugle, sous l'eau, tir de suppression, boucliers | ⏳ à faire |

## 2. Mécaniques implémentées (décisions de règles tranchées)

**Test simple** (`resolveTaskCheck`)
- d20, réussite si jet ≤ `actionValue + difficulty` (difficulty positif = bonus).
- Difficulté globale < 20 : jet de 20 = échec critique (marge = marge initiale − relance d20) ; marge initiale 0 = réussite critique (marge = jet + `valueCrit`).
- Difficulté globale ≥ 20 : échec impossible ; marge = jet brut ; jet de 20 = réussite critique (jet + `valueCrit`).
- Degré et « modificateur de réussite » (`nextModifier`) lus dans `POL3.SUCCESSTABLE` / `FAILURETABLE`.
- `valueCrit` : compétence → `mastery` ; Attribut seul → moitié de sa valeur.

**Test d'opposition** (`resolveOpposedCheck`, générique)
- Un seul réussit : il gagne, marge inchangée.
- Les deux réussissent : meilleure marge gagne ; marge du vainqueur = différence des marges, celle du perdant = 0 ; degré recalculé sur la marge effective.
- Égalité (double réussite) : **règle générale retenue** (les deux touchent simultanément), pas la règle « rien ne se passe » du chapitre Combat. Contradiction entre les deux textes identifiée et tranchée par Thomas.
- Double échec : match nul, rien ne se passe.
- Tests d'opposition **prolongés** (réduire un Attribut à 0) : non implémentés ; les ActiveEffects pourraient servir plus tard pour les effets temporaires.

**Contact** (`melee-check.mjs`)
- Allonge : différence entre les Allonges des armes de mêlée équipées ; le bonus va au camp qui a l'arme la plus longue.
- Défenseur : choisit librement n'importe quel Attribut ou Compétence (dialogue, regroupé par catégorie) — pas forcément une compétence de combat.
- Égalité : le Défenseur riposte avec son arme de mêlée équipée (voir dette §3 si désarmé).

**Distance**
- Test simple, pas d'opposition (conforme au texte). Modificateurs de portée `POL3.WEAPON.RANGE` ; hors portée extrême = tir impossible.

**Modificateurs de jet**
- Automatiques (`automatic-modifiers.mjs`) : malus de blessure = le pire de **toutes** les zones, quelle que soit la zone concernée par l'action. Architecture en liste de fournisseurs, extensible.
- Ad hoc : saisi dans `modifier-dialog.mjs`, avec récapitulatif des automatiques et total en direct. Appliqué des deux côtés d'un Test d'opposition, et aussi aux dégâts.

**Dégâts et localisation**
- Dégâts = dé de l'arme + modificateur de réussite (+ modificateur de dégâts au contact si mêlée) + modificateur ad hoc + résistance aux dégâts de la cible (valeur négative) − protection d'armure (couvrant la zone **et** équipée). Plancher à 0 uniquement sur le résultat final.
- Gravité : seuils 5 légère, 10 moyenne, 15 grave, 20 critique, 25 mortelle, 30 mort/membre détruit (`SEVERITY_THRESHOLDS`). 1–4 points : notifiés mais aucune blessure.
- Localisation : tables d20 dans `bodyTemplates.mjs` (humanoïde : contact ≠ distance ; poisson et autres créatures/PNJ : table unique). Choix Auto / Manuelle systématique avant le jet.
- Application de la blessure : `requestApplyWound` via socket (le propriétaire connecté, sinon le MJ).

**Sockets** (`net/socket.mjs`, `"socket": true` dans `system.json`)
- Destinataire : joueur propriétaire connecté en priorité ; un bouton MJ « Répondre à sa place » est toujours posté dans le chat (le MJ peut forcer une réponse à tout moment, pas de timeout).

## 3. Dette technique et pièges connus

| # | Sujet |
|---|---|
| 1 | **Couplage par nom** : `getSkillValue` et `weapon.linkedSkill` comparent des noms (normalisés trim/lowercase). Fragile (renommage, traduction). Clés stables prévues plus tard ; la sous-compétence passe par le champ `specialization` des compétences. |
| 2 | `closeCombatModifier` est **supposé** être le « Modificateur de Dommages au contact » du livre — à confirmer. |
| 3 | Combat à mains nues non modélisé : sur égalité, un Défenseur sans arme de mêlée équipée n'inflige pas de riposte (simple `console.warn`). |
| 4 | Zones d'armure (`head/body/arms/legs`) plus grossières que les zones de blessure ; les nageoires de poisson n'ont aucune zone d'armure correspondante (protection = 0). |
| 5 | Champs `label: 'POL3.ZONE.*'` de `BODY_TEMPLATES` inutilisés ; les vrais labels viennent de `POL3.ZONES.<Zone>.Label`. |
| 6 | Chaînes françaises en dur : flavor de `task-check` (« Réussite », « Échec », « Marge »), tooltips « Roll/Delete » dans les templates de fiche, message de `melee-check`, etc. |
| 7 | Les messages de chat ne détaillent pas les modificateurs appliqués (le dialogue les affiche avant le jet, pas le chat). |
| 8 | `weapon.getRollData()` renvoie `actor`, inutilisé par `meleeCheck` (qui recalcule `weapon.actor`). |
| 9 | Une seule arme de mêlée équipée du Défenseur est prise en compte (la première) ; un seul token actif pour l'Attaquant (`getActiveTokens()[0]`). |
| 10 | Test de Résistance au Choc (`shock-check`) jamais reconstruit après la refonte. |
| 11 | `creatureAttack` (compétence « Attaque » unique, contact ou distance selon la créature, table de localisation propre) : non traité. |
| 12 | Clés i18n : vérifier que toutes celles utilisées existent dans `fr.json` (`POL3.OPPOSED.*`, `POL3.DAMAGE.*`, `POL3.ERROR.*`, `POL3.DIALOG.*`). Un audit des textes en dur et des clés manquantes reste à faire. |

## 4. Décisions ouvertes et TODO

- **Esquive active à distance** (Test d'opposition contre un tir) : le texte dit « pas d'opposition en combat à distance ». Ce serait une house rule — en attente de la relecture du livre par Thomas.
- **Sauter le dialogue de modificateur** (`askForModifier = false`) : clic droit ? réglage système ? les deux ? `// TODO` présents dans le code, pas décidé.
- **Chat cards personnalisées** : détailler chaque modificateur (portée, blessures, ad hoc…) plutôt qu'un total agrégé.
- **Phase E (décision prise)** : pas de détection automatique des Techniques (dépendrait du couplage par nom, et Initiative / états multi-tours n'existent pas). À la place : champ ad hoc sur les dégâts (fait) + Journal Entry d'aide-mémoire à créer/vérifier dans Foundry.
- **Vérification légale** : contact avec l'éditeur / Philippe Tessier avant toute publication officielle (nom « Polaris », liste de compétences) — hors code, en cours côté Thomas.

## 5. INFORMATION MANQUANTE (ne pas inventer)

- Système d'**Initiative** (pool de points dépensables, Préparations à 3 points, Modes de combat) : inexistant dans le projet. Bloque Enchaînement, Balayage, saisie de Lutte, tir visé (points d'Initiative sacrifiés).
- **Taille de la cible** : le tableau de modificateurs de taille existe dans les règles, mais l'acteur n'a pas de champ de taille exploitable.
- **Test d'Observation / Perception** (combat et tir en aveugle) : vérifier qu'une compétence équivalente existe dans le compendium.
- États persistants multi-tours (clé maintenue, étranglement progressif) : aucun mécanisme.
- Condition exacte pour « être capable de manier deux armes » : non précisée par le texte.

## 6. Prochaines étapes envisageables

Choix en attente de Thomas entre les pistes 1 à 3 (recommandation : 1 puis 2, pour que les modificateurs de la phase D s'affichent sans retouche).

1. Chat cards détaillées (dette #7) + trancher « sauter le dialogue ».
2. Phase D (distance) : demander à Thomas de coller les règles correspondantes avant de proposer l'architecture.
3. Audit i18n (textes en dur, clés manquantes) et clés stables pour les compétences (supprime la dette #1).

## 7. Mise à jour de ce fichier

Quand une phase avance, qu'une décision est prise ou qu'un bug de fond est trouvé : modifie les sections 1, 3, 4 et 5 (garde-les courtes), puis mets à jour la date en tête. Ne duplique pas ici ce que `CLAUDE.md` ou le code disent déjà.
