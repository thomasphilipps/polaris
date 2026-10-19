import { STUN_MALUS } from '../config/actor/wounds.mjs';
/** @import Pol3Actor from '../documents/actor.mjs' */

/**
 * Provides automatic modifiers for dice rolls
 *
 * Usage: add getter functions to this module and include them
 * in collectAutomaticModifiers providers
 */

/**
 * Returns the malus for the actor's wounds
 * @param {Pol3Actor} actor  The rolling actor
 * @returns {{label: string, value: number}|null}
 */
export function getWoundModifier(actor) {
  const malus = actor.system.woundsSummary?.malus ?? 0;
  if (malus === 0) return null;
  return { label: 'POL3.WOUND.Malus', value: malus };
}

/**
 * Returns the stun malus for the actor, if applicable
 * @param {Pol3Actor} actor  The rolling actor
 * @returns {{label: string, value: number}|null}
 */
export function getStunModifier(actor) {
  return actor.statuses.has('stun') ? { label: 'POL3.SHOCK.StunMalus', value: STUN_MALUS } : null;
}

/**
 * Collects all automatic modifiers for an actor
 * @param {Pol3Actor} actor  The rolling actor
 * @returns {{label: string, value: number}[]}
 */
export function collectAutomaticModifiers(actor) {
  const providers = [getWoundModifier, getStunModifier]; //add other getters here
  return providers.map(fn => fn(actor)).filter(Boolean);
}
