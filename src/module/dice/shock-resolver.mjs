import {
  SEVERITIES,
  SHOCK_MIN_SEVERITY,
  SHOCK_ZONE_GROUPS,
  SHOCK_DURATIONS,
  SHOCK_WEAPON_DURATIONS,
} from '../config/actor/wounds.mjs';

/**
 * Defines if a shock test is needed. No severity (under 5 points) never triggers a test.
 * Shock weapon: any severity, whatever the zone. Otherwise: from 'severe' up, except a
 * severe wound on a limb.
 *
 * @param {object} params
 * @param {string|null} params.severity  Wound severity (virtual one for a shock weapon), null if none
 * @param {string} params.zone           Wound zone (e.g. 'armLeft')
 * @param {boolean} [params.isShockWeapon=false]  Whether the weapon deals shock damage
 * @returns {boolean}
 */
export function needsShockTest({ severity, zone, isShockWeapon = false }) {
  if (!SEVERITIES.includes(severity)) return false;
  if (isShockWeapon) return true;
  const hasRequiredSeverity = SEVERITIES.indexOf(severity) >= SEVERITIES.indexOf(SHOCK_MIN_SEVERITY);
  if (!hasRequiredSeverity) return false;
  const zoneGroup = SHOCK_ZONE_GROUPS[zone];
  return !(severity === 'severe' && zoneGroup === 'limbs');
}

/**
 * Calculates the result of a shock test
 *
 * @param {object} outcome  The resolveTaskCheck's outcome
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
 * Calculates the duration of a shock, read from SHOCK_DURATIONS (by severity and
 * zone group) or, for a shock weapon, from SHOCK_WEAPON_DURATIONS (by severity only).
 *
 * @param {object} params
 * @param {string} params.severity  Wound severity (virtual one for a shock weapon)
 * @param {string} params.zone      Wound zone (ignored for a shock weapon)
 * @param {string} params.state     'stun', 'unconscious' or 'catastrophic'
 * @param {boolean} [params.isShockWeapon=false]  Whether the weapon deals shock damage
 * @returns {{value?: string, unit?: string, effect?: string} | null}  null if the table has no entry
 */
export function getShockDuration({ severity, zone, state, isShockWeapon = false }) {
  if (isShockWeapon) {
    return SHOCK_WEAPON_DURATIONS[severity]?.[state] ?? null;
  }
  const zoneGroup = SHOCK_ZONE_GROUPS[zone];
  const states = SHOCK_DURATIONS[severity]?.[zoneGroup];
  if (states !== undefined && state in states) {
    return states[state];
  }
  return null;
}
