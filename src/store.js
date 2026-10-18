// The only module that touches localStorage.

export const STORAGE_KEY = 'bolis:v1';
export const BACKUP_KEY = 'bolis:v1:corrupted';

function emptyState() {
  return { version: 1, groups: [] };
}

function isValidState(state) {
  return (
    state !== null &&
    typeof state === 'object' &&
    state.version === 1 &&
    Array.isArray(state.groups)
  );
}

export function newId() {
  if (globalThis.crypto && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

/** Always returns a usable state. Broken data is kept aside, not lost. */
export function loadState() {
  let raw;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    return emptyState();
  }
  if (raw === null) return emptyState();
  try {
    const state = JSON.parse(raw);
    if (isValidState(state)) return state;
  } catch {
    // fall through
  }
  try {
    localStorage.setItem(BACKUP_KEY, raw);
  } catch {
    // storage full or blocked; nothing more we can do
  }
  return emptyState();
}

/** Returns true when saved, false when the browser refused. */
export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function listGroups() {
  return loadState().groups;
}

export function getGroup(id) {
  return loadState().groups.find((g) => g.id === id) ?? null;
}

/** Insert or replace a group by id. */
export function saveGroup(group) {
  const state = loadState();
  const index = state.groups.findIndex((g) => g.id === group.id);
  if (index === -1) state.groups.push(group);
  else state.groups[index] = group;
  return saveState(state);
}

export function deleteGroup(id) {
  const state = loadState();
  state.groups = state.groups.filter((g) => g.id !== id);
  return saveState(state);
}
