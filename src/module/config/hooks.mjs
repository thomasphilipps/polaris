import { handleOpposedDefensePrompt, handleShockTestPrompt } from '../net/socket.mjs';
import { rollShockDuration } from '../dice/shock-check.mjs';
/** @import Pol3Item from '../documents/item.mjs' */

/**
 * preCreateItem hook: stores the source item id on embedded items and sets
 * the default icon of a skill from its category.
 * @param {Pol3Item} item   The item about to be created
 * @param {object} data     Creation data
 * @param {object} options  Creation options
 * @param {string} userId   Id of the user creating the item
 */
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

/**
 * preUpdateItem hook: updates a skill's icon when its category changes.
 * @param {Pol3Item} item       The item about to be updated
 * @param {object} updateData   Pending changes (mutated in place)
 * @param {object} options      Update options
 * @param {string} userId       Id of the user updating the item
 */
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
    shockDurationButtons.forEach(button => button.remove());
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
      const { requestId, actorId, woundedZone, baseSeverity, isShockWeapon } = shockButton.dataset;
      await handleShockTestPrompt({
        requestId,
        actorId,
        woundedZone,
        baseSeverity,
        isShockWeapon: isShockWeapon === 'true',
      });
      shockButton.disabled = true;
    });
  }

  shockDurationButtons.forEach(button =>
    button.addEventListener('click', async () => {
      const { value, unit, effect, durationType } = button.dataset;
      await rollShockDuration({
        speaker: message.speaker,
        formula: value,
        unit,
        effect,
        durationType,
      });
    })
  );
}
