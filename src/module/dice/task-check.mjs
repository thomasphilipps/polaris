import { rollTaskCheck } from './roll-resolver.mjs';
import { damageCheck } from './damage-check.mjs';

export async function taskCheck({
                                  rollLabel,
                                  actionValue = 0,
                                  difficulty = 0,
                                  valueCrit = 0,
                                  isAttack = false,
                                  weapon = null,
                                  target = null,
                                } = {}) {

  //TODO: handle askForModifier
  const { roll, outcome } = await rollTaskCheck({
    actionValue,
    difficulty,
    valueCrit,
    askForModifier: true,
    contextLabel: rollLabel,
  });

  if (outcome === null) return null;

  const flavor = `<strong>${rollLabel}</strong><br>
    ${outcome.isSuccess ? 'Réussite' : 'Échec'}${outcome.isCritical ? ' critique' : ''}
    — Marge : ${outcome.rollMargin}<br>
    ${game.i18n.localize(outcome.degreeLabel)}`;

  const message = await roll.toMessage({ speaker: ChatMessage.getSpeaker(), flavor });

  if (isAttack && outcome.isSuccess && weapon && target) {
    await damageCheck({
      weapon,
      target,
      successModifier: outcome.nextModifier,
      combatType: weapon.system.category === 'ranged' ? 'ranged' : 'melee',
    });
  }

  return message;
}
