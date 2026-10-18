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
    ['#/group', { name: 'not-found' }],
    ['#/something/else', { name: 'not-found' }],
  ])('%j', (hash, route) => {
    expect(parseRoute(hash)).toEqual(route);
  });

  it('round-trips links with awkward ids', () => {
    expect(parseRoute(links.editGroup('g 1/2'))).toEqual({ name: 'edit-group', groupId: 'g 1/2' });
  });
});
