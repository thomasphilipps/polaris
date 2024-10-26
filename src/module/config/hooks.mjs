export function onPreCreateItem(item, data, options, userId) {
  console.log("Polaris | Pre-create item", item, data, options, userId);
  switch (item.type) {
    case "skill":
      item.img = `systems/polaris/assets/icons/${item.system.category}.png`;
      break;
  }
}
