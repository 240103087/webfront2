import { h } from './dom.js';
import { links, parseRoute } from './router.js';
import { renderHome } from './views/home.js';
import { renderGroupForm } from './views/groupForm.js';
import { renderGroup } from './views/group.js';
import { renderExpenseForm } from './views/expenseForm.js';
import { renderNotFound } from './views/notFound.js';

export function renderRoute(route) {
  switch (route.name) {
    case 'home':
      return renderHome();
    case 'new-group':
      return renderGroupForm();
    case 'edit-group':
      return renderGroupForm(route.groupId);
    case 'group':
      return renderGroup(route.groupId);
    case 'new-expense':
      return renderExpenseForm(route.groupId);
    case 'edit-expense':
      return renderExpenseForm(route.groupId, route.expenseId);
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
    // A new screen starts at the top, like a new page would.
    document.documentElement.scrollTop = 0;
  };
  window.addEventListener('hashchange', render);
  render();
  return () => window.removeEventListener('hashchange', render);
}
