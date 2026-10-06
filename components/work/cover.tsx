import Image from "next/image";
import { ViewTransition } from "react";
import { LazyMount } from "@/components/lazy-mount";
import type { Project } from "@/lib/types";

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PALETTES: [string, string][] = [
  ["#c6ff3d", "#0b0b10"],
  ["#ff3d9a", "#0b0b10"],
  ["#8b5cf6", "#c6ff3d"],
  ["#ff5a36", "#0b0b10"],
  ["#6ee7d8", "#0b0b10"],
  ["#f4f0e6", "#ff3d9a"],
];

/**
 * Generated poster art, seeded by the slug: flat colour, a giant outlined
 * initial, a sun, hatching and a small constellation. Each case study gets a
 * stable, loud visual until a real screenshot is provided. It is decorative
 * (aria-hidden) and never pretends to be a screenshot.
 */
function Generated({ project }: { project: Project }) {
  const rand = rng(hash(project.slug));
  const [bg, fg] = PALETTES[hash(project.slug) % PALETTES.length];
  const initial = project.title.charAt(0).toUpperCase();
  const pts = Array.from({ length: 11 }, () => ({
    x: 40 + rand() * 320,
    y: 40 + rand() * 420,
    r: 2 + rand() * 4,
  }));
  const edges: [number, number][] = [];
  pts.forEach((p, i) => {
    const near = pts
      .map((q, j) => ({ j, d: (p.x - q.x) ** 2 + (p.y - q.y) ** 2 }))
      .filter((n) => n.j !== i)
      .sort((x, y) => x.d - y.d)
      .slice(0, 2);
    near.forEach((n) => i < n.j && edges.push([i, n.j]));
  });
  const sunX = 90 + rand() * 220;
  const sunY = 90 + rand() * 120;

  return (
    <svg
      viewBox="0 0 400 500"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      className="size-full"
    >
      <defs>
        <pattern
          id={`hatch-${project.slug}`}
          width="14"
          height="14"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <line x1="0" y1="0" x2="0" y2="14" stroke={fg} strokeWidth="3" />
        </pattern>
      </defs>
      <rect width="400" height="500" fill={bg} />
      <circle cx={sunX} cy={sunY} r="120" fill={fg} />
      <rect
        x="0"
        y="330"
        width="400"
        height="170"
        fill={`url(#hatch-${project.slug})`}
        opacity="0.55"
      />
      <text
        x="200"
        y="400"
        textAnchor="middle"
        fontSize="520"
        fontWeight="700"
        fill="none"
        stroke={fg}
        strokeWidth="3"
        className="font-display"
      >
        {initial}
      </text>
      <g stroke={fg} strokeWidth="2" opacity="0.85">
        {edges.map(([p, q], i) => (
          <line key={i} x1={pts[p].x} y1={pts[p].y} x2={pts[q].x} y2={pts[q].y} />
        ))}
      </g>
      <g fill={bg} stroke={fg} strokeWidth="2.5">
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={p.r + 3} />
        ))}
      </g>
    </svg>
  );
}

/** Shared-element cover: the card and the case-study hero use the same name. */
export function Cover({
  project,
  className = "",
}: {
  project: Project;
  className?: string;
}) {
  const real = project.visual !== "TODO_SCREENSHOT";
  return (
    <ViewTransition name={`cover-${project.slug}`} share="morph" default="none">
      <div
        className={`border-line bg-surface relative aspect-[5/3] overflow-hidden rounded-[var(--radius)] border ${className}`}
      >
        {real ? (
          <Image
            src={project.visual}
            alt={`${project.title} screenshot`}
            fill
            sizes="(min-width:1024px) 560px, 100vw"
            className="object-cover"
          />
        ) : (
          <LazyMount className="size-full" rootMargin="300px">
            <Generated project={project} />
          </LazyMount>
        )}
      </div>
    </ViewTransition>
  );
}
