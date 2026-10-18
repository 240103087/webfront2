import { describe, expect, it } from 'vitest';
import { settlePlan } from '../src/settle.js';

const apply = (balances, plan) => {
  const b = new Map(balances);
  for (const t of plan) {
    b.set(t.from, b.get(t.from) + t.amount);
    b.set(t.to, b.get(t.to) - t.amount);
  }
  return b;
};

describe('settlePlan', () => {
  it('returns nothing when everyone is at 0', () => {
    expect(settlePlan(new Map([['a', 0], ['b', 0]]))).toEqual([]);
  });

  it('one debtor pays one creditor', () => {
    expect(settlePlan(new Map([['a', 500], ['b', -500]]))).toEqual([{ from: 'b', to: 'a', amount: 500 }]);
  });

  it('largest debtor pays largest creditor first', () => {
    const plan = settlePlan(new Map([['a', 700], ['b', 300], ['c', -600], ['d', -400]]));
    expect(plan).toEqual([
      { from: 'c', to: 'a', amount: 600 },
      { from: 'd', to: 'b', amount: 300 },
      { from: 'd', to: 'a', amount: 100 },
    ]);
  });

  it('settles everyone to 0 with at most n-1 transfers', () => {
    let seed = 7;
    const rand = () => (seed = (seed * 16807) % 2147483647);
    for (let round = 0; round < 200; round++) {
      const n = 2 + (rand() % 19);
      const values = Array.from({ length: n - 1 }, () => (rand() % 200001) - 100000);
      values.push(-values.reduce((x, y) => x + y, 0));
      const balances = new Map(values.map((v, i) => [`m${i}`, v]));
      const plan = settlePlan(balances);
      expect([...apply(balances, plan).values()].every((v) => v === 0)).toBe(true);
      expect(plan.length).toBeLessThanOrEqual(n - 1);
      expect(plan.every((t) => t.amount > 0 && Number.isInteger(t.amount))).toBe(true);
    }
  });

  it('is stable on ties, following member order', () => {
    const plan = settlePlan(new Map([['a', 100], ['b', 100], ['c', -100], ['d', -100]]));
    expect(plan).toEqual([
      { from: 'c', to: 'a', amount: 100 },
      { from: 'd', to: 'b', amount: 100 },
    ]);
  });
});
