import type Lenis from "lenis";

let instance: Lenis | null = null;

export const setLenis = (l: Lenis | null) => {
  instance = l;
};

export const getLenis = () => instance;

export const prefersReducedMotion = (): boolean =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Smooth-scroll to a selector/element/offset, falling back to native scrolling. */
export function scrollTo(target: string | HTMLElement | number, offset = 0) {
  if (instance) {
    instance.scrollTo(target, { offset, duration: 1.2 });
    return;
  }
  const el = typeof target === "string" ? document.querySelector(target) : target;
  if (typeof el === "number") window.scrollTo({ top: el + offset });
  else el?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" });
}
