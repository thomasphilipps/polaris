/** Armor types (simple armor, personal field…). */
export const TYPE = {
  simple: {
    label: 'POL3.ARMOR.TYPE.Simple',
  },
  personalField: {
    label: 'POL3.ARMOR.TYPE.PersonalField',
  },
  sphericalField: {
    label: 'POL3.ARMOR.TYPE.SphericalField',
  },
  shield: {
    label: 'POL3.ARMOR.TYPE.Shield',
  },
};

/** Armor categories, with their malus. */
export const CATEGORY = {
  a: {
    label: 'A',
    malus: -1,
  },
  b: {
    label: 'B',
    malus: -2,
  },
  c: {
    label: 'C',
    malus: -3,
  },
  d: {
    label: 'D',
    malus: -5,
  },
};

/** Body zones an armor can cover (coarser than wound zones). */
export const ZONES = {
  head: {
    label: 'POL3.ZONES.Head.Label',
    symbol: 'POL3.ZONES.Head.Symbol',
  },
  body: {
    label: 'POL3.ZONES.Body.Label',
    symbol: 'POL3.ZONES.Body.Symbol',
  },
  arms: {
    label: 'POL3.ZONES.Arms.Label',
    symbol: 'POL3.ZONES.Arms.Symbol',
  },
  legs: {
    label: 'POL3.ZONES.Legs.Label',
    symbol: 'POL3.ZONES.Legs.Symbol',
  },
};
