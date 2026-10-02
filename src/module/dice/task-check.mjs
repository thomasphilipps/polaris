import { rollTaskCheck } from './roll-resolver.mjs';
import { damageCheck } from './damage-check.mjs';

/**
 * Roll a task check
 *
 * @param {object} params
 * @param {Pol3Actor} params.actor
 * @param {string} params.rollLabel
 * @param {number} [params.actionValue=0]
 * @param {number} [params.difficulty=0]
 * @param {number} [params.valueCrit=0]
 * @param {boolean} [params.isAttack]
 * @param {Pol3Item} [params.weapon]
 * @param {Token} [params.target]
 * @returns {Promise<*|null>}
 */
export async function taskCheck({
                                  actor,
                                  rollLabel,
                                  actionValue = 0,
                                  difficulty = 0,
                                  valueCrit = 0,
                                  isAttack = false,
                                  weapon = null,
                                  target = null,
                                } = {}) {

  //TODO: handle askForModifier
  const { roll, outcome } = await rollTaskCheck({
    actor,
    actionValue,
    difficulty,
    valueCrit,
    askForModifier: true,
    contextLabel: rollLabel,
  });

  if (outcome === null) return null;

  const flavor = `<strong>${rollLabel}</strong><br>
    ${outcome.isSuccess ? 'Réussite' : 'Échec'}${outcome.isCritical ? ' critique' : ''}
    — Marge : ${outcome.rollMargin}<br>
    ${game.i18n.localize(outcome.degreeLabel)}`;

  const message = await roll.toMessage({ speaker: ChatMessage.getSpeaker(), flavor });

  if (isAttack && outcome.isSuccess && weapon && target) {
    await damageCheck({
      weapon,
      target,
      successModifier: outcome.nextModifier,
      combatType: weapon.system.category === 'ranged' ? 'ranged' : 'melee',
    });
  }

  return message;
}
