/**
 * Computes the hit and damage modifiers granted by a fire mode.
 *
 * @param {object} params
 * @param {object} params.fireMode An entry of BURST.<capacity>.modes
 * @param {number} params.bullets Number of bullets fired
 * @param {string} params.rangeBand Range band key ('close', 'short', ...)
 * @param {number} [params.damageGroups=0] Number of choice tiers assigned to damage
 * @returns {{hitModifier:number, damageModifier:number }}
 */
export function resolveFireMode({ fireMode, bullets, rangeBand, damageGroups = 0 }) {
  // 1. Normalize the bullet count
  const clampedBullets = Math.min(Math.max(bullets, fireMode.minBullets), fireMode.maxBullets);

  // 2. Keep only the tiers reached
  const tiers = fireMode.groups.filter(g => clampedBullets >= g.bulletThreshold);

  // 3. Can this range band receive damage bonuses?
  const isValidRangeBand = fireMode.damageRanges.includes(rangeBand);

  // 4. Accumulate the bonuses tier-by-tier
  // Number of choice tiers allocated to damage, capped by damage groups and range validity
  let groupCount = isValidRangeBand
    ? Math.min(tiers.filter(t => t.isChoice).length, damageGroups)
    : 0;

  let hitModifier = 0;
  let damageModifier = 0;

  for (const { isChoice, shotBonus, damageBonus } of tiers) {
    if (!isChoice) {
      hitModifier += shotBonus;
      if (isValidRangeBand) damageModifier += damageBonus;
    } else if (groupCount > 0) {
      damageModifier += damageBonus;
      groupCount--;
    } else {
      hitModifier += shotBonus;
    }
  }

  return { hitModifier, damageModifier };
}
