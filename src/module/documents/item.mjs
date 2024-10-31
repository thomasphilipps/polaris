export default class Pol3Item extends Item {
  get hasActor() {
    return this.isOwned && this.actor !== null && this.actor !== undefined;
  }

  /** @override */
  prepareBaseData() {
    const itemData = this.system;
    const actorData = this.actor ? this.actor.system : {};

    //Sets the reference string
    this._setBookReferenceString(itemData);

    switch (this.type) {
      case 'skill':
        this._prepareSkillData(itemData, actorData);
        this._prepareTags(itemData, CONFIG.POL3.SKILL.PROPERTY);
        this._prepareSpecializationName(itemData);
        break;
    }
    return super.prepareBaseData();
  }

  /**
   * Prepare specific skill data.
   * @param itemData
   * @param actorData
   */
  _prepareSkillData(itemData, actorData) {
    itemData.isBasicSkill = !(
      itemData.tags.has('isReserved') || itemData.tags.has('hasPrerequisites')
    );

    itemData.infoString = `${itemData.firstAttribute} / ${itemData.secondAttribute}`;

    if (this.hasActor) {
      itemData.baseLevel = this.#computeAttributeBaseLevel(itemData, actorData);
      itemData.globalLevel = itemData.baseLevel + itemData.mastery;
      itemData.globalLevel =
        itemData.tags.has('isDifficult') || itemData.tags.has('isReserved')
          ? itemData.globalLevel - 3
          : itemData.globalLevel;
    }
  }

  /**
   * Sets the Items's displayed name for the Observer
   * @param itemData
   */
  // TODO: handle displayed name on the app menubar and in the Item sidebar
  _prepareSpecializationName(itemData) {
    itemData.specializedName = itemData.specialization
      ? `${this.name} [${itemData.specialization}]`
      : this.name;
  }

  /**
   * Displays hints for the Item's properties
   * @param itemData
   * @param properties from config file
   */
  _prepareTags(itemData, properties) {
    let tagString = Object.keys(properties)
      .map(tag => (itemData.tags.has(tag) ? `| ${properties[tag].symbol} ` : ''))
      .join('');
    tagString = tagString ? tagString + '|' : tagString;
    itemData.tagString = tagString;
  }

  /**
   * Sets the Item's book reference string for non-GM users
   * @param itemData
   */
  _setBookReferenceString(itemData) {
    const bookRef = itemData.reference.book;
    const pageRef = itemData.reference.page;
    const pageReference = pageRef ? ` p.${pageRef}` : '';

    itemData.referenceString = bookRef
      ? `${game.i18n.localize(CONFIG.POL3.BOOK[bookRef].label)}${pageReference}`
      : '';
  }

  /**
   * Calculates the base level of the skill, depending on the actor's attributes.
   * @param itemData
   * @param actorData
   * @returns {number}
   */
  #computeAttributeBaseLevel(itemData, actorData) {
    const actorFirstAttribute = actorData.attribute[itemData.firstAttribute];
    const actorSecondAttribute = actorData.attribute[itemData.secondAttribute];
    const firstAttributeTotalValue =
      actorFirstAttribute.value +
      actorFirstAttribute.geneticModifier +
      actorFirstAttribute.otherModifier +
      actorFirstAttribute.competencePointsModifier;
    const secondAttributeTotalValue =
      actorSecondAttribute.value +
      actorSecondAttribute.geneticModifier +
      actorSecondAttribute.otherModifier +
      actorSecondAttribute.competencePointsModifier;
    return (
      this.#computeAttributeNaturalAptitude(firstAttributeTotalValue) +
      this.#computeAttributeNaturalAptitude(secondAttributeTotalValue)
    );
  }

  /**
   * Calculates the natural aptitude for a given attribute value.
   * @param {number} attributeTotalValue
   * @returns {number}
   */
  #computeAttributeNaturalAptitude(attributeTotalValue) {
    const attributeScoreLimits = [25, 22, 19, 16, 13, 10, 8, 6, 5, 4];
    let baseNaturalAptitude = -4;

    let index = attributeScoreLimits.findIndex(limit => attributeTotalValue >= limit);
    if (index !== -1) {
      baseNaturalAptitude = 6 - index;
    }

    return baseNaturalAptitude;
  }
}
