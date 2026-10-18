import { describe, expect, it } from 'vitest';
import { createGroup } from '../src/groups.js';
import { balances, expenseShares, makeExpense, totalSpent, validateExpense } from '../src/ledger.js';

function trip() {
  const g = createGroup('Trip', ['Aida', 'Dias', 'Erlan']);
  const [a, d, e] = g.members.map((m) => m.id);
  return { g, a, d, e };
}

describe('validateExpense', () => {
  it('accepts a full expense', () => {
    const { g, a, d } = trip();
    expect(validateExpense(g, { description: 'Taxi', amount: 500, paidBy: a, splitBetween: [a, d] })).toEqual([]);
  });

  it('lists every problem at once', () => {
    const { g } = trip();
    const errors = validateExpense(g, { description: ' ', amount: null, paidBy: 'x', splitBetween: [] });
    expect(errors).toHaveLength(4);
  });

  it('rejects members from another group', () => {
    const { g, a } = trip();
    expect(validateExpense(g, { description: 'x', amount: 1, paidBy: a, splitBetween: ['ghost'] })).toEqual([
      'Split only between members of this group.',
    ]);
  });

  it('rejects descriptions over 60 characters', () => {
    const { g, a } = trip();
    expect(validateExpense(g, { description: 'x'.repeat(61), amount: 1, paidBy: a, splitBetween: [a] })).toHaveLength(1);
  });
});

describe('expenseShares', () => {
  it('gives the extra tiyn to members in group order, not selection order', () => {
    const { g, a, d, e } = trip();
    const exp = makeExpense({ description: 'x', amount: 100000, paidBy: a, splitBetween: [e, d, a] });
    expect(expenseShares(g, exp)).toEqual([
      { memberId: a, amount: 33334 },
      { memberId: d, amount: 33333 },
      { memberId: e, amount: 33333 },
    ]);
  });
});

describe('totalSpent', () => {
  it('adds up all expenses', () => {
    const { g, a } = trip();
    expect(totalSpent(g)).toBe(0);
    g.expenses.push(makeExpense({ description: 'x', amount: 100, paidBy: a, splitBetween: [a] }));
    g.expenses.push(makeExpense({ description: 'y', amount: 250, paidBy: a, splitBetween: [a] }));
    expect(totalSpent(g)).toBe(350);
  });
});

describe('balances', () => {
  it('is zero for everyone with no expenses', () => {
    const { g } = trip();
    expect([...balances(g).values()]).toEqual([0, 0, 0]);
  });

  it('paid minus owed, summing to 0', () => {
    const { g, a, d, e } = trip();
    g.expenses.push(makeExpense({ description: 'Dinner', amount: 900000, paidBy: a, splitBetween: [a, d, e] }));
    g.expenses.push(makeExpense({ description: 'Taxi', amount: 300000, paidBy: d, splitBetween: [d, e] }));
    const b = balances(g);
    expect(b.get(a)).toBe(600000);
    expect(b.get(d)).toBe(-150000);
    expect(b.get(e)).toBe(-450000);
    expect([...b.values()].reduce((x, y) => x + y)).toBe(0);
  });

  it('a payer not sharing the expense gets all of it back', () => {
    const { g, a, d } = trip();
    g.expenses.push(makeExpense({ description: 'Gift', amount: 1001, paidBy: a, splitBetween: [d] }));
    expect(balances(g).get(a)).toBe(1001);
    expect(balances(g).get(d)).toBe(-1001);
  });

  it('stays exact for awkward amounts', () => {
    const { g, a, d, e } = trip();
    for (let i = 1; i <= 50; i++) {
      g.expenses.push(makeExpense({ description: 'x', amount: i * 7 + 1, paidBy: [a, d, e][i % 3], splitBetween: [a, d, e] }));
    }
    expect([...balances(g).values()].reduce((x, y) => x + y)).toBe(0);
  });
});

