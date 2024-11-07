const fields = foundry.data.fields;
import {POL3} from '../../config/config.mjs';

export function mainActorFields() {
  return {
    //scholar: new fields.HTMLField(),
    history: new fields.HTMLField(),
    size: new fields.StringField(),
    weight: new fields.NumberField(),
    skin: new fields.StringField(),
    build: new fields.StringField(),
    hair: new fields.StringField(),
    eyes: new fields.StringField(),
    handedness: new fields.StringField(),
    distinguishingMarks: new fields.HTMLField(),
    old: new fields.NumberField(),
    sex: new fields.StringField(),
    fertile: new fields.BooleanField({initial: false}),
    geographicalOrigin: new fields.StringField(),
    socialOrigin: new fields.StringField(),
    basicTraining: new fields.StringField(),
    studies: new fields.StringField(),
  };
}

export class Pol3ActorDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      description: new fields.SchemaField({
        public: new fields.HTMLField(),
        secret: new fields.HTMLField(),
      }),
      actorScale: new fields.StringField(),
      attributes: new fields.SchemaField(Object.values(POL3.ATTRIBUTE).reduce((obj, attribute) => {
        obj[attribute.id] = new fields.SchemaField({
          base: new fields.NumberField({initial: 7, min: 3, max: 20}),
          geneticModifier: new fields.NumberField({initial: 0, min: 0}),
          competencePointsModifier: new fields.NumberField({initial: 0, min: 0}),
          otherModifier: new fields.NumberField({initial: 0, min: 0}),
        }, {label: attribute.abbr});
        return obj;
      }, {}))
    };
  }
}
