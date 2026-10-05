"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/motion/gsap";
import { prefersReducedMotion } from "@/lib/motion/scroll";

/**
 * 3D tilt toward the pointer with a light glare that follows it.
 * Mouse and trackpad only; touch and reduced-motion get a plain wrapper.
 */
export function Tilt({
  children,
  className = "",
  max = 7,
}: {
  children: React.ReactNode;
  className?: string;
  max?: number;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const glare = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = wrap.current;
      const card = inner.current;
      const shine = glare.current;
      if (!el || !card || !shine || prefersReducedMotion()) return;
      if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

      const rx = gsap.quickTo(card, "rotationX", { duration: 0.5, ease: "power3.out" });
      const ry = gsap.quickTo(card, "rotationY", { duration: 0.5, ease: "power3.out" });
      gsap.set(card, { transformPerspective: 900, transformOrigin: "50% 50%" });

      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        ry((px - 0.5) * 2 * max);
        rx(-(py - 0.5) * 2 * max);
        gsap.to(shine, {
          opacity: 1,
          xPercent: (px - 0.5) * 60,
          yPercent: (py - 0.5) * 60,
          duration: 0.3,
          overwrite: "auto",
        });
      };
      const reset = () => {
        rx(0);
        ry(0);
        gsap.to(shine, { opacity: 0, duration: 0.4, overwrite: "auto" });
      };

      el.addEventListener("pointermove", move);
      el.addEventListener("pointerleave", reset);
      // Flatten before a click so the shared-element morph starts from a level card.
      el.addEventListener("pointerdown", reset);
      return () => {
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerleave", reset);
        el.removeEventListener("pointerdown", reset);
      };
    },
    { scope: wrap },
  );

  return (
    <div ref={wrap} className={className}>
      <div ref={inner} className="relative will-change-transform">
        {children}
        <div
          ref={glare}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[var(--radius)] opacity-0"
          style={{
            background:
              "radial-gradient(60% 60% at 50% 50%, color-mix(in oklab, var(--fg) 14%, transparent), transparent 70%)",
          }}
        />
      </div>
    </div>
  );
}
