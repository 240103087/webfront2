import { h } from '../dom.js';
import { links } from '../router.js';

export function renderNotFound(message = 'This page does not exist.') {
  return h(
    'section',
    { class: 'panel empty' },
    h('h1', { class: 'page-heading' }, 'Not found'),
    h('p', {}, message),
    h('a', { class: 'btn btn-primary', href: links.home() }, 'Back to my groups'),
  );
}
