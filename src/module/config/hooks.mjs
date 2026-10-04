import { handleOpposedDefensePrompt } from '../net/socket.mjs';

export function onPreCreateItem(item, data, options, userId) {
  // Adding useful informations when dropping an item on an Actor's sheet
  if (item.parent instanceof Actor) {
    item.updateSource({ 'flags.polaris.parentItemId': item.id });
  }
  switch (item.type) {
    case 'skill':
      const initialSkillImage = `systems/polaris/assets/icons/${item.system.category}.png`;
      item.updateSource({ img: initialSkillImage });
      break;
  }
}

export function onPreUpdateItem(item, updateData, options, userId) {
  switch (item.type) {
    case 'skill': {
      const category = updateData.system?.category;
      if (category) {
        updateData.img = `systems/polaris/assets/icons/${category}.png`;
      }
      break;
    }
  }
}

/**
 * Attaches the click handler to the "force defense" button on the GM-only
 * opposed-defense chat message, letting a GM answer on behalf of an
 * unresponsive or absent player.
 * @param {ChatMessage} message
 * @param {HTMLElement} html
 */
export function onRenderChatMessageHTML(message, html) {
  const button = html.querySelector('[data-action="polaris-force-defense"]');
  if (!button || !game.user.isGM) return;

  button.addEventListener('click', async () => {
    const { requestId, actorId, difficulty, attackLabel } = button.dataset;
    await handleOpposedDefensePrompt({
      requestId,
      actorId,
      difficulty: Number(difficulty),
      attackLabel,
    });
    button.disabled = true;
  });
}
