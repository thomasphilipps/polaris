/**
 * Preloads the Handlebars partials used by the sheets and chat cards.
 * @returns {Promise<Function[]>}
 */
export async function preloadHandlebarsTemplates() {
  const templatePaths = [
    'systems/polaris/templates/sheets/items/partials/item-details.hbs',
    'systems/polaris/templates/sheets/actors/partials/actor-weapons.hbs',
    'systems/polaris/templates/sheets/actors/partials/actor-wound-zone.hbs',
    'systems/polaris/templates/sheets/actors/partials/actor-armors.hbs',
    'systems/polaris/templates/chat/partials/modifier-list.hbs',
    'systems/polaris/templates/chat/partials/dice-module.hbs',
    'systems/polaris/templates/chat/partials/check-summary.hbs',
    'systems/polaris/templates/chat/partials/duration-summary.hbs',
  ];

  return foundry.applications.handlebars.loadTemplates(templatePaths);
}

