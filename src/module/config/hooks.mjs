export function onPreCreateItem(item, data, options, userId) {
  switch (item.type) {
    case "skill":
      const initialSkillImage = `systems/polaris/assets/icons/${item.system.category}.png`
      item.updateSource({img: initialSkillImage})
      break;
  }
}

export function onPreUpdateItem(item, updateData, options, userId) {
  switch (item.type) {
    case "skill":
      const updatedSkillImage = `systems/polaris/assets/icons/${updateData.system.category}.png`
      updateData.system.category ? updateData.img = updatedSkillImage : null
      break;
  }
}