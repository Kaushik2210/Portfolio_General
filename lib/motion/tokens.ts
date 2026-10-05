/** Motion language. Mirrors design/tokens.md and the CSS variables in globals.css. */
export const ease = {
  out: "expo.out",
  inOut: "power3.inOut",
  snap: "back.out(1.7)",
} as const;

/** Seconds (GSAP). */
export const dur = {
  fast: 0.15,
  base: 0.4,
  slow: 0.8,
  hero: 1.2,
} as const;

export const stagger = {
  char: 0.04,
  word: 0.08,
  card: 0.1,
  /** Total stagger spread never exceeds this. */
  maxTotal: 0.6,
} as const;

/** Distance in px for reveal translations. */
export const shift = { reveal: 24, hero: 60 } as const;

/** Stagger amount that respects the max total for n items. */
export const staggerFor = (n: number, each: number): number =>
  Math.min(each, stagger.maxTotal / Math.max(1, n - 1));
