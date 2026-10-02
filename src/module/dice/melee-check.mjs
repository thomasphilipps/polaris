import { rollTaskCheck } from './roll-resolver.mjs';
import { resolveOpposedCheck } from './opposed-resolver.mjs';
import { requestOpposedDefense } from '../net/socket.mjs';
import { damageCheck } from './damage-check.mjs';
import { getActorToken } from '../utils/combat-utils.mjs';

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
 * @param {Item} params.weapon   The Attacker's weapon
 * @param {Token} params.target  The Defender's token
 */
export async function meleeCheck({ rollLabel, actionValue, valueCrit, weapon, target }) {
  const attackerActor = weapon.actor;
  const defenderActor = target.actor;
  if (!defenderActor) return;

  const defenderWeapon = defenderActor.items.find(
    i => i.type === 'weapon' && i.system.isEquipped && i.system.category !== 'ranged',
  );

  const allongeDiff = (weapon.system.allonge ?? 0) - (defenderWeapon?.system.allonge ?? 0);
  const attackerDifficulty = allongeDiff > 0 ? allongeDiff : 0;
  const defenderDifficulty = allongeDiff < 0 ? -allongeDiff : 0;

  //TODO: handle askForModifier
  const { outcome: attackerOutcome } = await rollTaskCheck({
    actionValue,
    difficulty: attackerDifficulty,
    valueCrit,
    askForModifier: true,
    contextLabel: rollLabel,
  });

  if (attackerOutcome === null) return;

  const defenderOutcome = await requestOpposedDefense({
    defenderActor,
    difficulty: defenderDifficulty,
    attackLabel: rollLabel,
  });

  const { result, attacker, defender } = resolveOpposedCheck(attackerOutcome, defenderOutcome);

  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor: attackerActor }),
    content: `<strong>${rollLabel}</strong><br>
      ${attackerActor.name} : ${attacker.rollMargin} — ${defenderActor.name} : ${defender.rollMargin}<br>
      ${game.i18n.localize(OPPOSED_RESULT_LABELS[result])}`,
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
