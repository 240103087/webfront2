import { h } from './dom.js';

/** Build the app shell inside `root`: header and main container. */
export function mountApp(root) {
  const main = h(
    'main',
    { class: 'container', id: 'main' },
    h('h1', { class: 'page-heading' }, 'My groups'),
  );
  root.replaceChildren(
    h(
      'header',
      { class: 'app-header' },
      h(
        'div',
        { class: 'container' },
        h('a', { class: 'logo', href: '#/' }, 'Bolis'),
        h('span', { class: 'tagline' }, 'split trip expenses'),
      ),
    ),
    main,
  );
}
