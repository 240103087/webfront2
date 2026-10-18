# Testing guidelines

- Vitest, with jsdom as the environment (set in `vite.config.js`)
- Tests live in `tests/`, one file per module: `tests/money.test.js` tests
  `src/money.js`
- Logic modules are tested directly with plain inputs and outputs. Every
  money test checks exact tiyn values, never rounded floats
- Screens are tested through the DOM: render into `document.body`, fill
  inputs, dispatch `submit` or `click`, assert on the text the user sees
- Each test starts clean: `localStorage.clear()` and
  `document.body.innerHTML = ''` in `beforeEach`
- Test the awkward cases the issue lists: empty input, zero, negative,
  duplicates, corrupted storage, an id that does not exist
- A bug found by QA gets a test that fails before the fix
