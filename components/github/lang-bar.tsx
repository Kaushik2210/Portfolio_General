"use client";

import { animate, stagger } from "animejs";
import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion/scroll";

interface Lang {
  name: string;
  share: number;
}

/** Cycles ember -> data -> neutrals so adjacent segments stay distinguishable. */
const FILLS = [
  "var(--accent)",
  "var(--data)",
  "color-mix(in oklab, var(--accent) 55%, var(--fg-muted))",
  "color-mix(in oklab, var(--data) 55%, var(--fg-muted))",
  "var(--fg-muted)",
  "var(--line)",
];

export function LangBar({ languages }: { languages: Lang[] }) {
  const bar = useRef<HTMLDivElement>(null);
  const total = languages.reduce((a, l) => a + l.share, 0) || 1;

  useEffect(() => {
    const el = bar.current;
    if (!el || prefersReducedMotion()) return;
    const segs = el.querySelectorAll<HTMLElement>("[data-seg]");
    segs.forEach((s) => (s.style.transform = "scaleX(0)"));

    let anim: ReturnType<typeof animate> | null = null;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        anim = animate(segs, {
          scaleX: [0, 1],
          duration: 900,
          delay: stagger(90),
          ease: "outExpo",
        });
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      anim?.revert();
      segs.forEach((s) => (s.style.transform = ""));
    };
  }, []);

  return (
    <div>
      <div
        ref={bar}
        role="img"
        aria-label={`Language share: ${languages.map((l) => `${l.name} ${Math.round((l.share / total) * 100)}%`).join(", ")}`}
        className="flex h-3 w-full gap-0.5 overflow-hidden rounded-full"
      >
        {languages.map((l, i) => (
          <div
            key={l.name}
            data-seg
            className="origin-left first:rounded-l-full last:rounded-r-full"
            style={{
              flexGrow: l.share,
              flexBasis: 0,
              background: FILLS[i % FILLS.length],
            }}
          />
        ))}
      </div>
      <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
        {languages.map((l, i) => (
          <li key={l.name} className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="size-2.5 rounded-full"
              style={{ background: FILLS[i % FILLS.length] }}
            />
            {l.name}
            <span className="text-fg-muted ml-auto font-mono text-xs tabular-nums">
              {Math.round((l.share / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
