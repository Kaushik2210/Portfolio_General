"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/motion/gsap";
import { prefersReducedMotion } from "@/lib/motion/scroll";

/** Two soft colour fields that travel across the page as you scroll. Desktop only. */
export function Ambient() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion() || !window.matchMedia("(min-width: 768px)").matches)
        return;
      const trigger = {
        trigger: document.documentElement,
        start: "top top",
        end: "bottom bottom",
        scrub: 1.2,
      };
      gsap.fromTo(
        ".amb-a",
        { yPercent: -10, xPercent: 0 },
        { yPercent: 70, xPercent: 25, ease: "none", scrollTrigger: trigger },
      );
      gsap.fromTo(
        ".amb-b",
        { yPercent: 80, xPercent: 10 },
        { yPercent: -20, xPercent: -30, ease: "none", scrollTrigger: trigger },
      );
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 hidden overflow-hidden md:block"
    >
      <div
        className="amb-a absolute -top-[20vh] -left-[10vw] size-[70vw] will-change-transform"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in oklab, var(--accent) 20%, transparent), transparent)",
        }}
      />
      <div
        className="amb-c absolute top-[10vh] left-[30vw] size-[55vw] will-change-transform"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in oklab, var(--c3) 17%, transparent), transparent)",
        }}
      />
      <div
        className="amb-b absolute top-[30vh] -right-[15vw] size-[60vw] will-change-transform"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in oklab, var(--data) 15%, transparent), transparent)",
        }}
      />
    </div>
  );
}
