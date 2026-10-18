import { describe, expect, it } from 'vitest';
import { links, parseRoute } from '../src/router.js';

describe('parseRoute', () => {
  it.each([
    ['', { name: 'home' }],
    ['#', { name: 'home' }],
    ['#/', { name: 'home' }],
    ['#/new', { name: 'new-group' }],
    ['#/group/abc', { name: 'group', groupId: 'abc' }],
    ['#/group/abc/edit', { name: 'edit-group', groupId: 'abc' }],
    ['#/group/abc/expense/new', { name: 'new-expense', groupId: 'abc' }],
    ['#/group/abc/expense/e1', { name: 'edit-expense', groupId: 'abc', expenseId: 'e1' }],
    ['#/group/abc/expense', { name: 'not-found' }],
    ['#/group', { name: 'not-found' }],
    ['#/something/else', { name: 'not-found' }],
  ])('%j', (hash, route) => {
    expect(parseRoute(hash)).toEqual(route);
  });

  it('round-trips links with awkward ids', () => {
    expect(parseRoute(links.editGroup('g 1/2'))).toEqual({ name: 'edit-group', groupId: 'g 1/2' });
    expect(parseRoute(links.editExpense('g 1', 'e/2'))).toEqual({ name: 'edit-expense', groupId: 'g 1', expenseId: 'e/2' });
  });
});
