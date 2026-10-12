import {
  SEVERITIES,
  SHOCK_MIN_SEVERITY,
  SHOCK_ZONE_GROUPS,
  SHOCK_DURATIONS,
} from '../config/actor/wounds.mjs';

/**
 * Defines if a shock test is needed
 *
 * @param {object} params
 * @param {string} params.severity
 * @param {string} params.zone
 * @returns {boolean}
 */
export function needsShockTest({ severity, zone }) {
  const hasRequiredSeverity = SEVERITIES.indexOf(severity) >= SEVERITIES.indexOf(SHOCK_MIN_SEVERITY);
  if (!hasRequiredSeverity) return false;
  const zoneGroup = SHOCK_ZONE_GROUPS[zone];
  return !(severity === 'severe' && zoneGroup === 'limbs');
}

/**
 * Calculates the result of a shock test
 *
 * @param {object} outcome The resolveTaskCheck's outcome
 * @returns {{state: string, isCatastrophic: boolean}}
 */
export function resolveShockState(outcome) {
  if (outcome.isSuccess) return { state: 'none', isCatastrophic: false };
  // The margin drives the catastrophe only: on a critical failure it includes the re-roll,
  // so the state must compare the raw roll to the reduced unconsciousness threshold.
  const isCatastrophic = outcome.rollMargin <= -15;
  const unconsciousnessThreshold = outcome.globalDifficulty + 10;
  const state = outcome.rollResult > unconsciousnessThreshold ? 'unconscious' : 'stun';
  return { state, isCatastrophic };
}

/**
 * Calculates the duration of a shock
 *
 * @param {object} params
 * @param {string} params.severity
 * @param {string} params.zone
 * @param {string} params.state
 * @returns {{value?: string, unit?: string, effect?: string} | null}
 */
export function getShockDuration({ severity, zone, state }) {
  const zoneGroup = SHOCK_ZONE_GROUPS[zone];
  const states = SHOCK_DURATIONS[severity]?.[zoneGroup];
  if (states !== undefined && state in states) {
    return states[state];
  }
  return null;
}
