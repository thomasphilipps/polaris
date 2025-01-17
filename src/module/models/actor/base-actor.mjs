const fields = foundry.data.fields;
import { POL3 } from '../../config/config.mjs';

export function heroFields() {
  const ACTOR_GENETIC_TYPES = POL3.GENETICTYPE;
  const ACTOR_SEX = POL3.SEX;
  const ACTOR_HANDEDNESS = POL3.HANDEDNESS;
  const DEFAULT_GENETIC_TYPE = 'human';
  const DEFAULT_SEX = 'male';
  const DEFAULT_HANDEDNESS = 'rightHanded';
  return {
    physicalDescription: new fields.SchemaField({
      history: new fields.HTMLField({ label: 'POL3.ACTOR.DESCRIPTION.History' }),
      size: new fields.StringField({ label: 'POL3.ACTOR.DESCRIPTION.Size' }),
      weight: new fields.NumberField({ label: 'POL3.ACTOR.DESCRIPTION.Weight' }),
      skin: new fields.StringField({ label: 'POL3.ACTOR.DESCRIPTION.Skin' }),
      build: new fields.StringField({ label: 'POL3.ACTOR.DESCRIPTION.Build' }),
      hair: new fields.StringField({ label: 'POL3.ACTOR.DESCRIPTION.Hair' }),
      eyes: new fields.StringField({ label: 'POL3.ACTOR.DESCRIPTION.Eyes' }),
      handedness: new fields.StringField({
        label: 'POL3.ACTOR.DESCRIPTION.Handedness',
        required: true,
        choices: ACTOR_HANDEDNESS,
        initial: DEFAULT_HANDEDNESS,
      }),
      distinguishingMarks: new fields.HTMLField({ label: 'POL3.ACTOR.DESCRIPTION.DistinguishingMarks' }),
      geneticType: new fields.StringField({
        label: 'POL3.ACTOR.DESCRIPTION.GeneticType',
        required: true,
        choices: ACTOR_GENETIC_TYPES,
        initial: DEFAULT_GENETIC_TYPE,
      }),
      age: new fields.NumberField({ label: 'POL3.ACTOR.DESCRIPTION.Age' }),
      sex: new fields.StringField({
        label: 'POL3.ACTOR.DESCRIPTION.Sex',
        required: true,
        choices: ACTOR_SEX,
        initial: DEFAULT_SEX,
      }),
      fertile: new fields.BooleanField({ initial: false, label: 'POL3.ACTOR.DESCRIPTION.Fertile' }),
      geographicOrigin: new fields.StringField({ label: 'POL3.ACTOR.DESCRIPTION.GeographicOrigin' }),
      socialOrigin: new fields.StringField({ label: 'POL3.ACTOR.DESCRIPTION.SocialOrigin' }),
      basicTraining: new fields.StringField({ label: 'POL3.ACTOR.DESCRIPTION.BasicTraining' }),
      studies: new fields.StringField({ label: 'POL3.ACTOR.DESCRIPTION.Studies' }),
    }),

  };
}

export class Pol3ActorDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      description: new fields.SchemaField({
        public: new fields.HTMLField(),
        secret: new fields.HTMLField(),
        gmNotes: new fields.HTMLField({ gmOnly: true }),
      }),
      actorScale: new fields.StringField(),
      attributes: new fields.SchemaField(Object.values(POL3.ATTRIBUTE).reduce((obj, attribute) => {
        obj[attribute.id] = new fields.SchemaField({
          base: new fields.NumberField({ initial: 7, min: 3, max: 20 }),
          geneticModifier: new fields.NumberField({ initial: 0, min: 0 }),
          competencePointsModifier: new fields.NumberField({ initial: 0, min: 0 }),
          otherModifier: new fields.NumberField({ initial: 0, min: 0 }),
        }, { label: attribute.abbr });
        return obj;
      }, {})),
    };
  }
}
