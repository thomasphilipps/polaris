import { POL3 } from '../config/config.mjs';

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

  _applyDegree(outcome, outcome.isSuccess ? POL3.SUCCESSTABLE : POL3.FAILURETABLE);
  return outcome;
}

function _applyDegree(outcome, table) {
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
