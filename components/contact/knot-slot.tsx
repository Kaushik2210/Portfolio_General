"use client";

import dynamic from "next/dynamic";
import { useSceneMode } from "@/lib/capability";

const KnotScene = dynamic(() => import("./knot"), { ssr: false });

/** Mounts the 3D knot only where WebGL scenes are allowed (desktop, motion on). */
export function KnotSlot() {
  const mode = useSceneMode();
  if (mode !== "webgl") return null;
  return (
    <div className="pointer-events-none absolute top-16 right-[8%] z-0 hidden h-[clamp(220px,26vw,420px)] w-[clamp(220px,26vw,420px)] lg:block">
      <KnotScene />
    </div>
  );
}
