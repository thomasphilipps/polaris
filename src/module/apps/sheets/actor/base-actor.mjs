const { api, sheets } = foundry.applications;

export default class Pol3BaseActorSheet extends api.HandlebarsApplicationMixin(sheets.ActorSheetV2) {

  static DEFAULT_OPTIONS = {
    classes: ['polaris', 'sheet', 'actor'],
    tag: 'form',
    position: {
      width: 900,
      height: 750,
    },
    form: {
      submitOnChange: true,
    },
    actor: {
      type: undefined,
    },
  };

  /** @override */
  static PARTS = {
    header: {
      id: 'header',
      template: 'systems/polaris/templates/sheets/actors/actor-header.hbs',
    },
  };

  async _prepareContext(options) {

    return {
      actor: this.document,
      isEditable: this.isEditable,
      fieldDisabled: this.isEditable ? '' : 'disabled',
      source: this.document.toObject(),
      fields: this.document.system.schema.fields,
      config: CONFIG.POL3,
    };
  }

  static _initializeActorSheet() {
    const actor = this.DEFAULT_OPTIONS.actor;
    this.PARTS = foundry.utils.deepClone(this.PARTS);
    this.DEFAULT_OPTIONS.classes = [actor.type];
  }

}
