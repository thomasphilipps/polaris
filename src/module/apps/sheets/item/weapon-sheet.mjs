import Pol3BaseItemSheet from './base-item-sheet.mjs';

export default class Pol3WeaponSheet extends Pol3BaseItemSheet {
  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    item: {
      type: 'weapon',
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
        this._tagsWidget(field, groupConfig, inputConfig, { propertyConfig: CONFIG.POL3.WEAPON.BURST }),
      linkedSkillOptions: await this.#getLinkedSkillOptions(),
    });
    return context;
  }

  async #getLinkedSkillOptions() {
    // Attaque de créature : compétence unique fixe, pas de choix à proposer
    
    const targetCategory = CONFIG.POL3.WEAPON.CATEGORY_TO_SKILL_CATEGORY[this.item.system.category];
    if (!targetCategory) return {};

    const choices = {};

    for (const item of game.items) {
      if (item.type === 'skill' && item.system.category === targetCategory) {
        choices[item.name] = item.name;
      }
    }

    const itemPacks = game.packs.filter(p => p.documentName === 'Item');
    for (const pack of itemPacks) {
      const index = await pack.getIndex({ fields: ['type', 'system.category'] });
      for (const entry of index) {
        if (entry.type === 'skill' && entry.system?.category === targetCategory) {
          choices[entry.name] = entry.name;
        }
      }
    }

    return choices;
  }
}
