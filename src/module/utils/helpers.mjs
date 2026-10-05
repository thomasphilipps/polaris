/**
 * Sums modifiers values
 *
 * @param modifiersList {{label: string, value: number}[]}
 * @returns {number}
 */

export function sumModifiers(modifiersList) {
  return modifiersList.reduce((total, modifier) => (total + modifier.value), 0);
}
