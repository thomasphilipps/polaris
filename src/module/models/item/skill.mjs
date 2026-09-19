import { Pol3ItemDataModel, specialNameOption } from './base-item.mjs';
import { POL3 } from '../../config/config.mjs';

export default class Pol3Skill extends Pol3ItemDataModel {
  static ITEM_ATTRIBUTES = POL3.ATTRIBUTE;
  static DEFAULT_ATTRIBUTE = 'FOR';
  static ITEM_PROPERTIES = POL3.SKILL.PROPERTY;
  static ITEM_CATEGORIES = POL3.SKILL.CATEGORY;
  static DEFAULT_CATEGORY = 'physicalAptitude';

  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(),
      ...specialNameOption(),
      firstAttribute: new fields.StringField({
        label: 'POL3.ATTRIBUTE.FirstAttribute',
        required: true,
        choices: this.ITEM_ATTRIBUTES,
        initial: this.DEFAULT_ATTRIBUTE,
      }),
      secondAttribute: new fields.StringField({
        label: 'POL3.ATTRIBUTE.SecondAttribute',
        required: true,
        choices: this.ITEM_ATTRIBUTES,
        initial: this.DEFAULT_ATTRIBUTE,
      }),
      category: new fields.StringField({
        label: 'POL3.SHEETS.GENERAL.Category',
        required: true,
        choices: this.ITEM_CATEGORIES,
        initial: this.DEFAULT_CATEGORY,
      }),
      tags: new fields.SetField(
        new fields.StringField({ required: true, choices: this.ITEM_PROPERTIES }),
      ),
      mastery: new fields.NumberField({ initial: 0, integer: true }),
      //globalValue: new fields.NumberField({initial: 0}),
    };
  }

  getRollData() {
    console.log(this);
    return {
      rollLabel: this.parent.name,
      actionValue: this.globalLevel,
      valueCrit: this.mastery,
    };
  }
}
