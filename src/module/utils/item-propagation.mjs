import { PROPAGATION_EXCLUDED_PATHS } from '../config/item/propagation.mjs';

/**
 * Recursively prunes and flattens an object to exclude certain paths.
 * @param {object} changes  The changes to the Item
 * @param {Set<string>} [excludedPaths=PROPAGATION_EXLUDED_PATHS]  The paths to exclude
 * @returns {object|null}   The flattened object with excluded paths removed
 */
export function buildPropagationDiff(changes, excludedPaths = PROPAGATION_EXCLUDED_PATHS) {
  const isExcluded = path => {
    return excludedPaths.has(path);
  };

  const prune = (obj, prefix = '') => {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      const path = prefix ? `${prefix}.${key}` : key;
      if (isExcluded(path)) return acc;
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        return { ...acc, ...prune(value, path) };
      }
      return { ...acc, [path]: value };
    }, {});
  };

  const result = prune(changes);

  return Object.keys(result).length === 0 ? null : result;
}
