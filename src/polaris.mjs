import * as models from "./module/models/item/_module.mjs";
import * as documents from "./module/documents/_module.mjs";
import * as applications from "./module/apps/_module.mjs";

Hooks.once("init", () => {
  console.log("Polaris | Initializing Polaris system");
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

  Items.unregisterSheet("core", ItemSheet);

  DocumentSheetConfig.registerSheet(Item, "polaris", applications.Pol3SkillSheet, {
    types: ["skill"],
    makeDefault: true,
    label: "POL3.SHEETS.Skill",
  });
});
