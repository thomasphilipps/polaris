import { POL3 } from '../config/config.mjs';
import { applyDegree } from './roll-resolver.mjs';

/**
 * Resolves an opposition test between two already-rolled outcomes (from
 * resolveTaskCheck). Purely generic — knows nothing about weapons, damage,
 * or combat; usable for melee attacks, opposed Volonté/Endurance duels, etc.
 *
 * Rule applied for ties (double success, equal rollMargin): the general
 * opposition test rule — both sides win simultaneously — takes precedence
 * over the contact-combat chapter's "nothing happens" wording.
 *
 * @param {object} attackerOutcome  An outcome object from resolveTaskCheck
 * @param {object} defenderOutcome  An outcome object from resolveTaskCheck
 * @returns {{
 *   result: 'attackerWins'|'defenderWins'|'tie'|'bothFail',
 *   attacker: object,
 *   defender: object,
 * }}
 * Each returned side is a shallow copy of its input outcome, plus:
 * - `opposedWin` (boolean): whether this side's action takes effect
 * - `rollMargin`/`degreeLabel`/`nextModifier` adjusted per the opposition
 *   rules when relevant (untouched otherwise)
 */
export function resolveOpposedCheck(attackerOutcome, defenderOutcome) {
  const bothSucceed = attackerOutcome.isSuccess && defenderOutcome.isSuccess;
  const bothFail = !attackerOutcome.isSuccess && !defenderOutcome.isSuccess;

  if (bothFail) {
    // Match nul: each side keeps its own failure margin/degree unchanged.
    return {
      result: 'bothFail',
      attacker: { ...attackerOutcome, opposedWin: false },
      defender: { ...defenderOutcome, opposedWin: false },
    };
  }

  if (!bothSucceed) {
    // Only one side succeeded: it wins outright, its margin is unchanged.
    const attackerWins = attackerOutcome.isSuccess;
    return {
      result: attackerWins ? 'attackerWins' : 'defenderWins',
      attacker: { ...attackerOutcome, opposedWin: attackerWins },
      defender: { ...defenderOutcome, opposedWin: !attackerWins },
    };
  }

  // Both succeeded.
  if (attackerOutcome.rollMargin === defenderOutcome.rollMargin) {
    const asTiedWinner = outcome => {
      const adjusted = { ...outcome, rollMargin: 0, opposedWin: true };
      applyDegree(adjusted, POL3.SUCCESSTABLE);
      return adjusted;
    };
    return {
      result: 'tie',
      attacker: asTiedWinner(attackerOutcome),
      defender: asTiedWinner(defenderOutcome),
    };
  }

  const attackerWins = attackerOutcome.rollMargin > defenderOutcome.rollMargin;
  const winner = attackerWins ? attackerOutcome : defenderOutcome;
  const loser = attackerWins ? defenderOutcome : attackerOutcome;

  const winnerAdjusted = {
    ...winner,
    rollMargin: winner.rollMargin - loser.rollMargin,
    opposedWin: true,
  };
  applyDegree(winnerAdjusted, POL3.SUCCESSTABLE);
  const loserAdjusted = { ...loser, rollMargin: 0, opposedWin: false };

  return {
    result: attackerWins ? 'attackerWins' : 'defenderWins',
    attacker: attackerWins ? winnerAdjusted : loserAdjusted,
    defender: attackerWins ? loserAdjusted : winnerAdjusted,
  };
}
