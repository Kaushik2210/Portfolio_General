import type { RefObject } from "react";
import { gsap, ScrollTrigger, useGSAP } from "./gsap";
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
      ScrollTrigger.batch(".reveal", {
        start: "top 88%",
        once: true,
        onEnter: (els) =>
          gsap.fromTo(
            els,
            { y: shift.reveal, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: dur.slow,
              ease: ease.out,
              stagger: 0.1,
              overwrite: true,
            },
          ),
      });
    },
    { scope },
  );
}
