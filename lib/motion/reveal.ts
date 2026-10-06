import type { RefObject } from "react";
import { gsap, useGSAP } from "./gsap";
import { prefersReducedMotion } from "./scroll";
import { dur, ease, shift } from "./tokens";

/**
 * Fades `.reveal` descendants up as they enter the viewport, batched so a row
 * of cards staggers. Reduced motion: shown immediately, no transform.
 */
export function useScrollReveal(scope: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      if (prefersReducedMotion()) {
        gsap.set(".reveal", { opacity: 1 });
        return;
      }
      // IntersectionObserver rather than ScrollTrigger: immune to pin and scale maths, and an
      // element already passed (a jump, a fling) counts as seen, so text is never left hidden.
      const vh = () => window.innerHeight;
      const io = new IntersectionObserver(
        (entries) => {
          const hit = entries
            .filter((e) => e.isIntersecting || e.boundingClientRect.top < vh())
            .map((e) => e.target);
          if (hit.length === 0) return;
          hit.forEach((t) => io.unobserve(t));
          gsap.fromTo(
            hit,
            { y: shift.reveal * 1.5, opacity: 0, filter: "blur(6px)" },
            {
              y: 0,
              opacity: 1,
              filter: "blur(0px)",
              clearProps: "filter",
              duration: dur.slow,
              ease: ease.out,
              stagger: 0.08,
              overwrite: true,
            },
          );
        },
        { rootMargin: "0px 0px -6% 0px" },
      );
      // Lazily mounted blocks add `.reveal` nodes later; watch for them too.
      const seen = new WeakSet<Element>();
      const scan = () =>
        scope.current?.querySelectorAll<HTMLElement>(".reveal").forEach((el) => {
          if (seen.has(el)) return;
          seen.add(el);
          io.observe(el);
        });
      scan();
      const mo = scope.current ? new MutationObserver(scan) : null;
      if (scope.current) mo?.observe(scope.current, { childList: true, subtree: true });
      return () => {
        mo?.disconnect();
        io.disconnect();
      };
    },
    { scope },
  );
}
