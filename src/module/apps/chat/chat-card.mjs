/**
 * Render a chat card
 *
 * @param {string} templateName
 * @param {object} data
 * @returns {Promise<string>}
 */
export async function renderChatCard(templateName, data) {
  const path = `systems/polaris/templates/chat/${templateName}.hbs`;
  return foundry.applications.handlebars.renderTemplate(path, data);
}
