// Hash routes: #/, #/new, #/group/<id>, #/group/<id>/edit

export function parseRoute(hash) {
  const path = (hash || '').replace(/^#/, '') || '/';
  const parts = path.split('/').filter(Boolean).map(decodeURIComponent);
  if (parts.length === 0) return { name: 'home' };
  if (parts.length === 1 && parts[0] === 'new') return { name: 'new-group' };
  if (parts[0] === 'group' && parts[1]) {
    const groupId = parts[1];
    if (parts.length === 2) return { name: 'group', groupId };
    if (parts.length === 3 && parts[2] === 'edit') return { name: 'edit-group', groupId };
  }
  return { name: 'not-found' };
}

export const links = {
  home: () => '#/',
  newGroup: () => '#/new',
  group: (id) => `#/group/${encodeURIComponent(id)}`,
  editGroup: (id) => `#/group/${encodeURIComponent(id)}/edit`,
};

export function navigate(hash) {
  if (location.hash === hash) window.dispatchEvent(new HashChangeEvent('hashchange'));
  else location.hash = hash;
}
