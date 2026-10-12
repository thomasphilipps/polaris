import { rollTaskCheck } from './roll-resolver.mjs';
import { getShockDuration, resolveShockState } from './shock-resolver.mjs';
import { breakdownRoll, buildCheckContext, renderChatCard } from '../apps/chat/chat-card.mjs';
import { toPascalCase } from '../utils/sheet-utils.mjs';
import { MALUS } from '../config/actor/wounds.mjs';

/**@import('../config/actor/wounds.mjs').DurationEntry */

/**
 *
 * Performs a shock check.
 *
 * @param {object} params
 * @param {Pol3Actor} params.actor
 * @param {string} params.woundedZone
 * @param {string} params.baseSeverity
 * @returns {Promise<{state: string, isCatastrophic: boolean, duration: DurationEntry|null, catastrophicDuration: DurationEntry|null}|null>}
 */
export async function shockCheck({ actor, woundedZone, baseSeverity }) {
  const contextLabel = game.i18n.localize('POL3.SHOCK.ShockCheck');
  const actionValue = actor.system.stunThreshold.value;
  const valueCrit = Math.round(actionValue / 2);
  const woundModifiers = [{
    label: 'POL3.WOUND.SEVERITY.' + toPascalCase(baseSeverity),
    value: MALUS[baseSeverity],
  }];

  const { roll, outcome, modifiers } = await rollTaskCheck({
    actor,
    actionValue,
    modifiers: woundModifiers,
    valueCrit,
    contextLabel,
    applyAutomaticModifiers: false,
  });

  if (outcome === null) return null;

  const { state, isCatastrophic } = resolveShockState(outcome);

  const catastrophicDuration = isCatastrophic ? getShockDuration({
    severity: baseSeverity,
    zone: woundedZone,
    state: 'catastrophic',
  }) : null;

  const duration = getShockDuration({ severity: baseSeverity, zone: woundedZone, state });

  if (state !== 'none') {
    await actor.toggleStatusEffect(state, { active: true, overlay: true });
  }

  const context = buildCheckContext({
    rollBreakdown: breakdownRoll(roll),
    rollLabel: contextLabel,
    actionValue,
    outcome,
    modifiers,
  });

  Object.assign(context, {
    duration,
    catastrophicDuration,
    isCatastrophic,
    state,
    stateKey: 'POL3.SHOCK.STATE.' + toPascalCase(state),
  });

  const content = await renderChatCard('shock-card', context);

  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content,
    rolls: [roll],
    sound: CONFIG.sounds.dice,
  });

  return { state, isCatastrophic, duration, catastrophicDuration };
}
