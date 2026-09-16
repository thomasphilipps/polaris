import { ATTRIBUTE } from './actor/attributes.mjs';
import * as SKILL from './item/skills.mjs';
import * as WEAPON from './item/weapons.mjs';
import * as WOUND from './actor/wounds.mjs';

export const POL3 = {
  ATTRIBUTE,
  SKILL,
  WEAPON,
  WOUND,
};

POL3.GENETICTYPE = {
  human: { label: 'POL3.ACTOR.GENETIC_TYPE.Human' },
  naturalHybrid: { label: 'POL3.ACTOR.GENETIC_TYPE.NaturalHybrid' },
  technoHybrid: { label: 'POL3.ACTOR.GENETIC_TYPE.TechnoHybrid' },
  geneticHybrid: { label: 'POL3.ACTOR.GENETIC_TYPE.GeneticHybrid' },
};

POL3.SEX = {
  male: { label: 'POL3.ACTOR.SEX.Male' },
  female: { label: 'POL3.ACTOR.SEX.Female' },
};

POL3.HANDEDNESS = {
  rightHanded: { label: 'POL3.ACTOR.HANDEDNESS.RightHanded' },
  leftHanded: { label: 'POL3.ACTOR.HANDEDNESS.LeftHanded' },
  ambidextrous: { label: 'POL3.ACTOR.HANDEDNESS.Ambidextrous' },
};

POL3.BOOK = {
  coreRulebook1: { label: 'POL3.BOOKS.CoreRulebook1' },
  coreRulebook2: { label: 'POL3.BOOKS.CoreRulebook2' },
};

POL3.TABLEARRAY = {
  valueArray: [22, 20, 18, 16, 14, 12, 9, 7, 5, 3],
  resultArray: [-5, -5, -4, -3, -2, -1, 0, 1, 2, 4],
};
