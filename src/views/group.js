import { h } from '../dom.js';
import { formatAmount } from '../money.js';
import { balances, totalSpent } from '../ledger.js';
import { getGroup, saveGroup } from '../store.js';
import { links, navigate } from '../router.js';
import { renderNotFound } from './notFound.js';

const dateFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

export function renderGroup(groupId) {
  const group = getGroup(groupId);
  if (!group) return renderNotFound('This group does not exist.');
  function save() {
    if (!saveGroup(group)) alert('The browser refused to save. Free up storage and try again.');
    navigate(links.group(group.id));
  }
  const nameOf = (id) => group.members.find((m) => m.id === id)?.name ?? '?';
  const splitText = (e) =>
    e.splitBetween.length === group.members.length ? 'everyone' : e.splitBetween.map(nameOf).join(', ');

  const header = h(
    'div',
    { class: 'page-header' },
    h(
      'div',
      {},
      h('p', { class: 'breadcrumb' }, h('a', { class: 'link', href: links.home() }, '← My groups')),
      h('h1', { class: 'page-heading' }, group.name),
      h(
        'p',
        { class: 'muted' },
        `${group.members.map((m) => m.name).join(', ')} · ${formatAmount(totalSpent(group))} spent`,
      ),
    ),
    h(
      'div',
      { class: 'actions' },
      h('a', { class: 'btn btn-primary', href: links.newExpense(group.id) }, 'Add expense'),
      h('a', { class: 'btn btn-secondary', href: links.editGroup(group.id) }, 'Edit group'),
    ),
  );

  const balanceMap = balances(group);
  const balancesPanel = h(
    'section',
    { class: 'panel', 'aria-labelledby': 'balances-heading' },
    h('h2', { id: 'balances-heading' }, 'Balances'),
    h(
      'ul',
      { class: 'list compact', 'data-testid': 'balances' },
      group.members.map((m) => {
        const value = balanceMap.get(m.id);
        const state = value > 0 ? 'positive' : value < 0 ? 'negative' : 'zero';
        const label = value > 0 ? 'gets back' : value < 0 ? 'owes' : 'settled';
        return h(
          'li',
          { class: `balance ${state}`, 'data-member': m.name },
          h('span', {}, m.name),
          h(
            'span',
            { class: 'balance-value' },
            h('span', { class: 'muted' }, `${label} `),
            (value > 0 ? '+' : '') + formatAmount(value),
          ),
        );
      }),
    ),
  );

  const expenses = [...group.expenses].sort((a, b) => b.createdAt - a.createdAt);
  const expensesPanel = h(
    'section',
    { class: 'panel', 'aria-labelledby': 'activity-heading' },
    h('h2', { id: 'activity-heading' }, 'Expenses'),
    expenses.length === 0
      ? h('p', { class: 'muted' }, 'No expenses yet. Add the first one.')
      : h(
          'ul',
          { class: 'list', 'data-testid': 'activity' },
          expenses.map((e) =>
            h(
              'li',
              { class: 'activity expense' },
              h(
                'a',
                { class: 'list-item', href: links.editExpense(group.id, e.id) },
                h(
                  'span',
                  { class: 'list-title' },
                  e.description,
                  h('span', { class: 'amount' }, formatAmount(e.amount)),
                ),
                h(
                  'span',
                  { class: 'muted' },
                  `${nameOf(e.paidBy)} paid · split between ${splitText(e)} · ${dateFormat.format(e.createdAt)}`,
                ),
              ),
              h(
                'button',
                {
                  type: 'button',
                  class: 'btn btn-secondary btn-small',
                  'aria-label': `Delete ${e.description}`,
                  onclick: () => {
                    if (!confirm(`Delete "${e.description}"?`)) return;
                    group.expenses = group.expenses.filter((x) => x.id !== e.id);
                    save();
                  },
                },
                'Delete',
              ),
            ),
          ),
        ),
  );

  return h('section', {}, header, h('div', { class: 'grid' }, h('div', {}, balancesPanel), expensesPanel));
}
