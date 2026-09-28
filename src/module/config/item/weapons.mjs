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

export const RANGE = {
  close: {
    label: 'POL3.WEAPON.Range.Close',
    modifier: 5,
  },
  short: {
    label: 'POL3.WEAPON.Range.Short',
    modifier: 0,
  },
  medium: {
    label: 'POL3.WEAPON.Range.Medium',
    modifier: -5,
  },
  long: {
    label: 'POL3.WEAPON.Range.Long',
    modifier: -10,
  },
  extreme: {
    label: 'POL3.WEAPON.Range.Extreme',
    modifier: -15,
  },
};

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

export const CATEGORY_TO_SKILL_CATEGORY = {
  ranged: 'rangedCombat',
  melee: 'closeCombat',
};
