import * as baseActor from './base-actor.mjs';
import {POL3} from '../../config/config.mjs';

export default class Pol3Hero extends baseActor.Pol3ActorDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema()
    };
  }
}
