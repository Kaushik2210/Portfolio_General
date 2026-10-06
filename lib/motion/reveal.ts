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
      // Phones: one IntersectionObserver, no ScrollTrigger measuring at hydration.
      if (window.innerWidth < 1024) {
        const io = new IntersectionObserver(
          (entries) => {
            const hit = entries.filter((e) => e.isIntersecting).map((e) => e.target);
            if (hit.length === 0) return;
            hit.forEach((t) => io.unobserve(t));
            gsap.fromTo(
              hit,
              { y: shift.reveal, opacity: 0 },
              {
                y: 0,
                opacity: 1,
                duration: dur.slow,
                ease: ease.out,
                stagger: 0.08,
                overwrite: true,
              },
            );
          },
          { rootMargin: "0px 0px -6% 0px" },
        );
        gsap.utils.toArray<HTMLElement>(".reveal").forEach((el) => io.observe(el));
        return () => io.disconnect();
      }
      ScrollTrigger.batch(".reveal", {
        start: "top 92%",
        once: true,
        onEnter: (els) =>
          gsap.fromTo(
            els,
            { y: shift.reveal * 1.5, opacity: 0, filter: "blur(6px)" },
            {
              y: 0,
              opacity: 1,
              filter: "blur(0px)",
              clearProps: "filter",
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
