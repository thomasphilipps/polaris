import Pol3BaseItemSheet from "./base-item.mjs";

export default class Pol3SkillSheet extends Pol3BaseItemSheet {
  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    item: {
      type: "skill",
    },
  };
}
