/**
 * Utility functions shared by Polaris sheets (ApplicationV2), actors and items.
 * These depend on the Foundry globals (`game`, `foundry`) but not on any specific sheet class.
 */

/**
 * Resolves the dataset of the nearest ancestor matching a selector.
 * @param {HTMLElement} target
 * @param {string} selector
 * @returns {DOMStringMap|null}
 */
export function datasetOf(target, selector) {
  return target.closest(selector)?.dataset ?? null;
}

/**
 * Converts a camelCase/kebab-case/snake_case string to PascalCase (e.g. ‘arm-left’ → ‘ArmLeft’).
 * @param {string} str
 * @returns {string}
 */
export function toPascalCase(str) {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[-_ ]+([a-zA-Z0-9])/g, (_, match) => match.toUpperCase())
    .replace(/^([a-z])/, (_, match) => match.toUpperCase());
}

/**
 * Group a collection of items of a given type by a field in their `system` (by default
 * `category`), displaying the group label and sorting the groups and items alphabetically.
 * @param {Iterable<Item>} items      An iterable of Items (e.g. actor.items)
 * @param {string} itemType           The type of item to keep (e.g. “skill”, “weapon”, “armour”)
 * @param {string} i18nPrefix         The i18n key prefix for labels (e.g. “POL3.SKILL.Category”)
 * @param {string} [groupField]       The `system` field used for grouping (default: “category”)
 * @returns {{group: string, label: string, itemList: Item[]}[]}
 */
export function groupItemsByField(items, itemType, i18nPrefix, groupField = 'category') {
  const grouped = Map.groupBy(
    Array.from(items).filter(i => i.type === itemType),
    item => item.system[groupField] ?? '',
  );

  return [...grouped.entries()]
    .map(([group, groupItems]) => ({
      group,
      label: game.i18n.localize(`${i18nPrefix}.${toPascalCase(group)}`),
      itemList: [...groupItems].sort((a, b) => (a.name ?? '').localeCompare(b.name ?? '')),
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

/**
 * Opens a DialogV2 dialogue rendered from a Handlebars template, and returns the submitted data.
 * @param {object} options
 * @param {string} options.template        Path to the form’s Handlebars template.
 * @param {object} [options.templateData]  Data passed to the template.
 * @param {string} options.title           Localised title of the window.
 * @param {string} [options.icon]          The window’s FontAwesome icon class.
 * @returns {Promise<object|null>}         The data submitted, or null if the dialogue was cancelled.
 */
export async function openConfigDialog({
                                         template,
                                         templateData = {},
                                         title,
                                         icon = 'fas fa-edit',
                                       }) {
  const content = await foundry.applications.handlebars.renderTemplate(template, templateData);

  return foundry.applications.api.DialogV2.input({
    window: { title, icon },
    content,
    ok: { label: game.i18n.localize('POL3.DIALOG.SaveButton'), icon: 'fas fa-save' },
  });
}
