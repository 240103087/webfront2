import { describe, expect, it } from 'vitest';
import { applyGroupEdit, createGroup, isMemberUsed, validateGroupInput } from '../src/groups.js';

describe('validateGroupInput', () => {
  it('accepts a name and two members, trimming spaces', () => {
    const r = validateGroupInput('  Shymbulak  ', [' Aida ', 'Dias', '  ']);
    expect(r.errors).toEqual([]);
    expect(r.name).toBe('Shymbulak');
    expect(r.members).toEqual(['Aida', 'Dias']);
  });

  it('needs a group name', () => {
    expect(validateGroupInput('   ', ['A', 'B']).errors).toContain('Give the group a name.');
  });

  it('needs at least 2 members, empty rows do not count', () => {
    expect(validateGroupInput('T', ['A', '', ' ']).errors).toContain('A group needs at least 2 members.');
  });

  it('allows 20 members but not 21', () => {
    const names = (n) => Array.from({ length: n }, (_, i) => `P${i}`);
    expect(validateGroupInput('T', names(20)).errors).toEqual([]);
    expect(validateGroupInput('T', names(21)).errors).toContain('A group can have at most 20 members.');
  });

  it('rejects duplicate names regardless of case and spaces', () => {
    const r = validateGroupInput('T', ['Aida', ' aida ']);
    expect(r.errors[0]).toMatch(/twice/);
  });

  it('rejects names longer than 40 characters', () => {
    expect(validateGroupInput('x'.repeat(41), ['A', 'B']).errors).toHaveLength(1);
    expect(validateGroupInput('T', ['A', 'b'.repeat(41)]).errors).toHaveLength(1);
  });
});

describe('createGroup', () => {
  it('gives the group and every member an id', () => {
    const g = createGroup('T', ['A', 'B'], 123);
    expect(g.id).toBeTruthy();
    expect(g.members.map((m) => m.name)).toEqual(['A', 'B']);
    expect(new Set(g.members.map((m) => m.id)).size).toBe(2);
    expect(g).toMatchObject({ expenses: [], payments: [], createdAt: 123 });
  });
});

describe('editing members', () => {
  const base = () => {
    const g = createGroup('T', ['A', 'B', 'C']);
    const [a, b, c] = g.members;
    g.expenses.push({ id: 'e', description: 'x', amount: 100, paidBy: a.id, splitBetween: [a.id, b.id], createdAt: 1 });
    return { g, a, b, c };
  };

  it('knows who is used in an expense or payment', () => {
    const { g, a, b, c } = base();
    expect(isMemberUsed(g, a.id)).toBe(true);
    expect(isMemberUsed(g, b.id)).toBe(true);
    expect(isMemberUsed(g, c.id)).toBe(false);
    g.payments.push({ id: 'p', from: c.id, to: a.id, amount: 1, createdAt: 2 });
    expect(isMemberUsed(g, c.id)).toBe(true);
  });

  it('renames, adds and removes an unused member, keeping ids', () => {
    const { g, a, b } = base();
    const { group, errors } = applyGroupEdit(g, 'New name', [
      { id: a.id, name: 'Aida' },
      { id: b.id, name: 'B' },
      { id: null, name: 'D' },
    ]);
    expect(errors).toEqual([]);
    expect(group.name).toBe('New name');
    expect(group.members.map((m) => m.name)).toEqual(['Aida', 'B', 'D']);
    expect(group.members[0].id).toBe(a.id);
    expect(group.expenses).toHaveLength(1);
  });

  it('refuses to remove a member used in an expense', () => {
    const { g, a, c } = base();
    const { group, errors } = applyGroupEdit(g, 'T', [
      { id: a.id, name: 'A' },
      { id: c.id, name: 'C' },
    ]);
    expect(errors).toEqual(['B is part of an expense or payment and cannot be removed.']);
    expect(group).toBe(g);
  });

  it('treats a cleared name as a removal', () => {
    const { g, a, b, c } = base();
    const { group } = applyGroupEdit(g, 'T', [
      { id: a.id, name: 'A' },
      { id: b.id, name: 'B' },
      { id: c.id, name: '  ' },
    ]);
    expect(group.members.map((m) => m.name)).toEqual(['A', 'B']);
  });
});
