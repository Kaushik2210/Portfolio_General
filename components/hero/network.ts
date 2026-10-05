/**
 * Deterministic "neural network" layout shared by the WebGL field and the SVG
 * fallback, so both show the same structure. Seeded so server and client agree.
 */
export type Vec3 = [number, number, number];

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const LAYERS = [4, 7, 9, 7, 4];
const WIDTH = 6.4;
const HEIGHT = 3.2;

export interface Network {
  nodes: Vec3[];
  edges: [number, number][];
}

export function buildNetwork(seed = 7): Network {
  const rand = mulberry32(seed);
  const nodes: Vec3[] = [];
  const layerStart: number[] = [];

  LAYERS.forEach((count, li) => {
    layerStart.push(nodes.length);
    const x = (li / (LAYERS.length - 1) - 0.5) * WIDTH;
    for (let i = 0; i < count; i++) {
      const y = ((i + 0.5) / count - 0.5) * HEIGHT + (rand() - 0.5) * 0.25;
      nodes.push([x + (rand() - 0.5) * 0.2, y, (rand() - 0.5) * 0.9]);
    }
  });

  const edges: [number, number][] = [];
  for (let li = 0; li < LAYERS.length - 1; li++) {
    const from = layerStart[li];
    const to = layerStart[li + 1];
    for (let i = 0; i < LAYERS[li]; i++) {
      const picks = new Set<number>();
      while (picks.size < 2) picks.add(to + Math.floor(rand() * LAYERS[li + 1]));
      picks.forEach((j) => edges.push([from + i, j]));
    }
  }
  return { nodes, edges };
}

export interface FieldGeometry {
  scattered: Float32Array;
  targets: Float32Array;
  seeds: Float32Array;
  lines: Float32Array;
}

/** Points start scattered (noise) and have a target on a node or an edge (signal). */
export function buildField(count: number, seed = 7): FieldGeometry {
  const rand = mulberry32(seed + 101);
  const { nodes, edges } = buildNetwork(seed);

  const scattered = new Float32Array(count * 3);
  const targets = new Float32Array(count * 3);
  const seeds = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    scattered[i * 3] = (rand() - 0.5) * 11;
    scattered[i * 3 + 1] = (rand() - 0.5) * 6.5;
    scattered[i * 3 + 2] = (rand() - 0.5) * 5;
    seeds[i] = rand();

    let t: Vec3;
    if (rand() < 0.3) {
      const n = nodes[Math.floor(rand() * nodes.length)];
      const j = 0.09;
      t = [
        n[0] + (rand() - 0.5) * j,
        n[1] + (rand() - 0.5) * j,
        n[2] + (rand() - 0.5) * j,
      ];
    } else {
      const [a, b] = edges[Math.floor(rand() * edges.length)];
      const k = rand();
      const j = 0.02;
      t = [
        nodes[a][0] + (nodes[b][0] - nodes[a][0]) * k + (rand() - 0.5) * j,
        nodes[a][1] + (nodes[b][1] - nodes[a][1]) * k + (rand() - 0.5) * j,
        nodes[a][2] + (nodes[b][2] - nodes[a][2]) * k + (rand() - 0.5) * j,
      ];
    }
    targets.set(t, i * 3);
  }

  const lines = new Float32Array(edges.length * 6);
  edges.forEach(([a, b], i) => {
    lines.set(nodes[a], i * 6);
    lines.set(nodes[b], i * 6 + 3);
  });

  return { scattered, targets, seeds, lines };
}
