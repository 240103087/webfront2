// Expenses, payments and balances. No DOM, no storage.
import { splitEvenly } from './money.js';
import { newId } from './store.js';

export const MAX_DESCRIPTION_LENGTH = 60;

/**
 * Check expense input. `amount` is tiyn or null (from parseAmount).
 * Returns a list of error messages, empty when valid.
 */
export function validateExpense(group, { description, amount, paidBy, splitBetween }) {
  const errors = [];
  const text = String(description ?? '').trim();
  if (!text) errors.push('Say what the expense was for.');
  if (text.length > MAX_DESCRIPTION_LENGTH) {
    errors.push(`The description can be at most ${MAX_DESCRIPTION_LENGTH} characters.`);
  }
  if (amount === null || amount === undefined) {
    errors.push('Enter an amount greater than 0, with at most two decimals.');
  }
  const ids = new Set(group.members.map((m) => m.id));
  if (!ids.has(paidBy)) errors.push('Choose who paid.');
  if (!splitBetween.length) errors.push('Choose at least one person to split with.');
  else if (!splitBetween.every((id) => ids.has(id))) {
    errors.push('Split only between members of this group.');
  }
  return errors;
}

export function makeExpense({ description, amount, paidBy, splitBetween }, now = Date.now()) {
  return {
    id: newId(),
    description: String(description).trim(),
    amount,
    paidBy,
    splitBetween: [...splitBetween],
    createdAt: now,
  };
}

/** Shares of one expense in group member order: [{ memberId, amount }]. */
export function expenseShares(group, expense) {
  const ordered = group.members
    .map((m) => m.id)
    .filter((id) => expense.splitBetween.includes(id));
  const parts = splitEvenly(expense.amount, ordered.length);
  return ordered.map((memberId, i) => ({ memberId, amount: parts[i] }));
}

/** Total of all expenses, payments not included. */
export function totalSpent(group) {
  return group.expenses.reduce((sum, e) => sum + e.amount, 0);
}
