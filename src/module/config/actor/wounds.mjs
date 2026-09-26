import { BODY_TEMPLATES } from './bodyTemplates.mjs';

export const SEVERITIES = ['light', 'medium', 'severe', 'critical', 'deadly', 'destroyed'];
export const BASE_MAX = { light: 3, medium: 3, severe: 2, critical: 2, deadly: 1, destroyed: 1 };
export const RESISTANT_BONUS = {
  light: 1,
  medium: 0,
  severe: 1,
  critical: 0,
  deadly: 1,
  destroyed: 0,
};
export const MALUS = {
  light: -1,
  medium: -3,
  severe: -5,
  critical: -10,
  deadly: -15,
  destroyed: -30,
};
export const ACTION_IMPOSSIBLE = {
  light: false,
  medium: false,
  severe: false,
  critical: false,
  deadly: true,
  destroyed: true,
};

export const ZONES = (creatureType = 'humanoid') => {
  const templates = BODY_TEMPLATES[creatureType] ?? BODY_TEMPLATES.humanoid;

  return Object.fromEntries(templates.map(({ name, ...zone }) => [name, zone]));
};

/**
 * Builds a fresh `system.wounds`-shaped object for a given creature type, with
 * all counters at 0. Used to populate a new actor's wounds, or to add missing
 * zones when an actor's bodyTemplate changes.
 * @param {string} creatureType
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
    ]),
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
