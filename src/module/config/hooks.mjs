import { handleOpposedDefensePrompt, handleShockTestPrompt } from '../net/socket.mjs';

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
 * Attaches the click handler to the button on the GM-only
 * chat message, letting a GM answer on behalf of an
 * unresponsive or absent player.
 * @param {ChatMessage} message
 * @param {HTMLElement} html
 */
export function onRenderChatMessageHTML(message, html) {
  if (!game.user.isGM) return;
  const defenseButton = html.querySelector('[data-action="polaris-force-defense"]');
  const shockButton = html.querySelector('[data-action="polaris-force-shock"]');

  if (defenseButton) {
    defenseButton.addEventListener('click', async () => {
      const { requestId, actorId, difficulty, attackLabel } = defenseButton.dataset;
      await handleOpposedDefensePrompt({
        requestId,
        actorId,
        difficulty: Number(difficulty),
        attackLabel,
      });
      defenseButton.disabled = true;
    });
  }

  if (shockButton) {
    shockButton.addEventListener('click', async () => {
      const { requestId, actorId, woundedZone, baseSeverity } = shockButton.dataset;
      await handleShockTestPrompt({
        requestId,
        actorId,
        woundedZone,
        baseSeverity,
      });
      shockButton.disabled = true;
    });
  }
}
