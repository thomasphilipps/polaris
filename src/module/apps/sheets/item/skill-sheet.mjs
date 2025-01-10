import Pol3BaseItemSheet from './base-item-sheet.mjs';

export default class Pol3SkillSheet extends Pol3BaseItemSheet {
  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    item: {
      type: 'skill',
      hasGMDescription: true,
    },
  };

  static {
    this._initializeItemSheet();
  }

  //** @inheritDoc */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    Object.assign(context, {
      tagsWidget: (field, groupConfig, inputConfig) =>
        this._tagsWidget(field, groupConfig, inputConfig, {
          propertyConfig: CONFIG.POL3.SKILL.PROPERTY,
        }),
    });
    return context;
  }

}
