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

  async _prepareContext() {
    return await super._prepareContext();

  }
}
