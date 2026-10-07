import { rollTaskCheck } from './roll-resolver.mjs';
import { damageCheck } from './damage-check.mjs';
import { breakdownRoll, renderChatCard, buildCheckContext } from '../apps/chat/chat-card.mjs';

/**
 * Roll a task check
 *
 * @param {object} params
 * @param {Pol3Actor} params.actor
 * @param {string} params.rollLabel
 * @param {number} [params.actionValue=0]
 * @param {{label: string, value: number}[]} [params.modifiers=[]]
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
                                  modifiers = [],
                                  valueCrit = 0,
                                  isAttack = false,
                                  weapon = null,
                                  target = null,
                                } = {}) {

  //TODO: handle askForModifier
  const { roll, outcome, modifiers: modifiersOutcome } = await rollTaskCheck({
    actor,
    actionValue,
    modifiers,
    valueCrit,
    askForModifier: true,
    contextLabel: rollLabel,
  });

  if (outcome === null) return null;

  const rollBreakdown = breakdownRoll(roll);
  const context = {
    ...buildCheckContext({ rollLabel, actionValue, outcome, modifiers: modifiersOutcome }),
    rollBreakdown,
  };

  const content = await renderChatCard('task-card', context);

  const message = await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content,
    rolls: [roll],
    sound: CONFIG.sounds.dice,
  });

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
