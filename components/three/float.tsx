"use client";

import dynamic from "next/dynamic";
import { useSceneMode } from "@/lib/capability";
import type { Variant } from "./shapes";

const Shape = dynamic(() => import("./shapes"), { ssr: false });

/**
 * A decorative 3D shape pinned inside the nearest positioned section. Only mounts where
 * WebGL scenes are allowed (desktop, motion on), so phones never download Three.js for it.
 */
export function Float3D({
  variant,
  className = "top-16 right-[6%]",
}: {
  variant: Variant;
  className?: string;
}) {
  const mode = useSceneMode();
  if (mode !== "webgl") return null;
  return (
    <div
      className={`pointer-events-none absolute z-0 hidden h-[clamp(220px,24vw,380px)] w-[clamp(220px,24vw,380px)] lg:block ${className}`}
    >
      <Shape variant={variant} />
    </div>
  );
}
