/**
 * Combat-related utilities: target/token resolution and range calculations,
 * shared across weapon types and combat phases.
 */

const RANGE_BAND_ORDER = ['close', 'short', 'medium', 'long', 'extreme'];

/**
 * Resolves the single targeted token required for a Phase A ranged attack.
 * Notifies the user and returns null if there isn't exactly one target.
 * @returns {Token|null}
 */
export function getSingleTarget() {
  const targets = Array.from(game.user.targets);

  if (targets.length === 0) {
    ui.notifications.error(game.i18n.localize('POL3.ERROR.NoTarget'));
    return null;
  }
  if (targets.length > 1) {
    ui.notifications.error(game.i18n.localize('POL3.ERROR.MultipleTargets'));
    return null;
  }
  return targets[0];
}

/**
 * Resolves the first active token of an actor on the current scene.
 * Notifies the user and returns null if the actor has no token there.
 * @param {Actor} actor
 * @returns {Token|null}
 */
export function getActorToken(actor) {
  const token = actor?.getActiveTokens()[0];
  if (!token) {
    ui.notifications.error(game.i18n.format('POL3.ERROR.NoToken', { actorName: actor?.name }));
    return null;
  }
  return token;
}

/**
 * Measures the distance between two tokens along the scene's grid.
 * @param {Token} tokenA
 * @param {Token} tokenB
 * @returns {number} Distance in the scene's configured units.
 */
export function measureTokenDistance(tokenA, tokenB) {
  const path = canvas.grid.measurePath([tokenA.center, tokenB.center]);
  return path.distance;
}

/**
 * Resolves the range band for a given distance, based on a weapon's own
 * hitDistance thresholds (each weapon defines its own close/short/medium/long/extreme).
 * @param {number} distance
 * @param {{close: number, short: number, medium: number, long: number, extreme: number}} hitDistance
 * @returns {string|null} The range band key, or null if beyond the weapon's Extreme threshold.
 */
export function getRangeBand(distance, hitDistance) {
  for (const band of RANGE_BAND_ORDER) {
    if (distance <= hitDistance[band]) return band;
  }
  return null; // beyond Extreme: out of range
}
