/**
 * Sums modifiers values
 *
 * @param modifiersList {{label: string, value: number}[]}
 * @returns {number}
 */

export function sumModifiers(modifiersList) {
  return modifiersList.reduce((total, modifier) => (total + modifier.value), 0);
}

/**
 * Returns true if the user should be asked for modifiers.
 * The client setting gives the default behaviour; holding Shift inverts it.
 *
 * @param {boolean} [shiftKey=false] Whether Shift was held when the roll was triggered
 * @returns {boolean}
 */
export function askForModifiers(shiftKey = false) {
  return game.settings.get('polaris', 'askForModifier') !== shiftKey;
}
