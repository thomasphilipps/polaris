import { handleOpposedDefensePrompt, handleShockTestPrompt } from '../net/socket.mjs';
import { rollShockDuration } from '../dice/shock-check.mjs';
import { buildPropagationDiff } from '../utils/item-propagation.mjs';
/** @import Pol3Item from '../documents/item.mjs' */

/**
 * preCreateItem hook:
 * - sets the default icon of a skill from its category.
 * @param {Pol3Item} item   The item about to be created
 * @param {object} data     Creation data
 * @param {object} options  Creation options
 * @param {string} userId   Id of the user creating the item
 */
export function onPreCreateItem(item, data, options, userId) {
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
 * updateItem hook: propagates an item's changes to its linked copies, one level down
 * (compendium -> world items and actor copies, world item -> actor copies). Updating a
 * world item fires this hook again, which carries the changes on to its own copies.
 * Runs on the author's client only, for the GM, and never from an embedded item.
 * @param {Pol3Item} item       The updated item
 * @param {object} updateData   The changes applied to the item
 * @param {object} options      Update options
 * @param {string} userId       Id of the user who updated the item
 * @returns {Promise<void>}
 */
export async function onUpdateItem(item, updateData, options, userId) {
  if (userId !== game.user.id || !game.user.isGM || item.parent) return;

  const diff = buildPropagationDiff(updateData);
  if (diff === null) return;

  let count = 0;

  // World items imported from this compendium item
  if (item.pack) {
    const worldUpdates = game.items
      .filter(i => i._stats.compendiumSource === item.uuid)
      .map(i => ({ _id: i.id, ...diff }));
    if (worldUpdates.length) {
      await Item.implementation.updateDocuments(worldUpdates);
      count += worldUpdates.length;
    }
  }

  // Actor copies dropped from this item
  for (const actor of game.actors) {
    const copyUpdates = actor.items
      .filter(i => i.getFlag('polaris', 'sourceUuid') === item.uuid)
      .map(i => ({ _id: i.id, ...diff }));
    if (!copyUpdates.length) continue;
    await actor.updateEmbeddedDocuments('Item', copyUpdates);
    count += copyUpdates.length;
  }

  if (count > 0) {
    ui.notifications.info(
      game.i18n.format('POL3.INFO.ItemPropagated', { itemName: item.name, count })
    );
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
