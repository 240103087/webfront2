# Bolis

Browser app for splitting shared expenses on trips and events. Plain HTML,
CSS and JavaScript (ES modules), no framework, no server. See
`_docs/plan.md` for the specification.

## Documents

Read only what the task needs:

- `_docs/process.md` - how work is organised: issues, roles, lifecycle
- `_docs/task-template.md` - the shape of a groomed issue
- `_docs/team/pm.md`, `_docs/team/software-engineer.md`,
  `_docs/team/qa-engineer.md` - the three roles
- `_docs/design-system.md` - read before touching HTML or CSS
- `_docs/testing-guidelines.md` - read before writing tests
- `_docs/plan.md` - the specification, `_docs/stack.md` - why this stack

## Commands

- `npm install` - install the dev toolchain (Vite, Vitest, jsdom)
- `npm run dev` - dev server at http://localhost:5173
- `npm test` - the whole test suite, once
- `npx vitest run tests/money.test.js` - one test file
- `npm run build` - production build into `dist/`
- `npm run preview` - serve the built `dist/`

## Rules

- No runtime dependencies. Dev dependencies are pinned exactly in
  `package.json`. Do not add one without asking
- Money is always integer tiyn (1 ₸ = 100 tiyn). Never store or add floats.
  Convert only at the edges with `src/money.js`
- All `localStorage` access goes through `src/store.js`. No other module
  reads or writes storage
- Pure logic (`src/money.js`, `src/ledger.js`, `src/settle.js`) has no DOM
  code. Screens live in `src/views/` and call the logic
- User text is put into the page with `textContent` or `createElement`,
  never by building HTML strings with it
- Tests live in `tests/` and run with `npm test`. Every change keeps the
  suite green
- Commit after every meaningful step. Commit messages reference the issue:
  `Add the expense form (#7)`
- When a correction is made during a session, update the document it belongs
  to (this file, the design system or the testing guidelines) so it is not
  repeated
