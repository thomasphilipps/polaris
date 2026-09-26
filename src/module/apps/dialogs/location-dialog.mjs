/**
 * Prompts the user to choose how the hit location is determined: automatically
 * (1d20 roll against the target's location table) or manually (direct zone pick).
 * @param {object} params
 * @param {{key: string, label: string}[]} params.zoneChoices  The target's available zones
 * @returns {Promise<{mode: 'auto'}|{mode: 'manual', zone: string}|null>} null if cancelled
 */
export async function promptLocationChoice({ zoneChoices }) {
  const zoneOptions = zoneChoices
    .map(z => `<option value="${z.key}">${game.i18n.localize(z.label)}</option>`)
    .join('');

  const content = `
    <div class="form-group">
      <label>${game.i18n.localize('POL3.DIALOG.LocationMode')}</label>
      <select name="mode">
        <option value="auto">${game.i18n.localize('POL3.DIALOG.LocationAuto')}</option>
        <option value="manual">${game.i18n.localize('POL3.DIALOG.LocationManual')}</option>
      </select>
    </div>
    <div class="form-group">
      <label>${game.i18n.localize('POL3.DIALOG.LocationZone')}</label>
      <select name="zone">${zoneOptions}</select>
    </div>
  `;

  const result = await foundry.applications.api.DialogV2.wait({
    window: { title: game.i18n.localize('POL3.DIALOG.LocationTitle') },
    content,
    buttons: [
      {
        action: 'confirm',
        label: game.i18n.localize('POL3.DIALOG.Confirm'),
        default: true,
        callback: (event, button) => {
          const form = button.form;
          const mode = form.querySelector('[name="mode"]').value;
          return mode === 'manual'
            ? { mode: 'manual', zone: form.querySelector('[name="zone"]').value }
            : { mode: 'auto' };
        },
      },
      { action: 'cancel', label: game.i18n.localize('POL3.DIALOG.Cancel') },
    ],
    rejectClose: false,
  });

  return result === null || result === 'cancel' ? null : result;
}
