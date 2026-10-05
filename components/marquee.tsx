"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/motion/gsap";
import { prefersReducedMotion } from "@/lib/motion/scroll";

interface Props {
  words: string[];
  /** 1 scrolls left, -1 scrolls right. */
  direction?: 1 | -1;
}

/**
 * Kinetic text band. It drifts on its own, speeds up with scroll velocity,
 * reverses with scroll direction and leans into the motion (skew).
 */
export function Marquee({ words, direction = 1 }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = track.current;
      if (!el || prefersReducedMotion()) return;

      const drift = gsap.to(el, {
        xPercent: direction === 1 ? -50 : 0,
        startAt: { xPercent: direction === 1 ? 0 : -50 },
        duration: 38,
        ease: "none",
        repeat: -1,
      });
      const skew = gsap.quickTo(el, "skewX", { duration: 0.4, ease: "power3.out" });

      ScrollTrigger.create({
        trigger: root.current,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          const v = self.getVelocity();
          const push = 1 + Math.min(Math.abs(v) / 250, 7);
          drift.timeScale(self.direction * push);
          skew(gsap.utils.clamp(-14, 14, -v / 220));
          // Ease back to a gentle drift once scrolling stops.
          gsap.to(drift, { timeScale: self.direction, duration: 1.2, overwrite: true });
          skew(0);
        },
      });
    },
    { scope: root, dependencies: [direction] },
  );

  const run = words.map((w, i) => (
    <span key={`${w}-${i}`} className="flex items-center gap-[0.6em] pr-[0.6em]">
      <span className={i % 2 === 0 ? "text-fg" : "text-outline"}>{w}</span>
      <span aria-hidden="true" className="text-accent">
        ✦
      </span>
    </span>
  ));

  return (
    <div
      ref={root}
      aria-hidden="true"
      className="border-line overflow-hidden border-y py-[clamp(16px,3vw,32px)] select-none"
    >
      <div
        ref={track}
        className="font-display flex w-max text-[clamp(2.5rem,8vw,7rem)] leading-none font-semibold tracking-tighter whitespace-nowrap will-change-transform"
      >
        <div className="flex">{run}</div>
        <div className="flex">{run}</div>
      </div>
    </div>
  );
}
