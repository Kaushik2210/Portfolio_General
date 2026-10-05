"use client";

import { animate, stagger } from "animejs";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ROLE_COPY, ROLE_ORDER } from "@/lib/copy";
import { gsap, useGSAP } from "@/lib/motion/gsap";
import { prefersReducedMotion } from "@/lib/motion/scroll";
import { dur, ease } from "@/lib/motion/tokens";
import { useRole } from "@/lib/prefs";
import { LazyMount } from "../lazy-mount";
import { VIEW, type PlacedSkill, type SkillEdge } from "@/lib/skills-layout";
import type { Role } from "@/lib/types";

interface Props {
  skills: PlacedSkill[];
  edges: SkillEdge[];
  titles: Record<string, string>;
}

const TINT: Record<Role, string> = {
  sde: "var(--accent)",
  data: "var(--data)",
  ai: "color-mix(in oklab, var(--accent) 50%, var(--data))",
};

const ANCHOR_LABEL: Record<Role, [number, number]> = {
  sde: [215, 70],
  data: [590, 62],
  ai: [400, 486],
};

interface GraphProps {
  skills: PlacedSkill[];
  edges: SkillEdge[];
  byName: Map<string, PlacedSkill>;
  role: Role;
  active: string | null;
  opacityOf: (s: PlacedSkill) => number;
  setHover: (n: string | null) => void;
  setLocked: React.Dispatch<React.SetStateAction<string | null>>;
}

/** The decorative SVG. Mounted lazily (and never on phones, where it is hidden). */
function Graph({
  skills,
  edges,
  byName,
  role,
  active,
  opacityOf,
  setHover,
  setLocked,
}: GraphProps) {
  const svg = useRef<SVGSVGElement>(null);

  // Nodes pop in once when the graph scrolls into view.
  useGSAP(
    () => {
      if (prefersReducedMotion() || !svg.current) return;
      gsap.from(".skill-enter", {
        scale: 0,
        opacity: 0,
        duration: dur.slow,
        ease: ease.out,
        stagger: { each: 0.03, from: "random" },
        scrollTrigger: { trigger: svg.current, start: "top 95%", once: true },
      });
    },
    { scope: svg },
  );

  return (
    <svg
      ref={svg}
      viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
      aria-hidden="true"
      className="h-auto w-full"
    >
      {ROLE_ORDER.map((r) => (
        <text
          key={r}
          x={ANCHOR_LABEL[r][0]}
          y={ANCHOR_LABEL[r][1]}
          textAnchor="middle"
          fill={TINT[r]}
          className="font-mono"
          fontSize="13"
          letterSpacing="4"
          opacity={r === role ? 0.9 : 0.4}
          style={{ transition: "opacity var(--dur-base) var(--ease-out)" }}
        >
          {ROLE_COPY[r].label.toUpperCase()}
        </text>
      ))}

      <g>
        {edges.map((e) => {
          const a = byName.get(e.a)!;
          const b = byName.get(e.b)!;
          const on = !!active && (e.a === active || e.b === active);
          return (
            <line
              key={`${e.a}|${e.b}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={on ? "var(--accent)" : "var(--fg-muted)"}
              strokeWidth={on ? 1.4 : 0.6}
              opacity={on ? 0.85 : active ? 0 : 0.14}
              style={{ transition: "opacity var(--dur-base) var(--ease-out)" }}
            />
          );
        })}
      </g>

      {skills.map((s) => (
        <g
          key={s.name}
          className="skill-enter"
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
        >
          <g
            onPointerEnter={() => setHover(s.name)}
            onPointerLeave={() => setHover(null)}
            onClick={() => setLocked((l) => (l === s.name ? null : s.name))}
            opacity={opacityOf(s)}
            style={{
              cursor: "pointer",
              transition: "opacity var(--dur-base) var(--ease-out)",
            }}
          >
            <circle cx={s.x} cy={s.y} r={s.r + 8} fill="transparent" />
            <circle
              cx={s.x}
              cy={s.y}
              r={active === s.name ? s.r + 2 : s.r}
              fill={TINT[s.group]}
              style={{ transition: "r var(--dur-fast) var(--ease-out)" }}
            />
            <text
              x={s.x}
              y={s.y + s.r + 14}
              textAnchor="middle"
              fill="var(--fg)"
              className="font-mono"
              fontSize="11"
            >
              {s.name}
            </text>
          </g>
        </g>
      ))}
    </svg>
  );
}

export function Constellation({ skills, edges, titles }: Props) {
  const [role] = useRole();
  const [hover, setHover] = useState<string | null>(null);
  const [locked, setLocked] = useState<string | null>(null);
  const active = hover ?? locked;
  const chips = useRef<HTMLDivElement>(null);
  const firstRole = useRef(true);

  // Chips re-enter in a wave when the role changes (anime.js).
  useEffect(() => {
    if (firstRole.current) {
      firstRole.current = false;
      return;
    }
    if (prefersReducedMotion()) return;
    const els = chips.current?.querySelectorAll("button");
    if (els?.length)
      animate(els, {
        translateY: [14, 0],
        opacity: [0.15, 1],
        delay: stagger(26),
        duration: 650,
        ease: "outExpo",
      });
  }, [role]);

  const byName = useMemo(() => new Map(skills.map((s) => [s.name, s])), [skills]);
  const neighbours = useMemo(() => {
    const m = new Map<string, Set<string>>();
    for (const e of edges) {
      (m.get(e.a) ?? m.set(e.a, new Set()).get(e.a)!).add(e.b);
      (m.get(e.b) ?? m.set(e.b, new Set()).get(e.b)!).add(e.a);
    }
    return m;
  }, [edges]);

  const connected = (name: string) =>
    !!active && (name === active || neighbours.get(active)?.has(name) === true);

  const opacityOf = (s: PlacedSkill) => {
    if (active) return connected(s.name) ? 1 : 0.18;
    return s.group === role ? 1 : 0.42;
  };

  const activeSkill = active ? byName.get(active) : undefined;
  const groups = [role, ...ROLE_ORDER.filter((r) => r !== role)];

  return (
    <div className="grid gap-12 lg:grid-cols-12">
      <div className="border-line bg-surface hidden rounded-[var(--radius-lg)] border p-4 md:block lg:col-span-7">
        <LazyMount className="aspect-[800/520] w-full">
          <Graph
            skills={skills}
            edges={edges}
            byName={byName}
            role={role}
            active={active}
            opacityOf={opacityOf}
            setHover={setHover}
            setLocked={setLocked}
          />
        </LazyMount>
      </div>

      <div className="lg:col-span-5" ref={chips}>
        <div className="space-y-8">
          {groups.map((g) => (
            <section key={g} aria-labelledby={`skills-${g}`}>
              <h3
                id={`skills-${g}`}
                className="mb-3 flex items-center gap-2 font-mono text-xs tracking-widest uppercase"
                style={{ color: TINT[g] }}
              >
                <span
                  aria-hidden="true"
                  className="size-2 rounded-full"
                  style={{ background: TINT[g] }}
                />
                {ROLE_COPY[g].label}
                {g === role && <span className="text-fg-muted">/ selected role</span>}
              </h3>
              <ul className="flex flex-wrap gap-2">
                {skills
                  .filter((s) => s.group === g)
                  .map((s) => (
                    <li key={s.name}>
                      <button
                        type="button"
                        aria-pressed={locked === s.name}
                        onPointerEnter={() => setHover(s.name)}
                        onPointerLeave={() => setHover(null)}
                        onFocus={() => setHover(s.name)}
                        onBlur={() => setHover(null)}
                        onClick={() => setLocked((l) => (l === s.name ? null : s.name))}
                        className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                          active === s.name || locked === s.name
                            ? "border-accent bg-accent text-accent-ink"
                            : "border-line text-fg-muted hover:border-accent hover:text-fg"
                        }`}
                      >
                        {s.name}
                        {s.projects && s.projects.length > 0 && (
                          <span className="sr-only">
                            , used in {s.projects.map((p) => titles[p] ?? p).join(", ")}
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
              </ul>
            </section>
          ))}
        </div>

        <div
          aria-live="polite"
          className="border-line mt-8 min-h-24 rounded-[var(--radius)] border border-dashed p-5 text-sm"
        >
          {activeSkill ? (
            activeSkill.projects && activeSkill.projects.length > 0 ? (
              <>
                <p className="text-fg-muted font-mono text-xs tracking-widest uppercase">
                  {activeSkill.name} appears in
                </p>
                <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                  {activeSkill.projects.map((p) => (
                    <li key={p}>
                      <Link
                        href={`/work/${p}`}
                        transitionTypes={["nav-forward"]}
                        className="decoration-accent hover:text-accent underline underline-offset-4"
                      >
                        {titles[p] ?? p}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-fg-muted">
                {activeSkill.name}: no featured case study yet. It shows up in other repos
                on GitHub.
              </p>
            )
          ) : (
            <p className="text-fg-muted">
              Hover or focus a skill to see where it shows up. Click to hold the
              selection.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
