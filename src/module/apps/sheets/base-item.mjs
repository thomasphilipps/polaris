const { api, sheets } = foundry.applications;

export default class Pol3BaseItemSheet extends api.HandlebarsApplicationMixin(sheets.ItemSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["polaris", "sheet", "item"],
    item: {
      type: undefined,
    },
  };
}
