import { Pol3ItemDataModel, itemGlobalFields, specialNameOption } from './base-item.mjs';
import { POL3 } from '../../config/config.mjs';

export default class Pol3Armor extends Pol3ItemDataModel {
  static ARMOR_TYPES = POL3.ARMOR.TYPE;
  static ARMOR_CATEGORY = POL3.ARMOR.CATEGORY;
  static ARMOR_ZONES = POL3.ARMOR.ZONES;
  static DEFAULT_TYPE = 'simple';
  static DEFAULT_CATEGORY = 'a';

  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(),
      ...itemGlobalFields(),
      type: new fields.StringField({
        label: 'POL3.SHEETS.GENERAL.Type',
        required: true,
        choices: this.ARMOR_TYPES,
        initial: this.DEFAULT_TYPE,
      }),
      category: new fields.StringField({
        label: 'POL3.SHEETS.GENERAL.Category',
        required: true,
        choices: this.ARMOR_CATEGORY,
        initial: this.DEFAULT_CATEGORY,
      }),
      tags: new fields.SetField(new fields.StringField({ blank: true, choices: this.ARMOR_ZONES })),
      baseProtection: new fields.NumberField({ blank: true, label: 'POL3.ARMOR.Protection' }),
      shockProtection: new fields.NumberField({ blank: true, label: 'POL3.ARMOR.ShockProtection' }),
    };
  }
}
