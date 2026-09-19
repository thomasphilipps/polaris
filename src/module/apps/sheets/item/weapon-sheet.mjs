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


  // async #getLinkedSkillOptions() {
  //   // Attaque de créature : compétence unique fixe, pas de choix à proposer (à confirmer)
  //   if (this.item.system.category === 'creatureAttack') return {};
  //
  //   const targetCategory = CONFIG.POL3.WEAPON.CATEGORY_TO_SKILL_CATEGORY[this.item.system.category];
  //   if (!targetCategory) return {};
  //
  //   const choices = {};
  //
  //   for (const item of game.items) {
  //     if (item.type === 'skill' && item.system.category === targetCategory) {
  //       choices[item.name] = item.name;
  //     }
  //   }
  //
  //   const itemPacks = game.packs.filter(p => p.documentName === 'Item');
  //   for (const pack of itemPacks) {
  //     const index = await pack.getIndex({ fields: ['type', 'system.category'] });
  //     for (const entry of index) {
  //       if (entry.type === 'skill' && entry.system?.category === targetCategory) {
  //         choices[entry.name] = entry.name;
  //       }
  //     }
  //   }
  //
  //   return choices;
  // }
}
