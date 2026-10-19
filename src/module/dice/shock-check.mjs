import { rollTaskCheck } from './roll-resolver.mjs';
import { getShockDuration, resolveShockState } from './shock-resolver.mjs';
import { breakdownRoll, buildCheckContext, renderChatCard } from '../apps/chat/chat-card.mjs';
import { toPascalCase } from '../utils/sheet-utils.mjs';
import { MALUS } from '../config/actor/wounds.mjs';
import { promptShockDuration } from '../apps/dialogs/shock-duration-dialog.mjs';

/** @import { DurationEntry } from '../config/actor/wounds.mjs' */
/** @import Pol3Actor from '../documents/actor.mjs' */

/**
 * Performs a shock check.
 *
 * @param {object} params
 * @param {Pol3Actor} params.actor         The actor taking the test
 * @param {string} params.woundedZone      Zone of the wound causing the test
 * @param {string} params.baseSeverity     Severity of that wound (e.g. 'severe')
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

/**
 * Lets the GM adjust the duration of a shock effect, rolls it and posts the result to the chat.
 *
 * @param {object} params
 * @param {object} params.speaker        Speaker of the shock card, reused as is
 * @param {string} params.formula        Default formula read from the table (may be empty)
 * @param {string} params.unit           'Round' or 'Minutes' (may be empty)
 * @param {string} params.effect         Effect without roll (e.g. 'MildComa'), shown in the dialog
 * @param {string} params.durationType   'duration' or 'catastrophicDuration'
 * @returns {Promise<ChatMessage|null>}  null if cancelled or if the formula is invalid
 */
export async function rollShockDuration({ speaker, formula, unit, effect, durationType }) {
  const choice = await promptShockDuration({ formula, unit, effect });
  if (!choice) return null;

  if (!choice.formula.trim() || !Roll.validate(choice.formula)) {
    ui.notifications.warn(game.i18n.format('POL3.WARNING.InvalidFormula', { formula: choice.formula }));
    return null;
  }

  const durationRoll = new Roll(choice.formula);
  await durationRoll.evaluate();

  const durationContext = {
    rollTerms: breakdownRoll(durationRoll),
    duration: durationRoll.total,
    unit: choice.unit,
    isCatastrophic: durationType === 'catastrophicDuration',
  };

  const content = await renderChatCard('duration-card', durationContext);

  return ChatMessage.create({
    speaker,
    content,
    rolls: [durationRoll],
    sound: CONFIG.sounds.dice,
  });
}
