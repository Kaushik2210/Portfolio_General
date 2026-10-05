import type { Role, Skill } from "./types";

export const VIEW = { w: 800, h: 520 } as const;

/** Cluster centres: SDE left, Data right, AI bottom. */
const ANCHORS: Record<Role, [number, number]> = {
  sde: [215, 175],
  data: [590, 150],
  ai: [400, 385],
};

export interface PlacedSkill extends Skill {
  x: number;
  y: number;
  r: number;
}

export interface SkillEdge {
  a: string;
  b: string;
  shared: number;
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Seeded relaxation: nodes are pulled to their group's anchor and pushed apart,
 * so the same input always yields the same coordinates (SSR-safe, no jitter).
 */
export function layoutSkills(skills: Skill[]): PlacedSkill[] {
  const rand = mulberry32(42);
  const nodes = skills.map((s) => {
    const [ax, ay] = ANCHORS[s.group];
    const angle = rand() * Math.PI * 2;
    const spread = 40 + rand() * 50;
    return {
      ...s,
      x: ax + Math.cos(angle) * spread,
      y: ay + Math.sin(angle) * spread,
      r: 5 + (s.projects?.length ?? 0) * 1.6,
      vx: 0,
      vy: 0,
    };
  });

  for (let step = 0; step < 220; step++) {
    const cool = 1 - step / 220;
    for (const n of nodes) {
      const [ax, ay] = ANCHORS[n.group];
      n.vx += (ax - n.x) * 0.012;
      n.vy += (ay - n.y) * 0.012;
    }
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.hypot(dx, dy) || 0.01;
        const min = a.r + b.r + 46;
        if (dist < min) {
          const push = ((min - dist) / dist) * 0.5;
          a.vx += dx * push;
          a.vy += dy * push;
          b.vx -= dx * push;
          b.vy -= dy * push;
        }
      }
    }
    for (const n of nodes) {
      n.x = Math.min(VIEW.w - 70, Math.max(70, n.x + n.vx * cool));
      n.y = Math.min(VIEW.h - 30, Math.max(30, n.y + n.vy * cool));
      n.vx *= 0.6;
      n.vy *= 0.6;
    }
  }

  return nodes.map((n) => ({
    name: n.name,
    group: n.group,
    level: n.level,
    projects: n.projects,
    r: n.r,
    x: Math.round(n.x * 10) / 10,
    y: Math.round(n.y * 10) / 10,
  }));
}

/** Two skills are linked when they appear in the same project. */
export function skillEdges(skills: Skill[]): SkillEdge[] {
  const edges: SkillEdge[] = [];
  for (let i = 0; i < skills.length; i++) {
    for (let j = i + 1; j < skills.length; j++) {
      const a = new Set(skills[i].projects ?? []);
      const shared = (skills[j].projects ?? []).filter((p) => a.has(p)).length;
      if (shared > 0) edges.push({ a: skills[i].name, b: skills[j].name, shared });
    }
  }
  return edges;
}
