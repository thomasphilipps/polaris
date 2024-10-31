import { Pol3ItemDataModel, itemGlobalFields } from './base-item.mjs';
import { POL3 } from '../../config/config.mjs';

//function weapon

export default class Pol3Weapon extends Pol3ItemDataModel {
  static WEAPON_BURSTS = POL3.WEAPON.BURST;

  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(),
      ...itemGlobalFields(),
      baseDamage: new fields.StringField({ required: true, blank: false, initial: '1d10' }),
      chocDamage: new fields.StringField({ blank: true }),
      minimalStrength: new fields.NumberField({ blank: true }),
      penetration: new fields.NumberField({ blank: true }),
      initiativeModifier: new fields.NumberField({ blank: true }),
      burstMode: new fields.SetField(
        new fields.StringField({ blank: true, choices: this.WEAPON_BURSTS }),
      ),
      allonge: new fields.NumberField({ blank: true }),

    };
  }
}
