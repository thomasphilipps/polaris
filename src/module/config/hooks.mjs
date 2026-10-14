import { handleOpposedDefensePrompt, handleShockTestPrompt } from '../net/socket.mjs';
import { rollShockDuration } from '../dice/shock-check.mjs';

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
 * Handles interactivity and event listeners for action buttons
 * within chat messages (Foundry VTT / Polaris).
 * Separates behaviors based on user permissions (GM vs Player)
 *
 * @param {ChatMessage} message - The Foundry VTT chat message object associated with the render.
 * @param {HTMLElement} html - The root HTML element of the chat message currently being rendered.
 * @returns {void}
 */
export function onRenderChatMessageHTML(message, html) {
  const shockDurationButtons = html.querySelectorAll('[data-action="polaris-apply-duration"]');
  const defenseButton = html.querySelector('[data-action="polaris-force-defense"]');
  const shockButton = html.querySelector('[data-action="polaris-force-shock"]');

  if (!game.user.isGM) {
    shockDurationButtons.forEach((button) => button.remove());
    return;
  }

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

  shockDurationButtons.forEach((button) => button.addEventListener('click', async () => {
    const { value, unit, effect, durationType } = button.dataset;
    await rollShockDuration({ speaker: message.speaker, formula: value, unit, effect, durationType });
  }));
}
