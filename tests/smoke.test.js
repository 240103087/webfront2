import { describe, expect, it } from 'vitest';
import { mountApp } from '../src/app.js';

describe('app', () => {
  it('mounts into #app and shows the name', () => {
    document.body.innerHTML = '<div id="app"></div>';
    mountApp(document.getElementById('app'));
    expect(document.getElementById('app').textContent).toContain('Bolis');
  });
});
