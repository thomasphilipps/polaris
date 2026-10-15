import Pol3BaseItemSheet from './base-item-sheet.mjs';

/**
 * Item sheet for skills.
 * @extends {Pol3BaseItemSheet}
 */
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

  /**
   * Adds the skill-specific data to the base sheet context.
   * @param {object} options  Render options
   * @returns {Promise<object>}
   * @override
   */
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
