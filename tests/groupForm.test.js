import { afterEach, describe, expect, it, vi } from 'vitest';
import { $, $$, byText, click, go, startApp, submit, type } from './helpers.js';
import { listGroups, getGroup, saveGroup } from '../src/store.js';

afterEach(() => vi.restoreAllMocks());

const memberInputs = () => $$('input[name="member"]');

async function fillNewGroup(name, members) {
  type($('#group-name'), name);
  while (memberInputs().length < members.length) await click(byText('button', 'Add member'));
  members.forEach((m, i) => type(memberInputs()[i], m));
  await submit($('form'));
}

describe('new group form', () => {
  it('starts with three member rows', async () => {
    await startApp('#/new');
    expect(memberInputs()).toHaveLength(3);
  });

  it('creates a group and opens it', async () => {
    await startApp('#/new');
    await fillNewGroup('Shymbulak', ['Aida', 'Dias', '']);
    const [group] = listGroups();
    expect(group.name).toBe('Shymbulak');
    expect(group.members.map((m) => m.name)).toEqual(['Aida', 'Dias']);
    expect(location.hash).toBe(`#/group/${group.id}`);
    expect($('main h1').textContent).toBe('Shymbulak');
  });

  it('shows errors and saves nothing for invalid input', async () => {
    await startApp('#/new');
    await fillNewGroup('  ', ['Aida', 'aida']);
    expect($('[role="alert"]').textContent).toContain('Give the group a name.');
    expect($('[role="alert"]').textContent).toContain('twice');
    expect(listGroups()).toEqual([]);
    expect(location.hash).toBe('#/new');
  });

  it('cannot add more than 20 member rows', async () => {
    await startApp('#/new');
    const add = byText('button', 'Add member');
    for (let i = 0; i < 25; i++) await click(add);
    expect(memberInputs()).toHaveLength(20);
    expect(add.disabled).toBe(true);
  });

  it('removes a row', async () => {
    await startApp('#/new');
    await click($$('.member-row button')[0]);
    expect(memberInputs()).toHaveLength(2);
  });
});

describe('edit group', () => {
  async function existingGroup() {
    await startApp('#/new');
    await fillNewGroup('Trip', ['Aida', 'Dias', 'Erlan']);
    return listGroups()[0];
  }

  it('renames the group and a member, adds a member, keeps the ids', async () => {
    const g = await existingGroup();
    await go(`#/group/${g.id}/edit`);
    expect(memberInputs().map((i) => i.value)).toEqual(['Aida', 'Dias', 'Erlan']);
    type($('#group-name'), 'Trip 2');
    type(memberInputs()[0], 'Aidana');
    await click(byText('button', 'Add member'));
    type(memberInputs()[3], 'Zhanna');
    await submit($('form'));
    const saved = getGroup(g.id);
    expect(saved.name).toBe('Trip 2');
    expect(saved.members.map((m) => m.name)).toEqual(['Aidana', 'Dias', 'Erlan', 'Zhanna']);
    expect(saved.members[0].id).toBe(g.members[0].id);
  });

  it('disables Remove for a member used in an expense', async () => {
    const g = await existingGroup();
    const [a, d] = g.members;
    g.expenses.push({ id: 'e1', description: 'x', amount: 100, paidBy: a.id, splitBetween: [d.id], createdAt: 1 });
    saveGroup(g);
    await go(`#/group/${g.id}/edit`);
    const buttons = $$('.member-row button');
    expect(buttons.map((b) => b.disabled)).toEqual([true, true, false]);
  });

  it('deletes the group after confirmation, and not without it', async () => {
    const g = await existingGroup();
    await go(`#/group/${g.id}/edit`);
    vi.spyOn(window, 'confirm').mockReturnValueOnce(false);
    await click(byText('button', 'Delete group'));
    expect(getGroup(g.id)).not.toBeNull();
    vi.spyOn(window, 'confirm').mockReturnValueOnce(true);
    await click(byText('button', 'Delete group'));
    expect(getGroup(g.id)).toBeNull();
    expect(location.hash).toBe('#/');
  });

  it('shows Not found when editing a group that does not exist', async () => {
    await startApp('#/group/nope/edit');
    expect($('main h1').textContent).toBe('Not found');
  });
});
