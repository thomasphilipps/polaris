import {POL3} from '../../../config/config.mjs';

const {api, sheets} = foundry.applications;

/**
 * Pol3BaseActorSheet class that extends Foundry's ActorSheetV2 with Polaris-specific logic.
 */
export default class Pol3BaseActorSheet extends api.HandlebarsApplicationMixin(sheets.ActorSheetV2) {

  /**
   * Default options for this sheet, including CSS classes, sheet dimensions, and sheet actions.
   * @type {object}
   */
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

  /**
   * PARTS define which partials/templates compose the sheet.
   * Each property can declare:
   *  - an id
   *  - a path to a Handlebars template
   *  - any relevant config options (e.g., scrollable elements)
   */
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
      scrollable: ['.sheet-body'],
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
      template: undefined, // This is set in _initializeActorSheetClass based on actor type
    },
    notes: {
      id: 'notes',
      template: 'systems/polaris/templates/sheets/actors/actor-gmNotes.hbs',
    }
  };

  /**
   * TABS define which tabs are visible on the sheet, grouped by a key (e.g., 'sheet').
   */
  static TABS = {
    sheet: [
      {id: 'attributes', group: 'sheet', label: 'POL3.ATTRIBUTE.LabelPlural'},
      {id: 'skills', group: 'sheet', label: 'POL3.SHEETS.GENERAL.SkillPlural'},
      {id: 'equipment', group: 'sheet', label: 'POL3.SHEETS.TABS.Equipment'},
      {id: 'description', group: 'sheet', label: 'POL3.SHEETS.TABS.Description'},
      {id: 'notes', group: 'sheet', label: 'POL3.SHEETS.TABS.GMDescription'},
    ],
  };

  /**
   * By default, which tab should be active?
   * If the actor is "limited," we show only 'description'.
   */
  tabGroups = {
    sheet: this.document.limited ? 'description' : 'attributes',
  };

  /**
   * Override Foundry's render options to control which PARTS appear in the sheet.
   * @param {object} options
   */
  _configureRenderOptions(options) {
    // Call the parent class's method first
    super._configureRenderOptions(options);

    // Base sheet parts: tabs, header, body, description
    options.parts = ['tabs', 'header', 'body', 'description'];

    // If actor is not limited, insert extra parts before 'description'
    if (!this.document.limited) {
      // Insert attributes, skills, equipment before index 3 (i.e., just before 'description')
      options.parts.splice(3, 0, 'attributes', 'skills', 'equipment');
    }

    // If the user is a GM, add 'notes' at the end
    if (game.user.isGM) {
      options.parts.push('notes');
    }
  }

  /**
   * Prepare context data for the sheet's Handlebars templates.
   * @param {object} options
   * @returns {Promise<object>}
   */
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
      description: await this.#prepareDescription(),
      speed: this.#prepareSpeeds(),
      source: this.document.toObject(),
      tabGroups,
      tabs: tabGroups.sheet,
    };
  }

  /**
   * Initialize actor-specific sheet data (e.g., dynamically set template paths).
   * This is called before the sheet is initially rendered.
   */
  static _initializeActorSheetClass() {
    // Clone PARTS and TABS to avoid mutating them globally
    this.PARTS = foundry.utils.deepClone(this.PARTS);
    this.TABS = foundry.utils.deepClone(this.TABS);

    // Dynamically apply a custom CSS class and template path based on actor type
    const actor = this.DEFAULT_OPTIONS.actor;
    this.DEFAULT_OPTIONS.classes = [actor.type];
    this.PARTS.description.template = `systems/polaris/templates/sheets/actors/${actor.type}-description.hbs`;
  }

  /**
   * Construct a record of all tabs and whether they're active.
   * Filters out GM-only tabs if current user is not GM, or tabs not relevant if actor is limited.
   * @returns {Record<string, Record<string, ApplicationTab>>}
   * @protected
   */
  _getTabs() {
    const tabs = {};
    const isGM = game.user.isGM;

    for (const [groupId, config] of Object.entries(this.constructor.TABS)) {
      const group = {};

      for (const t of config) {
        // Skip GM-only tabs if user is not GM
        if (t.id === 'notes' && !isGM) continue;

        // If actor is limited, only show the 'description' tab
        if (this.document.limited && t.id !== 'description') continue;

        // Determine if this tab should be active
        const active = this.tabGroups[t.group] === t.id;

        // Spread original config and add custom properties for rendering
        group[t.id] = {
          ...t,
          active,
          cssClass: active ? 'active' : '',
        };
      }
      tabs[groupId] = group;
    }

    return tabs;
  }

  /**
   * Prepare HTML for different kinds of descriptions.
   * @returns {Promise<{GMNotes: string, public: string, secret: string}>}
   */
  async #prepareDescription() {
    const description = this.document.system.description;
    const context = {relativeTo: this.document, secrets: this.document.isOwner};

    return {
      GMNotes: await TextEditor.enrichHTML(description.GMNotes, context),
      public: await TextEditor.enrichHTML(description.public, context),
      secret: await TextEditor.enrichHTML(description.secret, context),
    };
  }

  /**
   * Prepare a list of attribute objects to be rendered, including the current total value.
   * @returns {Array<object>}
   */
  #prepareAttributes() {
    const data = this.actor.system.attributes;
    const attributes = Object.values(POL3.ATTRIBUTE).map(config => {
      const attr = foundry.utils.deepClone(config);
      attr.value = data[attr.id].total;
      return attr;
    });
    attributes.sort((a, b) => a.order - b.order);
    return attributes;
  }

  /**
   * Prepare variable attributes such as luck, initiative, etc.
   * @returns {object}
   */
  #prepareVariableAttributes() {
    const data = this.actor.system;
    return {
      baseLuck: data.baseLuck,
      baseInitiative: data.baseInitiative,
    };
  }

  /**
   * Prepare secondary attributes, such as thresholds and resistances.
   * @returns {object}
   */
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

  /**
   * Prepare speed values (e.g., ground, swim).
   * @returns {object}
   */
  #prepareSpeeds() {
    const data = this.actor.system;
    return {
      groundSpeed: data.groundSpeed,
      swimSpeed: data.swimSpeed,
    };
  }

  /**
   * Handler for configuring an attribute.
   * This could open a dialog or pop-up to modify attribute details.
   * @param {MouseEvent} event
   * @private
   */
  static #onConfigureAttribute(event) {
    const attributeId = event.target.closest('.attribute').dataset.attributeId;
    console.log('Polaris | Configure attribute:', attributeId);
    // Implement your configuration logic here
  }

  /**
   * Handler for rolling an attribute test.
   * This typically triggers a Foundry roll with relevant data.
   * @param {MouseEvent} event
   * @private
   */
  static #onTestAttribute(event) {
    // "this" in static methods is the class, so we need a different way to access actor
    // Usually you’d do a check like: const sheet = event.currentTarget.closest('.some-sheet-class')?.someSheetInstance;
    // But since this is purely static, you might consider rewriting this logic in the instance.
    // The snippet below is illustrative.
    const attributeId = event.target.closest('.attribute').dataset.attributeId;
    console.log('Polaris | Roll attribute:', attributeId);

    // If you need to retrieve the actor from somewhere, you would do that here:
    // e.g., const actor = someGlobalReference.actors?.get(actorId);
    // const attributeValue = actor.rollAction(attributeId, 'attribute');
    // console.log('Roll result:', attributeValue);
  }
}
