export default class Pol3Item extends Item {
    get hasActor() {
        return this.isOwned && this.actor !== null && this.actor !== undefined;
    }

    /** @override */
    prepareBaseData() {
        const itemData = this.system;
        const actorData = this.actor ? this.actor.system : {};

        switch (this.type) {
            case 'skill':
                this._prepareSkillData(itemData, actorData);
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
        itemData.isBasicSKill = !(itemData.tags.isReserved || itemData.tags.hasPrerequisites);
        if (this.hasActor) {
            itemData.baseLevel = this.#computeAttributeBaseLevel(itemData, actorData);
            itemData.globalLevel = itemData.baseLevel + itemData.mastery;
        }
        (itemData.tags.isDifficult || itemData.tags.isReserved) ? itemData.globalLevel -= 3 : null;
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
        const firstAttributeTotalValue = actorFirstAttribute.value + actorFirstAttribute.geneticModifier + actorFirstAttribute.otherModifier + actorFirstAttribute.competencePointsModifier;
        const secondAttributeTotalValue = actorSecondAttribute.value + actorSecondAttribute.geneticModifier + actorSecondAttribute.otherModifier + actorSecondAttribute.competencePointsModifier;
        return this.#computeAttributeNaturalAptitude(firstAttributeTotalValue) + this.#computeAttributeNaturalAptitude(secondAttributeTotalValue);
    }

    /**
     * Calculates the natural aptitude for a given attribute value.
     * @param {number} attributeTotalValue
     * @returns {number}
     */
    #computeAttributeNaturalAptitude(attributeTotalValue) {
        const attributeScoreLimits = [25, 22, 19, 16, 13, 10, 8, 6, 5, 4];
        let baseNaturalAptitude = -4;

        let index = attributeScoreLimits.findIndex((limit) => attributeTotalValue >= limit);
        if (index !== -1) {
            baseNaturalAptitude = 6 - index;
        }

        return baseNaturalAptitude;
    }
}
