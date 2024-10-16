const fields = foundry.data.fields;

function itemGlobalFields() {
  return {
    quantity: new fields.NumberField({ initial: 0 }),
    category: new fields.StringField({ initial: "" }),
    price: new fields.NumberField({ initial: 0 }),
    weight: new fields.NumberField({ initial: 0 }),
    minimalStrength: new fields.NumberField({ initial: 0 }),
    availability: new fields.NumberField({ initial: 0 }),
    blackMarketAvailability: new fields.NumberField({ initial: 0 }),
    techLevel: new fields.NumberField({ initial: 2 }),
    manufacturer: new fields.StringField({ initial: "" }),
    integrity: new fields.NumberField({ initial: 0 }),
    isEquipped: new fields.BooleanField({ initial: false }),
  };
}

function specialNameOption() {
  return {
    special: new fields.SchemaField({
      name: new fields.StringField({ initial: "" }),
      isSpecialSkill: new fields.BooleanField({ initial: false }),
    }),
  };
}

export class Pol3ItemDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      description: new fields.HTMLField({ initial: "" }),
      reference: new fields.StringField({ initial: "" }),
    };
  }
}

export class WeaponDataModel extends ItemDataModel {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      ...itemGlobalFields(),
      damage: new fields.StringField({ required: true, blank: false, initial: "1d6" }),
    };
  }
}

export class SkillDataModel extends ItemDataModel {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      ...specialNameOption(),
      firstAttribute: new fields.StringField({ initial: "" }),
      secondAttribute: new fields.StringField({ initial: "" }),
      category: new fields.StringField({ initial: "" }),
      option: new fields.SchemaField({
        isDifficult: new fields.BooleanField({ initial: false }),
        isReserved: new fields.BooleanField({ initial: false }),
        limitsOtherSkills: new fields.BooleanField({ initial: false }),
        hasNaturalProgression: new fields.BooleanField({ initial: false }),
        hasPrerequisites: new fields.BooleanField({ initial: false }),
        isBaseSkill: new fields.BooleanField({ initial: false }),
      }),
      mastery: new fields.NumberField({ initial: 0, integer: true }),
      globalValue: new fields.NumberField({ initial: 0 }),
    };
  }
}
