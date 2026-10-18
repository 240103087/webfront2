import { h } from '../dom.js';
import { formatAmount } from '../money.js';
import { totalSpent } from '../ledger.js';
import { getGroup } from '../store.js';
import { links } from '../router.js';
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
                'div',
                { class: 'list-item' },
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
            ),
          ),
        ),
  );

  return h('section', {}, header, expensesPanel);
}
