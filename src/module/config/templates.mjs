export async function preloadHandlebarsTemplates() {
  const templatePaths = [
    'systems/polaris/templates/sheets/items/partials/item-details.hbs',
    'systems/polaris/templates/sheets/actors/partials/actor-weapons.hbs',
    'systems/polaris/templates/sheets/actors/partials/actor-wound-zone.hbs',
    'systems/polaris/templates/sheets/actors/partials/actor-armors.hbs',
    'systems/polaris/templates/chat/partials/modifier-list.hbs',
  ];

  return foundry.applications.handlebars.loadTemplates(templatePaths);
}

