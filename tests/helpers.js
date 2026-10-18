import { mountApp } from '../src/app.js';

let unmount = null;

/** Clean storage and DOM, mount the app at `hash`, wait for it to render. */
export async function startApp(hash = '#/') {
  unmount?.();
  localStorage.clear();
  document.body.innerHTML = '<div id="app"></div>';
  history.replaceState(null, '', hash);
  unmount = mountApp(document.getElementById('app'));
  await tick();
}

/** Go to a hash and wait for the hashchange render. */
export async function go(hash) {
  location.hash = hash;
  await tick();
}

export const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

export const $ = (selector) => document.querySelector(selector);
export const $$ = (selector) => [...document.querySelectorAll(selector)];

export function byText(selector, text) {
  return $$(selector).find((el) => el.textContent.trim() === text);
}

export function type(input, value) {
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

export async function submit(form) {
  form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  await tick();
}

export async function click(el) {
  el.click();
  await tick();
}
