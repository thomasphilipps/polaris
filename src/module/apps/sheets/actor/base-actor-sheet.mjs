import {POL3} from '../../../config/config.mjs';

const {api, sheets} = foundry.applications;

export default class Pol3BaseActorSheet extends api.HandlebarsApplicationMixin(sheets.ActorSheetV2) {

  static DEFAULT_OPTIONS = {
    classes: ['polaris', 'sheet', 'actor'],
    tag: 'form',
    position: {
      width: 900,
      height: 750,
    },
    actions: {
      configureAttribute: Pol3BaseActorSheet.#onConfigureAttribute,
      testAttribute: Pol3BaseActorSheet.#onTestAttribute,
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
    attributes: {
      id: 'attributes',
      template: 'systems/polaris/templates/sheets/actors/attributes.hbs',
    },
  };


  async _prepareContext(options) {
    return {
      attributeScores: this.#prepareAttributes(),
      secondaryAttributeScores: this.#prepareSecondaryAttributes(),
      speed: this.#prepareSpeeds(),
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


  #prepareAttributes() {
    const a = this.actor.system.attributes;
    const attributes = Object.values(POL3.ATTRIBUTE).map(config => {
      const attribute = foundry.utils.deepClone(config);
      attribute.value = a[attribute.id].total;
      return attribute;
    });
    attributes.sort((a, b) => a.order - b.order);
    return attributes;
  }

  #prepareSecondaryAttributes() {
    const data = this.actor.system;
    return {
      stunThreshold: data.stunThreshold,
      unconsciousnessThreshold: data.unconsciousnessThreshold,
      closeCombatModifier: data.closeCombatModifier,
      reaction: data.reaction,
      damageResistance: data.damageResistance,
      drugResistance: data.drugResistance,
      illnessResistance: data.illnessResistance,
      breath: data.breath,
    };
  }

  #prepareSpeeds() {
    const data = this.actor.system;
    return {
      groundSpeed: data.groundSpeed,
      swimSpeed: data.swimSpeed,
    };
  }

  /**
   * Actions
   */

  static #onConfigureAttribute(event) {
    const attributeId = event.target.closest('.attribute').dataset.attributeId;
    console.log('Polaris | Configure ', attributeId);
  };

  static #onTestAttribute(event) {
    const attributeId = event.target.closest('.attribute').dataset.attributeId;
    console.log('Polaris | Roll ', attributeId);
  }
}
