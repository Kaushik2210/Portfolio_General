"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/motion/gsap";
import { prefersReducedMotion } from "@/lib/motion/scroll";

/**
 * Giant type that travels sideways as you scroll past it. The movement is
 * tied directly to scroll position (scrub), so it is impossible to miss.
 */
export function ScrubBand({
  rows,
}: {
  /** Each row is [text, direction]; direction 1 moves left, -1 moves right. */
  rows: [string, 1 | -1][];
}) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.utils.toArray<HTMLElement>("[data-row]").forEach((row) => {
        const dir = Number(row.dataset.dir);
        gsap.fromTo(
          row,
          { xPercent: dir === 1 ? 12 : -42 },
          {
            xPercent: dir === 1 ? -42 : 12,
            ease: "none",
            scrollTrigger: {
              trigger: root.current,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.8,
            },
          },
        );
      });
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      aria-hidden="true"
      data-world="ink"
      className="bg-bg relative overflow-hidden py-[clamp(24px,5vw,72px)] select-none"
    >
      {rows.map(([text, dir], i) => (
        <p
          key={text}
          data-row
          data-dir={dir}
          className={`font-display w-max text-[clamp(5rem,20vw,19rem)] leading-[0.85] font-semibold tracking-tighter whitespace-nowrap ${
            i % 2 === 0 ? "text-fg" : "text-outline"
          }`}
        >
          {text}
        </p>
      ))}
    </div>
  );
}
