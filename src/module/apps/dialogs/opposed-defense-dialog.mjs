import { groupItemsByField } from '../../utils/sheet-utils.mjs';
import { rollTaskCheck } from '../../dice/roll-resolver.mjs';
import { POL3 } from '../../config/config.mjs';
import { breakdownRoll } from '../chat/chat-card.mjs';
import { askForModifiers } from '../../utils/helpers.mjs';

/**
 * Prompts whoever controls `actor` to choose an Attribute or Skill to defend
 * with, then rolls it against the given difficulty.
 * @param {object} params
 * @param {Pol3Actor} params.actor
 * @param {number} params.difficulty
 * @param {string} params.attackLabel
 * @returns {Promise<object|null>} A resolveTaskCheck outcome (+ rollLabel) and a list of modifiers, or null if cancelled
 */
export async function promptOpposedDefense({ actor, difficulty, attackLabel }) {
  const attributeOptions = Object.values(POL3.ATTRIBUTE)
    .map(a => `<option value="${a.id}">${game.i18n.localize(a.label)}</option>`)
    .join('');

  const skillGroups = groupItemsByField(actor.items, 'skill', 'POL3.SKILL.Category');
  const skillOptgroups = skillGroups
    .map(
      g => `<optgroup label="${g.label}">
        ${g.itemList.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
      </optgroup>`,
    )
    .join('');

  const content = `
    <p>${game.i18n.format('POL3.OPPOSED.RespondingTo', { attackLabel })}</p>
    <div class="form-group">
      <label>${game.i18n.localize('POL3.OPPOSED.TestType')}</label>
      <select name="testType">
        <option value="skill">${game.i18n.localize('POL3.OPPOSED.Skill')}</option>
        <option value="attribute">${game.i18n.localize('POL3.OPPOSED.Attribute')}</option>
      </select>
    </div>
    <div class="form-group" data-skill-group>
      <label>${game.i18n.localize('POL3.OPPOSED.Skill')}</label>
      <select name="skillId">${skillOptgroups}</select>
    </div>
    <div class="form-group" data-attribute-group style="display:none">
      <label>${game.i18n.localize('POL3.OPPOSED.Attribute')}</label>
      <select name="attribute">${attributeOptions}</select>
    </div>
  `;

  const syncVisibility = root => {
    const testType = root.querySelector('[name="testType"]').value;
    root.querySelector('[data-skill-group]').style.display = testType === 'skill' ? '' : 'none';
    root.querySelector('[data-attribute-group]').style.display =
      testType === 'attribute' ? '' : 'none';
  };

  const choice = await foundry.applications.api.DialogV2.wait({
    window: { title: game.i18n.localize('POL3.OPPOSED.DialogTitle') },
    content,
    render: (event, dialog) => {
      syncVisibility(dialog.element);
      dialog.element
        .querySelector('[name="testType"]')
        .addEventListener('change', () => syncVisibility(dialog.element));
    },
    buttons: [
      {
        action: 'roll',
        label: game.i18n.localize('POL3.DIALOG.Confirm'),
        default: true,
        callback: (event, button) => {
          const form = button.form;
          const testType = form.querySelector('[name="testType"]').value;
          return testType === 'attribute'
            ? { testType, attribute: form.querySelector('[name="attribute"]').value }
            : { testType, skillId: form.querySelector('[name="skillId"]').value };
        },
      },
      { action: 'cancel', label: game.i18n.localize('POL3.DIALOG.Cancel') },
    ],
    rejectClose: false,
  });

  if (choice === null || choice === 'cancel') return null;

  let rollLabel;
  let actionValue;
  let valueCrit = 0;

  if (choice.testType === 'attribute') {
    const attrKey = choice.attribute;
    rollLabel = game.i18n.localize(POL3.ATTRIBUTE[attrKey].label);
    actionValue = actor.system.attributes[attrKey].total;
    valueCrit = Math.round(actionValue / 2);
  } else {
    const skill = actor.items.get(choice.skillId);
    rollLabel = skill.name;
    actionValue = skill.system.globalLevel;
    valueCrit = skill.system.mastery;
  }

  const modifiersList =
    difficulty !== 0
      ? [
        {
          label: 'POL3.WEAPON.SHEET.Reach',
          value: difficulty,
        },
      ]
      : [];

  // The Defender follows their own client setting: the Attacker's Shift key does not apply here.
  const {
    roll,
    outcome,
    modifiers: modifiersOutcome,
  } = await rollTaskCheck({
    actor,
    actionValue,
    modifiers: modifiersList,
    valueCrit,
    askForModifier: askForModifiers(),
    contextLabel: rollLabel,
  });

  if (outcome === null) return null;

  const rollBreakdown = breakdownRoll(roll);

  return { ...outcome, rollLabel, rollBreakdown, actionValue, modifiers: modifiersOutcome };
}
