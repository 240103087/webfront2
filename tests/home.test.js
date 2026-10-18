import { describe, expect, it } from 'vitest';
import { $, $$, go, startApp } from './helpers.js';
import { createGroup } from '../src/groups.js';
import { makeExpense } from '../src/ledger.js';
import { saveGroup } from '../src/store.js';

describe('home screen', () => {
  it('shows an empty state and a New group link when there are no groups', async () => {
    await startApp('#/');
    expect($('main').textContent).toContain('No groups yet.');
    expect($('a[href="#/new"]').textContent).toBe('New group');
  });

  it('lists groups newest first with member count and total spent', async () => {
    await startApp('#/');
    const old = createGroup('Old trip', ['A', 'B'], 1);
    const fresh = createGroup('Birthday', ['A', 'B', 'C'], 2);
    fresh.expenses.push(makeExpense({ description: 'Cake', amount: 1500000, paidBy: fresh.members[0].id, splitBetween: [fresh.members[0].id] }));
    saveGroup(old);
    saveGroup(fresh);
    await go('#/new');
    await go('#/');
    const items = $$('[data-testid="group-list"] li');
    expect(items.map((li) => li.querySelector('.list-title').textContent)).toEqual(['Birthday', 'Old trip']);
    expect(items[0].textContent).toContain('3 members · 15\u00a0000\u00a0₸ spent');
    expect(items[1].textContent).toContain('2 members · 0\u00a0₸ spent');
    expect(items[0].querySelector('a').getAttribute('href')).toBe(`#/group/${fresh.id}`);
  });

  it('shows Not found for an unknown group or route, with a way back', async () => {
    await startApp('#/group/does-not-exist');
    expect($('main h1').textContent).toBe('Not found');
    expect($('main a[href="#/"]')).not.toBeNull();
    await go('#/what');
    expect($('main h1').textContent).toBe('Not found');
  });

  it('back and forward move between screens', async () => {
    await startApp('#/');
    await go('#/new');
    expect($('main h1').textContent).toBe('New group');
    history.back();
    await new Promise((r) => setTimeout(r, 20));
    expect($('main h1').textContent).toBe('My groups');
  });

  it('the logo always leads home', async () => {
    await startApp('#/new');
    expect($('.logo').getAttribute('href')).toBe('#/');
  });
});
