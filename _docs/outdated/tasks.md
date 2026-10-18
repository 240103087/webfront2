# Backlog

Each task fits one session and is independent. Template: number, title,
Goal, Description.

## 1. Project skeleton with a passing test

Goal: an empty Vite project that starts, builds and has one passing test.

Description: `index.html`, `src/main.js`, `package.json` with `dev`, `build`
and `test` scripts. Vitest with jsdom. One smoke test that imports the app.

## 2. Base layout and design tokens

Goal: every screen shares one header, one container and one set of styles.

Description: CSS custom properties for colours, spacing and radius, base
styles for buttons, inputs, panels and lists, mobile-first layout. Record the
classes in `_docs/design-system.md`.

## 3. Money: parse, format and split tenge amounts

Goal: all money math is exact and lives in one module.

Description: parse user input like "1 500,50" into integer tiyn, format tiyn
as "1 500.50 ₸", and split an amount between N people so the shares add up
exactly. Pure functions with unit tests.

## 4. Storage of groups in localStorage

Goal: groups survive a page reload and broken data does not crash the app.

Description: a store module that loads and saves all groups under one
versioned key, generates ids, and falls back to an empty state when the
stored JSON is missing or corrupted.

## 5. Create and edit a group with members

Goal: the user can create a group with 2-20 members and edit it later.

Description: a form with the group name and member names, validation for
empty and duplicate names, rename, add and remove members, delete the group
with confirmation.

## 6. Home screen: list of groups and navigation

Goal: the user sees all groups and moves between home and a group.

Description: hash-based routing (`#/`, `#/group/<id>`), list of groups with
member count and total spent, empty state, "not found" for a wrong id.

## 7. Add an expense with an equal split

Goal: the user records who paid how much and for whom.

Description: expense form with description, amount, payer and the members
sharing it (all ticked by default). The expense list shows newest first.

## 8. Edit and delete an expense

Goal: mistakes can be fixed.

Description: open an expense in the same form to edit it, delete it with
confirmation. A member used in an expense can no longer be removed.

## 9. Member balances

Goal: the group page shows what each member is owed or owes.

Description: balance = paid - owed, computed from expenses (and later
payments), shown with colour and sign; the total is always 0.

## 10. Settle-up plan

Goal: the group page shows the transfers that settle everyone up.

Description: a greedy algorithm that matches the largest debtor with the
largest creditor until all balances are 0. "All settled up" when there is
nothing to pay.

## 11. Mark a transfer as paid

Goal: a repayment is recorded and the balances update.

Description: "Mark as paid" creates a payment entry that shows in the
activity list and can be deleted. Balances and the plan include payments.

## 12. Deploy to GitHub Pages

Goal: the app is available by a public link.

Description: a GitHub Actions workflow builds with Vite and deploys `dist/`
to Pages on every push to main. The link goes into `README.md`.
