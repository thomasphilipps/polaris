/**
 * Prompts the user (GM or Player) to make a modifier roll.
 * @param {string} contextLabel
 * @param {{label: string, value: number}[]} globalModifiersList
 * @param {number} globalModifiers
 *@returns {Promise<number>} null if canceled
 */
export async function promptAdHocModifier(contextLabel, globalModifiersList, globalModifiers) {
  const globalModifiersString = globalModifiersList
    .map(m => (`<li>${game.i18n.localize(m.label)}: ${m.value}</li>`))
    .join('');

  const content = `
  <div class="dialog dialog-list">
    <label>${game.i18n.localize('POL3.DIALOG.ExistingModifiers')}</label>
    <ul>${globalModifiersString || `<li>${game.i18n.localize('POL3.DIALOG.NoAutomaticModifier')}</li>`}</ul>
  </div>
  <div class="form-group">
    <label>${contextLabel}</label>
    <input type="number" id="modifier-input" name="modifier" value="0">
  </div>
  <div class="dialog modifiers-total">
    ${game.i18n.localize('POL3.DIALOG.Total')} : <span id="total-display">${globalModifiers}</span>
  </div>
  `;

  const result = await foundry.applications.api.DialogV2.wait({
    window: { title: game.i18n.localize('POL3.DIALOG.ModifierTitle') },
    content,
    render: (event, dialog) => {
      const modifierInput = dialog.element.querySelector('#modifier-input');
      const totalDisplay = dialog.element.querySelector('#total-display');

      const updateTotal = () => {
        const modifier = parseInt(modifierInput.value) || 0;
        totalDisplay.textContent = modifier + globalModifiers;
      };
      modifierInput.addEventListener('input', updateTotal);
    },
    buttons: [
      {
        action: 'confirm',
        label: game.i18n.localize('POL3.DIALOG.Confirm'),
        default: true,
        callback: (event, button) => {
          const form = button.form;
          const modifier = form.querySelector('input[name="modifier"]').value;
          return parseInt(modifier) || 0;
        },
      },
      { action: 'cancel', label: game.i18n.localize('POL3.DIALOG.Cancel') },
    ],
    rejectClose: false,
  });

  return result === null || result === 'cancel' ? null : result;
}
