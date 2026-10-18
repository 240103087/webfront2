import { h } from '../dom.js';
import { getGroup } from '../store.js';
import { links } from '../router.js';
import { renderNotFound } from './notFound.js';

export function renderGroup(groupId) {
  const group = getGroup(groupId);
  if (!group) return renderNotFound('This group does not exist.');

  return h(
    'section',
    {},
    h(
      'div',
      { class: 'page-header' },
      h(
        'div',
        {},
        h('p', { class: 'breadcrumb' }, h('a', { class: 'link', href: links.home() }, '← My groups')),
        h('h1', { class: 'page-heading' }, group.name),
        h('p', { class: 'muted' }, group.members.map((m) => m.name).join(', ')),
      ),
      h(
        'div',
        { class: 'actions' },
        h('a', { class: 'btn btn-secondary', href: links.editGroup(group.id) }, 'Edit group'),
      ),
    ),
  );
}
