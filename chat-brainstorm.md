# Brainstorming session: Bolis

Chat history of how the app idea was narrowed down into a specification,
following the flow from "AI-Native Development: Specifications, Loop and
Graph Engineering": start from a vague idea, let the assistant ask one
question at a time with options, keep answers short, and at the end save
everything to a markdown file that becomes `_docs/plan.md`.

Part 1 is the chat with the assistant. Part 2 is the first prompts given to
the coding agent once `plan.md` was in the repository.

---

## Part 1. Chat with the assistant

**User:** I want to build a tool for splitting money with friends. Help me
set the scope. Ask me one question at a time, give me options for each
question, and keep your output short.

**Assistant:** Got it. One question at a time.

Q1. What situation is this for?

- A) Trips and events - a group spends money over a few days, then settles up
- B) Flatmates - recurring shared bills every month
- C) One restaurant bill - split one receipt right now
- D) Something else

**User:** A. Trips and events. Like when we go to Shymbulak or to a friend's
birthday and everyone pays for something different.

**Assistant:** Q2. Who uses the app?

- A) One person (the organiser) enters everything on their phone
- B) Every member has an account and enters their own expenses
- C) Shared link, everyone edits the same group

**User:** A for the first version. I don't want accounts and a server. It is a
front-end course, so it should work only in the browser.

**Assistant:** Then data lives in the browser (localStorage). That means no
sync between phones. OK?

**User:** Yes, that's fine for v1.

**Assistant:** Q3. What is inside a group?

- A) Name + list of members
- B) Name + members + currency
- C) Name + members + dates + photo

**User:** A. Currency is always tenge for now.

**Assistant:** Q4. How many members in a group?

- A) 2-10
- B) 2-20
- C) No limit

**User:** B. 20 is enough. A group needs at least 2 people, otherwise there is
nothing to split. Member names must be different inside one group.

**Assistant:** Q5. What does an expense contain?

- A) Description, amount, who paid
- B) A + who it is split between
- C) B + category + date + receipt photo

**User:** B. Description, amount, who paid and who shares it. Date I'd like to
see too, but it can just be the time it was added.

**Assistant:** Q6. How is an expense split?

- A) Always equally among everyone in the group
- B) Equally among the people you select
- C) B + custom amounts or percentages per person

**User:** B. Sometimes not everyone eats, so I need to pick people. Custom
amounts are nice, but later.

**Assistant:** Noted: custom split goes to "later". Q7. 1000 ₸ split between
3 people is 333.33... Who gets the extra tiyn?

- A) Round to whole tenge and ignore the difference
- B) Work in tiyn; the remainder goes one tiyn at a time to the first people
  in the list, so the total always matches exactly
- C) The payer absorbs the difference

**User:** B. The sum must always be exact.

**Assistant:** Q8. Can expenses be changed after adding?

- A) No, only delete
- B) Edit and delete
- C) Edit, delete and undo

**User:** B. Delete should ask for confirmation. Undo later.

**Assistant:** Q9. What should the app show at the end?

- A) Each person's balance (+ is owed, - owes)
- B) A + the list of transfers "Aida pays Dias 4 500 ₸"
- C) B + with the smallest possible number of transfers

**User:** C. And balances too, so people can check.

**Assistant:** Q10. After someone pays back, what happens?

- A) Nothing, they just know
- B) A "Mark as paid" button records the payment, and balances update
- C) B + the history of payments

**User:** B, and the payment shows in the same list as expenses so you can see
it. That basically is C.

**Assistant:** Q11. Several groups at once?

- A) One group only
- B) Many groups, a home screen to switch between them
- C) B + archive old groups

**User:** B. Archive later.

**Assistant:** Q12. Can a member be removed from a group?

- A) Any time
- B) Only if they are not in any expense or payment
- C) Never

**User:** B. Otherwise the numbers break.

**Assistant:** Q13. Which devices?

- A) Desktop first
- B) Phone first, works on desktop
- C) Desktop only

**User:** B. People will use it on the phone after a trip. Also it should be in
English for now, Kazakh and Russian later.

**Assistant:** Q14. What is explicitly NOT in v1? My proposal:

- Accounts, login, server, sync between devices
- Other currencies and conversion
- Custom (unequal) split
- Receipt photos, categories, charts
- Sharing a group by link, export
- Undo, archive, translations

**User:** Agree with all of them. Add deploying to GitHub Pages as the last
step of v1 so I can send a link.

**Assistant:** Q15. Name?

- A) SplitTrip
- B) Bolis (from Kazakh "бөлісу", to share)
- C) Dostar Wallet

**User:** B. Bolis.

**User:** Save everything to a markdown file that I can download.

**Assistant:** Done - `plan.md` (saved into the repository as `_docs/plan.md`).

---

## Part 2. First prompts to the coding agent

After creating the folder, running `git init`, creating `_docs/` and
committing `_docs/plan.md`:

**User:** Read `_docs/plan.md`. Propose multiple options for the tech stack
and explain each option. Don't write code yet.

**Agent:** Three options:

1. Vanilla HTML, CSS and JavaScript (ES modules), Vite only as dev server and
   bundler, Vitest + jsdom for tests. Smallest, and exactly what the course
   teaches: DOM, events, forms, localStorage.
2. React + Vite. Components and state are easier as the app grows, but most
   of the code becomes React rather than web fundamentals.
3. Vue + Vite. Similar trade-off to React, smaller syntax.

**User:** Option 1. It's a Web Front Fundamentals course and I want to be
able to review every line. No runtime dependencies at all.

**User:** Create a backlog with tasks in `_docs/tasks.md`. Each task must fit
one session and be independent. Use this template: number, title, Goal (one
line), Description (two or three sentences). Task 1 is an empty project with
a passing test.

**Agent:** Created `_docs/tasks.md` with 14 tasks.

**User:** Merge the tiny ones, cut what is outside the MVP. Then move the
tasks into GitHub issues with `gh` and label them `mvp`.

**Agent:** Merged to 12 tasks, created issues #1-#12, `_docs/tasks.md` moved
to `_docs/outdated/`.

**User:** Create `AGENTS.md`, `CLAUDE.md` with `@AGENTS.md`,
`_docs/process.md`, `_docs/task-template.md` and the roles in `_docs/team/`:
PM, software engineer, QA engineer.

**User:** /goal work through the backlog
