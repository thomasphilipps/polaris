import { Pol3ItemDataModel, itemGlobalFields, specialNameOption } from './base-item.mjs';
import {
  getSingleTarget,
  getActorToken,
  measureTokenDistance,
  getRangeBand,
} from '../../utils/combat-utils.mjs';
import { POL3 } from '../../config/config.mjs';

//function weapon

export default class Pol3Weapon extends Pol3ItemDataModel {
  static WEAPON_BURSTS = POL3.WEAPON.BURST;
  static ITEM_CATEGORIES = POL3.WEAPON.CATEGORY;
  static DEFAULT_CATEGORY = 'ranged';
  static WEAPON_RANGED_SUBCATEGORY = POL3.WEAPON.SUBCATEGORY.ranged;
  static DEFAULT_RANGED_SUBCATEGORY = 'draft';

  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(),
      ...itemGlobalFields(),
      linkedSkill: new fields.StringField({
        required: true,
        label: 'POL3.SHEETS.GENERAL.LinkedSkill',
      }),
      category: new fields.StringField({
        label: 'POL3.SHEETS.GENERAL.Category',
        required: true,
        choices: this.ITEM_CATEGORIES,
        initial: this.DEFAULT_CATEGORY,
      }),
      subcategory: new fields.StringField({
        label: 'POL3.SHEETS.GENERAL.Subcategory',
        required: true,
        choices: this.WEAPON_RANGED_SUBCATEGORY,
        initial: this.DEFAULT_RANGED_SUBCATEGORY,
      }),
      baseDamage: new fields.StringField({
        required: true,
        blank: false,
        initial: '1d10',
        label: 'POL3.WEAPON.SHEET.BaseDamage',
      }),
      chocDamage: new fields.StringField({ blank: true, label: 'POL3.WEAPON.SHEET.ChocDamage' }),
      penetration: new fields.NumberField({ blank: true, label: 'POL3.WEAPON.SHEET.Penetration' }),
      allonge: new fields.NumberField({ blank: true, label: 'POL3.WEAPON.SHEET.Reach' }),
      hitDistance: new fields.SchemaField({
        close: new fields.NumberField({ required: true, label: 'POL3.WEAPON.Range.Close.Label' }),
        short: new fields.NumberField({ required: true, label: 'POL3.WEAPON.Range.Short.Label' }),
        medium: new fields.NumberField({ required: true, label: 'POL3.WEAPON.Range.Medium.Label' }),
        long: new fields.NumberField({ required: true, label: 'POL3.WEAPON.Range.Long.Label' }),
        extreme: new fields.NumberField({
          required: true,
          label: 'POL3.WEAPON.Range.Extreme.Label',
        }),
      }),
      tags: new fields.SetField(
        new fields.StringField({ blank: true, choices: this.WEAPON_BURSTS }),
      ),
      minimalStrength: new fields.NumberField({
        blank: true,
        label: 'POL3.WEAPON.SHEET.MinimalStrength',
      }),
      initiativeModifier: new fields.NumberField({
        blank: true,
        label: 'POL3.WEAPON.SHEET.InitiativeModifier',
      }),
    };
  }

  /**
   * Builds the roll parameters for this weapon: the linked skill's value, plus
   * (for ranged weapons) the range modifier computed from the current target's distance.
   * @returns {{
   *   actor: Actor,
   *   rollLabel: string,
   *   actionValue: number,
   *   valueCrit: number,
   *   modifiers: {label: string, value: number}[],
   *   isAttack: boolean,
   *   weapon: Item,
   *   target: Token
   * }|null}
   */
  getRollData() {
    const actor = this.parent.actor;
    const competence = actor?.getSkillValue(this.linkedSkill);

    if (!competence?.value) {
      ui.notifications.error(
        game.i18n.format('POL3.ERROR.CannotUse', {
          actorName: actor?.name,
          itemName: this.parent.name,
        }),
      );
      return null;
    }

    const target = getSingleTarget();
    if (!target) return null;

    const modifiers = [];

    if (this.category === 'ranged') {
      const attackerToken = getActorToken(actor);
      if (!attackerToken) return null;

      const distance = measureTokenDistance(attackerToken, target);
      const rangeBand = getRangeBand(distance, this.hitDistance);
      if (!rangeBand) {
        ui.notifications.error(
          game.i18n.format('POL3.ERROR.OutOfRange', { itemName: this.parent.name }),
        );
        return null;
      }
      const rangeConfig = CONFIG.POL3.WEAPON.RANGE[rangeBand];
      if (rangeConfig) {
        modifiers.push({
          label: rangeConfig.label,
          value: rangeConfig.modifier,
        });
      }
    }

    return {
      actor,
      rollLabel: competence.label,
      actionValue: competence.value,
      valueCrit: competence.valueCrit,
      modifiers,
      isAttack: true,
      weapon: this.parent,
      target,
    };
  }
}
