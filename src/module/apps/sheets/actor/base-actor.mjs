const {api, sheets} = foundry.applications;

export default class Pol3BaseActorSheet extends api.HandlebarsApplicationMixin(sheets.ActorSheetV2) {

  static DEFAULT_OPTIONS = {
    classes: ['polaris', 'sheet', 'actor'],
    tag: 'form',
    form: {
      submitOnChange: true
    },
    actor: {
      type: undefined,
    }
  };

}
