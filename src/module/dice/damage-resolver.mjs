/**
 * Resolves the hit zone for a d20 result, given a body template's location tables
 * and the combat type ('melee' or 'ranged'). Falls back to the single 'all' table
 * for body templates that don't distinguish melee/ranged localization.
 * @param {object} params
 * @param {object} params.locationTables  A body template's entry in POL3.BODY_TEMPLATE.LOCATION_TABLES
 * @param {string} params.combatType      'melee' or 'ranged'
 * @param {number} params.rollResult      The 1d20 result
 * @returns {string|null} The zone key, or null if the tables are misconfigured
 */
export function resolveLocation({ locationTables, combatType, rollResult }) {
  const table = locationTables[combatType] ?? locationTables.all;
  if (!table) return null;
  return table.find(entry => rollResult <= entry.max)?.zone ?? null;
}

/**
 * Computes final physical damage: weapon damage + success modifier
 * (+ close combat modifier if melee), then damage resistance (already a
 * negative value), then armor protection. Floored at 0 — no intermediate
 * floor is applied between steps (order doesn't matter arithmetically here).
 * @param {object} params
 * @param {number} params.weaponDamageRoll         Result of the weapon's damage formula roll
 * @param {number} params.successModifier          nextModifier from the attack's resolveTaskCheck outcome
 * @param {number} [params.otherModifiers=0]       Additional modifiers, e.g. displacement, combat techniques...
 * @param {number} [params.closeCombatModifier=0]  Attacker's close combat damage modifier (melee only)
 * @param {number} [params.damageResistance=0]     Target's damage resistance (negative value)
 * @param {number} [params.armorProtection=0]      Protection value of armor covering the hit zone
 * @returns {number} Final damage, floored at 0
 */
export function resolveFinalDamage({
  weaponDamageRoll,
  successModifier,
  otherModifiers = 0,
  closeCombatModifier = 0,
  damageResistance = 0,
  armorProtection = 0,
}) {
  const total =
    weaponDamageRoll +
    successModifier +
    otherModifiers +
    closeCombatModifier +
    damageResistance -
    armorProtection;
  return Math.max(0, total);
}

/**
 * Resolves the wound severity for a given final damage value.
 * Returns null for damage below the lightest threshold (1-4) — the caller
 * distinguishes "no damage at all" (0) from "damage dealt but no wound" (1-4).
 * @param {number} finalDamage
 * @param {{threshold: number, severity: string}[]} severityThresholds
 * @returns {string|null}
 */
export function resolveWoundSeverity(finalDamage, severityThresholds) {
  let matched = null;
  for (const entry of severityThresholds) {
    if (finalDamage >= entry.threshold) matched = entry.severity;
  }
  return matched;
}
