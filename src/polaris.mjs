import * as models from './module/models/_module.mjs';
import * as documents from './module/documents/_module.mjs';
import * as applications from './module/apps/_module.mjs';
import * as hooks from './module/config/hooks.mjs';
import { POL3 } from './module/config/config.mjs';
import { preloadHandlebarsTemplates } from './module/config/templates.mjs';

Hooks.once('init', async function() {
  console.log('Polaris | Initializing Polaris config');
  globalThis.polaris = game.system;

  game.system.api = {
    applications,
    models,
    documents,
    hooks,
  };

  CONFIG.Item.documentClass = documents.Pol3Item;
  CONFIG.Item.dataModels = {
    skill: models.Pol3Skill,
    weapon: models.Pol3Weapon,
  };

  CONFIG.Actor.documentClass = documents.Pol3Actor;

  CONFIG.Actor.dataModels = {
    hero: models.Pol3Hero,
  };

  CONFIG.POL3 = POL3;

  foundry.documents.collections.Actors.unregisterSheet('core', foundry.appv1.sheets.ActorSheet);

  foundry.applications.apps.DocumentSheetConfig.registerSheet(Actor, 'polaris', applications.Pol3HeroSheet, {
    types: ['hero'],
    makeDefault: true,
    label: 'POL3.SHEETS.GENERAL.Hero',
  });

  foundry.documents.collections.Items.unregisterSheet('core', foundry.appv1.sheets.ItemSheet);

  foundry.applications.apps.DocumentSheetConfig.registerSheet(Item, 'polaris', applications.Pol3SkillSheet, {
    types: ['skill'],
    makeDefault: true,
    label: 'POL3.SHEETS.GENERAL.Skill',
  });

  foundry.applications.apps.DocumentSheetConfig.registerSheet(Item, 'polaris', applications.Pol3WeaponSheet, {
    types: ['weapon'],
    makeDefault: true,
    label: 'POL3.SHEETS.GENERAL.Weapon',
  });

  await preloadHandlebarsTemplates();
});

Hooks.on('preCreateItem', (item, data, options, userId) => {
  hooks.onPreCreateItem(item, data, options, userId);
});
Hooks.on('preUpdateItem', (item, updateData, options, userId) => {
  hooks.onPreUpdateItem(item, updateData, options, userId);
});
