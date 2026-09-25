import Pol3BaseActorSheet from './base-actor-sheet.mjs';

export default class Pol3HeroSheet extends Pol3BaseActorSheet {
  static DEFAULT_OPTIONS = {
    actor: {
      type: 'hero',
    },
  };

  static {
    this._initializeActorSheetClass();
  }

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const { fields: f } = context;
    Object.assign(context, {
      physicalDescription: f.physicalDescription.fields,
    });
    return context;
  }

}
