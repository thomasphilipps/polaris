import { Pol3ItemDataModel, itemGlobalFields, specialNameOption } from './base-item.mjs';
import { POL3 } from '../../config/config.mjs';

//function weapon

export default class Pol3Weapon extends Pol3ItemDataModel {
  static WEAPON_BURSTS = POL3.WEAPON.BURST;
  static ITEM_CATEGORIES = POL3.WEAPON.CATEGORY;
  static DEFAULT_CATEGORY = 'ranged';

  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(),
      ...itemGlobalFields(),
      ...specialNameOption(),
      baseDamage: new fields.StringField({ required: true, blank: false, initial: '1d10' }),
      chocDamage: new fields.StringField({ blank: true }),
      minimalStrength: new fields.NumberField({ blank: true }),
      penetration: new fields.NumberField({ blank: true }),
      initiativeModifier: new fields.NumberField({ blank: true }),
      tags: new fields.SetField(
        new fields.StringField({ blank: true, choices: this.WEAPON_BURSTS }),
      ),
      allonge: new fields.NumberField({ blank: true }),
      category: new fields.StringField({
        label: 'POL3.SHEETS.Category',
        required: true,
        choices: this.ITEM_CATEGORIES,
        initial: this.DEFAULT_CATEGORY,
      }),
    };
  }
}
