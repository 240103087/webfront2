/** Render the app into `root`. */
export function mountApp(root) {
  const heading = document.createElement('h1');
  heading.textContent = 'Bolis';
  root.replaceChildren(heading);
}
