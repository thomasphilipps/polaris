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

    // Calculate total value and natural aptitude for each attribute
    Object.values(system.attributes).forEach((attribute) => {
      attribute.total = this.#calculateAttributeTotalValue(attribute);
      attribute.naturalAptitude = this.#calculateNaturalAptitude(attribute.total);
    });

    // Prepare other derived data
    this._prepareLuck(system);
    this._prepareSecondaryAttributes(system);
    this._prepareActorDisplacement(system);
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
  #calculateAttributeTotalValue({
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
  #calculateNaturalAptitude(total) {
    const valueArray = [25, 22, 19, 16, 13, 10, 8, 6, 5, 4];
    const index = valueArray.findIndex((value) => total >= value);
    return index !== -1 ? 6 - index : -4;
  }

  /**
   * Prepare various secondary attributes such as reaction, initiative, thresholds, etc.
   * @param {Object} system - The system data object of the actor.
   */
  _prepareSecondaryAttributes(system) {
    const { attributes } = system;

    // Calculate intermediate values
    const reactionValue = Math.round((attributes.PER.total + attributes.VOL.total) / 2);
    const stunThresholdValue = Math.round(
      (attributes.FOR.total + attributes.CON.total + attributes.VOL.total) / 3,
    );
    const unconsciousnessThresholdValue = stunThresholdValue + 10;
    const breathValue = Math.round((attributes.CON.total + attributes.VOL.total) / 2);

    // Assign them to system with the desired structure
    this._setSystemAttribute(system, 'reaction', reactionValue);
    this._setSystemAttribute(system, 'baseInitiative', reactionValue);
    this._setSystemAttribute(system, 'stunThreshold', stunThresholdValue);
    this._setSystemAttribute(system, 'unconsciousnessThreshold', unconsciousnessThresholdValue);
    this._setSystemAttribute(system, 'breath', breathValue);

    // Resistance helper function
    const calculateResistance = (temp, valueArray, resultArray, upperBonus) => {
      const index = valueArray.findIndex((value) => temp >= value);
      return index !== -1 ? resultArray[index] - upperBonus : 6;
    };

    // Close combat modifier
    const forTemp = attributes.FOR.total;
    const valueArray = [22, 20, 18, 16, 14, 12, 9, 7, 5, 3];
    const closeCombatResultArray = [5, 5, 4, 3, 2, 1, 0, -1, -2, -4];
    const upperBonusFor = Math.max(0, Math.floor((forTemp - 20) / 2));
    const index = valueArray.findIndex((value) => forTemp >= value);
    const closeCombatModifierValue =
      index !== -1 ? closeCombatResultArray[index] + upperBonusFor : -6;

    this._setSystemAttribute(system, 'closeCombatModifier', closeCombatModifierValue);

    // Damage resistance
    const tempFC = attributes.FOR.total + attributes.CON.total;
    const damageResistanceValue =
      tempFC >= 10 ? Math.floor((45 - tempFC) / 4) - 6 : tempFC >= 6 ? 4 : 6;

    this._setSystemAttribute(system, 'damageResistance', damageResistanceValue);

    // Illness resistance
    const illnessResultArray = [-5, -5, -4, -3, -2, -1, 0, 1, 2, 4];
    const conTemp = attributes.CON.total;
    const upperBonusCon = Math.max(0, Math.floor((conTemp - 20) / 2));
    const illnessResistanceValue = calculateResistance(
      conTemp,
      valueArray,
      illnessResultArray,
      upperBonusCon,
    );

    this._setSystemAttribute(system, 'illnessResistance', illnessResistanceValue);

    // Drug resistance
    const volconTemp = Math.round((attributes.CON.total + attributes.VOL.total) / 2);
    const upperBonusVolCon = Math.max(0, Math.floor((volconTemp - 20) / 2));
    const drugResistanceValue = calculateResistance(
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
   */
  _prepareActorDisplacement(system) {
    const { geneticType } = system.physicalDescription;
    const coordination = system.attributes.COO.total;

    // Calculate base speed
    const meanSpeed = 4 + Math.ceil(coordination / 5) * 2;
    const speeds = {
      mean: meanSpeed,
      slow: meanSpeed / 2,
      fast: meanSpeed * 2,
    };

    // Ground speed is always set
    system.groundSpeed = { ...speeds };

    // Swimming speed depends on genetic type
    switch (geneticType) {
      case 'naturalHybrid':
      case 'geneticHybrid':
        system.swimSpeed = { ...speeds };
        break;
      case 'technoHybrid':
        system.swimSpeed = {
          mean: meanSpeed - 2,
          slow: (meanSpeed - 2) / 2,
          fast: (meanSpeed - 2) * 2,
        };
        break;
      case 'human':
        const adjustedMean = Math.ceil((meanSpeed - 4) / 2);
        system.swimSpeed = {
          mean: adjustedMean,
          slow: Math.ceil(adjustedMean / 2),
          fast: adjustedMean * 2,
        };
        break;
    }
  }

  /**
   * Prepare actor's luck.
   * In the future, this might be adjusted by "ambience" features.
   * @param {Object} system - The system data object of the actor.
   */
  _prepareLuck(system) {
    // By default, luck is 11
    this._setSystemAttribute(system, 'baseLuck', 11);
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
   * @param {number} value - The numerical value to store.
   */
  _setSystemAttribute(system, key, value) {
    system[key] = {
      id: key,
      value,
      label: `POL3.ATTRIBUTE.${this._capitalize(key)}`,
    };
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
}
