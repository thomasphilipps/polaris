import { promptOpposedDefense } from '../apps/dialogs/opposed-defense-dialog.mjs';
import { shockCheck } from '../dice/shock-check.mjs';

const SOCKET_NAME = 'system.polaris';
const pendingRequests = new Map(); // requestId -> { resolve }

/** Call once at init (Hooks.once('init')) to start listening for socket messages. */
export function initSocketListeners() {
  game.socket.on(SOCKET_NAME, handleSocketMessage);
}

function handleSocketMessage(message) {
  switch (message.type) {
    case 'opposedDefenseRequest':
      return onOpposedDefenseRequest(message);
    case 'opposedDefenseResponse':
      return onResponse(message);
    case 'applyWoundRequest':
      return onApplyWoundRequest(message);
    case 'applyWoundResponse':
      return onResponse(message);
    case 'shockTestRequest':
      return onShockTestRequest(message);
    case 'shockTestResponse':
      return onResponse(message);
  }
}

function onResponse(message) {
  const pending = pendingRequests.get(message.requestId);
  if (!pending) return; // already resolved, or not ours
  pendingRequests.delete(message.requestId);
  pending.resolve(message.result);
}

/**
 * Finds the connected, non-GM user(s) owning an actor. Empty array if none.
 * @param {Actor} actor
 * @returns {string[]} User ids
 */
function getConnectedOwnerIds(actor) {
  return game.users
    .filter(u => u.active && !u.isGM && actor.testUserPermission(u, 'OWNER'))
    .map(u => u.id);
}

//****************************************************************************
// OVERRIDES
//****************************************************************************

/**
 * Posts a chat message with a button letting any GM answer a request manually.
 *
 * @param {object} params
 * @param {string} params.requestId
 * @param {Actor} params.actor
 * @param {string} params.i18nKeyText - Text localization key (e.g. 'POL3.SHOCK.ShockRequest')
 * @param {string} params.i18nKeyButton - Button localization key (e.g 'POL3.SHOCK.ForceShock')
 * @param {string} params.action - data-action value (e.g. 'polaris-force-shock')
 * @param {object} [params.additionalData={}] - Extra camelCase data, used both as text variables and as data-* attributes
 * @returns {Promise<void>}
 */
async function postGmOverrideMessage({
                                       requestId,
                                       actor,
                                       i18nKeyText,
                                       i18nKeyButton,
                                       action,
                                       additionalData = {},
                                     }) {
  // camelCase keys become kebab-case attributes (attackLabel -> data-attack-label),
  // which the browser exposes back as dataset.attackLabel.
  const dataAttributes = Object.entries(additionalData)
    .map(([key, value]) => {
      const attributeName = key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
      return `data-${attributeName}="${foundry.utils.escapeHTML(String(value))}"`;
    })
    .join(' ');

  const content = `
    <p>${game.i18n.format(i18nKeyText, { actorName: actor.name, ...additionalData })}</p>
    <button type="button" data-action="${action}" data-request-id="${requestId}" data-actor-id="${actor.id}" ${dataAttributes}>
      ${game.i18n.localize(i18nKeyButton)}
    </button>
  `;
  await ChatMessage.create({ content, whisper: ChatMessage.getWhisperRecipients('GM') });
}

//----------------------------------------------------------------------------
// Shock check
//----------------------------------------------------------------------------

async function onShockTestRequest(message) {
  const isTargetUser = message.recipients.includes(game.user.id);
  const isGmFallback = message.recipients.length === 0 && game.user.isGM;
  if (!isTargetUser && !isGmFallback) return;
  if (isTargetUser && game.user.isGM) return; // already handled locally by the requester if it's their own actor

  await handleShockTestPrompt(message);
}

async function handleShockTestPrompt({ requestId, actorId, woundedZone, baseSeverity }) {
  const actor = game.actors.get(actorId);
  if (!actor) return;

  const outcome = await shockCheck({ actor, woundedZone, baseSeverity });
  if (!outcome) return; // cancelled — the other responder (GM/player) may still answer

  game.socket.emit(SOCKET_NAME, { type: 'shockTestResponse', requestId, result: outcome });
  onResponse({ requestId, result: outcome }); // resolve immediately if we're the requester ourselves
}

/**
 * Requests a shock test
 *
 * @param {object} params
 * @param {Actor} params.actor
 * @param {string} params.woundedZone
 * @param {string} params.baseSeverity
 * @returns {Promise<object>} A shockCheck-shaped outcome
 */
export function requestShockTest({ actor, woundedZone, baseSeverity }) {
  return new Promise(resolve => {
    const requestId = foundry.utils.randomID();
    pendingRequests.set(requestId, { resolve });

    const recipients = getConnectedOwnerIds(actor);

    game.socket.emit(SOCKET_NAME, {
      type: 'shockTestRequest',
      requestId,
      actorId: actor.id,
      woundedZone,
      baseSeverity,
      recipients,
    });

    postGmOverrideMessage({
      requestId,
      actor,
      i18nKeyText: 'POL3.SHOCK.ShockRequest',
      i18nKeyButton: 'POL3.SHOCK.ForceShock',
      action: 'polaris-force-shock',
      additionalData: {
        woundedZone,
        baseSeverity,
      },
    });

    if (recipients.includes(game.user.id) || (recipients.length === 0 && game.user.isGM)) {
      handleShockTestPrompt({ requestId, actorId: actor.id, woundedZone, baseSeverity });
    }
  });
}

export { handleShockTestPrompt };

// ---------------------------------------------------------------------------
// Opposed defense (requires a dialog — the responder chooses what to roll)
// ---------------------------------------------------------------------------

/**
 * Requests an opposed defense roll from whoever controls `defenderActor`:
 * the connected owning player if any, and always a GM override option via
 * a chat message button. Resolves with whichever outcome arrives first.
 * @param {object} params
 * @param {Actor} params.defenderActor
 * @param {number} params.difficulty   Pre-computed difficulty (e.g. Allonge) for the defender
 * @param {string} params.attackLabel  Label shown to the responder (e.g. attacker's weapon)
 * @returns {Promise<object>} A resolveTaskCheck-shaped outcome, enriched with rollLabel
 */
export function requestOpposedDefense({ defenderActor, difficulty, attackLabel }) {
  return new Promise(resolve => {
    const requestId = foundry.utils.randomID();
    pendingRequests.set(requestId, { resolve });

    const recipients = getConnectedOwnerIds(defenderActor);

    game.socket.emit(SOCKET_NAME, {
      type: 'opposedDefenseRequest',
      requestId,
      actorId: defenderActor.id,
      difficulty,
      attackLabel,
      recipients,
    });

    postGmOverrideMessage({
      requestId,
      actor: defenderActor,
      i18nKeyText: 'POL3.OPPOSED.DefenseRequest',
      i18nKeyButton: 'POL3.OPPOSED.ForceDefense',
      action: 'polaris-force-defense',
      additionalData: {
        difficulty,
        attackLabel,
      },
    });

    if (recipients.includes(game.user.id) || (recipients.length === 0 && game.user.isGM)) {
      handleOpposedDefensePrompt({ requestId, actorId: defenderActor.id, difficulty, attackLabel });
    }
  });
}

async function onOpposedDefenseRequest(message) {
  const isTargetUser = message.recipients.includes(game.user.id);
  const isGmFallback = message.recipients.length === 0 && game.user.isGM;
  if (!isTargetUser && !isGmFallback) return;
  if (isTargetUser && game.user.isGM) return; // already handled locally by the requester if it's their own actor

  await handleOpposedDefensePrompt(message);
}

async function handleOpposedDefensePrompt({ requestId, actorId, difficulty, attackLabel }) {
  const actor = game.actors.get(actorId);
  if (!actor) return;

  const outcome = await promptOpposedDefense({ actor, difficulty, attackLabel });
  if (!outcome) return; // cancelled — the other responder (GM/player) may still answer

  game.socket.emit(SOCKET_NAME, { type: 'opposedDefenseResponse', requestId, result: outcome });
  onResponse({ requestId, result: outcome }); // resolve immediately if we're the requester ourselves
}

// Exported for the chat button listener in hooks.mjs
export { handleOpposedDefensePrompt };

// ********************************************************************************
// Apply wound (no dialog — purely mechanical, executed by whoever has permission)
// ********************************************************************************

/**
 * Requests that whoever controls `actor` (connected owning player, else an
 * active GM, else the requester as a last-resort best effort) apply a wound
 * locally, on a client where the permission actually exists.
 * @param {object} params
 * @param {Actor} params.actor
 * @param {string} params.zone
 * @param {string} params.severity
 * @returns {Promise<void>}
 */
export function requestApplyWound({ actor, zone, severity }) {
  return new Promise(resolve => {
    const requestId = foundry.utils.randomID();
    pendingRequests.set(requestId, { resolve });

    const recipients = getConnectedOwnerIds(actor);
    const hasActiveGM = game.users.some(u => u.active && u.isGM);

    game.socket.emit(SOCKET_NAME, {
      type: 'applyWoundRequest',
      requestId,
      actorId: actor.id,
      zone,
      severity,
      recipients,
    });

    if (recipients.includes(game.user.id) || (recipients.length === 0 && game.user.isGM)) {
      executeApplyWound({ requestId, actorId: actor.id, zone, severity });
    } else if (recipients.length === 0 && !hasActiveGM) {
      // Nobody connected can apply this remotely — best-effort local attempt.
      console.warn(`POLARIS | No connected owner or GM for actor "${actor.name}" — attempting local applyWound.`);
      executeApplyWound({ requestId, actorId: actor.id, zone, severity });
    }
  });
}

async function onApplyWoundRequest(message) {
  const isTargetUser = message.recipients.includes(game.user.id);
  const isGmFallback = message.recipients.length === 0 && game.user.isGM;
  if (!isTargetUser && !isGmFallback) return;
  if (isTargetUser && game.user.isGM) return; // already handled locally by the requester

  await executeApplyWound(message);
}

async function executeApplyWound({ requestId, actorId, zone, severity }) {
  const actor = game.actors.get(actorId);
  if (actor) {
    try {
      await actor.applyWound(zone, severity);
    } catch (err) {
      console.error(`POLARIS | Failed to apply wound on "${actor.name}":`, err);
    }
  }
  game.socket.emit(SOCKET_NAME, { type: 'applyWoundResponse', requestId, result: undefined });
  onResponse({ requestId, result: undefined });
}
