export async function preloadHandlebarsTemplates() {
  const templatePaths = [
    'systems/polaris/templates/sheets/partials/item-details.hbs',
  ];
  console.log('Polaris | templates: ', templatePaths);

  return foundry.applications.handlebars.loadTemplates(templatePaths);
}

