import { describe, expect, it } from 'vitest';
import { $, $$, byText, click, go, startApp, submit, type } from './helpers.js';
import { createGroup } from '../src/groups.js';
import { getGroup, saveGroup } from '../src/store.js';

async function setup() {
  await startApp('#/');
  const g = createGroup('Trip', ['Aida', 'Dias', 'Erlan']);
  saveGroup(g);
  await go(`#/group/${g.id}/expense/new`);
  return g;
}

const boxes = () => $$('input[name="splitBetween"]');

async function addExpense(description, amount, payerIndex = 0, split = null) {
  type($('#expense-description'), description);
  type($('#expense-amount'), amount);
  $('#expense-paid-by').selectedIndex = payerIndex;
  if (split) boxes().forEach((b, i) => (b.checked = split.includes(i)));
  await submit($('form'));
}

describe('add expense', () => {
  it('has everyone ticked by default and the first member as payer', async () => {
    await setup();
    expect(boxes().every((b) => b.checked)).toBe(true);
    expect($('#expense-paid-by').selectedOptions[0].textContent).toBe('Aida');
  });

  it('saves the expense in tiyn and returns to the group', async () => {
    const g = await setup();
    await addExpense('Dinner', '15 000,50', 1, [0, 1]);
    const [e] = getGroup(g.id).expenses;
    expect(e).toMatchObject({ description: 'Dinner', amount: 1500050, paidBy: g.members[1].id });
    expect(e.splitBetween).toEqual([g.members[0].id, g.members[1].id]);
    expect(location.hash).toBe(`#/group/${g.id}`);
    expect($('[data-testid="activity"]').textContent).toContain('Dinner');
    expect($('[data-testid="activity"]').textContent).toContain('Dias paid · split between Aida, Dias');
  });

  it.each([
    ['', '100', 'Say what the expense was for.'],
    ['Taxi', '0', 'Enter an amount greater than 0'],
    ['Taxi', '-5', 'Enter an amount greater than 0'],
    ['Taxi', '1.234', 'Enter an amount greater than 0'],
    ['Taxi', 'abc', 'Enter an amount greater than 0'],
  ])('rejects description %j amount %j', async (description, amount, message) => {
    const g = await setup();
    await addExpense(description, amount);
    expect($('[role="alert"]').textContent).toContain(message);
    expect(getGroup(g.id).expenses).toEqual([]);
  });

  it('rejects an expense split between nobody', async () => {
    const g = await setup();
    await click(byText('button', 'All / none'));
    expect(boxes().every((b) => !b.checked)).toBe(true);
    await addExpense('Taxi', '100');
    expect($('[role="alert"]').textContent).toContain('Choose at least one person');
    expect(getGroup(g.id).expenses).toEqual([]);
  });

  it('lists expenses newest first and survives a reload', async () => {
    const g = await setup();
    await addExpense('First', '100');
    await go(`#/group/${g.id}/expense/new`);
    await addExpense('Second', '200');
    await startAppKeepingStorage(`#/group/${g.id}`);
    const titles = $$('[data-testid="activity"] .list-title').map((t) => t.firstChild.textContent);
    expect(titles).toEqual(['Second', 'First']);
  });
});

async function startAppKeepingStorage(hash) {
  const saved = { ...localStorage };
  await startApp(hash);
  for (const [k, v] of Object.entries(saved)) localStorage.setItem(k, v);
  await go('#/');
  await go(hash);
}

describe('expense screen edge cases', () => {
  it('shows Not found for a group that does not exist', async () => {
    await startApp('#/group/nope/expense/new');
    expect($('main h1').textContent).toBe('Not found');
  });

  it('puts user text into the page as text, not HTML', async () => {
    const g = await setup();
    await addExpense('<img src=x onerror=alert(1)>', '100');
    expect($('[data-testid="activity"] img')).toBeNull();
    expect($('[data-testid="activity"]').textContent).toContain('<img src=x onerror=alert(1)>');
    expect(getGroup(g.id).expenses).toHaveLength(1);
  });

  it('says everyone when all members share, and shows the total in the header', async () => {
    const g = await setup();
    await addExpense('Hotel', '30000');
    expect($('[data-testid="activity"]').textContent).toContain('Aida paid · split between everyone');
    expect($('main .page-header').textContent).toContain('30\u00a0000\u00a0₸ spent');
    expect(getGroup(g.id).expenses[0].amount).toBe(3000000);
  });

  it('shows an empty state with no expenses', async () => {
    const g = await setup();
    await go(`#/group/${g.id}`);
    expect($('main').textContent).toContain('No expenses yet. Add the first one.');
  });
});
