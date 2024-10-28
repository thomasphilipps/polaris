import Pol3BaseItemSheet from "./base-item.mjs";

export default class Pol3WeaponSheet extends Pol3BaseItemSheet {
  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    item: {
      type: "weapon",
      //hasGMDescription: true,
    },
  };

  static {
    this._initializeItemSheet();
  }

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    return context;
  }
}
