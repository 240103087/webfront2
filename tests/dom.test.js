import { describe, expect, it, vi } from 'vitest';
import { errorList, h } from '../src/dom.js';

describe('h', () => {
  it('builds an element with attributes and children', () => {
    const el = h('a', { class: 'btn btn-primary', href: '#/x' }, 'Go', h('span', {}, '!'));
    expect(el.outerHTML).toBe('<a class="btn btn-primary" href="#/x">Go<span>!</span></a>');
  });

  it('puts strings in as text, never as HTML', () => {
    const el = h('p', {}, '<b>x</b>');
    expect(el.querySelector('b')).toBeNull();
    expect(el.textContent).toBe('<b>x</b>');
  });

  it('skips null, false and undefined children and attributes, flattens arrays', () => {
    const el = h('ul', { title: null, hidden: false }, [h('li', {}, 'a'), null, false, [h('li', {}, 'b')]], undefined);
    expect(el.outerHTML).toBe('<ul><li>a</li><li>b</li></ul>');
  });

  it('true becomes an empty attribute, numbers become text', () => {
    expect(h('input', { disabled: true }).outerHTML).toBe('<input disabled="">');
    expect(h('span', {}, 0).textContent).toBe('0');
  });

  it('on* functions become event listeners', () => {
    const onclick = vi.fn();
    h('button', { onclick }).click();
    expect(onclick).toHaveBeenCalledOnce();
  });
});

describe('errorList', () => {
  it('renders nothing for no errors', () => {
    expect(errorList([])).toBeNull();
  });

  it('renders messages as text in an alert', () => {
    const el = errorList(['One', '<i>Two</i>']);
    expect(el.getAttribute('role')).toBe('alert');
    expect([...el.querySelectorAll('li')].map((li) => li.textContent)).toEqual(['One', '<i>Two</i>']);
  });
});
