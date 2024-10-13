import { SkillDataModel, WeaponDataModel } from "./module/data/item.js";

Hooks.once("init", () => {
  console.log("Polaris | Initializing Polaris system");
  // Register the ItemDataModel class
  CONFIG.Item.dataModels = {
    weapon: WeaponDataModel,
    skill: SkillDataModel,
  };
});
