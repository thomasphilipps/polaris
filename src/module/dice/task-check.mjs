import { resolveTaskCheck } from './roll-resolver.mjs';

/**
 * Version allégée du jet de tâche, pour tester l'intégration depuis les fiches.
 * Pas de dialogue de modificateurs, pas de template hbs custom :
 * utilise Roll#toMessage() (rendu natif Foundry) pour le chat.
 *
 * @param {string} rollLabel     Libellé affiché en flavor text
 * @param {number} actionValue   Valeur de base testée
 * @param {number} [difficulty]  Modificateur total (0 par défaut, pas de dialogue ici)
 * @param {number} [valueCrit]   Bonus critique associé
 * @returns {Promise<ChatMessage>}
 */
export async function taskCheck({
                                  rollLabel,
                                  actionValue = 0,
                                  difficulty = 0,
                                  valueCrit = 0,
                                } = {}) {
  const roll = new Roll('1d20');
  await roll.evaluate();

  const globalDifficulty = actionValue + difficulty;
  let critFailReroll = null;
  if (globalDifficulty < 20 && roll.total === 20) {
    const reroll = new Roll('1d20');
    await reroll.evaluate();
    critFailReroll = reroll.total;
  }

  const outcome = resolveTaskCheck({
    rollResult: roll.total,
    actionValue,
    difficulty,
    valueCrit,
    critFailReroll,
  });

  const flavor = `<strong>${rollLabel}</strong><br>
    ${outcome.isSuccess ? 'Réussite' : 'Échec'}${outcome.isCritical ? ' critique' : ''}
    — Marge : ${outcome.rollMargin}<br>
    ${game.i18n.localize(outcome.degreeLabel)}`;

  return roll.toMessage({
    speaker: ChatMessage.getSpeaker(),
    flavor,
  });
}
