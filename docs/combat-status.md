# État du combat — Polaris pour FoundryVTT

Dernière mise à jour : 2026-10-24 (branche `combat`).
Fichier importé par `CLAUDE.md`. Mets-le à jour dès qu'une phase avance ou qu'une décision est prise.

## 1. Avancement

| Phase | Contenu | Statut |
|---|---|---|
| A | Tir simple : cible unique, portée automatique (canvas + `hitDistance`) | ✅ fait, testé |
| — | `bodyTemplate` + zones de blessure dynamiques (`TypedObjectField`) | ✅ fait, testé |
| C | Dommages + localisation (Auto d20 / Manuelle) | ✅ fait, testé |
| B | Contact : Test d'opposition, défense via socket, Allonge automatique | ✅ fait, testé |
| — | Modificateurs automatiques (blessures) + ad hoc sur touche **et** dégâts | ✅ fait, testé |
| — | Chat cards détaillées (test, opposition, dégâts) + saut du dialogue de modificateur | ✅ fait, testé (CSS des cartes à faire) |
| — | Test de Résistance au Choc (armes sans dommages de choc) | ✅ fait, testé |
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
- Automatiques (`automatic-modifiers.mjs`) : malus de blessure = le pire de **toutes** les zones, quelle que soit la zone concernée par l'action. Étourdi (statut Foundry `stun`) : −5 (`STUN_MALUS`) sur **tous** les jets de l'acteur, cumulé avec le malus de blessure (confirmé par Thomas le 2026-10-13) ; le Test de Choc lui-même n'applique aucun modificateur automatique. Architecture en liste de fournisseurs, extensible.
- Ad hoc : saisi dans `modifier-dialog.mjs`, avec récapitulatif des automatiques et total en direct. Appliqué des deux côtés d'un Test d'opposition, et aussi aux dégâts.
- Saut du dialogue ad hoc : réglage **client** `askForModifier` (« demander par défaut »), que Maj+clic inverse ; même règle pour le dialogue des dégâts. Le Défenseur d'une opposition suit son propre réglage, pas le Maj de l'Attaquant. Le dialogue de localisation reste systématique.
- Les modificateurs circulent en liste `{ label (clé i18n), value }` de bout en bout, socket compris ; ils sont localisés au rendu.

**Chat cards** (`apps/chat/chat-card.mjs`, `templates/chat/`)
- Trois cartes (test, opposition, dégâts). Résumé court visible (type de jet, jet, réussite/échec, critique, marge, seuil final) ; détail des modificateurs dans un `<details>` replié.
- Opposition : jet, seuil et marge des deux camps, puis marge effective du vainqueur. Le Défenseur ne poste pas de message : son jet, son breakdown et ses modificateurs reviennent par le socket.

**Dégâts et localisation**
- Dégâts = dé de l'arme + modificateur de réussite (+ modificateur de dégâts au contact si mêlée) + modificateur ad hoc + résistance aux dégâts de la cible (valeur négative) − protection d'armure (couvrant la zone **et** équipée), réduite par la pénétration de l'arme sans descendre sous 0. Plancher à 0 uniquement sur le résultat final.
- Gravité : seuils 5 légère, 10 moyenne, 15 grave, 20 critique, 25 mortelle, 30 mort/membre détruit (`SEVERITY_THRESHOLDS`). 1–4 points : notifiés mais aucune blessure.
- Localisation : tables d20 dans `bodyTemplates.mjs` (humanoïde : contact ≠ distance ; poisson et autres créatures/PNJ : table unique). Choix Auto / Manuelle systématique avant le jet.
- Application de la blessure : `requestApplyWound` via socket (le propriétaire connecté, sinon le MJ).

**Sockets** (`net/socket.mjs`, `"socket": true` dans `system.json`)
- Destinataire : joueur propriétaire connecté en priorité ; un bouton MJ « Répondre à sa place » est toujours posté dans le chat (le MJ peut forcer une réponse à tout moment, pas de timeout). Même mécanisme pour la défense opposée et le Test de Choc (`postGmOverrideMessage`).
- Test de Choc : demandé par `damageCheck` après la carte de dégâts, sans attendre la réponse.

## 3. Dette technique et pièges connus

| # | Sujet |
|---|---|
| 1 | **Couplage par nom** : `getSkillValue` et `weapon.linkedSkill` comparent des noms (normalisés trim/lowercase). Fragile (renommage, traduction). Clés stables prévues plus tard ; la sous-compétence passe par le champ `specialization` des compétences. |
| 2 | `closeCombatModifier` est **supposé** être le « Modificateur de Dommages au contact » du livre — à confirmer. |
| 3 | Combat à mains nues non modélisé : sur égalité, un Défenseur sans arme de mêlée équipée n'inflige pas de riposte (simple `console.warn`). |
| 4 | Zones d'armure (`head/body/arms/legs`) plus grossières que les zones de blessure ; les nageoires de poisson n'ont aucune zone d'armure correspondante (protection = 0). |
| 5 | Champs `label: 'POL3.ZONE.*'` de `BODY_TEMPLATES` inutilisés ; les vrais labels viennent de `POL3.ZONES.<Zone>.Label`. |
| 6 | Chaînes en dur restantes : tooltips « Roll/Delete » dans les templates de fiche, `console.warn` en français, etc. (les messages de chat des jets passent désormais par i18n). |
| 7 | Chat cards : aucun CSS propre pour l'instant (repoussé à la fin). La relance d'un échec critique n'apparaît pas dans la carte ; un d20 forcé par la triche s'affiche comme un nombre, sans icône de dé. |
| 8 | `weapon.getRollData()` renvoie `actor`, inutilisé par `meleeCheck` (qui recalcule `weapon.actor`). |
| 9 | Une seule arme de mêlée équipée du Défenseur est prise en compte (la première) ; un seul token actif pour l'Attaquant (`getActiveTokens()[0]`). |
| 10 | Test de Résistance au Choc : si le joueur et le MJ répondent tous deux à la même demande, deux cartes sont postées (fermeture du dialogue de l'autre écartée par Thomas : trop de travail pour le gain). Sans propriétaire connecté ni MJ, personne ne lance le test. |
| 11 | `creatureAttack` (compétence « Attaque » unique, contact ou distance selon la créature, table de localisation propre) : non traité. |
| 12 | Clés i18n : vérifier que toutes celles utilisées existent dans `fr.json` (`POL3.OPPOSED.*`, `POL3.DAMAGE.*`, `POL3.ERROR.*`, `POL3.DIALOG.*`). Un audit des textes en dur et des clés manquantes reste à faire. |
| 13 | **À vérifier en jeu** : les requêtes socket transmettent `actor.id` et le destinataire fait `game.actors.get(id)`. Pour un token non lié (PNJ), cela désigne l'acteur de base, pas l'acteur du token. Correctif envisagé : transmettre `actor.uuid` et résoudre avec `fromUuid`. |

## 4. Décisions ouvertes et TODO

- **Esquive active à distance** (Test d'opposition contre un tir) : le texte dit « pas d'opposition en combat à distance ». Ce serait une house rule — en attente de la relecture du livre par Thomas.
- **Test de Choc (décisions prises le 2026-10-11, fait le 2026-10-14)** :
  - Résolu comme un test d'Attribut (`resolveTaskCheck`, critiques compris) : valeur = seuil d'étourdissement, modificateur = malus de la blessure reçue (`POL3.WOUND.MALUS`). Réussite = rien ; échec avec jet ≤ seuil d'inconscience réduit = étourdi ; au-dessus = inconscient.
  - Arme sans dommages de choc : test à partir d'une blessure `severe`, sauf grave sur un membre (pas de test). Arme avec dommages de choc : test systématique, quelle que soit la zone (chantier suivant).
  - Le d20 est lancé par le propriétaire de la cible, via socket (le joueur garde la main sur ce qu'il subit).
  - Statut Foundry posé sur l'acteur (étourdi / inconscient), retiré ou changé à la main par le MJ via le HUD du token (pas de bouton dédié sur la carte : décision du 2026-10-14). Étourdi : −5 automatique (fournisseur dans `automatic-modifiers.mjs`) ; attaquer reste possible, avec une notification d'avertissement. Inconscient : avertissement aussi, sans blocage (décision du 2026-10-13).
  - Gravité retenue : celle que donnent les points de dommages comparés aux seuils de blessure (pas la gravité inscrite après débordement des cases).
  - Catastrophe : marge d'échec de 15 ou plus par rapport au seuil d'étourdissement réduit, **si le MJ le souhaite** ; la carte la signale comme possible, l'effet de la table est indicatif, modifiable ou ignorable par le MJ.
  - Durée : formule lue dans la table pour les humanoïdes, toujours modifiable par le MJ ; pour les autres gabarits, formule saisie à la main. Tours de combat = phases de combat, minutes = phases de jeu de rôle ; l'unité est stockée avec la formule. Jet de durée : bouton MJ sur la carte de choc (un par durée, catastrophe comprise), dialogue de formule et d'unité préremplies, carte de résultat publique au nom de l'acteur ; plusieurs clics autorisés. Décompte manuel par le MJ, à conserver quand les tours de combat Foundry seront gérés. Corrections de la table validées par Thomas pour les armes de choc : grave 2D6 / 2D6, mortelle 5D6 / 5D6, membre détruit 5D6 / 5D6.
  - Pas de cas particulier « mort = pas de test » : la Chance pourra intervenir (non gérée, à traiter avant ou après les tours de combat).
  - Non codé, laissé au MJ : inconscience, comas, réveil, stabilisation, limites de déplacement de l'étourdi.
- **Armes de choc (décisions du 2026-10-16, à coder)** : deux familles, distinguées par un booléen `shockOnly` sur l'arme ; formule de choc dans `shockDamage` (renommage de `chocDamage`, sans migration : système pas encore public, base de test vérifiée le 2026-10-17).
  - Arme physique avec dommages additionnels de choc : jet physique d'abord, blessure réelle inscrite comme d'habitude. Puis jet de `shockDamage`, auquel s'appliquent la résistance aux dommages de la cible et `shockProtection` (qui s'ajoute à la protection d'armure pour le seul calcul du choc). La partie choc est plafonnée à 0 (elle ne fait jamais baisser la blessure virtuelle). Physiques + choc = blessure **virtuelle**, qui ne sert qu'au malus du Test de Choc et à la durée (colonne « armes de choc »). Seule la résistance (= « Résistance aux blessures » du livre, confirmé le 2026-10-23) et `shockProtection` s'appliquent au jet de choc : ni réussite, ni contact, ni ad hoc ; la résistance compte donc deux fois dans le total virtuel (voulu par le texte). La part de choc s'ajoute même si les dommages physiques valent 0. Test quelle que soit la zone touchée (le livre réserve la tête aux armes « normales » et toute zone aux armes conçues pour le choc ; Thomas retient toute zone pour toutes, 2026-10-16, confirmé le 2026-10-23). Malus du Test de Choc : `POL3.WOUND.MALUS` pour les deux familles (une seule colonne dans la table, 2026-10-23).
  - Arme uniquement de choc (`shockOnly`) : même calcul qu'une arme ordinaire (réussite, contact, ad hoc, résistance), protection = armure de la zone + `shockProtection` ; aucune blessure inscrite, la gravité ne sert qu'au Test de Choc. Pas de test sous 5 points ; au-delà, test systématique quelle que soit la zone. Localisation conservée.
  - Durée : `SHOCK_WEAPON_DURATIONS`, pour l'étourdissement et l'inconscience seulement. Catastrophe : signalée par la carte, effet géré manuellement par le MJ (pas de colonne dans la table).
  - Hors périmètre : armes à action neurale (jouées en roleplay, trop spécifiques), exo-armures (traitées plus tard, avec leurs règles proches des véhicules), armes inopérantes sous l'eau (phase F), charges supplémentaires (−1 au Test de Choc par charge en plus, dommages inchangés : géré par le MJ, à reprendre avec les munitions ; 2026-10-23).
- **Pénétration (décision du 2026-10-16, faite le 2026-10-17)** : protection d'armure effective = `max(0, protection − penetration)` ; la pénétration n'ajoute jamais de dommages sans armure et ne réduit pas `shockProtection`.
- **Propagation des modifications d'objets (décisions du 2026-10-17, à faire après les armes de choc)** : sens unique compendium → objets du monde → copies embarquées dans les acteurs (une modification du monde ne touche jamais le compendium). Report automatique, sans confirmation, du diff de la mise à jour (`changes`), nom et image compris. Aucun champ exclu : le MJ doit pouvoir corriger une erreur de création en cours de partie ; une variante propre à un personnage passera par un objet distinct ou des ActiveEffects. Lien par l'uuid de l'original (flag posé au drop, ou `_stats.compendiumSource`), via le hook `updateItem` exécuté par le seul client auteur. L'ancien flag `parentItemId` n'est pas repris (système pas encore public, aucune migration). Tokens non liés hors périmètre (voir dette #13).
- **CSS des chat cards** : à faire en dernier, une fois le reste prêt (décision de Thomas).
- **Phase E (décision prise)** : pas de détection automatique des Techniques (dépendrait du couplage par nom, et Initiative / états multi-tours n'existent pas). À la place : champ ad hoc sur les dégâts (fait) + Journal Entry d'aide-mémoire à créer/vérifier dans Foundry.
- **Vérification légale** : contact avec l'éditeur / Philippe Tessier avant toute publication officielle (nom « Polaris », liste de compétences) — hors code, en cours côté Thomas.

## 5. INFORMATION MANQUANTE (ne pas inventer)

- Système d'**Initiative** (pool de points dépensables, Préparations à 3 points, Modes de combat) : inexistant dans le projet. Bloque Enchaînement, Balayage, saisie de Lutte, tir visé (points d'Initiative sacrifiés).
- **Taille de la cible** : le tableau de modificateurs de taille existe dans les règles, mais l'acteur n'a pas de champ de taille exploitable.
- **Test d'Observation / Perception** (combat et tir en aveugle) : vérifier qu'une compétence équivalente existe dans le compendium.
- États persistants multi-tours (clé maintenue, étranglement progressif) : aucun mécanisme.
- Condition exacte pour « être capable de manier deux armes » : non précisée par le texte.

## 6. Prochaines étapes envisageables

Piste 1 terminée et testée le 2026-10-11, hors CSS des cartes.

1. **En cours** — Armes de choc (règles au §4). Faits : étape 0 pénétration, étape 1 champs `shockDamage` / `shockOnly` (commit `52125a1`), étape 2 `isShockWeapon` dans `needsShockTest` (aucun test sans gravité) et `getShockDuration` (2026-10-20). Reste :
   - ✅ **3a** (2026-10-23, commit `d2eadbc`) — `damageCheck`, arme `shockOnly` : jet de `shockDamage` au lieu de `baseDamage` ; protection = `max(0, armure − pénétration)` + `shockProtection` ; pas de `requestApplyWound` ; carte : la gravité est un choc, pas une blessure.
   - ✅ **3b** (2026-10-24, commit `8f11f5d`) — `damageCheck`, arme avec `shockDamage` et `shockOnly` faux : après le flux normal, jet de `shockDamage` + résistance − `shockProtection`, plafonné à 0, ajouté aux dommages physiques finaux → gravité virtuelle ; section « Choc » sur la carte. Formule de choc invalide : avertissement, le flux physique continue sans partie choc. Fonction pure `resolveShockDamage` dans `damage-resolver.mjs`.
   - ✅ **3c** (2026-10-24) — `requestShockTest` appelé avec la gravité réelle ou virtuelle (`needsShockTest` avec `isShockWeapon`).
   - **4** — transmettre `isShockWeapon` par le socket et le bouton MJ jusqu'à `shockCheck` → `getShockDuration` (piège : `"false"` lu dans un `data-*` est vrai).
   - **5** — tests en jeu, puis mise à jour de ce fichier (§1, §2, §4).
2. Propagation des modifications d'objets (voir §4).
3. CSS des chat cards (dette #7), en dernier.
4. Phase D (distance) : demander à Thomas de coller les règles correspondantes avant de proposer l'architecture.
5. Audit i18n (textes en dur, clés manquantes) et clés stables pour les compétences (supprime la dette #1).

## 7. Mise à jour de ce fichier

Quand une phase avance, qu'une décision est prise ou qu'un bug de fond est trouvé : modifie les sections 1, 3, 4 et 5 (garde-les courtes), puis mets à jour la date en tête. Ne duplique pas ici ce que `CLAUDE.md` ou le code disent déjà.
