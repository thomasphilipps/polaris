const { api, sheets } = foundry.applications;

export default class Pol3BaseItemSheet extends api.HandlebarsApplicationMixin(sheets.ItemSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["polaris", "sheet", "item"],
    tag: "form",
    position: {
      width: 560,
      height: "auto",
    },
    item: {
      type: undefined,
    },
  };

  static PARTS = {
    form: {
      template: "systems/polaris/templates/item-header.hbs",
    },
  };

  async _prepareContext(options) {
    return {
      item: this.document,
      source: this.document.toObject(),
    };
  }
}
