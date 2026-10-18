import { describe, expect, it } from 'vitest';
import { startApp } from './helpers.js';

describe('app shell', () => {
  it('renders the header with the logo linking home, and a main container', async () => {
    await startApp();
    const logo = document.querySelector('.app-header .logo');
    expect(logo.textContent).toBe('Bolis');
    expect(logo.getAttribute('href')).toBe('#/');
    expect(document.querySelector('.app-header').textContent).toContain('split trip expenses');
    expect(document.querySelector('main.container')).not.toBeNull();
  });
});
