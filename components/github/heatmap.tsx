"use client";

import { animate, stagger } from "animejs";
import { useEffect, useMemo, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion/scroll";
import type { ContributionDay } from "@/lib/types";

const CELL = 11;
const GAP = 3;
const LEFT = 28;
const TOP = 18;

const LEVEL_FILL = [
  "var(--surface-2)",
  "color-mix(in oklab, var(--accent) 28%, var(--surface-2))",
  "color-mix(in oklab, var(--accent) 50%, var(--surface-2))",
  "color-mix(in oklab, var(--accent) 75%, var(--surface-2))",
  "var(--accent)",
] as const;

const fmtDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

/** Quartile thresholds over non-zero days: counts are heavily skewed, so linear buckets wash out. */
function levelFn(days: ContributionDay[]) {
  const nz = days
    .map((d) => d.count)
    .filter(Boolean)
    .sort((a, b) => a - b);
  const q = (p: number) => nz[Math.min(nz.length - 1, Math.floor(nz.length * p))] ?? 1;
  const [a, b, c] = [q(0.25), q(0.5), q(0.75)];
  return (n: number) => (n === 0 ? 0 : n <= a ? 1 : n <= b ? 2 : n <= c ? 3 : 4);
}

export function Heatmap({ days, total }: { days: ContributionDay[]; total: number }) {
  const svg = useRef<SVGSVGElement>(null);

  const { weeks, months, level, busiest } = useMemo(() => {
    const lvl = levelFn(days);
    const w: ContributionDay[][] = [];
    for (let i = 0; i < days.length; i += 7) w.push(days.slice(i, i + 7));
    const m: { x: number; label: string }[] = [];
    let last = -1;
    w.forEach((week, i) => {
      const mo = new Date(`${week[0].date}T00:00:00Z`).getUTCMonth();
      if (mo !== last && i < w.length - 2) {
        m.push({
          x: LEFT + i * (CELL + GAP),
          label: new Date(`${week[0].date}T00:00:00Z`).toLocaleString("en-US", {
            month: "short",
            timeZone: "UTC",
          }),
        });
        last = mo;
      }
    });
    const top = days.reduce((a, b) => (b.count > a.count ? b : a), days[0]);
    return { weeks: w, months: m, level: lvl, busiest: top };
  }, [days]);

  useEffect(() => {
    const el = svg.current;
    if (!el || prefersReducedMotion()) return;
    const cells = el.querySelectorAll<SVGRectElement>("rect[data-cell]");
    cells.forEach((c) => (c.style.opacity = "0"));

    let anim: ReturnType<typeof animate> | null = null;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        anim = animate(cells, {
          opacity: [0, 1],
          duration: 500,
          ease: "outQuad",
          delay: stagger(6, { grid: [weeks.length, 7], axis: "x" }),
        });
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      anim?.revert();
      cells.forEach((c) => (c.style.opacity = ""));
    };
  }, [weeks.length]);

  const width = LEFT + weeks.length * (CELL + GAP);
  const height = TOP + 7 * (CELL + GAP);

  return (
    <figure>
      <div className="overflow-x-auto pb-2">
        <svg
          ref={svg}
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={`${total.toLocaleString("en-US")} contributions in the past year. Busiest day: ${fmtDate(busiest.date)} with ${busiest.count}.`}
          className="h-auto w-full min-w-[720px]"
        >
          {months.map((m) => (
            <text
              key={m.x}
              x={m.x}
              y={10}
              fontSize="9"
              fill="var(--fg-muted)"
              className="font-mono"
            >
              {m.label}
            </text>
          ))}
          {["Mon", "Wed", "Fri"].map((d, i) => (
            <text
              key={d}
              x={0}
              y={TOP + (i * 2 + 1) * (CELL + GAP) + CELL - 2}
              fontSize="9"
              fill="var(--fg-muted)"
              className="font-mono"
            >
              {d}
            </text>
          ))}
          {weeks.map((week, wi) =>
            week.map((d, di) => (
              <rect
                key={d.date}
                data-cell
                x={LEFT + wi * (CELL + GAP)}
                y={TOP + di * (CELL + GAP)}
                width={CELL}
                height={CELL}
                rx={2}
                fill={LEVEL_FILL[level(d.count)]}
              >
                <title>{`${d.count} contribution${d.count === 1 ? "" : "s"} on ${fmtDate(d.date)}`}</title>
              </rect>
            )),
          )}
        </svg>
      </div>
      <figcaption className="text-fg-muted mt-3 flex items-center gap-2 font-mono text-xs">
        Less
        {LEVEL_FILL.map((f, i) => (
          <span
            key={i}
            aria-hidden="true"
            className="size-3 rounded-sm"
            style={{ background: f }}
          />
        ))}
        More
      </figcaption>
    </figure>
  );
}
