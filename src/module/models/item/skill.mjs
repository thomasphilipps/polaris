import { Pol3ItemDataModel, specialNameOption } from "./base-item.mjs";

export default class Pol3Skill extends Pol3ItemDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(),
      ...specialNameOption(),
      firstAttribute: new fields.StringField({ initial: "" }),
      secondAttribute: new fields.StringField({ initial: "" }),
      category: new fields.StringField({ initial: "" }),
      tags: new fields.SchemaField({
        isDifficult: new fields.BooleanField({ initial: false }),
        isReserved: new fields.BooleanField({ initial: false }),
        limitsOtherSkills: new fields.BooleanField({ initial: false }),
        hasNaturalProgression: new fields.BooleanField({ initial: false }),
        hasPrerequisites: new fields.BooleanField({ initial: false }),
      }),
      mastery: new fields.NumberField({ initial: 0, integer: true }),
      globalValue: new fields.NumberField({ initial: 0 }),
    };
  }
}
