import Pol3BaseItemSheet from './base-item-sheet.mjs';

/**
 * Item sheet for armor and shields.
 * @extends {Pol3BaseItemSheet}
 */
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

  /**
   * Adds the armor-specific data to the base sheet context.
   * @param {object} options  Render options
   * @returns {Promise<object>}
   * @override
   */
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
