"use client";

import dynamic from "next/dynamic";
import { useSceneMode } from "@/lib/capability";
import { buildNetwork } from "./network";

// Three.js, R3F and the shaders only load on capable desktop clients.
const SceneCanvas = dynamic(() => import("./scene-canvas"), { ssr: false });

const NETWORK = buildNetwork();

/** Static, CSS-only stand-in: same layout as the 3D scene, no JS animation. */
function Fallback() {
  const sx = (x: number) => 50 + x * 7.2;
  const sy = (y: number) => 50 - y * 11;
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 70% 40%, color-mix(in oklab, var(--accent) 22%, transparent), transparent 70%), radial-gradient(40% 40% at 85% 75%, color-mix(in oklab, var(--data) 14%, transparent), transparent 70%)",
        }}
      />
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        className="fallback-drift absolute inset-0 size-full opacity-60"
      >
        <g stroke="var(--fg-muted)" strokeWidth="0.12" opacity="0.5">
          {NETWORK.edges.map(([a, b], i) => (
            <line
              key={i}
              x1={sx(NETWORK.nodes[a][0])}
              y1={sy(NETWORK.nodes[a][1])}
              x2={sx(NETWORK.nodes[b][0])}
              y2={sy(NETWORK.nodes[b][1])}
            />
          ))}
        </g>
        <g fill="var(--accent)">
          {NETWORK.nodes.map((n, i) => (
            <circle key={i} cx={sx(n[0])} cy={sy(n[1])} r={i % 5 === 0 ? 0.7 : 0.4} />
          ))}
        </g>
      </svg>
    </div>
  );
}

export function HeroScene() {
  const mode = useSceneMode();
  return (
    <div className="absolute inset-0 [mask-image:linear-gradient(90deg,transparent_8%,#000_52%)]">
      {mode === "webgl" ? <SceneCanvas /> : <Fallback />}
    </div>
  );
}
