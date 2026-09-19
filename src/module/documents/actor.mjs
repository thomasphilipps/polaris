import { POL3 } from '../config/config.mjs';

export default class Pol3Actor extends Actor {
  /**
   * Prepare all derived data for this actor.
   * It calculates:
   *  - Each attribute's total value and natural aptitude.
   *  - Luck, secondary attributes, and displacement.
   *
   * Note: This method is automatically called by Foundry VTT
   * whenever the actor's data is updated.
   */
  prepareDerivedData() {
    const { system } = this;
    const { attributes } = system;
    const ambiance = game.settings.get('polaris', 'worldAmbiance');

    // Setting Attribute Points and Luck accordingly to world ambiance
    const worldAmbiance = () => {
      switch (ambiance) {
        case 'realistic':
          return { attributePoints: 30, luck: 11 };
        case 'intermediate':
          return { attributePoints: 38, luck: 13 };
        case 'heroic':
          return { attributePoints: 46, luck: 15 };
      }
    };

    // Calculate total value and natural aptitude for each attribute
    Object.values(attributes).forEach(attribute => {
      attribute.total = this._calculateAttributeTotalValue(attribute);
      attribute.naturalAptitude = this._calculateNaturalAptitude(attribute.total);
    });

    // Prepare other derived data
    this._prepareLuck(system, worldAmbiance().luck);
    this._prepareSecondaryAttributes(system, attributes);
    this._prepareActorDisplacement(system, attributes);
    this._prepareWounds(system);
  }

  /**
   * Compute the total value of a given attribute.
   * @param {Object} param0 - The attribute object containing base and modifiers.
   * @param {number} param0.base - Base value of the attribute.
   * @param {number} param0.geneticModifier - Genetic modifier.
   * @param {number} param0.competencePointsModifier - Competence points modifier.
   * @param {number} param0.otherModifier - Other arbitrary modifiers.
   * @returns {number} The summed total of the attribute.
   */
  _calculateAttributeTotalValue({
                                  base,
                                  geneticModifier,
                                  competencePointsModifier,
                                  otherModifier,
                                }) {
    return [base, geneticModifier, competencePointsModifier, otherModifier].reduce(
      (sum, val) => sum + val,
      0,
    );
  }

  /**
   * Calculate the natural aptitude based on the total attribute value.
   * @param {number} total - The total attribute value.
   * @returns {number} The natural aptitude.
   */
  _calculateNaturalAptitude(total) {
    const valueArray = [25, 22, 19, 16, 13, 10, 8, 6, 5, 4];
    const index = valueArray.findIndex(value => total >= value);
    return index !== -1 ? 6 - index : -4;
  }

  /**
   * Prepare various secondary attributes by delegating each
   * calculation to smaller methods.
   *
   * @param {Object} system - The system data object of the actor.
   * @param {Object} attributes - The destructured attributes object from system.
   */
  _prepareSecondaryAttributes(system, attributes) {
    this._prepareReactionAndInitiative(system, attributes);
    this._prepareThresholds(system, attributes);
    this._prepareCloseCombatModifier(system, attributes);
    this._prepareDamageResistance(system, attributes);
    this._prepareIllnessResistance(system, attributes);
    this._prepareDrugResistance(system, attributes);
  }

  /**
   * Calculate and assign reaction & initiative.
   */
  _prepareReactionAndInitiative(system, attributes) {
    const reactionValue = Math.round((attributes.PER.total + attributes.VOL.total) / 2);

    this._setSystemAttribute(system, 'reaction', reactionValue);
    // baseInitiative is identical to reaction in your example
    this._setSystemAttribute(system, 'baseInitiative', reactionValue);
  }

  /**
   * Calculate and assign thresholds (stun, unconsciousness, breath).
   */
  _prepareThresholds(system, attributes) {
    const stunThresholdValue = Math.round(
      (attributes.FOR.total + attributes.CON.total + attributes.VOL.total) / 3,
    );
    const unconsciounessThresholdValue = stunThresholdValue + 10;
    const breathValue = Math.round((attributes.CON.total + attributes.VOL.total) / 2);

    this._setSystemAttribute(system, 'stunThreshold', stunThresholdValue);
    this._setSystemAttribute(system, 'unconsciousnessThreshold', unconsciounessThresholdValue);
    this._setSystemAttribute(system, 'breath', breathValue);
  }

  /**
   * Calculate and assign the close combat modifier.
   */
  _prepareCloseCombatModifier(system, attributes) {
    const forTemp = attributes.FOR.total;
    const valueArray = POL3.TABLEARRAY.valueArray;
    const closeCombatResultArray = POL3.TABLEARRAY.resultArray.map(num => -num);
    const upperBonusFor = Math.max(0, Math.floor((forTemp - 20) / 2));
    const index = valueArray.findIndex(value => forTemp >= value);

    const closeCombatModifierValue =
      index !== -1 ? closeCombatResultArray[index] + upperBonusFor : -6;

    this._setSystemAttribute(system, 'closeCombatModifier', closeCombatModifierValue);
  }

  /**
   * Calculate and assign damage resistance.
   */
  _prepareDamageResistance(system, attributes) {
    const tempFC = attributes.FOR.total + attributes.CON.total;
    const damageResistanceValue =
      tempFC >= 10 ? Math.floor((45 - tempFC) / 4) - 6 : tempFC >= 6 ? 4 : 6;

    this._setSystemAttribute(system, 'damageResistance', damageResistanceValue);
  }

  /**
   * Calculate and assign illness resistance.
   */
  _prepareIllnessResistance(system, attributes) {
    const conTemp = attributes.CON.total;
    const valueArray = POL3.TABLEARRAY.valueArray;
    const illnessResultArray = POL3.TABLEARRAY.resultArray;
    const upperBonusCon = Math.max(0, Math.floor((conTemp - 20) / 2));

    // Use our private method instead of an inline helper
    const illnessResistanceValue = this._calculateResistance(
      conTemp,
      valueArray,
      illnessResultArray,
      upperBonusCon,
    );

    this._setSystemAttribute(system, 'illnessResistance', illnessResistanceValue);
  }

  /**
   * Calculate and assign drug resistance.
   */
  _prepareDrugResistance(system, attributes) {
    const volconTemp = Math.round((attributes.CON.total + attributes.VOL.total) / 2);
    const valueArray = POL3.TABLEARRAY.valueArray;
    const illnessResultArray = POL3.TABLEARRAY.resultArray;
    const upperBonusVolCon = Math.max(0, Math.floor((volconTemp - 20) / 2));

    // Same private helper
    const drugResistanceValue = this._calculateResistance(
      volconTemp,
      valueArray,
      illnessResultArray,
      upperBonusVolCon,
    );

    this._setSystemAttribute(system, 'drugResistance', drugResistanceValue);
  }

  /**
   * Prepare the actor's displacement (movement) based on genetic type and coordination.
   * @param {Object} system - The system data object of the actor.
   * @param {Object} attributes - The destructured attributes object from system.
   */
  _prepareActorDisplacement(system, attributes) {
    const { geneticType } = system.physicalDescription;
    const coordination = attributes.COO.total;

    // Calculate base speed
    const meanSpeed = 4 + Math.ceil(coordination / 5) * 2;
    const speeds = {
      mean: meanSpeed,
      slow: meanSpeed / 2,
      fast: meanSpeed * 2,
    };

    // Ground speed is always set
    this._setSystemAttribute(system, 'groundSpeed', speeds);

    let swimSpeedValue;
    // Swimming speed depends on genetic type
    switch (geneticType) {
      case 'naturalHybrid':
      case 'geneticHybrid':
        swimSpeedValue = { ...speeds };
        break;
      case 'technoHybrid':
        swimSpeedValue = {
          mean: meanSpeed - 2,
          slow: (meanSpeed - 2) / 2,
          fast: (meanSpeed - 2) * 2,
        };
        break;
      case 'human':
        const adjustedMean = Math.ceil((meanSpeed - 4) / 2);
        swimSpeedValue = {
          mean: adjustedMean,
          slow: Math.ceil(adjustedMean / 2),
          fast: adjustedMean * 2,
        };
        break;
    }

    this._setSystemAttribute(system, 'swimSpeed', swimSpeedValue);
  }

  /**
   * Prepare actor's luck.
   *
   * @param {Object} system - The system data object of the actor.
   * @param {Number} luckValue - The actor's initial luck
   *
   * TODO: handle luck malus
   */
  _prepareLuck(system, luckValue = 13) {
    this._setSystemAttribute(system, 'baseLuck', luckValue);
  }

  /**
   * Prepare actor's wounds.
   * Computes, for each zone, the worst active severity, its malus/actionImpossible,
   * and whether the zone is destroyed; aggregates the results into system.woundsSummary.
   * @param {Object} system - The system data object of the actor.
   */
  _prepareWounds(system) {
    const { WOUND } = POL3;
    let actorMalus = 0;
    let isDead = false;
    const destroyedZones = [];

    for (const [zoneKey, zone] of Object.entries(system.wounds)) {
      const { counters } = zone;
      // Worst severity with a non-zero counter, walking from destroyed -> light
      const worstSeverity = [...WOUND.SEVERITIES].reverse().find(s => counters[s] > 0) ?? null;
      const effectiveMax = s => WOUND.BASE_MAX[s] + (zone.resistant ? WOUND.RESISTANT_BONUS[s] : 0);
      const isZoneDestroyed =
        worstSeverity === 'destroyed' && counters.destroyed >= effectiveMax('destroyed');

      zone.worstSeverity = worstSeverity;
      zone.malus = worstSeverity ? WOUND.MALUS[worstSeverity] : 0;
      zone.actionImpossible = worstSeverity ? WOUND.ACTION_IMPOSSIBLE[worstSeverity] : false;
      zone.isDestroyed = isZoneDestroyed;

      if (isZoneDestroyed) {
        destroyedZones.push(zoneKey);
        if (zone.lethal) isDead = true;
      }
      actorMalus = Math.min(actorMalus, zone.malus);
    }

    system.woundsSummary = { malus: actorMalus, destroyedZones, isDead };
  }

  /**
   * Apply a wound of the given severity to a zone, cascading the overflow into
   * the next severity whenever the effective maximum of a severity is exceeded.
   * @param {string} zoneKey - The zone to apply the wound to (e.g. 'head').
   * @param {string} severity - The severity to apply (one of POL3.WOUND.SEVERITIES).
   * @param {number} amount - The number of counters to add (default 1).
   */
  async applyWound(zoneKey, severity, amount = 1) {
    const { WOUND } = POL3;
    const zone = this.system.wounds[zoneKey];
    if (!zone) return;

    const counters = { ...zone.counters };
    const effectiveMax = s => WOUND.BASE_MAX[s] + (zone.resistant ? WOUND.RESISTANT_BONUS[s] : 0);

    let currentSeverity = severity;
    counters[currentSeverity] += amount;

    while (
      currentSeverity !== 'destroyed' &&
      counters[currentSeverity] > effectiveMax(currentSeverity)
      ) {
      const overflow = counters[currentSeverity] - effectiveMax(currentSeverity);
      counters[currentSeverity] = effectiveMax(currentSeverity);

      const nextSeverity = WOUND.SEVERITIES[WOUND.SEVERITIES.indexOf(currentSeverity) + 1];
      counters[nextSeverity] += overflow;
      currentSeverity = nextSeverity;
    }

    if (currentSeverity === 'destroyed') {
      counters.destroyed = Math.min(counters.destroyed, effectiveMax('destroyed'));
    }

    await this.update({ [`system.wounds.${zoneKey}.counters`]: counters });
  }

  /**
   * Heal the worst active severity of a zone, clearing all lower severities
   * once the worst one reaches 0.
   * @param {string} zoneKey - The zone to heal.
   * @param {number} amount - The number of counters to remove (default 1).
   */
  async healWound(zoneKey, amount = 1) {
    const { WOUND } = POL3;
    const zone = this.system.wounds[zoneKey];
    if (!zone) return;

    const counters = { ...zone.counters };
    const worstSeverity = [...WOUND.SEVERITIES].reverse().find(s => counters[s] > 0);
    if (!worstSeverity) return;

    counters[worstSeverity] = Math.max(0, counters[worstSeverity] - amount);

    if (counters[worstSeverity] === 0) {
      const worstIndex = WOUND.SEVERITIES.indexOf(worstSeverity);
      WOUND.SEVERITIES.slice(0, worstIndex).forEach(s => {
        counters[s] = 0;
      });
    }

    await this.update({ [`system.wounds.${zoneKey}.counters`]: counters });
  }

  /**
   * Utility method to set a system property with a standardized object structure:
   * {
   *   id: <string>,
   *   value: <number>,
   *   label: "POL3.ATTRIBUTE.<Key with first letter capitalized>"
   * }
   * @param {Object} system - The system data object of the actor.
   * @param {string} key - The key to set on the system object.
   * @param {number | Object} value - The numerical value to store.
   */
  _setSystemAttribute(system, key, value) {
    system[key] = {
      id: key,
      value,
      label: `POL3.ATTRIBUTE.${this._capitalize(key)}`,
    };
  }

  /**
   * A private helper to calculate any kind of standard resistance.
   * @param {number} temp - The main attribute value used in the calculation.
   * @param {number[]} valueArray - The array of thresholds to check against.
   * @param {number[]} resultArray - The array of corresponding results.
   * @param {number} upperBonus - Any additional bonus to subtract from the final result.
   * @returns {number} The calculated resistance.
   *
   *
   *TODO: Check if this is necessary
   */
  _calculateResistance(temp, valueArray, resultArray, upperBonus) {
    const idx = valueArray.findIndex(v => temp >= v);
    return idx !== -1 ? resultArray[idx] - upperBonus : 6;
  }

  rollAction(actionId, actionType) {
    const data = this.system;

    switch (actionType) {
      case 'attribute':
        return this.#rollAttribute(actionId, data);
      case 'skill':
        console.log('Polaris | Skill');
        break;
    }
  }

  // TODO: check if this is necessary
  #rollAttribute(actionId, data) {
    // Test if attributeId is an attribute or another value
    const regex = /^[A-Z]{3}$/;
    const isPrimaryAttribute = regex.test(actionId);
    return isPrimaryAttribute ? data.attributes[actionId].total : data[actionId].value;
  }

  /**
   * Helper to capitalize the first letter of a string.
   * @param {string} str - The string to capitalize.
   * @returns {string} The capitalized string.
   */
  _capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Get relevant values of a skill.
   * @param {string} skillName - The name of the skill to get the value for.
   * @returns {Object} The competence skill value, or undefined if not found.
   */

  getSkillValue(skillName) {
    const normalized = skillName?.trim().toLowerCase();
    const competence = this.items.find(
      i => i.type === 'skill' && i.name.trim().toLowerCase() === normalized,
    );
    if (!competence) return;

    return {
      label: competence.name,
      baseLevel: competence.system.baseLevel,
      value: competence.system.globalLevel,
      valueCrit: competence.system.mastery,
    };
  }
}
