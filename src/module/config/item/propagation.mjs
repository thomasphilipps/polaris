/**
 * Set of paths that should not be propagated to the item.
 * @type {Set<string>}
 */
export const PROPAGATION_EXCLUDED_PATHS = new Set([
  '_id',
  '_stats',
  'folder',
  'sort',
  'ownership',
  'system.mastery',
  'system.specialization',
  'system.isEquipped',
  'system.quantity',
  'system.integrity',
  'flags.polaris.sourceUuid',
]);
