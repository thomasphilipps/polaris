import { POL3 } from '../config/config.mjs';
import { consumeForcedD20 } from '../dev/dice-cheat.mjs';

/**
 * Calculates the result of a task roll based on known values.
 *
 * @param {number} rollResult              Initial 1d20 result
 * @param {number} actionValue             Base value tested (competence/value)
 * @param {number} difficulty              Sum of the applied modifiers
 * @param {number} [valueCrit=0]           Associated critical bonus
 * @param {number|null} [critFailReroll]   Result of the 1d20 re-roll in case of a critical failure
 * @returns {object} outcome
 */
export function resolveTaskCheck({
  rollResult,
  actionValue,
  difficulty,
  valueCrit = 0,
  critFailReroll = null,
}) {
  const globalDifficulty = actionValue + difficulty;
  const initialMargin = globalDifficulty - rollResult;

  const outcome = {
    globalDifficulty,
    isSuccess: true,
    isCritical: false,
    rollMargin: 0,
    degreeLabel: POL3.DEGREE_BARELY,
    nextModifier: 0,
  };

  if (globalDifficulty < 20) {
    if (rollResult === 20) {
      outcome.isSuccess = false;
      outcome.isCritical = true;
      outcome.rollMargin = initialMargin - (critFailReroll ?? 0);
    } else if (initialMargin > 0) {
      outcome.rollMargin = rollResult;
    } else if (initialMargin === 0) {
      outcome.isCritical = true;
      outcome.rollMargin = rollResult + valueCrit;
    } else {
      outcome.isSuccess = false;
      outcome.rollMargin = initialMargin;
    }
  } else {
    if (rollResult === 20) {
      outcome.isCritical = true;
      outcome.rollMargin = rollResult + valueCrit;
    } else {
      outcome.rollMargin = rollResult;
    }
  }

  applyDegree(outcome, outcome.isSuccess ? POL3.SUCCESSTABLE : POL3.FAILURETABLE);
  return outcome;
}

/**
 * Looks up the degree label and nextModifier for a given rollMargin against a
 * threshold table (POL3.SUCCESSTABLE or POL3.FAILURETABLE), mutating `outcome`.
 * Exported so other resolvers (e.g. opposed checks) can recompute the degree
 * on an adjusted margin without duplicating this lookup.
 * @param {object} outcome  Must have a `rollMargin` property; mutated in place.
 * @param {{threshold: number, label: string, nextModifier: number}[]} table
 */
export function applyDegree(outcome, table) {
  const isPositive = outcome.rollMargin >= 0;
  for (const entry of table) {
    const reached = isPositive
      ? outcome.rollMargin >= entry.threshold
      : outcome.rollMargin <= entry.threshold;
    if (reached) {
      outcome.degreeLabel = entry.label;
      outcome.nextModifier = entry.nextModifier;
      break;
    }
  }
}

/**
 * Rolls a 1d20, using a queued forced value if one is pending (dev cheat).
 * Exported so any 1d20 roll in the system (task checks, hit location...)
 * benefits from the same cheat mechanism.
 * @returns {Promise<Roll>}
 */
export async function rollD20() {
  const forced = consumeForcedD20();
  const roll = new Roll(forced !== null ? String(forced) : '1d20');
  await roll.evaluate();
  return roll;
}

/**
 * Rolls a 1d20 and resolves a full task check outcome (including the
 * critical-failure re-roll when applicable). Shared by any caller that needs
 * "roll + resolve" together: task-check.mjs, melee-check.mjs, and the
 * opposed-defense dialog.
 * @param {object} params
 * @param {number} params.actionValue
 * @param {number} params.difficulty
 * @param {number} [params.valueCrit=0]
 * @returns {Promise<{roll: Roll, outcome: object}>}
 */
export async function rollTaskCheck({ actionValue, difficulty, valueCrit = 0 }) {
  const roll = await rollD20();

  const globalDifficulty = actionValue + difficulty;
  let critFailReroll = null;
  if (globalDifficulty < 20 && roll.total === 20) {
    const reroll = await rollD20();
    critFailReroll = reroll.total;
  }

  const outcome = resolveTaskCheck({
    rollResult: roll.total,
    actionValue,
    difficulty,
    valueCrit,
    critFailReroll,
  });
  return { roll, outcome };
}
