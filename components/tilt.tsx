"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/motion/gsap";
import { prefersReducedMotion } from "@/lib/motion/scroll";

/**
 * 3D tilt toward the pointer with a light glare that follows it.
 * Everything is set up on the first hover, so touch devices and reduced-motion
 * users pay nothing at mount time.
 */
export function Tilt({
  children,
  className = "",
  innerClassName = "",
  radius = "var(--radius)",
  max = 7,
}: {
  children: React.ReactNode;
  className?: string;
  /** Classes for the tilting surface itself (use for tiles that own their background). */
  innerClassName?: string;
  radius?: string;
  max?: number;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const glare = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;

    let teardown: (() => void) | undefined;

    const init = (e: PointerEvent) => {
      const card = inner.current;
      const shine = glare.current;
      // Only a real mouse or trackpad tilts; touch pointers never do.
      if (!card || !shine || e.pointerType !== "mouse" || prefersReducedMotion()) return;

      const rx = gsap.quickTo(card, "rotationX", { duration: 0.5, ease: "power3.out" });
      const ry = gsap.quickTo(card, "rotationY", { duration: 0.5, ease: "power3.out" });
      gsap.set(card, { transformPerspective: 900, transformOrigin: "50% 50%" });

      const move = (ev: PointerEvent) => {
        const r = el.getBoundingClientRect();
        const px = (ev.clientX - r.left) / r.width;
        const py = (ev.clientY - r.top) / r.height;
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
      move(e);
      teardown = () => {
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerleave", reset);
        el.removeEventListener("pointerdown", reset);
        gsap.killTweensOf([card, shine]);
      };
    };

    el.addEventListener("pointerenter", init, { once: true });
    return () => {
      el.removeEventListener("pointerenter", init);
      teardown?.();
    };
  }, [max]);

  return (
    <div ref={wrap} className={className}>
      <div ref={inner} className={`relative ${innerClassName}`}>
        {children}
        <div
          ref={glare}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0"
          style={{
            borderRadius: radius,
            background:
              "radial-gradient(60% 60% at 50% 50%, color-mix(in oklab, var(--fg) 14%, transparent), transparent 70%)",
          }}
        />
      </div>
    </div>
  );
}
