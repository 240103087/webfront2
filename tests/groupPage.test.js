import { afterEach, describe, expect, it, vi } from 'vitest';
import { $, $$, click, go, startApp, submit, type } from './helpers.js';

afterEach(() => vi.restoreAllMocks());
import { createGroup } from '../src/groups.js';
import { makeExpense } from '../src/ledger.js';
import { getGroup, saveGroup } from '../src/store.js';

async function trip(expenses = []) {
  await startApp('#/');
  const g = createGroup('Trip', ['Aida', 'Dias', 'Erlan']);
  const ids = g.members.map((m) => m.id);
  expenses.forEach(([amount, payer, split], i) =>
    g.expenses.push(makeExpense({ description: `E${i}`, amount, paidBy: ids[payer], splitBetween: split.map((s) => ids[s]) }, i + 1)),
  );
  saveGroup(g);
  await go(`#/group/${g.id}`);
  return g;
}

const balanceText = (name) => $(`[data-testid="balances"] [data-member="${name}"] .balance-value`).textContent;

describe('balances', () => {
  it('shows every member settled with no expenses', async () => {
    await trip();
    expect($$('[data-testid="balances"] li')).toHaveLength(3);
    expect(['Aida', 'Dias', 'Erlan'].map(balanceText)).toEqual(Array(3).fill('settled 0\u00a0₸'));
  });

  it('shows who gets back and who owes, with sign and colour class', async () => {
    await trip([[900000, 0, [0, 1, 2]]]);
    expect(balanceText('Aida')).toBe('gets back +6\u00a0000\u00a0₸');
    expect(balanceText('Dias')).toBe('owes \u22123\u00a0000\u00a0₸');
    expect($('[data-member="Aida"]').classList.contains('positive')).toBe(true);
    expect($('[data-member="Dias"]').classList.contains('negative')).toBe(true);
    expect($('[data-member="Erlan"]').classList.contains('negative')).toBe(true);
  });

  it('updates right after an expense is edited', async () => {
    const g = await trip([[900000, 0, [0, 1, 2]]]);
    await go(`#/group/${g.id}/expense/${g.expenses[0].id}`);
    type($('#expense-amount'), '300');
    await submit($('form'));
    expect(balanceText('Aida')).toBe('gets back +200\u00a0₸');
    expect(getGroup(g.id).expenses[0].amount).toBe(30000);
  });
});

describe('settle up', () => {
  it('says Nothing to settle yet with no expenses', async () => {
    await trip();
    expect($('[data-testid="all-settled"]').textContent).toBe('Nothing to settle yet.');
  });

  it('lists the transfers', async () => {
    await trip([[900000, 0, [0, 1, 2]]]);
    const rows = $$('[data-testid="settle-plan"] li').map((li) => li.querySelector('span').textContent);
    expect(rows).toEqual(['Dias pays Aida 3\u00a0000\u00a0₸', 'Erlan pays Aida 3\u00a0000\u00a0₸']);
  });

  it('says All settled up when expenses cancel out', async () => {
    await trip([[100000, 0, [1]], [100000, 1, [0]]]);
    expect($('[data-testid="settle-plan"]')).toBeNull();
    expect($('[data-testid="all-settled"]').textContent).toBe('All settled up.');
  });
});

describe('mark as paid', () => {
  it('Mark as paid records a payment, updates balances and the plan', async () => {
    const g = await trip([[900000, 0, [0, 1, 2]]]);
    await click($$('[data-testid="settle-plan"] button')[0]);
    const [p] = getGroup(g.id).payments;
    expect(p).toMatchObject({ from: g.members[1].id, to: g.members[0].id, amount: 300000 });
    expect(balanceText('Dias')).toBe('settled 0 ₸');
    expect($$('[data-testid="settle-plan"] li')).toHaveLength(1);
    expect($('[data-testid="activity"]').textContent).toContain('Dias paid Aida');
  });

  it('says All settled up when every transfer is paid', async () => {
    await trip([[900000, 0, [0, 1, 2]]]);
    await click($$('[data-testid="settle-plan"] button')[0]);
    await click($$('[data-testid="settle-plan"] button')[0]);
    expect($('[data-testid="all-settled"]').textContent).toBe('All settled up.');
  });

  it('deleting a payment brings the debt back, after confirmation', async () => {
    const g = await trip([[900000, 0, [0, 1, 2]]]);
    await click($$('[data-testid="settle-plan"] button')[0]);
    vi.spyOn(window, 'confirm').mockReturnValueOnce(true);
    await click($('[aria-label="Delete payment from Dias to Aida"]'));
    expect(getGroup(g.id).payments).toEqual([]);
    expect($$('[data-testid="settle-plan"] li')).toHaveLength(2);
  });

  it('a member with a payment cannot be removed', async () => {
    const g = await trip([[900000, 0, [0, 1]]]);
    await click($$('[data-testid="settle-plan"] button')[0]);
    await go(`#/group/${g.id}/edit`);
    expect($$('.member-row button').map((b) => b.disabled)).toEqual([true, true, false]);
  });

  it('payments survive a reload', async () => {
    const g = await trip([[900000, 0, [0, 1, 2]]]);
    await click($$('[data-testid="settle-plan"] button')[0]);
    await go('#/');
    await go(`#/group/${g.id}`);
    expect($('[data-testid="activity"]').textContent).toContain('Dias paid Aida');
    expect(getGroup(g.id).payments).toHaveLength(1);
  });
});
