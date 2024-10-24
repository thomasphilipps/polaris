const { api, sheets } = foundry.applications;
const hasProperty = foundry.utils.hasProperty;

export default class Pol3BaseItemSheet extends api.HandlebarsApplicationMixin(sheets.ItemSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["polaris", "sheet", "item"],
    tag: "form",
    position: {
      width: 450,
      height: "auto",
    },
    form: {
      submitOnChange: true,
    },
    item: {
      type: undefined,
    },
  };

  static PARTS = {
    header: {
      template: "systems/polaris/templates/item-header.hbs",
    },
  };

  async _prepareContext(options) {
    return {
      item: this.document,
      source: this.document.toObject(),
      fields: this.document.system.schema.fields,
      isPhysical: hasProperty(this.document.system, "techLevel"),
      isEditable: this.isEditable,
      fieldDisabled: this.isEditable ? "" : "disabled",
    };
  }
}
