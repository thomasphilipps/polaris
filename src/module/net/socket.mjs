import { promptOpposedDefense } from '../apps/dialogs/opposed-defense-dialog.mjs';

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

    postGmOverrideMessage({ requestId, defenderActor, difficulty, attackLabel });

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


/** Posts a chat message with a button letting any GM answer the defense request manually. */
async function postGmOverrideMessage({ requestId, defenderActor, difficulty, attackLabel }) {
  const content = `
    <p>${game.i18n.format('POL3.OPPOSED.DefenseRequest', {
    actorName: defenderActor.name,
    attackLabel,
  })}</p>
    <button type="button" data-action="polaris-force-defense" data-request-id="${requestId}" data-actor-id="${defenderActor.id}" data-difficulty="${difficulty}" data-attack-label="${attackLabel}">
      ${game.i18n.localize('POL3.OPPOSED.ForceDefense')}
    </button>
  `;
  await ChatMessage.create({ content, whisper: ChatMessage.getWhisperRecipients('GM') });
}

// Exported for the chat button listener in hooks.mjs
export { handleOpposedDefensePrompt };

// ---------------------------------------------------------------------------
// Apply wound (no dialog — purely mechanical, executed by whoever has permission)
// ---------------------------------------------------------------------------

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
