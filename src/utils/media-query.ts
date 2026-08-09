export function matchesMediaQuery(query: string) {
  return window.matchMedia(query).matches;
}

export function subscribeToMediaQuery(query: string, onChange: () => void) {
  const mediaQuery = window.matchMedia(query);
  mediaQuery.addEventListener("change", onChange);

  return () => mediaQuery.removeEventListener("change", onChange);
}
