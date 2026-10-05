"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/motion/gsap";
import { ease } from "@/lib/motion/tokens";
import { prefersReducedMotion } from "@/lib/motion/scroll";

const INTERACTIVE = "a, button, [role='button'], input, textarea, select, [data-cursor]";

/**
 * Desktop-only follower ring. The native cursor stays visible: hiding it harms
 * low-vision users and text selection, and the ring is decoration.
 */
export function Cursor() {
  const ring = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const ringEl = ring.current;
    const dotEl = dot.current;
    if (!fine || prefersReducedMotion() || !ringEl || !dotEl) return;

    const ctx = gsap.context(() => {
      gsap.set([ringEl, dotEl], { xPercent: -50, yPercent: -50, autoAlpha: 0 });
      const rx = gsap.quickTo(ringEl, "x", { duration: 0.5, ease: ease.out });
      const ry = gsap.quickTo(ringEl, "y", { duration: 0.5, ease: ease.out });
      const dx = gsap.quickTo(dotEl, "x", { duration: 0.1, ease: "power3.out" });
      const dy = gsap.quickTo(dotEl, "y", { duration: 0.1, ease: "power3.out" });

      const move = (e: PointerEvent) => {
        gsap.to([ringEl, dotEl], { autoAlpha: 1, duration: 0.2, overwrite: "auto" });
        rx(e.clientX);
        ry(e.clientY);
        dx(e.clientX);
        dy(e.clientY);
      };
      const over = (e: PointerEvent) => {
        const hit = (e.target as Element | null)?.closest(INTERACTIVE);
        gsap.to(ringEl, {
          scale: hit ? 1.9 : 1,
          borderColor: hit ? "var(--accent)" : "var(--fg-muted)",
          duration: 0.3,
          ease: ease.out,
          overwrite: "auto",
        });
      };
      const leave = () => gsap.to([ringEl, dotEl], { autoAlpha: 0, duration: 0.2 });

      window.addEventListener("pointermove", move, { passive: true });
      window.addEventListener("pointerover", over, { passive: true });
      document.documentElement.addEventListener("pointerleave", leave);
      return () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerover", over);
        document.documentElement.removeEventListener("pointerleave", leave);
      };
    });
    return () => ctx.revert();
  }, []);

  return (
    <>
      <div
        ref={ring}
        aria-hidden="true"
        className="border-fg-muted pointer-events-none fixed top-0 left-0 z-[95] size-9 rounded-full border opacity-0 max-md:hidden"
      />
      <div
        ref={dot}
        aria-hidden="true"
        className="bg-accent pointer-events-none fixed top-0 left-0 z-[95] size-1.5 rounded-full opacity-0 max-md:hidden"
      />
    </>
  );
}
