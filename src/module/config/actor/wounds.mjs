import { BODY_TEMPLATES } from './bodyTemplates.mjs';

/**
 * @typedef {Object} DurationEntry
 * @property {string} [value] - Value or dice expression (e.g., '1', '2', '1d6')
 * @property {string} [unit] - Time unit or status (e.g., 'Round', 'Minutes')
 * @property {string} [effect] - Effect name (e.g., 'MildComa')
 */

/**
 * Base shock effects (stunned and unconscious).
 * @typedef {Object} BaseShockEffects
 * @property {DurationEntry} [stun]
 * @property {DurationEntry} [unconscious]
 */

/**
 * Full shock effects including catastrophic.
 * @typedef {BaseShockEffects} FullShockEffects
 * @property {DurationEntry} [catastrophic]
 */

/**
 * Body zone structure for full shock durations.
 * @typedef {Object} SeverityLevel
 * @property {FullShockEffects} [head]
 * @property {FullShockEffects} [body]
 * @property {FullShockEffects} [limbs]
 */

/** Wound severities, from the lightest to the worst. */
export const SEVERITIES = ['light', 'medium', 'severe', 'critical', 'deadly', 'destroyed'];
/** Number of wound boxes per severity, before the resistant-zone bonus. */
export const BASE_MAX = { light: 3, medium: 3, severe: 2, critical: 2, deadly: 1, destroyed: 1 };
/** Extra wound boxes per severity on a resistant zone. */
export const RESISTANT_BONUS = {
  light: 1,
  medium: 0,
  severe: 1,
  critical: 0,
  deadly: 1,
  destroyed: 0,
};
/** Roll modifier caused by a wound of each severity. */
export const MALUS = {
  light: -1,
  medium: -3,
  severe: -5,
  critical: -10,
  deadly: -15,
  destroyed: -30,
};
/** Whether a wound of each severity makes any action impossible. */
export const ACTION_IMPOSSIBLE = {
  light: false,
  medium: false,
  severe: false,
  critical: false,
  deadly: true,
  destroyed: true,
};

/**
 * Wound zones of a body template, keyed by zone name. Unknown types fall back to humanoid.
 * @param {string} [creatureType='humanoid']  Body template key (see BODY_TEMPLATES)
 * @returns {Record<string, object>}
 */
export const ZONES = (creatureType = 'humanoid') => {
  const templates = BODY_TEMPLATES[creatureType] ?? BODY_TEMPLATES.humanoid;

  return Object.fromEntries(templates.map(({ name, ...zone }) => [name, zone]));
};

/**
 * Builds a fresh `system.wounds`-shaped object for a given creature type, with
 * all counters at 0. Used to populate a new actor's wounds, or to add missing
 * zones when an actor's bodyTemplate changes.
 * @param {string} creatureType  Body template key (see BODY_TEMPLATES)
 * @returns {object}
 */
export function buildDefaultWounds(creatureType) {
  const zones = ZONES(creatureType);
  return Object.fromEntries(
    Object.entries(zones).map(([zoneKey, cfg]) => [
      zoneKey,
      {
        resistant: cfg.resistant,
        lethal: cfg.lethal,
        counters: Object.fromEntries(SEVERITIES.map(s => [s, 0])),
      },
    ])
  );
}

/**
 * Damage thresholds mapping final physical damage to wound severity.
 * 1-4 points of final damage: no wound at all (below the lightest threshold).
 */
export const SEVERITY_THRESHOLDS = [
  { threshold: 5, severity: 'light' },
  { threshold: 10, severity: 'medium' },
  { threshold: 15, severity: 'severe' },
  { threshold: 20, severity: 'critical' },
  { threshold: 25, severity: 'deadly' },
  { threshold: 30, severity: 'destroyed' },
];

/**
 * Minimum severity for a wound to trigger the shock effect.
 * @type {string}
 */
export const SHOCK_MIN_SEVERITY = 'severe';

/**
 * Automatic malus applied for a stunned Actor.
 * @type {number}
 */
export const STUN_MALUS = -5;

/**
 * Groups of zones that trigger the shock effect.
 * @type {Record<string, string>}
 */
export const SHOCK_ZONE_GROUPS = {
  head: 'head',
  body: 'body',
  armLeft: 'limbs',
  armRight: 'limbs',
  legLeft: 'limbs',
  legRight: 'limbs',
};

/**
 * Shock durations based on severity and body zone.
 * @type {Record<'severe' | 'critical' | 'deadly' | 'destroyed', Partial<SeverityLevel>>}
 */
export const SHOCK_DURATIONS = {
  severe: {
    head: {
      stun: { value: '2', unit: 'Round' },
      unconscious: { value: '2', unit: 'Minutes' },
      catastrophic: { value: '1d6', unit: 'Minutes' },
    },
    body: {
      stun: { value: '1', unit: 'Round' },
      unconscious: { value: '1', unit: 'Minutes' },
      catastrophic: { value: '1', unit: 'Minutes' },
    },
  },
  critical: {
    head: {
      stun: { value: '3d6', unit: 'Round' },
      unconscious: { value: '3d6', unit: 'Minutes' },
      catastrophic: { effect: 'MildComa' },
    },
    body: {
      stun: { value: '2d6', unit: 'Round' },
      unconscious: { value: '2d6', unit: 'Minutes' },
      catastrophic: { value: '3d6', unit: 'Minutes' },
    },
    limbs: {
      stun: { value: '1d6', unit: 'Round' },
      unconscious: { value: '1d6', unit: 'Minutes' },
      catastrophic: { value: '2d6', unit: 'Minutes' },
    },
  },
  deadly: {
    head: {
      stun: { value: '3d6', unit: 'Minutes' },
      unconscious: { effect: 'MildComa' },
      catastrophic: { effect: 'DeepComa' },
    },
    body: {
      stun: { value: '2d6', unit: 'Minutes' },
      unconscious: { value: '3d6', unit: 'Minutes' },
      catastrophic: { effect: 'Stabilization' },
    },
    limbs: {
      stun: { value: '1d6', unit: 'Minutes' },
      unconscious: { value: '2d6', unit: 'Minutes' },
      catastrophic: { effect: 'Stabilization' },
    },
  },
  destroyed: {
    limbs: {
      stun: { value: '2d6', unit: 'Minutes' },
      unconscious: { value: '3d6', unit: 'Minutes' },
      catastrophic: { effect: 'Stabilization' },
    },
  },
};

/**
 * Weapon shock durations based on their intensity level.
 * @type {Record<'light' | 'medium' | 'severe' | 'critical' | 'deadly' | 'destroyed', BaseShockEffects>}
 */
export const SHOCK_WEAPON_DURATIONS = {
  light: {
    stun: { value: '1', unit: 'Round' },
    unconscious: { value: '1', unit: 'Minutes' },
  },
  medium: {
    stun: { value: '1d6', unit: 'Round' },
    unconscious: { value: '1d6', unit: 'Minutes' },
  },
  severe: {
    stun: { value: '2d6', unit: 'Round' },
    unconscious: { value: '2d6', unit: 'Minutes' },
  },
  critical: {
    stun: { value: '3d6', unit: 'Round' },
    unconscious: { value: '3d6', unit: 'Minutes' },
  },
  deadly: {
    stun: { value: '5d6', unit: 'Round' },
    unconscious: { value: '5d6', unit: 'Minutes' },
  },
  destroyed: {
    stun: { value: '5d6', unit: 'Round' },
    unconscious: { value: '5d6', unit: 'Minutes' },
  },
};
