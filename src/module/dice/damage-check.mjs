import { resolveLocation, resolveFinalDamage, resolveWoundSeverity } from './damage-resolver.mjs';
import { promptLocationChoice } from '../apps/dialogs/location-dialog.mjs';
import { toPascalCase } from '../utils/sheet-utils.mjs';

// Armor zones (head/body/arms/legs) are coarser than wound zones
// (head/body/armLeft/armRight/legLeft/legRight). Fish zones (finLeft/finRight)
// have no matching armor zone yet — armorProtection simply stays 0 for them.
const WOUND_ZONE_TO_ARMOR_ZONE = {
  head: 'head',
  body: 'body',
  armLeft: 'arms',
  armRight: 'arms',
  legLeft: 'legs',
  legRight: 'legs',
};

/**
 * Resolves damage and hit location for a successful attack, applies the resulting
 * wound to the target, and posts a chat message with the breakdown.
 * @param {object} params
 * @param {Item} params.weapon             The weapon used (for its damage formula)
 * @param {Token} params.target            The target token
 * @param {number} params.successModifier  nextModifier from the attack's outcome
 * @param {string} params.combatType       'melee' or 'ranged'
 */
export async function damageCheck({ weapon, target, successModifier, combatType }) {
  const targetActor = target.actor;
  if (!targetActor) return;

  const bodyTemplateKey = targetActor.system.bodyTemplate;
  const locationTables = CONFIG.POL3.BODY_TEMPLATE.LOCATION_TABLES[bodyTemplateKey];
  if (!locationTables) {
    console.warn(`POLARIS | No location table for body template "${bodyTemplateKey}"`);
    return;
  }

  const zoneChoices = Object.keys(targetActor.system.wounds).map(key => ({
    key,
    label: `POL3.ZONES.${toPascalCase(key)}.Label`,
  }));

  const choice = await promptLocationChoice({ zoneChoices });
  if (!choice) return;

  let zone;
  let locationRoll = null;
  if (choice.mode === 'manual') {
    zone = choice.zone;
  } else {
    locationRoll = new Roll('1d20');
    await locationRoll.evaluate();
    zone = resolveLocation({ locationTables, combatType, rollResult: locationRoll.total });
    if (!zone) {
      console.warn('POLARIS | Could not resolve a hit location');
      return;
    }
  }

  const damageRoll = new Roll(weapon.system.baseDamage);
  await damageRoll.evaluate();

  const closeCombatModifier =
    combatType === 'melee' ? (weapon.actor?.system.closeCombatModifier?.value ?? 0) : 0;

  const damageResistance = targetActor.system.damageResistance?.value ?? 0;
  const armorZone = WOUND_ZONE_TO_ARMOR_ZONE[zone];
  const armor = targetActor.items.find(
    i => i.type === 'armor' && i.system.isEquipped && armorZone && i.system.tags.has(armorZone),
  );
  const armorProtection = armor?.system.baseProtection ?? 0;

  const finalDamage = resolveFinalDamage({
    weaponDamageRoll: damageRoll.total,
    successModifier,
    closeCombatModifier,
    damageResistance,
    armorProtection,
  });

  const severity =
    finalDamage > 0 ? resolveWoundSeverity(finalDamage, CONFIG.POL3.WOUND.SEVERITY_THRESHOLDS) : null;

  if (severity) {
    await targetActor.applyWound(zone, severity);
  }

  const zoneLabel = game.i18n.localize(`POL3.ZONES.${toPascalCase(zone)}.Label`);
  const severityText = severity
    ? game.i18n.localize(`POL3.WOUND.SEVERITY.${toPascalCase(severity)}`)
    : finalDamage > 0
      ? game.i18n.localize('POL3.DAMAGE.NoWound')
      : game.i18n.localize('POL3.DAMAGE.NoDamage');

  const flavor = `<strong>${game.i18n.localize('POL3.DAMAGE.Title')}</strong><br>
    ${zoneLabel} — ${finalDamage} ${game.i18n.localize('POL3.DAMAGE.Points')}<br>
    ${severityText}`;

  const rolls = locationRoll ? [locationRoll, damageRoll] : [damageRoll];

  return ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor: targetActor }),
    content: flavor,
    rolls,
    sound: CONFIG.sounds.dice,
  });
}
