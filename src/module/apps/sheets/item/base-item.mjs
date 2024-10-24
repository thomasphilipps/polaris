const {api, sheets} = foundry.applications;
const hasProperty = foundry.utils.hasProperty;

export default class Pol3BaseItemSheet extends api.HandlebarsApplicationMixin(sheets.ItemSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ['polaris', 'sheet', 'item'],
    tag: 'form',
    position: {
      width: 520,
      height: 'auto',
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
      id: 'header',
      template: 'systems/polaris/templates/item-header.hbs',
    },
    config: {
      id: 'config',
      template: undefined // Populated with _initializeItemSheet
    }
  };

  async _prepareContext(options) {
    return {
      item: this.document,
      source: this.document.toObject(),
      fields: this.document.system.schema.fields,
      isPhysical: hasProperty(this.document.system, 'techLevel'),
      isEditable: this.isEditable,
      fieldDisabled: this.isEditable ? '' : 'disabled',
    };
  }

  static _initializeItemSheet() {
    const item = this.DEFAULT_OPTIONS.item;
    this.PARTS = foundry.utils.deepClone(this.PARTS);

    this.DEFAULT_OPTIONS.classes = [this.DEFAULT_OPTIONS.item.type];
    this.PARTS.config.template = `systems/polaris/templates/sheets/partials/${item.type}-config.hbs`;
  }
}
