/* Runs in <head> before first paint and before React hydrates. */

/* 1. Hosts can inject markup into <head> that React did not render: Netlify adds a
      promotional HTML comment (and sometimes hosting <meta> tags) on *.netlify.app.
      React treats such nodes as a hydration mismatch (error #418) and re-renders the
      whole page on the client, so remove them before hydration starts. */
try {
  for (let node = document.head.firstChild; node; ) {
    const next = node.nextSibling;
    if (node.nodeType === Node.COMMENT_NODE && /netlify/i.test(node.data)) {
      const before = node.previousSibling;
      if (before && before.nodeType === Node.TEXT_NODE && !before.data.trim()) before.remove();
      node.remove();
    }
    node = next;
  }
  document.head
    .querySelectorAll('meta[name="hosting-provider"], meta[name="netlify-deploy"]')
    .forEach((meta) => meta.remove());
} catch {
  /* Nothing to clean up. */
}

/* 2. Skip the opening sequence for returning visitors and reduced motion. */
try {
  if (
    sessionStorage.getItem('azure:intro') === 'seen' ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    document.documentElement.dataset.intro = 'seen';
  }
} catch {
  document.documentElement.dataset.intro = 'seen';
}
