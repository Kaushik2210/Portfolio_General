"use client";

import { animate } from "animejs";
import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion/scroll";
import { Tilt } from "../tilt";

export interface Stat {
  label: string;
  value: number;
  note?: string;
}

const fmt = (n: number) => Math.round(n).toLocaleString("en-US");

const TILE = ["bg-accent", "bg-c4", "bg-c3", "bg-c5", "bg-data", "bg-c4"];
const TILT = [
  "md:-rotate-1",
  "md:rotate-1",
  "md:rotate-0",
  "md:-rotate-1",
  "md:rotate-1",
  "md:-rotate-1",
];

function Counter({ stat, i }: { stat: Stat; i: number }) {
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
    <li className={`reveal ${TILT[i % TILT.length]}`}>
      <Tilt
        max={9}
        radius="var(--radius-lg)"
        innerClassName={`text-ink border-ink rounded-[var(--radius-lg)] border-2 p-6 shadow-[6px_6px_0_0_var(--ink)] ${TILE[i % TILE.length]}`}
      >
        <p className="font-display text-[length:var(--text-3xl)] leading-none font-semibold tracking-tight tabular-nums">
          <span ref={num}>{fmt(stat.value)}</span>
        </p>
        <p className="mt-3 text-sm font-medium">{stat.label}</p>
        {stat.note && <p className="font-mono text-xs opacity-70">{stat.note}</p>}
      </Tilt>
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
      {items.map((s, i) => (
        <Counter key={s.label} stat={s} i={i} />
      ))}
    </ul>
  );
}
