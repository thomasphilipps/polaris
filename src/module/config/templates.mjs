export async function preloadHandlebarsTemplates() {
  const templatePaths = [
    'systems/polaris/templates/sheets/items/partials/item-details.hbs',
  ];

  return foundry.applications.handlebars.loadTemplates(templatePaths);
}

