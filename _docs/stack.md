# Stack

Chosen from three options (vanilla JS, React, Vue - see `chat-brainstorm.md`).

- HTML, CSS and JavaScript as ES modules. No framework, no runtime
  dependencies
- Vite - dev server and production build into `dist/`
- Vitest + jsdom - unit tests for the logic and DOM tests for the screens
- `localStorage` - the only storage
- GitHub Pages - hosting, deployed by a GitHub Actions workflow

Why: the project is for the Web Front Fundamentals course, so the code should
be plain DOM, events, forms and storage that can be reviewed line by line.
Node is a build-time tool only; the shipped app is static files.
