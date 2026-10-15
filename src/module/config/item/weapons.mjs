/** Weapon categories (ranged, melee…). */
export const CATEGORY = {
  ranged: {
    label: 'POL3.WEAPON.Category.Ranged',
  },
  melee: {
    label: 'POL3.WEAPON.Category.Melee',
  },
  /*explosive: {
    label: 'POL13.WEAPON.Category.Explosive',
  },*/
  creatureAttack: {
    label: 'POL3.WEAPON.Category.CreatureAttack',
  },
};

/** Weapon subcategories, grouped by category. */
export const SUBCATEGORY = {
  ranged: {
    draft: {
      label: 'POL3.WEAPON.Subcategory.Draft',
    },
    throwing: {
      label: 'POL3.WEAPON.Subcategory.Throwing',
    },
    handgun: {
      label: 'POL3.WEAPON.Subcategory.Handgun',
    },
    rifle: {
      label: 'POL3.WEAPON.Subcategory.Rifle',
    },
    sniper: {
      label: 'POL3.WEAPON.Subcategory.Sniper',
    },
  },
};

/** Range bands, with their roll modifier. */
export const RANGE = {
  close: {
    label: 'POL3.WEAPON.Range.Close.Label',
    modifier: 5,
  },
  short: {
    label: 'POL3.WEAPON.Range.Short.Label',
    modifier: 0,
  },
  medium: {
    label: 'POL3.WEAPON.Range.Medium.Label',
    modifier: -5,
  },
  long: {
    label: 'POL3.WEAPON.Range.Long.Label',
    modifier: -10,
  },
  extreme: {
    label: 'POL3.WEAPON.Range.Extreme.Label',
    modifier: -15,
  },
};

/** Fire modes (tags) of a weapon. */
export const BURST = {
  single: {
    label: 'POL3.WEAPON.BURST.SingleShot.Label',
    symbol: 'POL3.WEAPON.BURST.SingleShot.Symbol',
  },
  short: {
    label: 'POL3.WEAPON.BURST.ShortBurst.Label',
    symbol: 'POL3.WEAPON.BURST.ShortBurst.Symbol',
  },
  long: {
    label: 'POL3.WEAPON.BURST.LongBurst.Label',
    symbol: 'POL3.WEAPON.BURST.LongBurst.Symbol',
  },
};

/** Skill category a weapon of each category can be linked to. */
export const CATEGORY_TO_SKILL_CATEGORY = {
  ranged: 'rangedCombat',
  melee: 'closeCombat',
};
