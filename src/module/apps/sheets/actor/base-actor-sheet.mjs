import { POL3 } from '../../../config/config.mjs';

const { api, sheets } = foundry.applications;

/**
 * Pol3BaseActorSheet class that extends Foundry's ActorSheetV2 with Polaris-specific logic.
 */
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
      deleteItem: Pol3BaseActorSheet.#onDeleteItem,
      rollItem: Pol3BaseActorSheet.#onRollItem,
      toggleEquipped: Pol3BaseActorSheet.#onToggleEquipped,
      applyWound: Pol3BaseActorSheet.#onApplyWound,
      healWound: Pol3BaseActorSheet.#onHealWound,
    },
    form: {
      submitOnChange: true,
    },
    actor: {
      type: undefined,
    },
  };

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
    wounds: {
      id: 'wounds',
      template: 'systems/polaris/templates/sheets/actors/actor-wounds.hbs',
    },
    description: {
      id: 'description',
      template: undefined, // Set in _initializeActorSheetClass based on actor type
    },
    notes: {
      id: 'notes',
      template: 'systems/polaris/templates/sheets/actors/actor-gmNotes.hbs',
    },
  };

  static TABS = {
    sheet: [
      { id: 'attributes', group: 'sheet', label: 'POL3.ATTRIBUTE.LabelPlural' },
      { id: 'skills', group: 'sheet', label: 'POL3.SHEETS.GENERAL.SkillPlural' },
      { id: 'equipment', group: 'sheet', label: 'POL3.SHEETS.TABS.Equipment' },
      { id: 'wounds', group: 'sheet', label: 'POL3.SHEETS.TABS.Wounds' },
      { id: 'description', group: 'sheet', label: 'POL3.SHEETS.TABS.Description' },
      { id: 'notes', group: 'sheet', label: 'POL3.SHEETS.TABS.GMDescription' },
    ],
  };

  tabGroups = {
    sheet: this.document.limited ? 'description' : 'attributes',
  };

  /* -------------------------------------------- */
  /*  Rendering                                    */

  /* -------------------------------------------- */

  _configureRenderOptions(options) {
    super._configureRenderOptions(options);

    options.parts = ['tabs', 'header', 'body', 'description'];

    if (!this.document.limited) {
      options.parts.splice(3, 0, 'attributes', 'skills', 'equipment', 'wounds');
    }

    if (game.user.isGM) {
      options.parts.push('notes');
    }
  }

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
      items: this.#prepareItems(),
      wounds: this.#prepareWounds(),
      tabGroups,
      tabs: tabGroups.sheet,
    };
  }

  static _initializeActorSheetClass() {
    this.PARTS = foundry.utils.deepClone(this.PARTS);
    this.TABS = foundry.utils.deepClone(this.TABS);

    const actor = this.DEFAULT_OPTIONS.actor;
    this.DEFAULT_OPTIONS.classes = [actor.type];
    this.PARTS.description.template = `systems/polaris/templates/sheets/actors/${actor.type}-description.hbs`;
  }

  _getTabs() {
    const tabs = {};
    const isGM = game.user.isGM;

    for (const [groupId, config] of Object.entries(this.constructor.TABS)) {
      const group = {};

      for (const t of config) {
        if (t.id === 'notes' && !isGM) continue;
        if (this.document.limited && t.id !== 'description') continue;

        const active = this.tabGroups[t.group] === t.id;
        group[t.id] = { ...t, active, cssClass: active ? 'active' : '' };
      }
      tabs[groupId] = group;
    }

    return tabs;
  }

  /* -------------------------------------------- */
  /*  Context preparation                          */

  /* -------------------------------------------- */

  async #prepareDescription() {
    const description = this.document.system.description;
    const context = { relativeTo: this.document, secrets: this.document.isOwner };
    const enrich = (text) => foundry.applications.ux.TextEditor.implementation.enrichHTML(text, context);

    const [GMNotes, publicText, secret] = await Promise.all([
      enrich(description.GMNotes),
      enrich(description.public),
      enrich(description.secret),
    ]);

    return { GMNotes, public: publicText, secret };
  }

  #prepareAttributes() {
    const data = this.actor.system.attributes;
    return Object.values(POL3.ATTRIBUTE)
      .map(config => ({ ...config, value: data[config.id].total }))
      .sort((a, b) => a.order - b.order);
  }

  #prepareVariableAttributes() {
    const { baseLuck, baseInitiative } = this.actor.system;
    return { baseLuck, baseInitiative };
  }

  #prepareSecondaryAttributes() {
    const {
      stunThreshold, unconsciousnessThreshold, closeCombatModifier,
      reaction, damageResistance, drugResistance, illnessResistance, breath,
    } = this.actor.system;
    return {
      stunThreshold, unconsciousnessThreshold, closeCombatModifier,
      reaction, damageResistance, drugResistance, illnessResistance, breath,
    };
  }

  #prepareSpeeds() {
    const { groundSpeed, swimSpeed } = this.actor.system;
    return { groundSpeed, swimSpeed };
  }

  #prepareItems() {
    return {
      skills: this._prepareSkills(),
      weapons: this._prepareWeapons(),
    };
  }

  #prepareWounds() {
    const { wounds, woundsSummary } = this.actor.system;

    const zoneKeys = Object.keys(wounds);
    const severityKeys = Object.keys(POL3.WOUND.BASE_MAX); // canon order light->destroyed

    const zones = {};
    for (const [zoneKey, zone] of Object.entries(wounds)) {
      const severitySquares = {};
      const effectiveMax = (s) => POL3.WOUND.BASE_MAX[s] + (zone.resistant ? POL3.WOUND.RESISTANT_BONUS[s] : 0);
      for (const [severityKey, severityValue] of Object.entries(zone.counters)) {
        const arrayLength = effectiveMax(severityKey);
        severitySquares[severityKey] = Array.from({ length: arrayLength }, (_, i) => i < severityValue);
      }
      zones[zoneKey] = { ...zone, severitySquares };
    }
    return { zones, zoneKeys, severityKeys, summary: woundsSummary };
  }

  /**
   * Group an actor's embedded items of a given type by category, then by name,
   * sorted alphabetically at every level.
   * @param {string} itemType    - The item type to filter (e.g. 'skill', 'weapon')
   * @param {string} i18nPrefix  - The i18n key prefix for category labels
   * @returns {{label: string, itemList: Item[]}[]}
   */
  #prepareItemsByCategory(itemType, i18nPrefix) {
    const byCategory = Map.groupBy(
      this.actor.items.filter(i => i.type === itemType),
      item => item.system.category ?? '',
    );

    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

    return [...byCategory.entries()]
      .map(([category, items]) => ({
        label: game.i18n.localize(`${i18nPrefix}.${capitalize(category)}`),
        itemList: [...items].sort((a, b) => (a.name ?? '').localeCompare(b.name ?? '')),
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  _prepareSkills() {
    return this.#prepareItemsByCategory('skill', 'POL3.SKILL.Category')
      .map(({ label, itemList }) => ({ label, skillList: itemList }));
  }

  _prepareWeapons() {
    return this.#prepareItemsByCategory('weapon', 'POL3.WEAPON.Category')
      .map(({ label, itemList }) => ({ label, weaponList: itemList }));
  }

  /* -------------------------------------------- */
  /*  Action handlers                              */

  /* -------------------------------------------- */

  /**
   * Resolve the dataset of the closest ancestor matching a selector.
   * @param {HTMLElement} target
   * @param {string} selector
   * @returns {DOMStringMap|null}
   */
  static #datasetOf(target, selector) {
    return target.closest(selector)?.dataset ?? null;
  }

  static async #onConfigureAttribute(event, target) {
    const { attributeId } = Pol3BaseActorSheet.#datasetOf(target, '.attribute') ?? {};
    const attribute = attributeId ? this.actor.system.attributes[attributeId] : null;
    if (!attribute) return;

    const saveLabel = game.i18n.localize('POL3.DIALOG.SaveButton');
    const label = game.i18n.localize(POL3.ATTRIBUTE[attributeId]?.label);
    const title = game.i18n.format('POL3.ATTRIBUTE.ConfigureAttribute', { attributeName: label });

    const attributeConfigs = await foundry.applications.api.DialogV2.input({
      window: { title, icon: 'fas fa-edit' },
      content: await foundry.applications.handlebars.renderTemplate(
        'systems/polaris/templates/dialogs/attribute-dialog.hbs',
        { attribute },
      ),
      ok: { label: saveLabel, icon: 'fas fa-save' },
    });
    if (!attributeConfigs) return;

    await this.actor.update({
      [`system.attributes.${attributeId}.base`]: attributeConfigs.base ?? attribute.base,
      [`system.attributes.${attributeId}.geneticModifier`]: attributeConfigs.geneticModifier ?? 0,
      [`system.attributes.${attributeId}.competencePointsModifier`]: attributeConfigs.competencePoints ?? 0,
    });
  }

  /**
   * Handler for rolling an attribute test.
   * @param {PointerEvent} event
   * @param {HTMLElement} target
   */
  static #onTestAttribute(event, target) {
    const {
      attributeId,
      attributeName,
    } = Pol3BaseActorSheet.#datasetOf(target, '.attribute') ?? {};
    if (!attributeId) return;

    // this.actor is available here since Foundry's ApplicationV2 action framework
    // invokes action handlers with `this` bound to the sheet instance.
    // TODO: wire this up to the actual roll pipeline once it exists, e.g.:
    // this.actor.rollAttribute(attributeId);
  }

  /**
   * Handler for deleting an embedded Item, after confirmation.
   * @param {PointerEvent} event
   * @param {HTMLElement} target
   */
  static async #onDeleteItem(event, target) {
    const { itemId, itemName } = Pol3BaseActorSheet.#datasetOf(target, '.item') ?? {};
    if (!itemId) return;

    const confirmed = await foundry.applications.api.DialogV2.confirm({
      window: { title: 'Delete Item', icon: 'fas fa-trash' },
      content: `Are you sure you want to delete ${itemName}?`,
      rejectLabel: false,
      modal: true,
    });
    if (!confirmed) return;

    await this.actor.deleteEmbeddedDocuments('Item', [itemId]);
  }

  /**
   * Handler for rolling an Item.
   * @param {PointerEvent} event
   * @param {HTMLElement} target
   */
  static #onRollItem(event, target) {
    const { itemId, itemName } = Pol3BaseActorSheet.#datasetOf(target, '.item') ?? {};
    if (!itemId) return;

    // TODO: wire this up to the actual roll pipeline once it exists, e.g.:
    // const item = this.actor.items.get(itemId);
    // item.roll();
  }

  /**
   * Handler for toggling an item's equipped status.
   * @param {PointerEvent} event
   * @param {HTMLElement} target
   */
  static async #onToggleEquipped(event, target) {
    const itemId = target.closest('.item')?.dataset.itemId;
    const item = itemId ? this.actor.items.get(itemId) : null;
    if (!item) return;

    const isEquipped = target instanceof HTMLInputElement ? target.checked : !item.system.isEquipped;
    await item.update({ 'system.isEquipped': isEquipped });
  }

  /**
   * Handler for applying a wound of a given severity to a zone.
   * @param {PointerEvent} event
   * @param {HTMLElement} target
   */
  static async #onApplyWound(event, target) {
    const { zone, severity } = Pol3BaseActorSheet.#datasetOf(target, '[data-zone]') ?? {};
    if (!zone || !severity) return;
    console.log('Polaris | Applying wound:', zone, severity);
    await this.actor.applyWound(zone, severity);
  }

  /**
   * Handler for healing the worst active wound of a zone.
   * @param {PointerEvent} event
   * @param {HTMLElement} target
   */
  static async #onHealWound(event, target) {
    const { zone } = Pol3BaseActorSheet.#datasetOf(target, '[data-zone]') ?? {};
    console.log('Polaris | Healing wound:', zone);
    if (!zone) return;

    await this.actor.healWound(zone);
  }

  /* -------------------------------------------- */
  /*  Drag & drop                                  */

  /* -------------------------------------------- */

  /** @override */
  _onRender(_context, _options) {
    new foundry.applications.ux.DragDrop.implementation({
      dragSelector: '.draggable',
      dropSelector: null,
      callbacks: {
        dragstart: this._onDragStart.bind(this),
        dragover: this._onDragOver.bind(this),
        drop: this._onDrop.bind(this),
      },
    }).bind(this.element);
  }

  async _onDragStart(event) {
  }

  async _onDragOver(event) {
  }

  /**
   * An event that occurs when data is dropped into a drop target.
   * @param {DragEvent} event
   * @returns {Promise<void>}
   * @protected
   */
  async _onDrop(event) {
    const data = foundry.applications.ux.TextEditor.implementation.getDragEventData(event);
    const actor = this.actor;
    const allowed = Hooks.call('dropActorSheetData', actor, this, data);
    if (allowed === false) return;

    const documentClass = getDocumentClass(data.type);
    if (documentClass) {
      const document = await documentClass.fromDropData(data);
      await this._onDropDocument(event, document);
    }
  }

  /**
   * Handle a dropped document on the ActorSheet.
   * @param {DragEvent} event
   * @param {Document} document
   * @returns {Promise<void>}
   * @protected
   */
  async _onDropDocument(event, document) {
    switch (document.documentName) {
      case 'ActiveEffect':
        return this._onDropActiveEffect(event, /** @type ActiveEffect */ document);
      case 'Actor':
        return this._onDropActor(event, /** @type Actor */ document);
      case 'Item':
        return this._onDropItem(event, /** @type Item */ document);
      case 'Folder':
        return this._onDropFolder(event, /** @type Folder */ document);
    }
  }

  async _onDropItem(event, item) {
    if (!this.actor.isOwner) {
      ui.notifications.warn(game.i18n.localize('POL3.WARNIING.NotOwner'));
      return false;
    }

    if (item.type === 'skill' && this.actor.items.has(item.id)) {
      ui.notifications.warn(game.i18n.localize('POL3.WARNING.SkillAlreadyExists'));
      return false;
    }

    // TODO: set a flag to retrieve the original object later, and handle in-sheet
    // reordering via _onSortItem when dropping onto the same actor.
    const keepId = !this.actor.items.has(item.id);
    await Item.create(item, { parent: this.actor, keepId });
  }
}
