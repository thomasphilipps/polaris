export default class Pol3Actor extends Actor {

  prepareDerivedData() {
    const { system } = this;
    Object.values(system.attributes).forEach(attribute => {
      attribute.total = this.#calculateAttributeTotalValue(attribute);
      attribute.naturalAptitude = this.#calculateNaturalAptitude(attribute.total);
    });
    this._prepareSecondaryAttributes(system);
    this._prepareActorDisplacement(system);
  }

  #calculateAttributeTotalValue({
                                  base,
                                  geneticModifier,
                                  competencePointsModifier,
                                  otherModifier,
                                }) {
    return [base, geneticModifier, competencePointsModifier, otherModifier].reduce((sum, val) => sum + val, 0);
  }

  #calculateNaturalAptitude(total) {
    const valueArray = [25, 22, 19, 16, 13, 10, 8, 6, 5, 4];
    const index = valueArray.findIndex(value => total >= value);
    return index !== -1 ? 6 - index : -4;
  }

  _prepareSecondaryAttributes(system) {
    const { attributes } = system;
    system.reaction = Math.round((attributes.PER.total + attributes.VOL.total) / 2);
    system.stunThreshold = Math.round((attributes.FOR.total + attributes.CON.total + attributes.VOL.total) / 3);
    system.inconsciounessThreshold = system.stunThreshold + 10;
    system.breath = Math.round((attributes.CON.total + attributes.VOL.total) / 2);

    const calculateResistance = (temp, valueArray, resultArray, upperBonus) => {
      const index = valueArray.findIndex(value => temp >= value);
      return index !== -1 ? resultArray[index] - upperBonus : 6;
    };

    // Close combat modifier
    const forTemp = attributes.FOR.total;
    const valueArray = [22, 20, 18, 16, 14, 12, 9, 7, 5, 3];
    const closeCombatResultArray = [5, 5, 4, 3, 2, 1, 0, -1, -2, -4];
    const upperBonusFor = Math.max(0, Math.floor((forTemp - 20) / 2));
    const index = valueArray.findIndex(value => forTemp >= value);
    system.closeCombatModifier = index !== -1 ? closeCombatResultArray[index] + upperBonusFor : -6;

    // Damage resistance
    const tempFC = attributes.FOR.total + attributes.CON.total;
    system.damageResistance = tempFC >= 10 ? Math.floor((45 - tempFC) / 4) - 6 : (tempFC >= 6 ? 4 : 6);

    // Illness resistance
    const illnessResultArray = [-5, -5, -4, -3, -2, -1, 0, 1, 2, 4];
    const conTemp = attributes.CON.total;
    const upperBonusCon = Math.max(0, Math.floor((conTemp - 20) / 2));
    system.illnessResistance = calculateResistance(conTemp, valueArray, illnessResultArray, upperBonusCon);

    // Drug resistance
    const volconTemp = Math.round((attributes.CON.total + attributes.VOL.total) / 2);
    const upperBonusVolCon = Math.max(0, Math.floor((volconTemp - 20) / 2));
    system.drugResistance = calculateResistance(volconTemp, valueArray, illnessResultArray, upperBonusVolCon);
  }

  _prepareActorDisplacement(system) {
    const { geneticType } = system.physicalDescription;
    const coordination = system.attributes.COO.total;

    const meanSpeed = 4 + Math.ceil(coordination / 5) * 2;
    const speeds = {
      mean: meanSpeed,
      slow: meanSpeed / 2,
      fast: meanSpeed * 2,
    };

    system.groundSpeed = { ...speeds };

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
}
