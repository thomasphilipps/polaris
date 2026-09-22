import Pol3BaseItemSheet from './base-item-sheet.mjs';

export default class Pol3ArmorSheet extends Pol3BaseItemSheet {
  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    item: {
      type: 'armor',
      hasGMDescription: true,
      templates: ['systems/polaris/templates/sheets/partials/items/item-details.hbs'],
    },
  };

  static {
    this._initializeItemSheet();
  }

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    Object.assign(context, {
      tagsWidget: (field, groupConfig, inputConfig) =>
        this._tagsWidget(field, groupConfig, inputConfig, {
          propertyConfig: CONFIG.POL3.ARMOR.ZONES,
        }),
    });
    return context;
  }
}
