"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/motion/gsap";
import { prefersReducedMotion } from "@/lib/motion/scroll";

interface Props {
  words: string[];
  /** 1 scrolls left, -1 scrolls right. */
  direction?: 1 | -1;
  /** Colour block. Omit for a plain bordered band. */
  tone?: "accent" | "lime" | "violet" | "pink";
  /** Static tilt in degrees. */
  tilt?: number;
}

const TONE: Record<NonNullable<Props["tone"]>, string> = {
  accent: "bg-accent text-ink",
  lime: "bg-c4 text-ink",
  violet: "bg-c3 text-ink",
  pink: "bg-c5 text-ink",
};

/**
 * Kinetic text band. It drifts on its own, speeds up with scroll velocity,
 * reverses with scroll direction and leans into the motion (skew).
 */
export function Marquee({ words, direction = 1, tone, tilt = 0 }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = track.current;
      // Phones get a static band: three endless tweens are real main-thread cost there.
      if (
        !el ||
        prefersReducedMotion() ||
        !window.matchMedia("(min-width: 768px)").matches
      )
        return;

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
        // Only run the endless drift while the band is on screen.
        onToggle: (self) => drift.paused(!self.isActive),
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
      <span
        className={
          tone
            ? i % 2 === 0
              ? ""
              : "text-outline-ink"
            : i % 2 === 0
              ? "text-fg"
              : "text-outline"
        }
      >
        {w}
      </span>
      <span aria-hidden="true" className={tone ? "" : "text-accent"}>
        ✦
      </span>
    </span>
  ));

  return (
    <div
      ref={root}
      aria-hidden="true"
      className={`overflow-hidden border-y py-[clamp(16px,3vw,32px)] select-none ${
        tone ? `${TONE[tone]} border-ink` : "border-line"
      }`}
      style={tilt ? { transform: `rotate(${tilt}deg)` } : undefined}
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
