import Pol3BaseActorSheet from './base-actor.mjs';

export default class Pol3HeroSheet extends Pol3BaseActorSheet {
  static DEFAULT_OPTIONS = {
    actor: {
      type: 'hero',
    },
  };

  static {
    this._initializeActorSheet();
  }
}
