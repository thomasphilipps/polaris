import { ATTRIBUTE } from './attributes.mjs';
import * as SKILL from './item/skills.mjs';
import * as WEAPON from './item/weapons.mjs';

export const POL3 = {
  ATTRIBUTE,
  SKILL,
  WEAPON,
};

POL3.GENETICTYPE = {
  human: { label: 'POL3.ACTOR.GeneticType.Human' },
  naturalHybrid: { label: 'POL3.ACTOR.GeneticType.NaturalHybrid' },
  technoHybrid: { label: 'POL3.ACTOR.GeneticType.TechnoHybrid' },
  geneticHybrid: { label: 'POL3.ACTOR.GeneticType.GeneticHybrid' },
};

POL3.BOOK = {
  coreRulebook1: { label: 'POL3.BOOKS.CoreRulebook1' },
  coreRulebook2: { label: 'POL3.BOOKS.CoreRulebook2' },
};
