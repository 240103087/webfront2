import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  BACKUP_KEY,
  STORAGE_KEY,
  deleteGroup,
  getGroup,
  listGroups,
  loadState,
  newId,
  saveGroup,
} from '../src/store.js';

const group = (id, name = 'Trip') => ({ id, name, members: [], expenses: [], payments: [], createdAt: 1 });

beforeEach(() => localStorage.clear());

describe('store', () => {
  it('starts empty', () => {
    expect(loadState()).toEqual({ version: 1, groups: [] });
    expect(listGroups()).toEqual([]);
  });

  it('saves a group and reads it back after a "reload"', () => {
    saveGroup(group('a'));
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)).groups).toHaveLength(1);
    expect(getGroup('a').name).toBe('Trip');
  });

  it('replaces a group with the same id instead of adding a second one', () => {
    saveGroup(group('a', 'Old'));
    saveGroup(group('a', 'New'));
    expect(listGroups()).toHaveLength(1);
    expect(getGroup('a').name).toBe('New');
  });

  it('deletes a group', () => {
    saveGroup(group('a'));
    saveGroup(group('b'));
    deleteGroup('a');
    expect(listGroups().map((g) => g.id)).toEqual(['b']);
  });

  it('returns null for an unknown id', () => {
    expect(getGroup('nope')).toBeNull();
  });

  it.each(['{not json', '[]', '{"version":2,"groups":[]}', '{"version":1}', 'null'])(
    'falls back to empty state and keeps a backup when storage holds %j',
    (raw) => {
      localStorage.setItem(STORAGE_KEY, raw);
      expect(loadState()).toEqual({ version: 1, groups: [] });
      expect(localStorage.getItem(BACKUP_KEY)).toBe(raw);
    },
  );

  it('reports false instead of throwing when the browser refuses to save', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    expect(saveGroup(group('a'))).toBe(false);
    spy.mockRestore();
  });

  it('generates unique ids', () => {
    const ids = new Set(Array.from({ length: 100 }, newId));
    expect(ids.size).toBe(100);
  });
});
