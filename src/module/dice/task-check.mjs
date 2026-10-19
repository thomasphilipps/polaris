import { rollTaskCheck } from './roll-resolver.mjs';
import { damageCheck } from './damage-check.mjs';
import { breakdownRoll, renderChatCard, buildCheckContext } from '../apps/chat/chat-card.mjs';
/** @import Pol3Actor from '../documents/actor.mjs' */
/** @import Pol3Item from '../documents/item.mjs' */

/**
 * Roll a task check
 *
 * @param {object} params
 * @param {Pol3Actor} params.actor                 The rolling actor
 * @param {string} params.rollLabel                 Name of the roll (skill, attribute…)
 * @param {number} [params.actionValue=0]           Base value tested
 * @param {{label: string, value: number}[]} [params.modifiers=[]]  Modifiers already known (e.g. range)
 * @param {number} [params.valueCrit=0]             Critical bonus
 * @param {boolean} [params.isAttack=false]         Whether a success leads to damage (ranged attack)
 * @param {Pol3Item|null} [params.weapon=null]      The weapon, for an attack
 * @param {Token|null} [params.target=null]         The target token, for an attack
 * @param {boolean} [params.askForModifier=true]    Whether to prompt for an ad hoc modifier
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
                                  askForModifier = true,
                                } = {}) {
  const {
    roll,
    outcome,
    modifiers: modifiersOutcome,
  } = await rollTaskCheck({
    actor,
    actionValue,
    modifiers,
    valueCrit,
    askForModifier,
    contextLabel: rollLabel,
  });

  if (outcome === null) return null;

  const context = buildCheckContext({
    rollBreakdown: breakdownRoll(roll),
    rollLabel,
    actionValue,
    outcome,
    modifiers: modifiersOutcome,
  });

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
      askForModifier,
    });
  }

  return message;
}
