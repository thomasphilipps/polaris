import * as baseActor from './base-actor.mjs';
//import { POL3 } from '../../config/config.mjs';

/**
 * Data model of the `hero` actor type.
 * @extends {Pol3ActorDataModel}
 */
export default class Pol3Hero extends baseActor.Pol3ActorDataModel {
  /** @override */
  static defineSchema() {
    //const fields = foundry.data.fields;
    return {
      ...super.defineSchema(),
      ...baseActor.heroFields(),
    };
  }
}
