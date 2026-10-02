/**
 * Prompts the user (GM or Player) to make a modifier roll.
 * @param {string} contextLabel
 *@returns {Promise<number>} null if canceled
 */
export async function promptAdHocModifier(contextLabel) {
  const content = `
  <div class="form-group">
    <label>${contextLabel}</label>
    <input type="number" name="modifier" value="0">
  </div>
  `;

  const result = await foundry.applications.api.DialogV2.wait({
    window: { title: game.i18n.localize('POL3.DIALOG.ModifierTitle') },
    content,
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
