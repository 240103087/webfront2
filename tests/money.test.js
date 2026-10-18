import { describe, expect, it } from 'vitest';
import { formatAmount, parseAmount, splitEvenly, toInputValue, MAX_TIYN } from '../src/money.js';

describe('parseAmount', () => {
  it.each([
    ['1500', 150000],
    ['1 500', 150000],
    ['1 500', 150000],
    ['1500.5', 150050],
    ['1500,50', 150050],
    ['0.01', 1],
    ['  42 ', 4200],
    ['42 ₸', 4200],
    [7, 700],
  ])('%j -> %i tiyn', (input, expected) => {
    expect(parseAmount(input)).toBe(expected);
  });

  it.each(['', ' ', '0', '0.00', '-5', 'abc', '1.234', '1,2,3', '1e3', '.5', '5.', null, undefined])(
    'rejects %j',
    (input) => {
      expect(parseAmount(input)).toBeNull();
    },
  );

  it('rejects amounts above the maximum', () => {
    expect(parseAmount(String(MAX_TIYN / 100))).toBe(MAX_TIYN);
    expect(parseAmount(String(MAX_TIYN / 100 + 1))).toBeNull();
  });
});

describe('formatAmount', () => {
  it.each([
    [150000, '1 500 ₸'],
    [150050, '1 500.50 ₸'],
    [5, '0.05 ₸'],
    [0, '0 ₸'],
    [-123456, '−1 234.56 ₸'],
    [100000000, '1 000 000 ₸'],
  ])('%i -> %j', (tiyn, expected) => {
    expect(formatAmount(tiyn)).toBe(expected);
  });
});

describe('toInputValue', () => {
  it('round-trips through parseAmount', () => {
    for (const tiyn of [1, 50, 100, 150050, 999999]) {
      expect(parseAmount(toInputValue(tiyn))).toBe(tiyn);
    }
  });
});

describe('splitEvenly', () => {
  it('splits evenly when it divides', () => {
    expect(splitEvenly(900, 3)).toEqual([300, 300, 300]);
  });

  it('gives the remainder to the first shares one tiyn at a time', () => {
    expect(splitEvenly(100000, 3)).toEqual([33334, 33333, 33333]);
    expect(splitEvenly(5, 3)).toEqual([2, 2, 1]);
  });

  it('always adds up to the total', () => {
    for (const total of [1, 7, 99, 100001, 123456789]) {
      for (let n = 1; n <= 20; n++) {
        const parts = splitEvenly(total, n);
        expect(parts).toHaveLength(n);
        expect(parts.reduce((a, b) => a + b, 0)).toBe(total);
        expect(Math.max(...parts) - Math.min(...parts)).toBeLessThanOrEqual(1);
      }
    }
  });

  it('refuses a count below 1 or a non-integer total', () => {
    expect(() => splitEvenly(100, 0)).toThrow();
    expect(() => splitEvenly(1.5, 2)).toThrow();
  });
});
