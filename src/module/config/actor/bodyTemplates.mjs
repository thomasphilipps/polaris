export const BODY_TEMPLATES = {
  humanoid: [
    { name: 'head', resistant: false, lethal: true, label: 'POL3.ZONE.Head' },
    { name: 'body', resistant: true, lethal: true, label: 'POL3.ZONE.Body' },
    { name: 'armLeft', resistant: false, lethal: false, label: 'POL3.ZONE.ArmLeft' },
    { name: 'armRight', resistant: false, lethal: false, label: 'POL3.ZONE.ArmRight' },
    { name: 'legLeft', resistant: false, lethal: false, label: 'POL3.ZONE.LegLeft' },
    { name: 'legRight', resistant: false, lethal: false, label: 'POL3.ZONE.LegRight' },
  ],
  fish: [
    { name: 'head', resistant: false, lethal: true, label: 'POL3.ZONE.Head' },
    { name: 'body', resistant: true, lethal: true, label: 'POL3.ZONE.Body' },
    { name: 'finLeft', resistant: false, lethal: false, label: 'POL3.ZONE.FinLeft' },
    { name: 'finRight', resistant: false, lethal: false, label: 'POL3.ZONE.FinRight' },
  ],
};

/** Choices for the `bodyTemplate` field on an actor. */
export const TYPE = {
  humanoid: { label: 'POL3.BODY_TEMPLATE.Humanoid' },
  fish: { label: 'POL3.BODY_TEMPLATE.Fish' },
};

/**
 * Hit location tables, indexed by body template key. Each entry is either:
 * - { melee: [...], ranged: [...] } for templates with distinct tables per combat type
 * - { all: [...] } for templates using a single table regardless of combat type
 * Each table is an ascending array of { max, zone } — the first entry whose `max`
 * is >= the d20 result gives the hit zone.
 */
export const LOCATION_TABLES = {
  humanoid: {
    melee: [
      { max: 4, zone: 'head' },
      { max: 10, zone: 'body' },
      { max: 13, zone: 'armRight' },
      { max: 16, zone: 'armLeft' },
      { max: 18, zone: 'legRight' },
      { max: 20, zone: 'legLeft' },
    ],
    ranged: [
      { max: 2, zone: 'head' },
      { max: 8, zone: 'body' },
      { max: 11, zone: 'armRight' },
      { max: 14, zone: 'armLeft' },
      { max: 17, zone: 'legRight' },
      { max: 20, zone: 'legLeft' },
    ],
  },
  fish: {
    all: [
      { max: 5, zone: 'head' },
      { max: 16, zone: 'body' },
      { max: 18, zone: 'finRight' },
      { max: 20, zone: 'finLeft' },
    ],
  },
};
