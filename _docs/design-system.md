# Design system

Everything visual lives in `src/style.css`. Open it to see what exists; use
these classes instead of writing new CSS. No inline `style` attributes. A
new colour is a new token here first.

Build elements with `h()` from `src/dom.js`. It sets text through text
nodes, so user input can never become HTML.

## Tokens (`:root`)

| Token | Use |
|---|---|
| `--color-bg` | page background |
| `--color-surface` | panels, inputs, secondary buttons |
| `--color-text`, `--color-muted` | body text, secondary text |
| `--color-border` | borders and separators |
| `--color-primary`, `--color-primary-hover`, `--color-on-primary` | header, primary buttons, links, focus |
| `--color-positive`, `--color-negative` | balances: gets back / owes |
| `--color-danger`, `--color-error-bg` | delete buttons, error box |
| `--space-1`..`--space-6` | 4, 8, 12, 16, 24, 32 px |
| `--radius` | 10px, every rounded corner |
| `--font` | system font stack |

## Layout

- `.container` - centred, max 960px, 16px side padding. The header and
  `<main>` both use it
- `.page-header` - heading on the left, actions on the right, wraps on a
  phone
- `.grid` - one column on a phone, two from 768px
- Phone first: design at 375px, then check desktop

## Components

| Class | When |
|---|---|
| `.page-heading` | the one `<h1>` of a screen |
| `.panel` | a white box around a form or a section; `.panel.empty` for empty states |
| `.btn` + `.btn-primary` | the main action of a screen (one per screen) |
| `.btn` + `.btn-secondary` | every other action, Cancel |
| `.btn` + `.btn-danger` | destructive actions (delete group) |
| `.btn-small` | buttons inside list rows |
| `.actions` | a row of buttons |
| `.form-fields` | on a `<form>`: labels, inputs, selects and fieldsets get spacing and 44px height |
| `.errors` | from `errorList()`, at the top of a form |
| `.list`, `.list-item`, `.list-title` | a list of groups, expenses or payments |
| `.list.compact` | name on the left, value on the right (balances, transfers) |
| `.muted` | secondary text |
| `.link` | a text link |

## Rules

- Tap targets: 44px tall, 36px for `.btn-small`
- Every focusable element shows the focus outline; never remove it
- Colour is never the only signal: add a word or a sign
