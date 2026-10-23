/**
 * Prompt the user (GM) to adjust or not the duration of a shock effect.
 *
 * @param {object} params
 * @param {string} params.formula  Default formula (may be empty)
 * @param {string} params.unit     Default unit, 'Round' or 'Minutes' (may be empty)
 * @param {string} params.effect   Effect without roll (e.g. 'MildComa'), shown as information (may be empty)
 * @returns {Promise<{formula: string, unit:string}|null>}
 */
export async function promptShockDuration({ formula, unit, effect }) {
  const effectInfo = effect
    ? `
    <div class="dialog-info-text">
      ${game.i18n.localize('POL3.SHOCK.EffectLabel')}: ${game.i18n.localize('POL3.SHOCK.EFFECT.' + effect + '.Symbol')}
    </div>`
    : '';

  const content = `
    <div class="form-group">
      <label>${game.i18n.localize('POL3.SHOCK.EffectDuration')}</label>
      <input type="text" name="formula" value="${formula}" />
      <select name="unit">
        <option value="Minutes" ${unit === 'Minutes' ? 'selected' : ''}>${game.i18n.localize('POL3.SHOCK.UNIT.Minutes.Symbol')}</option>
        <option value="Round" ${unit === 'Round' ? 'selected' : ''}>${game.i18n.localize('POL3.SHOCK.UNIT.Round.Symbol')}</option>
      </select>
    </div>
    ${effectInfo}
  `;

  const duration = await foundry.applications.api.DialogV2.wait({
    window: { title: game.i18n.localize('POL3.SHOCK.EffectDuration') },
    content,
    buttons: [
      {
        action: 'confirm',
        label: game.i18n.localize('POL3.DIALOG.Confirm'),
        default: true,
        callback: (event, button) => {
          const form = button.form;
          const formula = form.querySelector('[name="formula"]').value;
          const unit = form.querySelector('[name="unit"]').value;
          return { formula, unit };
        },
      },
      { action: 'cancel', label: game.i18n.localize('POL3.DIALOG.Cancel') },
    ],
    rejectClose: false,
  });

  return duration === null || duration === 'cancel' ? null : duration;
}
