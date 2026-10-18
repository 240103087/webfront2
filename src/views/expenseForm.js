import { h, errorList } from '../dom.js';
import { parseAmount } from '../money.js';
import { MAX_DESCRIPTION_LENGTH, makeExpense, validateExpense } from '../ledger.js';
import { getGroup, saveGroup } from '../store.js';
import { links, navigate } from '../router.js';
import { renderNotFound } from './notFound.js';

export function renderExpenseForm(groupId) {
  const group = getGroup(groupId);
  if (!group) return renderNotFound('This group does not exist.');

  const errorsSlot = h('div');
  const description = h('input', {
    type: 'text',
    id: 'expense-description',
    name: 'description',
    maxlength: MAX_DESCRIPTION_LENGTH,
    placeholder: 'Dinner, taxi, tickets…',
  });
  const amount = h('input', {
    type: 'text',
    id: 'expense-amount',
    name: 'amount',
    inputmode: 'decimal',
    placeholder: '0',
  });
  const paidBy = h(
    'select',
    { id: 'expense-paid-by', name: 'paidBy' },
    group.members.map((m) =>
      h('option', { value: m.id }, m.name),
    ),
  );
  const checkboxes = group.members.map((m) =>
    h('input', {
      type: 'checkbox',
      name: 'splitBetween',
      value: m.id,
      checked: true,
    }),
  );
  const splitList = h(
    'div',
    { class: 'checkbox-list' },
    group.members.map((m, i) => h('label', { class: 'checkbox' }, checkboxes[i], m.name)),
  );
  const toggleAll = h(
    'button',
    {
      type: 'button',
      class: 'btn btn-secondary btn-small',
      onclick: () => {
        const allOn = checkboxes.every((c) => c.checked);
        checkboxes.forEach((c) => (c.checked = !allOn));
      },
    },
    'All / none',
  );

  function onSubmit(event) {
    event.preventDefault();
    const input = {
      description: description.value,
      amount: parseAmount(amount.value),
      paidBy: paidBy.value,
      splitBetween: checkboxes.filter((c) => c.checked).map((c) => c.value),
    };
    const errors = validateExpense(group, input);
    errorsSlot.replaceChildren(errorList(errors) ?? '');
    if (errors.length) return;
    group.expenses.push(makeExpense(input));
    if (!saveGroup(group)) {
      errorsSlot.replaceChildren(
        errorList(['The browser refused to save. Free up storage and try again.']),
      );
      return;
    }
    navigate(links.group(group.id));
  }

  return h(
    'section',
    {},
    h('p', { class: 'breadcrumb' }, h('a', { class: 'link', href: links.group(group.id) }, `← ${group.name}`)),
    h('h1', { class: 'page-heading' }, 'New expense'),
    h(
      'form',
      { class: 'panel form-fields', novalidate: true, onsubmit: onSubmit },
      errorsSlot,
      h('label', { for: 'expense-description' }, 'What for'),
      description,
      h('label', { for: 'expense-amount' }, 'Amount, ₸'),
      amount,
      h('label', { for: 'expense-paid-by' }, 'Paid by'),
      paidBy,
      h('fieldset', {}, h('legend', {}, 'Split equally between'), splitList, toggleAll),
      h(
        'div',
        { class: 'actions' },
        h('button', { type: 'submit', class: 'btn btn-primary' }, 'Add expense'),
        h('a', { class: 'btn btn-secondary', href: links.group(group.id) }, 'Cancel'),
      ),
    ),
  );
}
