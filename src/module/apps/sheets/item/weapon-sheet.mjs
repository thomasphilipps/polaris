import Pol3BaseItemSheet from './base-item-sheet.mjs';

export default class Pol3WeaponSheet extends Pol3BaseItemSheet {
  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    item: {
      type: 'weapon',
      hasGMDescription: true,
      templates: ['system/polaris/templates/sheets/partials/items/item-details.hbs'],
    },
  };

  static {
    this._initializeItemSheet();
  }

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    Object.assign(context, {
      tagsWidget: (field, groupConfig, inputConfig) =>
        this._tagsWidget(field, groupConfig, inputConfig, { propertyConfig: CONFIG.POL3.WEAPON.BURST }),
    });
    return context;
  }

  /*  #getWeaponAssociatedSkills(skillCategory) {
      let skillArray = game.items.filter(item => {
        item.type === "skill" && item.system.category === skillCategory;
      })
    }*/
}
