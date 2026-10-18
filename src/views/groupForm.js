import { h, errorList } from '../dom.js';
import {
  MAX_MEMBERS,
  MAX_NAME_LENGTH,
  applyGroupEdit,
  createGroup,
  isMemberUsed,
  validateGroupInput,
} from '../groups.js';
import { deleteGroup, getGroup, saveGroup } from '../store.js';
import { links, navigate } from '../router.js';
import { renderNotFound } from './notFound.js';

/** New group when groupId is undefined, edit otherwise. */
export function renderGroupForm(groupId) {
  const existing = groupId ? getGroup(groupId) : null;
  if (groupId && !existing) return renderNotFound('This group does not exist.');

  const errorsSlot = h('div');
  const rowsEl = h('ol', { class: 'member-rows' });

  function memberRow(member = { id: null, name: '' }) {
    const used = existing && member.id ? isMemberUsed(existing, member.id) : false;
    const input = h('input', {
      type: 'text',
      name: 'member',
      value: member.name,
      maxlength: MAX_NAME_LENGTH,
      placeholder: 'Name',
      'aria-label': 'Member name',
      'data-member-id': member.id,
    });
    const remove = h(
      'button',
      {
        type: 'button',
        class: 'btn btn-secondary btn-small',
        disabled: used,
        title: used ? 'Part of an expense or payment' : null,
        onclick: () => {
          row.remove();
          updateAddButton();
        },
      },
      'Remove',
    );
    const row = h('li', { class: 'member-row' }, input, remove);
    return row;
  }

  const addButton = h(
    'button',
    {
      type: 'button',
      class: 'btn btn-secondary',
      onclick: () => {
        const row = memberRow();
        rowsEl.append(row);
        row.querySelector('input').focus();
        updateAddButton();
      },
    },
    'Add member',
  );
  function updateAddButton() {
    addButton.disabled = rowsEl.children.length >= MAX_MEMBERS;
  }

  if (existing) existing.members.forEach((m) => rowsEl.append(memberRow(m)));
  else for (let i = 0; i < 3; i++) rowsEl.append(memberRow());
  updateAddButton();

  const nameInput = h('input', {
    type: 'text',
    id: 'group-name',
    name: 'name',
    value: existing?.name ?? '',
    maxlength: MAX_NAME_LENGTH,
    placeholder: 'Trip to Shymbulak',
    required: true,
  });

  function onSubmit(event) {
    event.preventDefault();
    const rows = [...rowsEl.querySelectorAll('input[name="member"]')].map((input) => ({
      id: input.dataset.memberId || null,
      name: input.value,
    }));
    let group;
    let errors;
    if (existing) {
      ({ group, errors } = applyGroupEdit(existing, nameInput.value, rows));
    } else {
      const result = validateGroupInput(nameInput.value, rows.map((r) => r.name));
      errors = result.errors;
      if (!errors.length) group = createGroup(result.name, result.members);
    }
    errorsSlot.replaceChildren(errorList(errors) ?? '');
    if (errors.length) return;
    if (!saveGroup(group)) {
      errorsSlot.replaceChildren(
        errorList(['The browser refused to save. Free up storage and try again.']),
      );
      return;
    }
    navigate(links.group(group.id));
  }

  const form = h(
    'form',
    { class: 'panel form-fields', novalidate: true, onsubmit: onSubmit },
    errorsSlot,
    h('label', { for: 'group-name' }, 'Group name'),
    nameInput,
    h('fieldset', {}, h('legend', {}, `Members (2-${MAX_MEMBERS})`), rowsEl, addButton),
    h(
      'div',
      { class: 'actions' },
      h('button', { type: 'submit', class: 'btn btn-primary' }, existing ? 'Save' : 'Create group'),
      h(
        'a',
        { class: 'btn btn-secondary', href: existing ? links.group(existing.id) : links.home() },
        'Cancel',
      ),
    ),
  );

  const danger = existing
    ? h(
        'div',
        { class: 'panel danger-zone' },
        h(
          'button',
          {
            type: 'button',
            class: 'btn btn-danger',
            onclick: () => {
              if (!confirm(`Delete "${existing.name}" with all its expenses?`)) return;
              deleteGroup(existing.id);
              navigate(links.home());
            },
          },
          'Delete group',
        ),
      )
    : null;

  return h(
    'section',
    {},
    h('h1', { class: 'page-heading' }, existing ? 'Edit group' : 'New group'),
    form,
    danger,
  );
}
