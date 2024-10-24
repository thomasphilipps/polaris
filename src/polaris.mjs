import * as models from "./module/models/item/_module.mjs";
import * as documents from "./module/documents/_module.mjs";
import * as applications from "./module/apps/_module.mjs";
import {POL3} from "./module/config/config.mjs";

Hooks.once("init", () => {
  console.log("Polaris | Initializing Polaris config");
  globalThis.polaris = game.system;

  game.system.api = {
    applications,
    models,
    documents,
  };

  CONFIG.Item.documentClass = documents.Pol3Item;
  CONFIG.Item.dataModels = {
    skill: models.Pol3Skill,
    weapon: models.Pol3Weapon,
  };

  CONFIG.POL3 = POL3

  Items.unregisterSheet("core", ItemSheet);

  DocumentSheetConfig.registerSheet(Item, "polaris", applications.Pol3SkillSheet, {
    types: ["skill"],
    makeDefault: true,
    label: "POL3.SHEETS.Skill",
  });

  DocumentSheetConfig.registerSheet(Item, "polaris", applications.Pol3WeaponSheet, {
    types: ["weapon"],
    makeDefault: true,
    label: "POL3.SHEETS.Weapon",
  });
});
