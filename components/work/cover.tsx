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

/** Dominant role decides the tint, so covers echo the role switcher colours. */
function tint(weight: Project["weight"]): string {
  const [top] = (Object.entries(weight) as [keyof typeof weight, number][]).sort(
    (a, b) => b[1] - a[1],
  );
  return top[0] === "data" ? "var(--data)" : "var(--accent)";
}

/**
 * Generated cover art: a small constellation seeded by the slug, so each case
 * study has a stable, distinct visual until a real screenshot is provided.
 * It is decorative (aria-hidden) and never pretends to be a screenshot.
 */
function Generated({ project }: { project: Project }) {
  const rand = rng(hash(project.slug));
  const color = tint(project.weight);
  const count = 16 + Math.floor(rand() * 8);
  const pts = Array.from({ length: count }, () => ({
    x: 30 + rand() * 340,
    y: 25 + rand() * 190,
    r: 1.2 + rand() * 3.2,
  }));
  const edges: [number, number][] = [];
  pts.forEach((p, i) => {
    const near = pts
      .map((q, j) => ({ j, d: (p.x - q.x) ** 2 + (p.y - q.y) ** 2 }))
      .filter((n) => n.j !== i)
      .sort((a, b) => a.d - b.d)
      .slice(0, 2);
    near.forEach((n) => i < n.j && edges.push([i, n.j]));
  });

  return (
    <svg
      viewBox="0 0 400 240"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      className="size-full"
    >
      <rect width="400" height="240" fill="var(--surface)" />
      <rect width="400" height="240" fill={color} opacity="0.07" />
      <g stroke={color} strokeWidth="0.6" opacity="0.5">
        {edges.map(([a, b], i) => (
          <line key={i} x1={pts[a].x} y1={pts[a].y} x2={pts[b].x} y2={pts[b].y} />
        ))}
      </g>
      <g fill={color}>
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={p.r} opacity={0.5 + (i % 3) * 0.2} />
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
