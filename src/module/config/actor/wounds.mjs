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
