"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useSceneMode } from "@/lib/capability";
import { Guard } from "../three/guard";

// Three.js, R3F and the shaders only load on capable desktop clients.
const Blob = dynamic(() => import("./blob"), { ssr: false });

/** Static stand-in for phones and low-power devices: same colours, no WebGL. */
function Orb() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 grid place-items-start justify-items-center overflow-hidden pt-[9svh] opacity-40 md:place-items-center md:pt-0 md:opacity-100"
    >
      <div
        className="size-[84vw] max-w-[560px] rounded-full opacity-90"
        style={{
          background: "conic-gradient(from 210deg, #c6ff3d, #ff3d9a, #8b5cf6, #c6ff3d)",
          boxShadow: "0 0 0 2px #0b0b10, 12px 12px 0 2px #c6ff3d",
        }}
      />
      <div className="absolute size-[112vw] max-w-[760px] rounded-full border-2 border-dashed border-[#ff3d9a]/60" />
    </div>
  );
}

export function HeroScene() {
  const mode = useSceneMode();
  const [ready, setReady] = useState(false);

  // Let the page paint and settle first; the crystal fades in just after.
  useEffect(() => {
    if (mode !== "webgl") return;
    let id = 0;
    const go = () => {
      id = window.setTimeout(() => setReady(true), 400);
    };
    if (document.readyState === "complete") go();
    else window.addEventListener("load", go, { once: true });
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("load", go);
    };
  }, [mode]);

  if (mode !== "webgl") return <Orb />;
  if (!ready) return null;
  return (
    <div className="hero-scene-in absolute inset-0">
      <Guard fallback={<Orb />}>
        <Blob />
      </Guard>
    </div>
  );
}
