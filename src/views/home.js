import { h } from '../dom.js';
import { formatAmount } from '../money.js';
import { totalSpent } from '../ledger.js';
import { listGroups } from '../store.js';
import { links } from '../router.js';

export function renderHome() {
  const groups = [...listGroups()].sort((a, b) => b.createdAt - a.createdAt);
  const header = h(
    'div',
    { class: 'page-header' },
    h('h1', { class: 'page-heading' }, 'My groups'),
    h('a', { class: 'btn btn-primary', href: links.newGroup() }, 'New group'),
  );
  if (!groups.length) {
    return h(
      'section',
      {},
      header,
      h(
        'div',
        { class: 'panel empty' },
        h('p', {}, 'No groups yet.'),
        h(
          'p',
          { class: 'muted' },
          'Create a group for a trip or an event, add who is coming, and Bolis will tell everyone who owes whom.',
        ),
      ),
    );
  }
  return h(
    'section',
    {},
    header,
    h(
      'ul',
      { class: 'list', 'data-testid': 'group-list' },
      groups.map((g) =>
        h(
          'li',
          {},
          h(
            'a',
            { class: 'list-item', href: links.group(g.id) },
            h('span', { class: 'list-title' }, g.name),
            h(
              'span',
              { class: 'muted' },
              `${g.members.length} members · ${formatAmount(totalSpent(g))} spent`,
            ),
          ),
        ),
      ),
    ),
  );
}
