// Pure rules for groups and members. No DOM, no storage.
import { newId } from './store.js';

export const MIN_MEMBERS = 2;
export const MAX_MEMBERS = 20;
export const MAX_NAME_LENGTH = 40;

const clean = (name) => String(name ?? '').trim().replace(/\s+/g, ' ');

/**
 * Check a group name and its member names.
 * Returns { name, members, errors } where errors is a list of messages
 * and members are the cleaned, non-empty names.
 */
export function validateGroupInput(groupName, memberNames) {
  const errors = [];
  const name = clean(groupName);
  if (!name) errors.push('Give the group a name.');
  if (name.length > MAX_NAME_LENGTH) {
    errors.push(`The group name can be at most ${MAX_NAME_LENGTH} characters.`);
  }

  const members = memberNames.map(clean).filter(Boolean);
  if (members.length < MIN_MEMBERS) {
    errors.push(`A group needs at least ${MIN_MEMBERS} members.`);
  }
  if (members.length > MAX_MEMBERS) {
    errors.push(`A group can have at most ${MAX_MEMBERS} members.`);
  }
  if (members.some((m) => m.length > MAX_NAME_LENGTH)) {
    errors.push(`A member name can be at most ${MAX_NAME_LENGTH} characters.`);
  }
  const seen = new Set();
  for (const m of members) {
    const key = m.toLocaleLowerCase();
    if (seen.has(key)) {
      errors.push(`"${m}" is in the list twice. Member names must be different.`);
      break;
    }
    seen.add(key);
  }
  return { name, members, errors };
}

export function createGroup(name, memberNames, now = Date.now()) {
  return {
    id: newId(),
    name,
    members: memberNames.map((m) => ({ id: newId(), name: m })),
    expenses: [],
    payments: [],
    createdAt: now,
  };
}

/** A member who appears in an expense or a payment cannot be removed. */
export function isMemberUsed(group, memberId) {
  return (
    group.expenses.some(
      (e) => e.paidBy === memberId || e.splitBetween.includes(memberId),
    ) ||
    (group.payments ?? []).some((p) => p.from === memberId || p.to === memberId)
  );
}

/**
 * Apply an edit form to an existing group. `rows` is a list of
 * { id | null, name } in display order; rows without id are new members.
 * Returns { group, errors }. Members missing from rows are removed, which
 * is refused when they are used.
 */
export function applyGroupEdit(group, groupName, rows) {
  const filled = rows.map((r) => ({ id: r.id ?? null, name: clean(r.name) }));
  const { name, errors } = validateGroupInput(
    groupName,
    filled.map((r) => r.name),
  );
  // A row with an id but an empty name is a removal.
  const kept = filled.filter((r) => r.name);
  const keptIds = new Set(kept.filter((r) => r.id).map((r) => r.id));
  for (const m of group.members) {
    if (!keptIds.has(m.id) && isMemberUsed(group, m.id)) {
      errors.push(`${m.name} is part of an expense or payment and cannot be removed.`);
    }
  }
  if (errors.length) return { group, errors };
  return {
    errors: [],
    group: {
      ...group,
      name,
      members: kept.map((r) => ({ id: r.id ?? newId(), name: r.name })),
    },
  };
}
