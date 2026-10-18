import { h } from './dom.js';
import { links, parseRoute } from './router.js';
import { renderGroupForm } from './views/groupForm.js';
import { renderGroup } from './views/group.js';
import { renderNotFound } from './views/notFound.js';

// Until #6 builds the list of groups.
function renderHomePlaceholder() {
  return h(
    'section',
    { class: 'page-header' },
    h('h1', { class: 'page-heading' }, 'My groups'),
    h('a', { class: 'btn btn-primary', href: links.newGroup() }, 'New group'),
  );
}

export function renderRoute(route) {
  switch (route.name) {
    case 'home':
      return renderHomePlaceholder();
    case 'new-group':
      return renderGroupForm();
    case 'edit-group':
      return renderGroupForm(route.groupId);
    case 'group':
      return renderGroup(route.groupId);
    default:
      return renderNotFound();
  }
}

/** Build the app shell inside `root` and render the current hash. */
export function mountApp(root) {
  const main = h('main', { class: 'container', id: 'main' });
  root.replaceChildren(
    h(
      'header',
      { class: 'app-header' },
      h(
        'div',
        { class: 'container' },
        h('a', { class: 'logo', href: links.home() }, 'Bolis'),
        h('span', { class: 'tagline' }, 'split trip expenses'),
      ),
    ),
    main,
  );
  const render = () => {
    main.replaceChildren(renderRoute(parseRoute(location.hash)));
  };
  window.addEventListener('hashchange', render);
  render();
  return () => window.removeEventListener('hashchange', render);
}
