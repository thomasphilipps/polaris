import Pol3BaseItemSheet from "./base-item.mjs";

export default class Pol3SkillSheet extends Pol3BaseItemSheet {
  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    item: {
      type: "skill",
      hasGMDescription: true,
    },
  };

  static {
    this._initializeItemSheet();
  }

  //** @inheritDoc */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    Object.assign(context, {
      tagsWidget: this.#tagsWidget.bind(this),
    });
    return context;
  }

  #tagsWidget(field, groupConfig, inputConfig) {
    inputConfig.name = field.fieldPath;
    inputConfig.options = Object.entries(CONFIG.POL3.SKILL.PROPERTIES).map(([k, v]) => ({
      value: k,
      label: v.label,
    }));
    inputConfig.type = "checkboxes";
    return foundry.applications.fields.createMultiSelectInput(inputConfig);
  }
}
