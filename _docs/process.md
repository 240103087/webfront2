# Process

Tasks are GitHub issues in this repository. `_docs/outdated/tasks.md` is the
original backlog; the issues are the source of truth now.

- Work on one issue at a time
- Read the acceptance criteria before starting, and again before closing
- Commit regularly; every commit message references its issue, `(#n)`
- Push as you go. Work nobody can see on GitHub is work nobody can review

## Labels

- `mvp` - part of v1 as described in `_docs/plan.md`
- `post-mvp` - a follow-up filed during grooming, not part of v1

Issues are worked through in number order, because later issues build on
the modules earlier ones create.

## Roles

Each role is a separate agent session with its own definition:

- Product Manager - `_docs/team/pm.md`. Grooms an issue into the template
  from `_docs/task-template.md`
- Software Engineer - `_docs/team/software-engineer.md`. Implements one
  groomed issue on its own branch
- QA Engineer - `_docs/team/qa-engineer.md`. Checks the work against the
  acceptance criteria and posts PASS or FAIL

## Lifecycle of an issue

```
PM grooms --> Engineer implements --> QA verifies --PASS--> merge, close
                    ^                      |
                    +--------- FAIL -------+
```

1. Pick the next open `mvp` issue
2. PM grooms it ("Groom issue #4"). The issue body is rewritten into the
   template and a `## PM: groomed` comment lists the decisions made and the
   follow-ups filed
3. Engineer implements it in a fresh session ("Implement issue #4") on the
   branch `issue-4`, pushes, and comments `## Engineer: implemented`
4. QA tests it in a fresh session ("Test issue #4") and comments
   `## QA: PASS` or `## QA: FAIL`
5. On FAIL, a new engineer session takes the QA comment as input and fixes
   it. Back to step 4. Repeat until PASS
6. On PASS, the orchestrator merges the branch into main, pushes main,
   comments `## Merged` with the commit, and closes the issue as completed

## Orchestrator

The main session is the orchestrator. It starts the three roles as
subagents and does none of the work itself. Start it with
`/goal work through the backlog`. Its rules:

- Never skip grooming
- The engineer does not close issues
- QA does not fix code
- An issue is closed only after a QA PASS, and only by the orchestrator
- Merge one branch at a time: rebase on main, run `npm test` and
  `npm run build` again, merge, push main, close the issue
- Stop when every `mvp` issue is closed. That is the goal's stop condition

## Capturing corrections

When a person corrects an agent during a session, the agent commits its
current work, then: "Based on the corrections I made, find the relevant
documents and update them." The correction then lives in `AGENTS.md`,
`_docs/design-system.md` or `_docs/testing-guidelines.md`.
