# Bolis - specification

Bolis (from Kazakh "бөлісу", to share) is a browser app for splitting shared
expenses on trips and events. One person, the organiser, enters who paid for
what; Bolis shows each member's balance and the shortest list of transfers
that settles everyone up.

## Users

- The organiser of a trip or event, entering everything on their phone
- v1 has no accounts: the app is used by one person on one device

## Platform

- Runs fully in the browser, no server
- Data is stored in `localStorage` of that browser
- Phone first, also works on desktop
- Interface language: English
- Currency: Kazakhstani tenge (₸) only

## Groups

- A group has a name and a list of members
- 2 to 20 members; names are trimmed, cannot be empty and must be unique
  inside the group (case-insensitive)
- The user can have many groups; a home screen lists them and opens one
- A group can be renamed and deleted (with confirmation)
- Members can be added; a member can be removed or renamed only if the rules
  hold: removal only when the member is in no expense and no payment

## Expenses

- An expense has: description, amount, who paid, who shares it, and the time
  it was added
- Amount is in tenge with up to 2 decimals (tiyn), greater than 0
- Split is equal among the members selected as sharing it (at least one)
- Internally all money is stored as integer tiyn. When an amount does not
  divide evenly, the remainder is handed out one tiyn at a time to the
  sharing members in group order, so shares always add up exactly to the
  amount
- Expenses can be edited and deleted (delete asks for confirmation)
- The group page lists expenses newest first

## Balances

- Each member's balance = what they paid - what they owe
- Positive: the group owes them; negative: they owe the group
- The sum of all balances is always exactly 0

## Settle up

- Bolis shows a list of transfers "A pays B X ₸" that brings every balance
  to 0 using as few transfers as practical (greedy: largest debtor pays
  largest creditor)
- "Mark as paid" on a transfer records a payment from A to B
- Payments appear in the same list as expenses and can be deleted
- When all balances are 0 the group shows "All settled up"

## Delivery

- Deployed to GitHub Pages so a link can be shared

## Out of scope for v1

- Accounts, login, server, sync between devices
- Other currencies and conversion
- Custom (unequal) split by amounts or percentages
- Receipt photos, categories, charts
- Sharing a group by link, export
- Undo, archived groups
- Kazakh and Russian translations
