import { resolveLocation, resolveFinalDamage, resolveWoundSeverity } from './damage-resolver.mjs';
import { promptAdHocModifier } from '../apps/dialogs/modifier-dialog.mjs';
import { promptLocationChoice } from '../apps/dialogs/location-dialog.mjs';
import { toPascalCase } from '../utils/sheet-utils.mjs';
import { requestApplyWound, requestShockTest } from '../net/socket.mjs';
import { rollD20 } from './roll-resolver.mjs';
import { breakdownRoll, renderChatCard } from '../apps/chat/chat-card.mjs';
import { needsShockTest } from './shock-resolver.mjs';
/** @import Pol3Item from '../documents/item.mjs' */

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
 * @param {Pol3Item} params.weapon         The weapon used (for its damage formula)
 * @param {Token} params.target            The target token
 * @param {number} params.successModifier  nextModifier from the attack's outcome
 * @param {string} params.combatType       'melee' or 'ranged'
 * @param {boolean} [params.askForModifier=true]  Whether to prompt for a modifier
 */
export async function damageCheck({
                                    weapon,
                                    target,
                                    successModifier,
                                    combatType,
                                    askForModifier = true,
                                  }) {
  const targetActor = target.actor;
  if (!targetActor) return;
  const isShockOnly = weapon.system.shockOnly;
  const damageFormula = isShockOnly ? weapon.system.shockDamage : weapon.system.baseDamage;

  const bodyTemplateKey = targetActor.system.bodyTemplate;
  const locationTables = CONFIG.POL3.BODY_TEMPLATE.LOCATION_TABLES[bodyTemplateKey];
  if (!locationTables) {
    console.warn(`POLARIS | No location table for body template "${bodyTemplateKey}"`);
    return;
  }

  if (isShockOnly && (!damageFormula?.trim() || !Roll.validate(damageFormula))) {
    ui.notifications.warn(game.i18n.format('POL3.WARNING.NoShockFormula', { weaponName: weapon.name }));
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
    locationRoll = await rollD20();
    zone = resolveLocation({ locationTables, combatType, rollResult: locationRoll.total });
    if (!zone) {
      console.warn('POLARIS | Could not resolve a hit location');
      return;
    }
  }

  const damageRoll = new Roll(damageFormula);
  await damageRoll.evaluate();

  const adHocModifier = askForModifier
    ? (await promptAdHocModifier(
    game.i18n.format('POL3.DAMAGE.ModifierContext', { weaponName: weapon.name }),
    [],
    0,
  )) ?? 0
    : 0;

  const closeCombatModifier =
    combatType === 'melee' ? (weapon.actor?.system.closeCombatModifier?.value ?? 0) : 0;

  const damageResistance = targetActor.system.damageResistance?.value ?? 0;
  const armorZone = WOUND_ZONE_TO_ARMOR_ZONE[zone];
  const armor = targetActor.items.find(
    i => i.type === 'armor' && i.system.isEquipped && armorZone && i.system.tags.has(armorZone),
  );
  const weaponPenetration = weapon.system.penetration ?? 0;
  const armorProtection = armor?.system.baseProtection ?? 0;
  const armorShockProtection = armor?.system.shockProtection ?? 0;
  // Penetration never reduces shock protection
  const mitigatedArmor = Math.max(0, armorProtection - weaponPenetration);
  const effectiveProtection = isShockOnly ? mitigatedArmor + armorShockProtection : mitigatedArmor;

  const finalDamage = resolveFinalDamage({
    weaponDamageRoll: damageRoll.total,
    successModifier,
    closeCombatModifier,
    otherModifiers: adHocModifier,
    damageResistance,
    armorProtection: effectiveProtection,
  });

  const severity =
    finalDamage > 0
      ? resolveWoundSeverity(finalDamage, CONFIG.POL3.WOUND.SEVERITY_THRESHOLDS)
      : null;

  if (severity && !isShockOnly) {
    await requestApplyWound({ actor: targetActor, zone, severity });
  }

  const zoneLabel = game.i18n.localize(`POL3.ZONES.${toPascalCase(zone)}.Label`);
  const severityText = severity
    ? game.i18n.localize(`POL3.WOUND.SEVERITY.${toPascalCase(severity)}`)
    : finalDamage > 0
      ? game.i18n.localize('POL3.DAMAGE.NoWound')
      : game.i18n.localize('POL3.DAMAGE.NoDamage');

  const rollTerms = breakdownRoll(damageRoll);

  const rolls = locationRoll ? [locationRoll, damageRoll] : [damageRoll];

  const modifiersList = [
    {
      label: isShockOnly ? 'POL3.DAMAGE.ShockDamage' : 'POL3.DAMAGE.BaseDamage',
      value: damageRoll.total,
    },
    {
      label: 'POL3.DIALOG.SuccessModifier',
      value: successModifier,
    },
    {
      label: 'POL3.DIALOG.OtherModifiers',
      value: adHocModifier,
    },
    {
      label: 'POL3.ATTRIBUTE.SECONDARIES.CloseCombatModifier',
      value: closeCombatModifier,
    },
    {
      label: 'POL3.ATTRIBUTE.SECONDARIES.DamageResistance',
      value: damageResistance,
    },
    {
      label: 'POL3.DIALOG.WeaponPenetration',
      value: weaponPenetration,
    },
    {
      label: 'POL3.DIALOG.ArmorProtection',
      value: armorProtection > 0 ? -armorProtection : 0,
    },
  ];

  const damageContext = {
    targetName: targetActor.name,
    weaponName: weapon.name,
    rollTerms,
    zoneLabel,
    finalDamage,
    severityText,
    damageFormula,
    modifiers: modifiersList,
  };

  const content = await renderChatCard('damage-card', damageContext);

  const message = await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor: targetActor }),
    content,
    rolls,
    sound: CONFIG.sounds.dice,
  });

  if (severity && needsShockTest({ severity, zone })) {
    // The absence of 'await' here is intentional: we want to send the request to not block attacker flow
    requestShockTest({
      actor: targetActor,
      woundedZone: zone,
      baseSeverity: severity,
    });
  }

  return message;
}
