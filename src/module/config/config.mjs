import { ATTRIBUTE } from './actor/attributes.mjs';
import * as SKILL from './item/skills.mjs';
import * as WEAPON from './item/weapons.mjs';
import * as WOUND from './actor/wounds.mjs';
import * as ARMOR from './item/armor.mjs';

export const POL3 = {
  ATTRIBUTE,
  SKILL,
  WEAPON,
  WOUND,
  ARMOR,
};

POL3.SUCCESSTABLE = [
  { threshold: 35, label: 'POL3.ROLL.Legendary', nextModifier: 9 },
  { threshold: 25, label: 'POL3.ROLL.Heroic', nextModifier: 8 },
  { threshold: 20, label: 'POL3.ROLL.Extraordinary', nextModifier: 7 },
  { threshold: 15, label: 'POL3.ROLL.Perfect', nextModifier: 6 },
  { threshold: 13, label: 'POL3.ROLL.Excellent', nextModifier: 5 },
  { threshold: 10, label: 'POL3.ROLL.ReallyGood', nextModifier: 4 },
  { threshold: 7, label: 'POL3.ROLL.Good', nextModifier: 3 },
  { threshold: 5, label: 'POL3.ROLL.QuiteGood', nextModifier: 2 },
  { threshold: 3, label: 'POL3.ROLL.Correct', nextModifier: 1 },
];

POL3.FAILURETABLE = [
  { threshold: -35, label: 'POL3.ROLL.Catastrophic', nextModifier: -9 },
  { threshold: -25, label: 'POL3.ROLL.Catastrophic', nextModifier: -8 },
  { threshold: -20, label: 'POL3.ROLL.Catastrophic', nextModifier: -7 },
  { threshold: -15, label: 'POL3.ROLL.Catastrophic', nextModifier: -6 },
  { threshold: -13, label: 'POL3.ROLL.Execrable', nextModifier: -5 },
  { threshold: -10, label: 'POL3.ROLL.ReallyBad', nextModifier: -4 },
  { threshold: -7, label: 'POL3.ROLL.Bad', nextModifier: -3 },
  { threshold: -5, label: 'POL3.ROLL.QuiteBad', nextModifier: -2 },
  { threshold: -3, label: 'POL3.ROLL.Poor', nextModifier: -1 },
];

POL3.DEGREE_BARELY = 'POL3.ROLL.Barely';

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
