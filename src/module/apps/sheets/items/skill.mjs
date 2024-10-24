import Pol3BaseItemSheet from "./base-item.mjs";

export default class Pol3SkillSheet extends Pol3BaseItemSheet {
  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    item: {
      type: "skill",
    },
  };

  //** @inheritDoc */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    Object.assign(context, {
      tags: this.document.system.tags,
    });
    return context;
  }

  _getTags(tags) {}
}
