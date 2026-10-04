# Polaris pour FoundryVTT — contexte projet

Système FoundryVTT (cible **v14**, API identique à v13) pour le JDR **Polaris v3.1** (Philippe Tessier).
Auteur : Thomas. Dépôt : github.com/thomasphilipps/polaris. Branche de travail : `combat` (dérivée de `development`, elle-même en avance sur `master`).

Avancement, règles déjà tranchées, dette technique et TODO : @docs/combat-status.md
(Tiens ce fichier à jour : voir la dernière section de `docs/combat-status.md`.)

## Comment travailler avec Thomas (IMPORTANT)

- **Langue** : conversation en français. Code, commentaires et JSDoc en **anglais**. Le français n'apparaît que dans les valeurs de `src/lang/fr.json`.
- **Thomas veut coder lui-même** pour s'approprier le projet. Par défaut : guider, ne pas livrer l'implémentation complète.
  - Découper en petites étapes, lui laisser écrire, relire son code.
  - Face à un bug, poser d'abord la question qui mène à la cause avant de donner la correction. Cette question doit être dans un bloc à part, annoncée explicitement comme une piste de bug (fichier/fonction concernés) — jamais glissée dans une liste d'autres corrections.
  - Réduire les indications au fil de la progression (il trouve déjà seul des bugs de logique et des cas limites oubliés).
  - Code complet seulement s'il le demande explicitement.
- **Gros chantier** : proposer l'architecture et les décisions à trancher (tableaux courts), attendre sa validation, puis seulement guider/coder.
- **Style** : réponses concises et structurées, tableaux plutôt que prose. Rigueur sur les vérifications (relire le code réel du dépôt plutôt que supposer).
- **Règles du jeu : ne jamais inventer.** Info absente du texte source → écrire `INFORMATION MANQUANTE` et poser la question. Ne pas modifier les valeurs numériques. Signaler les contradictions entre passages de règles au lieu de trancher en silence.
- **Le texte source des règles n'est pas dans le dépôt** (droit d'auteur). Pour implémenter une règle, demande à Thomas de coller le passage concerné. Ne recopie jamais le texte du livre : synthèses courtes, en tes mots. Les mécaniques (formules, seuils, tables) sont en revanche légitimes à coder.
- **Principe UX** : Polaris est très simulationniste. Un maximum de bonus/malus calculés automatiquement ; idéalement 0 à 1 champ manuel avant un jet, 3 maximum si justifié. « Du jeu de rôle, pas un jeu vidéo » : ne pas automatiser ce qui relève du jugement du MJ (Techniques d'Arts martiaux, Lutte…) — le champ de modificateur ad hoc suffit.

## Conventions de code

- Identifiants internes **en anglais** (gravités `light/medium/severe/critical/deadly/destroyed`, zones `head/body/armLeft/armRight/legLeft/legRight`, etc.).
- JSDoc en anglais, type entre accolades sur chaque `@param`.
- **Imports statiques uniquement. Aucun `import()` dynamique, jamais** : le build Rollup produit un fichier unique (`output.file`) et plante sinon.
- Tous les `Hooks.on(...)` sont enregistrés dans `src/polaris.mjs` ; la logique vit dans des fonctions exportées de `src/module/config/hooks.mjs`.
- API v14 : ApplicationV2 + `HandlebarsApplicationMixin`, `DialogV2`, `TypeDataModel`, hook `renderChatMessageHTML` (pas `renderChatMessage`), `Roll#evaluate()` asynchrone, `ChatMessage.create({ rolls: [...] })`.
- Un champ se met à jour sur le document qui le possède : `item.update(...)` pour un Item embarqué, jamais `actor.update({ 'items.<id>…' })`.
- Config de jeu : un fichier par domaine sous `src/module/config/`, agrégé dans `POL3` (`config.mjs`), exposé via `CONFIG.POL3`. Les labels sont des clés i18n `POL3.…`.
- Séparer la **logique pure** (aucune API Foundry : `resolveTaskCheck`, `resolveOpposedCheck`, `damage-resolver`) des **orchestrateurs** (dés Foundry, chat, dialogues, réseau).
- Pas de chaîne française en dur affichée à l'écran : passer par `game.i18n` (il reste de la dette, voir status).

## Build & test

- `npm run dev` (rollup -w, `NODE_ENV=development`) / `npm run build` (production + terser).
- Sortie dans le dossier Foundry `Data/systems/polaris` ; override via la variable d'env `FOUNDRY_DATA_PATH`.
- Les `.mjs` ne se rechargent **pas** à chaud : **F5** dans Foundry après chaque modification JS. Templates et lang : rechargement à chaud en mode dev.
- CSS : le système s'appuie pour l'instant sur les styles de base de Foundry ; `src/polaris.css` est écrit à la main et copié tel quel par Rollup. `src/sass/` et les dépendances sass/gulp sont conservés pour les futurs styles propres à Polaris (aucune compilation SCSS aujourd'hui).
- `src/packs-maker.mjs` est destiné à être distribué dans les releases, contrairement à `rollup.config.mjs` : les deux restent indépendants (pas de module partagé entre eux).
- Triche de dés (API console exposée en dev uniquement ; la file, toujours vide, reste dans le bundle prod via `rollD20`) : console Foundry `game.system.api.dev.forceNextD20(20)`, `forceNextD20(3, 18)` (file FIFO), `clearForcedRolls()`.
- Pas de tests automatisés : les vérifications se font en jeu.

## Architecture (`src/`)

| Chemin (`src/module/…`) | Rôle |
|---|---|
| `config/config.mjs` | Agrège `POL3` (ATTRIBUTE, SKILL, WEAPON, WOUND, ARMOR, BODY_TEMPLATE) + `SUCCESSTABLE`, `FAILURETABLE`, `DEGREE_BARELY`, GENETICTYPE, SEX, HANDEDNESS, BOOK, TABLEARRAY |
| `config/actor/` | `attributes`, `wounds` (SEVERITIES, BASE_MAX, RESISTANT_BONUS, MALUS, ACTION_IMPOSSIBLE, SEVERITY_THRESHOLDS, `ZONES()`, `buildDefaultWounds()`), `bodyTemplates` (BODY_TEMPLATES, TYPE, LOCATION_TABLES) |
| `config/item/` | `skills`, `weapons` (CATEGORY, SUBCATEGORY, RANGE, BURST, CATEGORY_TO_SKILL_CATEGORY), `armor` (TYPE, CATEGORY, ZONES) |
| `config/hooks.mjs` | Handlers de hooks (`onPreCreateItem`, `onPreUpdateItem`, `onRenderChatMessageHTML`) |
| `config/settings.mjs`, `config/templates.mjs` | `registerSystemSettings` (réglage monde `worldAmbiance`) ; `preloadHandlebarsTemplates` (partials préchargés) |
| `models/`, `documents/`, `apps/` → `_module.mjs` | Barrels importés par `polaris.mjs` (une classe à enregistrer = une ligne à y ajouter) |
| `models/actor/` | `base-actor.mjs` (`Pol3ActorDataModel` : `bodyTemplate`, `wounds` en `TypedObjectField`, attributs ; `heroFields()`), `hero.mjs` (`Pol3Hero`) |
| `models/item/` | `base-item.mjs` (`Pol3ItemDataModel`, `itemGlobalFields`, `specialNameOption`), `skill`, `weapon`, `armor` ; `getRollData()` sur skill et weapon |
| `documents/actor.mjs` | `Pol3Actor` : données dérivées (attributs secondaires, malus de blessures), `applyWound`/`healWound`, `getSkillValue`, `_preCreate`/`_preUpdate` (synchro des zones selon `bodyTemplate`) |
| `documents/item.mjs` | `Pol3Item` : `prepareBaseData` (niveaux de compétence…), `roll()` |
| `dice/roll-resolver.mjs` | `resolveTaskCheck` (pur), `applyDegree`, `rollD20` (+ triche dev), `rollTaskCheck` (modificateurs auto + ad hoc, puis d20) |
| `dice/opposed-resolver.mjs` | `resolveOpposedCheck` (pur, générique, réutilisable hors combat) |
| `dice/task-check.mjs` | Test simple ; jet de touche à distance puis `damageCheck` |
| `dice/melee-check.mjs` | Contact : Allonge auto, jet de l'Attaquant, défense via socket, opposition, dégâts |
| `dice/damage-resolver.mjs`, `damage-check.mjs` | Pur : localisation, dégâts finaux, gravité. Orchestrateur : dialogues, jets, application de la blessure |
| `dice/automatic-modifiers.mjs` | Fournisseurs de modificateurs automatiques (aujourd'hui : blessures) |
| `net/socket.mjs` | Canal `system.polaris` : `initSocketListeners`, `requestOpposedDefense`, `requestApplyWound`, `handleOpposedDefensePrompt` (bouton MJ « Répondre à sa place », branché dans `hooks.mjs`) |
| `apps/dialogs/` | `modifier-dialog`, `location-dialog`, `opposed-defense-dialog` (DialogV2) |
| `apps/sheets/` | `actor/` (`base-actor-sheet`, `hero-sheet`), `item/` (`base-item-sheet`, `skill-sheet`, `weapon-sheet`, `armor-sheet`) |
| `utils/` | `sheet-utils` (`datasetOf`, `toPascalCase`, `groupItemsByField`, `openConfigDialog`), `combat-utils` (`getSingleTarget`, `getActorToken`, `measureTokenDistance`, `getRangeBand`) |
| `dev/dice-cheat.mjs` | File de d20 forcés : `forceNextD20`, `clearForcedRolls` (console, dev), `consumeForcedD20` (lu par `rollD20`) |

Hors module : `src/polaris.mjs` (init : modèles, sheets, hooks, sockets, réglages), `src/system.json` (`"socket": true`), `src/lang/fr.json`, `src/polaris.css`, `src/assets/icons/` (icônes de catégories de compétence), `src/templates/` (`sheets/`, `dialogs/` = dialogues de config de la fiche d'acteur), `src/_source/skills/*.yml` + `src/packs-maker.mjs` (compendium des compétences), `rollup.config.mjs`.

## Flux d'une attaque

1. Fiche : action `rollItem` → `Pol3Item#roll()` → `system.getRollData()`.
   - `weapon` : compétence via `actor.getSkillValue(linkedSkill)` (absente → notification, pas de jet) ; cible unique via `getSingleTarget()`.
   - Distance : bande de portée = distance canvas vs `hitDistance` de l'arme → modificateur `POL3.WEAPON.RANGE` ; au-delà de « extrême » = tir impossible.
2. Arme `ranged` → `taskCheck` → `rollTaskCheck` → si succès → `damageCheck`.
3. Arme non `ranged` → `meleeCheck` : jet de l'Attaquant, `requestOpposedDefense` (le Défenseur choisit librement n'importe quel Attribut ou Compétence), `resolveOpposedCheck`, puis `damageCheck` pour qui l'emporte (les deux sur égalité).
4. `damageCheck` : dialogue de localisation (Auto d20 / Manuelle), jet de dégâts, dialogue de modificateur ad hoc, calcul, gravité, puis `requestApplyWound` (exécuté chez le propriétaire de la cible ou le MJ, pour respecter les permissions Foundry).
