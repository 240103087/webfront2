// Tiny helper to build elements. Text is always set with textContent.

/**
 * h('button', { class: 'btn', onclick: fn }, 'Save')
 * Attributes starting with "on" become event listeners. `null`, `false`
 * and `undefined` children are skipped; strings become text nodes.
 */
export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs ?? {})) {
    if (value === null || value === undefined || value === false) continue;
    if (key.startsWith('on') && typeof value === 'function') {
      el.addEventListener(key.slice(2), value);
    } else if (key === 'class') {
      el.className = value;
    } else if (value === true) {
      el.setAttribute(key, '');
    } else {
      el.setAttribute(key, String(value));
    }
  }
  for (const child of children.flat(Infinity)) {
    if (child === null || child === undefined || child === false) continue;
    el.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return el;
}

/** A list of error messages, or nothing when there are none. */
export function errorList(errors) {
  if (!errors.length) return null;
  return h(
    'div',
    { class: 'errors', role: 'alert' },
    h('ul', {}, errors.map((e) => h('li', {}, e))),
  );
}
