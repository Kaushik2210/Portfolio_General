"use client";

import { animate } from "animejs";
import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion/scroll";

export interface Stat {
  label: string;
  value: number;
  note?: string;
}

const fmt = (n: number) => Math.round(n).toLocaleString("en-US");

function Counter({ stat }: { stat: Stat }) {
  const num = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = num.current;
    if (!el || prefersReducedMotion()) return;

    el.textContent = fmt(0);
    const state = { v: 0 };
    let anim: ReturnType<typeof animate> | null = null;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        anim = animate(state, {
          v: stat.value,
          duration: 1600,
          ease: "outExpo",
          onUpdate: () => {
            el.textContent = fmt(state.v);
          },
        });
      },
      { threshold: 0.6 },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      anim?.revert();
      el.textContent = fmt(stat.value);
    };
  }, [stat.value]);

  return (
    <li className="reveal border-line border-t pt-5">
      <p className="font-display text-[length:var(--text-3xl)] leading-none font-semibold tracking-tight tabular-nums">
        <span ref={num}>{fmt(stat.value)}</span>
      </p>
      <p className="text-fg mt-3 text-sm">{stat.label}</p>
      {stat.note && <p className="text-fg-muted font-mono text-xs">{stat.note}</p>}
    </li>
  );
}

export function Stats({ items }: { items: Stat[] }) {
  if (items.length === 0) return null;
  return (
    <ul
      aria-label="Key numbers"
      className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4"
    >
      {items.map((s) => (
        <Counter key={s.label} stat={s} />
      ))}
    </ul>
  );
}
