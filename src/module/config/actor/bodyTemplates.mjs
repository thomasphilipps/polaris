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
