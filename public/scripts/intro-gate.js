/* Runs before first paint: skip the opening sequence for returning visitors and reduced motion. */
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
