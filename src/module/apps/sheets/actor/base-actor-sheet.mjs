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
    tabs: {
      id: 'tabs',
      template: 'systems/polaris/templates/sheets/actors/tabs.hbs',
    },
    header: {
      id: 'header',
      template: 'systems/polaris/templates/sheets/actors/actor-header.hbs',
    },
    body: {
      id: 'body',
      template: 'systems/polaris/templates/sheets/actors/actor-body.hbs',
      scrollable: ['.sheet-body']
    },
    attributes: {
      id: 'attributes',
      template: 'systems/polaris/templates/sheets/actors/actor-attributes.hbs',
    },
    skills: {
      id: 'skills',
      template: 'systems/polaris/templates/sheets/actors/actor-skills.hbs',
    },
    equipment: {
      id: 'equipment',
      template: 'systems/polaris/templates/sheets/actors/actor-equipment.hbs',
    },
    description: {
      id: 'description',
      template: undefined // Populated in _initializeActorSheetClass
    }
  };

  static TABS = {
    sheet: [
      {id: 'attributes', group: 'sheet', label: 'POL3.ATTRIBUTE.LabelPlural', active: true},
      {id: 'skills', group: 'sheet', label: 'POL3.SHEETS.GENERAL.SkillPlural'},
      {id: 'equipment', group: 'sheet', label: 'POL3.SHEETS.TABS.Equipment'},
      {id: 'description', group: 'sheet', label: 'POL3.SHEETS.TABS.Description'},
    ],
  };

  /** @override */
  tabGroups = {
    sheet: 'attributes',
  };


  async _prepareContext(options) {
    const tabGroups = this._getTabs();
    return {
      actor: this.document,
      attributeScores: this.#prepareAttributes(),
      config: CONFIG.POL3,
      fieldDisabled: this.isEditable ? '' : 'disabled',
      fields: this.document.system.schema.fields,
      isEditable: this.isEditable,
      secondaryAttributeScores: this.#prepareSecondaryAttributes(),
      variableAttributeScores: this.#prepareVariableAttributes(),
      speed: this.#prepareSpeeds(),
      source: this.document.toObject(),
      tabGroups,
      tabs: tabGroups.sheet,
    };
  }

  static _initializeActorSheetClass() {
    const actor = this.DEFAULT_OPTIONS.actor;
    this.PARTS = foundry.utils.deepClone(this.PARTS);
    this.TABS = foundry.utils.deepClone(this.TABS);
    this.DEFAULT_OPTIONS.classes = [actor.type];
    this.PARTS.description.template = `systems/polaris/templates/sheets/actors/${actor.type}-description.hbs`;
  }

  /**
   * Configure the tabs used by this sheet.
   * @returns {Record<string, Record<string, ApplicationTab>>}
   * @protected
   */
  _getTabs() {
    const tabs = {};
    for (const [groupId, config] of Object.entries(this.constructor.TABS)) {
      const group = {};
      for (const t of config) {
        const active = this.tabGroups[t.group] === t.id;
        group[t.id] = Object.assign({active, cssClass: active ? 'active' : ''}, t);
      }
      tabs[groupId] = group;
    }
    return tabs;
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

  #prepareVariableAttributes() {
    const data = this.actor.system;
    return {
      baseLuck: data.baseLuck,
      baseInitiative: data.baseInitiative,
    };
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
    console.log('Polaris | Speed', data.groundSpeed);
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
