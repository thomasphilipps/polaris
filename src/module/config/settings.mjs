export const registerSystemSettings = function() {
  game.settings.register('polaris', 'worldAmbiance', {
    config: true,
    scope: 'world',
    name: 'POL3.SETTINGS.WorldAmbiance.Name',
    hint: 'POL3.SETTINGS.WorldAmbiance.Hint',
    type: String,
    default: 'intermediate',
    choices: {
      realistic: 'POL3.SETTINGS.WorldAmbiance.Realistic',
      intermediate: 'POL3.SETTINGS.WorldAmbiance.Intermediate',
      heroic: 'POL3.SETTINGS.WorldAmbiance.Heroic',
    },
    requiresReload: true,
  });

  game.settings.register('polaris', 'askForModifier', {
      config: true,
      scope: 'client',
      name: 'POL3.SETTINGS.AskForModifier.Name',
      hint: 'POL3.SETTINGS.AskForModifier.Hint',
      type: Boolean,
      default: true,
    },
  );
};
