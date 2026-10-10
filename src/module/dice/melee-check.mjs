import { rollTaskCheck } from './roll-resolver.mjs';
import { resolveOpposedCheck } from './opposed-resolver.mjs';
import { requestOpposedDefense } from '../net/socket.mjs';
import { damageCheck } from './damage-check.mjs';
import { getActorToken } from '../utils/combat-utils.mjs';
import { breakdownRoll, renderChatCard, buildCheckContext } from '../apps/chat/chat-card.mjs';

const OPPOSED_RESULT_LABELS = {
  attackerWins: 'POL3.OPPOSED.RESULT.AttackerWins',
  defenderWins: 'POL3.OPPOSED.RESULT.DefenderWins',
  tie: 'POL3.OPPOSED.RESULT.Tie',
  bothFail: 'POL3.OPPOSED.RESULT.BothFail',
};

/**
 * Resolves a melee attack as a Test d'opposition. Computes the Allonge
 * modifier automatically from both combatants' equipped melee weapons,
 * requests the Defender's roll over the socket, compares the two outcomes,
 * and triggers damage for whoever's action lands (both, on a tie).
 * @param {object} params
 * @param {string} params.rollLabel
 * @param {number} params.actionValue
 * @param {number} params.valueCrit
 * @param {{label: string, value: number}[]} [params.modifiers=[]]
 * @param {Item} params.weapon   The Attacker's weapon
 * @param {Token} params.target  The Defender's token
 */
export async function meleeCheck({
                                   rollLabel,
                                   actionValue,
                                   valueCrit,
                                   modifiers = [],
                                   weapon,
                                   target,
                                 }) {
  const attackerActor = weapon.actor;
  const defenderActor = target.actor;
  if (!defenderActor) return;

  const defenderWeapon = defenderActor.items.find(
    i => i.type === 'weapon' && i.system.isEquipped && i.system.category !== 'ranged',
  );

  const allongeDiff = (weapon.system.allonge ?? 0) - (defenderWeapon?.system.allonge ?? 0);
  const attackerModifiersList =
    allongeDiff > 0
      ? [...modifiers, { label: 'POL3.WEAPON.SHEET.Reach', value: allongeDiff }]
      : modifiers;
  const defenderDifficulty = allongeDiff < 0 ? -allongeDiff : 0;

  //TODO: handle askForModifier
  const {
    roll: attackerRoll,
    outcome: attackerOutcome,
    modifiers: attackerModifiers,
  } = await rollTaskCheck({
    actor: attackerActor,
    actionValue,
    modifiers: attackerModifiersList,
    valueCrit,
    askForModifier: true,
    contextLabel: rollLabel,
  });

  if (attackerOutcome === null) return;

  const attackerContext = buildCheckContext({
    rollBreakdown: breakdownRoll(attackerRoll),
    rollLabel,
    outcome: attackerOutcome,
    modifiers: attackerModifiers,
    actionValue,
  });

  const defenderOutcome = await requestOpposedDefense({
    defenderActor,
    difficulty: defenderDifficulty,
    attackLabel: rollLabel,
  });

  const defenderContext = buildCheckContext({
    rollLabel: defenderOutcome.rollLabel,
    actionValue: defenderOutcome.actionValue,
    modifiers: defenderOutcome.modifiers,
    rollBreakdown: defenderOutcome.rollBreakdown,
    outcome: defenderOutcome,
  });

  const { result, attacker, defender } = resolveOpposedCheck(attackerOutcome, defenderOutcome);

  // On a tie both sides share the same adjusted margin and degree, so either one works.
  let winner = null;
  if (attacker.opposedWin) winner = attacker;
  else if (defender.opposedWin) winner = defender;

  const context = {
    attackerContext,
    defenderContext,
    attackerName: attackerActor.name,
    defenderName: defenderActor.name,
    result: OPPOSED_RESULT_LABELS[result],
    effective: winner ? { margin: winner.rollMargin, degreeLabel: winner.degreeLabel } : null,
  };

  const content = await renderChatCard('opposed-card', context);

  await ChatMessage.create({
    speaker: { alias: game.i18n.localize('POL3.OPPOSED.OpposedTest') },
    content,
    rolls: [attackerRoll],
    sound: CONFIG.sounds.dice,
  });

  if (attacker.opposedWin) {
    await damageCheck({
      weapon,
      target,
      successModifier: attacker.nextModifier,
      combatType: 'melee',
    });
  }

  if (result === 'tie') {
    if (!defenderWeapon) {
      console.warn(
        `POLARIS | ${defenderActor.name} n'a pas d'arme de mêlée équipée : dégâts de riposte ignorés (combat à mains nues non modélisé).`,
      );
      return;
    }
    const attackerToken = getActorToken(attackerActor);
    if (attackerToken) {
      await damageCheck({
        weapon: defenderWeapon,
        target: attackerToken,
        successModifier: defender.nextModifier,
        combatType: 'melee',
      });
    }
  }
}
