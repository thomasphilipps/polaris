import { sumModifiers } from '../../utils/helpers.mjs';

/**
 * Render a chat card
 *
 * @param {string} templateName  File name in templates/chat/, without extension (e.g. 'task-card')
 * @param {object} data          Template context
 * @returns {Promise<string>}
 */
export async function renderChatCard(templateName, data) {
  const path = `systems/polaris/templates/chat/${templateName}.hbs`;
  return foundry.applications.handlebars.renderTemplate(path, data);
}

/**
 * Breaks down a roll into its component parts.
 *
 * @param {Roll} roll  An evaluated roll
 * @returns {{type: string, value: number|string, faces?: number}[]}
 */
export function breakdownRoll(roll) {
  const { DiceTerm, NumericTerm, OperatorTerm } = foundry.dice.terms;
  return roll.terms.flatMap(t => {
    if (t instanceof DiceTerm) {
      return t.results.flatMap((r, i) => {
        const die = { type: 'die', value: r.result, faces: t.faces };
        return i < t.results.length - 1 ? [die, { type: 'operator', value: '+' }] : [die];
      });
    }
    if (t instanceof NumericTerm) return { type: 'number', value: t.number };
    if (t instanceof OperatorTerm) return { type: 'operator', value: t.operator };
    return [];
  });
}

/**
 * Normalize the context object for the chat card
 *
 * @param {object} params
 * @param {{type: string, value: number|string, faces?: number}[]} params.rollBreakdown  Output of breakdownRoll
 * @param {string} params.rollLabel    Localized name of what is rolled
 * @param {number} params.actionValue  Base value tested, before modifiers
 * @param {object} params.outcome      A resolveTaskCheck outcome
 * @param {{label: string, value: number}[]} params.modifiers  Applied modifiers (i18n keys as labels)
 * @returns {{rollLabel: string, actionValue: number, rollBreakdown: {type: string, value: (number|string), faces?: number}[],outcome: Object, modifiers: {label:string, value:number}[], hasModifiers: boolean, totalModifiers?: number}}
 */
export function buildCheckContext({ rollBreakdown, rollLabel, actionValue, outcome, modifiers }) {
  const context = {
    rollLabel,
    actionValue,
    rollBreakdown,
    outcome,
    modifiers,
    hasModifiers: false,
  };
  if (modifiers.length > 0) {
    context.totalModifiers = sumModifiers(modifiers);
    context.hasModifiers = true;
  }
  return context;
}
