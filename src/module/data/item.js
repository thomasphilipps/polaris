const { HTMLField, NumberField, SchemaField, BooleanField, StringField } = foundry.data.fields;

function itemGlobalFields() {
  return {
    quantity: new NumberField({ initial: 0 }),
    category: new StringField({ initial: "" }),
    price: new NumberField({ initial: 0 }),
    weight: new NumberField({ initial: 0 }),
    minimalStrngth: new NumberField({ initial: 0 }),
    disponibility: new NumberField({ initial: 0 }),
    blackMarcketdisponibility: new NumberField({ initial: 0 }),
    techLevel: new NumberField({ initial: 2 }),
    manufacturer: new StringField({ initial: "" }),
    integrity: new NumberField({ initial: 0 }),
    isEquipped: new BooleanField({ initial: false }),
  };
}

export class ItemDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      description: new HTMLField({ initial: "" }),
      reference: new StringField({ initial: "" }),
    };
  }
}

export class WeaponDataModel extends ItemDataModel {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      ...itemGlobalFields(),
      damage: new StringField({ required: true, blank: false, initial: "1d6" }),
    };
  }
}

export class SkillDataModel extends ItemDataModel {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      firstAttribute: new StringField({ initial: "" }),
      secondAttribute: new StringField({ initial: "" }),
      category: new StringField({ initial: "" }),
      special: new SchemaField({
        name: new StringField({ initial: "" }),
        isSpecialSkill: new BooleanField({ initial: false }),
      }),
      option: new SchemaField({
        isDifficult: new BooleanField({ initial: false }),
        isReserved: new BooleanField({ initial: false }),
        limitsOtherSkills: new BooleanField({ initial: false }),
        hasNaturalProgression: new BooleanField({ initial: false }),
        hasPrerequisites: new BooleanField({ initial: false }),
        isBaseSkill: new BooleanField({ initial: false }),
      }),
      mastery: new NumberField({ initial: 0, integer: true }),
      globalValue: new NumberField({ initial: 0 }),
    };
  }
}
