import Pol3BaseActorSheet from './base-actor-sheet.mjs';

/**
 * Actor sheet for heroes (player characters).
 * @extends {Pol3BaseActorSheet}
 */
export default class Pol3HeroSheet extends Pol3BaseActorSheet {
  static DEFAULT_OPTIONS = {
    actor: {
      type: 'hero',
    },
  };

  static {
    this._initializeActorSheetClass();
  }

  /**
   * Adds the hero-specific data to the base sheet context.
   * @param {object} options  Render options
   * @returns {Promise<object>}
   * @override
   */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const { fields: f } = context;
    Object.assign(context, {
      physicalDescription: f.physicalDescription.fields,
    });
    return context;
  }
}
