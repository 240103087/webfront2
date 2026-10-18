# Bolis

Bolis (from Kazakh "бөлісу", to share) splits shared expenses on trips and
events. Add who paid for what, and Bolis shows each person's balance and the
shortest list of transfers that settles everyone up. Everything stays in your
browser.

Built for the Web Front Fundamentals course with the AI-native workflow:
specification first (`_docs/plan.md`, brainstormed in `chat-brainstorm.md`),
context for agents (`AGENTS.md`), and every task as a GitHub issue that goes
through PM grooming, implementation and QA (`_docs/process.md`).

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # the test suite
npm run build    # production build into dist/
```

Plain HTML, CSS and JavaScript. Vite is the dev server and bundler, Vitest +
jsdom run the tests. No runtime dependencies.
