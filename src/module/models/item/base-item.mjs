const fields = foundry.data.fields;

export function itemGlobalFields() {
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

export function specialNameOption() {
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
