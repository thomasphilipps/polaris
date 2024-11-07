const fields = foundry.data.fields;
import { POL3 } from '../../config/config.mjs';

export function itemGlobalFields() {
  return {
    quantity: new fields.NumberField({ initial: 0, label: 'POL3.SHEETS.DETAILS.Quantity' }),
    price: new fields.NumberField({ initial: 0, label: 'POL3.SHEETS.DETAILS.Price' }),
    weight: new fields.NumberField({ initial: 0, label: 'POL3.SHEETS.DETAILS.Weight' }),
    availability: new fields.NumberField({ initial: 0, label: 'POL3.SHEETS.DETAILS.Availability' }),
    blackMarketAvailability: new fields.NumberField({
      initial: 0,
      label: 'POL3.SHEETS.DETAILS.BlackMarketAvailability',
    }),
    techLevel: new fields.NumberField({ initial: 2, label: 'POL3.SHEETS.DETAILS.TechLevel' }),
    manufacturer: new fields.StringField({
      initial: '',
      label: 'POL3.SHEETS.DETAILS.Manufacturer',
    }),
    integrity: new fields.NumberField({ initial: 0, label: 'POL3.SHEETS.DETAILS.Integrity' }),
    isEquipped: new fields.BooleanField({
      initial: false,
      label: 'POL3.SHEETS.DETAILS.IsEquipped',
    }),
  };
}

export function specialNameOption() {
  return {
    specialization: new fields.StringField({
      initial: '',
      label: 'POL3.SHEETS.GENERAL.Specialization',
    }),
  };
}

export class Pol3ItemDataModel extends foundry.abstract.TypeDataModel {
  static ITEM_BOOK_REFERENCES = POL3.BOOK;
  static DEFAULT_BOOK_REFERENCE = 'coreRulebook1';

  static defineSchema() {

    return {
      description: new fields.SchemaField({
        public: new fields.HTMLField(),
        secret: new fields.HTMLField(),
      }),
      reference: new fields.SchemaField({
        book: new fields.StringField({
          label: 'POL3.SHEETS.REFERENCE.Book',
          blank: true,
          choices: this.ITEM_BOOK_REFERENCES,
        }),
        page: new fields.NumberField({
          label: 'POL3.SHEETS.REFERENCE.Page',
        }),
      }),
    };
  }
}
