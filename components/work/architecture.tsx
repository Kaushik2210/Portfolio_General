"use client";

import { animate, stagger } from "animejs";
import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion/scroll";

/**
 * Left-to-right system flow. Rendered as an ordered list so it reads as plain
 * text for screen readers and crawlers; anime.js staggers the nodes in.
 */
export function Architecture({ nodes }: { nodes: string[] }) {
  const list = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const el = list.current;
    if (!el || prefersReducedMotion()) return;

    const parts = el.querySelectorAll<HTMLElement>("[data-node], [data-link]");
    parts.forEach((p) => (p.style.opacity = "0"));

    let anim: ReturnType<typeof animate> | null = null;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        anim = animate(parts, {
          opacity: [0, 1],
          translateY: [16, 0],
          duration: 700,
          delay: stagger(110),
          ease: "outExpo",
        });
      },
      { threshold: 0.3 },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      anim?.revert();
      parts.forEach((p) => (p.style.opacity = ""));
    };
  }, [nodes]);

  return (
    <ol
      ref={list}
      aria-label="System architecture, in order"
      className="flex flex-col items-stretch gap-3 lg:flex-row lg:items-center lg:gap-0"
    >
      {nodes.map((n, i) => (
        <li key={n} className="contents">
          <div
            data-node
            className="border-line bg-surface flex min-h-20 flex-1 items-center rounded-[var(--radius)] border px-5 py-4"
          >
            <span className="text-accent mr-3 font-mono text-xs tabular-nums">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="text-sm leading-snug">{n}</span>
          </div>
          {i < nodes.length - 1 && (
            <span
              data-link
              aria-hidden="true"
              className="bg-accent mx-auto block h-6 w-px lg:mx-0 lg:h-px lg:w-8"
            />
          )}
        </li>
      ))}
    </ol>
  );
}
