/**
 * Provides automatic modifiers for dice rolls
 *
 * Usage: add getter functions to this module and include them
 * in collectAutomaticModifiers providers
 */


/**
 * Returns the malus for the actor's wounds
 * @param {Pol3Actor} actor
 * @returns {{label: string, value: number}|null}
 */
export function getWoundModifier(actor) {
  const malus = actor.system.woundsSummary?.malus ?? 0;
  if (malus === 0) return null;
  return { label: game.i18n.localize('POL3.WOUND.Malus'), value: malus };
}

/**
 * Collects all automatic modifiers for an actor
 * @param {Pol3Actor} actor
 * @returns {{label: string, value: number}[]}
 */
export function collectAutomaticModifiers(actor) {
  const providers = [getWoundModifier]; //add other getters here
  return providers.map(fn => fn(actor)).filter(Boolean);
}
