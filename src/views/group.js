import { h } from '../dom.js';
import { formatAmount } from '../money.js';
import { activity, balances, makePayment, totalSpent } from '../ledger.js';
import { settlePlan } from '../settle.js';
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

  const plan = settlePlan(balanceMap);
  const settlePanel = h(
    'section',
    { class: 'panel', 'aria-labelledby': 'settle-heading' },
    h('h2', { id: 'settle-heading' }, 'Settle up'),
    plan.length === 0
      ? h(
          'p',
          { class: 'settled', 'data-testid': 'all-settled' },
          group.expenses.length ? 'All settled up.' : 'Nothing to settle yet.',
        )
      : h(
          'ul',
          { class: 'list compact', 'data-testid': 'settle-plan' },
          plan.map((t) =>
            h(
              'li',
              { class: 'transfer' },
              h(
                'span',
                {},
                h('strong', {}, nameOf(t.from)),
                ' pays ',
                h('strong', {}, nameOf(t.to)),
                ' ',
                formatAmount(t.amount),
              ),
              h(
                'button',
                {
                  type: 'button',
                  class: 'btn btn-secondary btn-small',
                  onclick: () => {
                    group.payments = group.payments ?? [];
                    group.payments.push(makePayment(t));
                    save();
                  },
                },
                'Mark as paid',
              ),
            ),
          ),
        ),
  );

  function expenseRow(e) {
    return h(
      'li',
      { class: 'activity expense' },
      h(
        'a',
        { class: 'list-item', href: links.editExpense(group.id, e.id) },
        h('span', { class: 'list-title' }, e.description, h('span', { class: 'amount' }, formatAmount(e.amount))),
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
    );
  }

  function paymentRow(p) {
    const label = `${nameOf(p.from)} paid ${nameOf(p.to)}`;
    return h(
      'li',
      { class: 'activity payment' },
      h(
        'div',
        { class: 'list-item' },
        h('span', { class: 'list-title' }, label, h('span', { class: 'amount' }, formatAmount(p.amount))),
        h('span', { class: 'muted' }, `Payment · ${dateFormat.format(p.createdAt)}`),
      ),
      h(
        'button',
        {
          type: 'button',
          class: 'btn btn-secondary btn-small',
          'aria-label': `Delete payment from ${nameOf(p.from)} to ${nameOf(p.to)}`,
          onclick: () => {
            if (!confirm(`Delete the payment "${label}"?`)) return;
            group.payments = group.payments.filter((x) => x.id !== p.id);
            save();
          },
        },
        'Delete',
      ),
    );
  }

  // Expenses and payments together, newest first
  const items = activity(group);
  const activityPanel = h(
    'section',
    { class: 'panel', 'aria-labelledby': 'activity-heading' },
    h('h2', { id: 'activity-heading' }, 'Expenses and payments'),
    items.length === 0
      ? h('p', { class: 'muted' }, 'No expenses yet. Add the first one.')
      : h(
          'ul',
          { class: 'list', 'data-testid': 'activity' },
          items.map(({ type, item }) => (type === 'expense' ? expenseRow(item) : paymentRow(item))),
        ),
  );

  return h('section', {}, header, h('div', { class: 'grid' }, h('div', {}, balancesPanel, settlePanel), activityPanel));
}
