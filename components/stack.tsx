"use client";

import { gsap, ScrollTrigger, useGSAP } from "@/lib/motion/gsap";

/**
 * Curtain stacking (desktop only). Every `[data-stack]` section pins at its
 * bottom edge and scales back while the next one slides over it, so the page
 * reads as a deck of coloured sheets being laid down.
 */
export function SectionStack() {
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      const sections = gsap.utils.toArray<HTMLElement>("[data-stack]");

      sections.forEach((sec, i) => {
        sec.style.position = "relative";
        sec.style.zIndex = String(i + 1);
        if (i === sections.length - 1) return;

        // A section taller than the screen pins once its bottom edge arrives.
        const start = () =>
          sec.offsetHeight > window.innerHeight ? "bottom bottom" : "top top";
        const end = () => `+=${window.innerHeight}`;

        ScrollTrigger.create({
          trigger: sec,
          start,
          end,
          pin: true,
          pinSpacing: false,
          invalidateOnRefresh: true,
        });
        gsap.to(sec, {
          scale: 0.93,
          transformOrigin: "50% 100%",
          ease: "none",
          scrollTrigger: {
            trigger: sec,
            start,
            end,
            scrub: true,
            invalidateOnRefresh: true,
          },
        });
      });

      // Fonts and images move section heights; pins must be measured again after.
      void document.fonts?.ready.then(() => ScrollTrigger.refresh());

      return () => {
        sections.forEach((s) => {
          s.style.position = "";
          s.style.zIndex = "";
        });
      };
    });
  });

  return null;
}
