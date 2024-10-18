import { Pol3ItemDataModel, itemGlobalFields } from "./base-item.mjs";

export default class Pol3Weapon extends Pol3ItemDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(),
      ...itemGlobalFields(),
      damage: new fields.StringField({ required: true, blank: false, initial: "1d6" }),
    };
  }
}
