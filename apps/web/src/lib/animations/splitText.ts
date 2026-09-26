/**
 * Server-safe word splitting: TextReveal renders each word in a clipping
 * mask so GSAP can slide it up. Splitting at render time (rather than
 * mutating the DOM after hydration) keeps markup identical on server and
 * client and leaves the real text in the HTML for SEO.
 */
export function splitWords(text: string): string[] {
  return text.split(/\s+/).filter(Boolean);
}
