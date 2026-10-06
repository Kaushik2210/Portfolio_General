"use client";

import { gsap, ScrollTrigger, useGSAP } from "@/lib/motion/gsap";

/**
 * Curtain stacking (desktop only). Every `[data-stack]` section pins at its bottom
 * edge and scales back while the next one slides over it, so the page reads as a
 * deck of coloured sheets being laid down.
 *
 * Each pinned sheet also gets a dwell: the next sheet is held half a screen further
 * down, so the sheet you are on stays fully on screen, still, for a moment before
 * the next one starts to cover it. Without that, text is buried the instant it lands.
 */
export function SectionStack() {
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      const sections = gsap.utils.toArray<HTMLElement>("[data-stack]");
      const dwell = () => Math.round(window.innerHeight * 0.55);

      // Real spacer elements between sheets (a margin would be moved onto the pin wrapper).
      const gaps: HTMLElement[] = [];
      sections.forEach((sec, i) => {
        if (i === 0) return;
        const gap = document.createElement("div");
        gap.setAttribute("aria-hidden", "true");
        gap.dataset.stackGap = "";
        sec.before(gap);
        gaps.push(gap);
      });
      const setGaps = () => gaps.forEach((g) => (g.style.height = `${dwell()}px`));
      setGaps();

      sections.forEach((sec, i) => {
        sec.style.position = "relative";
        sec.style.zIndex = String(i + 1);
        const next = sections[i + 1];
        if (!next) return;

        // A section taller than the screen pins once its bottom edge arrives.
        const start = () =>
          sec.offsetHeight > window.innerHeight ? "bottom bottom" : "top top";

        // Held until the next sheet has fully covered it (dwell + one screen).
        ScrollTrigger.create({
          trigger: sec,
          start,
          end: () => `+=${dwell() + window.innerHeight}`,
          pin: true,
          pinSpacing: false,
          invalidateOnRefresh: true,
          onRefreshInit: setGaps,
        });

        // It scales back only while the next sheet is sliding over it.
        gsap.to(sec, {
          scale: 0.93,
          transformOrigin: "50% 100%",
          ease: "none",
          scrollTrigger: {
            trigger: next,
            start: "top bottom",
            end: "top top",
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
        gaps.forEach((g) => g.remove());
      };
    });
  });

  return null;
}
