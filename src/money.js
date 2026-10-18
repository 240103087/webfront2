// All money in Bolis is integer tiyn: 1 ₸ = 100 tiyn.

export const MAX_TIYN = 100_000_000_00; // 100 million ₸

/**
 * Parse what a person typed into tiyn.
 * Accepts "1500", "1 500", "1500.5", "1500,50". Returns null for anything
 * that is not a positive amount with at most two decimals.
 */
export function parseAmount(input) {
  if (typeof input !== 'string' && typeof input !== 'number') return null;
  const text = String(input).replace(/[\s ₸]/g, '').replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(text)) return null;
  const [whole, fraction = ''] = text.split('.');
  const tiyn = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  if (!Number.isSafeInteger(tiyn) || tiyn <= 0 || tiyn > MAX_TIYN) return null;
  return tiyn;
}

/** 150050 -> "1 500.50 ₸", 150000 -> "1 500 ₸", -5000 -> "−50 ₸" */
export function formatAmount(tiyn) {
  const sign = tiyn < 0 ? '−' : '';
  const abs = Math.abs(tiyn);
  const whole = Math.floor(abs / 100)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const fraction = abs % 100;
  const decimals = fraction === 0 ? '' : '.' + String(fraction).padStart(2, '0');
  return `${sign}${whole}${decimals} ₸`;
}

/** Value to put back into an amount input when editing: 150050 -> "1500.50" */
export function toInputValue(tiyn) {
  const fraction = tiyn % 100;
  return fraction === 0
    ? String(tiyn / 100)
    : `${Math.floor(tiyn / 100)}.${String(fraction).padStart(2, '0')}`;
}

/**
 * Split total tiyn into `count` shares that add up exactly to the total.
 * The remainder goes one tiyn at a time to the first shares.
 */
export function splitEvenly(total, count) {
  if (!Number.isInteger(total) || !Number.isInteger(count) || count < 1) {
    throw new Error('splitEvenly needs an integer total and a count of at least 1');
  }
  const base = Math.floor(total / count);
  const remainder = total - base * count;
  return Array.from({ length: count }, (_, i) => base + (i < remainder ? 1 : 0));
}
