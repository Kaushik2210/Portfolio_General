"use client";

import { animate } from "animejs";
import { useEffect } from "react";
import { prefersReducedMotion } from "@/lib/motion/scroll";

/** Click ripple for any element marked `data-ripple` (it must be `relative overflow-hidden`). */
export function Ripple() {
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (prefersReducedMotion()) return;
      const host = (e.target as Element | null)?.closest<HTMLElement>("[data-ripple]");
      if (!host) return;
      const r = host.getBoundingClientRect();
      const size = Math.max(r.width, r.height) * 2.2;
      const dot = document.createElement("span");
      Object.assign(dot.style, {
        position: "absolute",
        left: `${e.clientX - r.left - size / 2}px`,
        top: `${e.clientY - r.top - size / 2}px`,
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        background: "currentColor",
        opacity: "0.28",
        pointerEvents: "none",
      });
      host.appendChild(dot);
      animate(dot, {
        scale: [0, 1],
        opacity: [0.28, 0],
        duration: 650,
        ease: "outExpo",
        onComplete: () => dot.remove(),
      });
    };
    document.addEventListener("pointerdown", onDown, { passive: true });
    return () => document.removeEventListener("pointerdown", onDown);
  }, []);

  return null;
}
