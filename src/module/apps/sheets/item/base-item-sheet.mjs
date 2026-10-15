const { api, sheets } = foundry.applications;
const hasProperty = foundry.utils.hasProperty;

/**
 * Base item sheet shared by all item types: header, description and configuration tabs.
 * Subclasses set `DEFAULT_OPTIONS.item` and call `_initializeItemSheet` in a static block.
 * @extends {ItemSheetV2}
 */
export default class Pol3BaseItemSheet extends api.HandlebarsApplicationMixin(sheets.ItemSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ['polaris', 'sheet', 'item'],
    tag: 'form',
    position: {
      width: 560,
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
      template: 'systems/polaris/templates/sheets/items/item-header.hbs',
    },
    tabs: {
      id: 'tabs',
      template: 'templates/generic/tab-navigation.hbs',
    },
    description: {
      id: 'description',
      template: 'systems/polaris/templates/sheets/items/partials/item-description.hbs',
    },
    config: {
      id: 'config',
      template: undefined, // Populated with _initializeItemSheet
    },
  };

  static TABS = {
    sheet: [
      {
        id: 'description',
        group: 'sheet',
        icon: 'fa-solid fa-file-alt',
        label: 'POL3.SHEETS.TABS.Description',
        active: true,
      },
      {
        id: 'config',
        group: 'sheet',
        icon: 'fa-solid fa-cogs',
        label: 'POL3.SHEETS.TABS.Configuration',
      },
    ],
  };
  tabGroups = {
    sheet: 'description',
    description: 'public',
  };

  /**
   * Prepares the context shared by all item sheets.
   * @param {object} options  Render options
   * @returns {Promise<object>}
   * @override
   */
  async _prepareContext(options) {
    const tabGroups = this._getTabs();
    return {
      item: this.document,
      isEditable: this.isEditable,
      fieldDisabled: this.isEditable ? '' : 'disabled',
      fields: this.document.system.schema.fields,
      source: this.document.toObject(),
      tabGroups,
      tabs: tabGroups.sheet,
      tabsPartial: this.constructor.PARTS.tabs.template,
      isPhysical: hasProperty(this.document.system, 'techLevel'),
    };
  }

  /**
   * Sets up a subclass from its `DEFAULT_OPTIONS.item` (type, GM description,
   * extra templates): own copies of PARTS and TABS, configuration template.
   * Call it from the subclass's static initialization block.
   */
  static _initializeItemSheet() {
    const item = this.DEFAULT_OPTIONS.item;
    this.PARTS = foundry.utils.deepClone(this.PARTS);
    this.TABS = foundry.utils.deepClone(this.TABS);

    this.DEFAULT_OPTIONS.classes = [this.DEFAULT_OPTIONS.item.type];
    this.PARTS.config.template = `systems/polaris/templates/sheets/items/partials/${item.type}-config.hbs`;

    if (item.hasGMDescription) {
      this.PARTS.description.template =
        'systems/polaris/templates/sheets/items/partials/item-description-advanced.hbs';
      this.TABS.description = [
        { id: 'public', group: 'description', label: 'POL3.SHEETS.TABS.Description' },
        { id: 'secret', group: 'description', label: 'POL3.SHEETS.TABS.GMDescription' },
      ];
    }
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
        group[t.id] = Object.assign({ active, cssClass: active ? 'active' : '' }, t);
      }
      tabs[groupId] = group;
    }
    /* // Hide the config tab from non-GMs
    if (!game.user.isGM) delete tabs.sheet.config; */
    return tabs;
  }

  /**
   * Creates a multi-select input for item sheets.
   * @param {Object} field - Field configuration object.
   * @param {Object} groupConfig - Group configuration.
   * @param {Object} inputConfig - Input configuration.
   * @param {Object} [options] - Optional entries for configuration (default: {}).
   * @returns {ApplicationFormField}
   * @protected
   */
  _tagsWidget(field, groupConfig, inputConfig, options = {}) {
    inputConfig.name = field.fieldPath;
    inputConfig.options = Object.entries(options.propertyConfig || {}).map(([k, v]) => ({
      value: k,
      label: v.label,
    }));
    inputConfig.type = 'checkboxes';
    return foundry.applications.fields.createMultiSelectInput(inputConfig);
  }
}
