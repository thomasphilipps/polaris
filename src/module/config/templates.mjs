export async function preloadHandlebarsTemplates() {
  const templatePaths = [
    'systems/polaris/templates/sheets/items/partials/item-details.hbs',
    'systems/polaris/templates/sheets/actors/partials/actor-weapons.hbs'
  ];

  return foundry.applications.handlebars.loadTemplates(templatePaths);
}

