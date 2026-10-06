"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useSceneMode } from "@/lib/capability";
import { Guard } from "./guard";
import type { Variant } from "./shapes";

const Shape = dynamic(() => import("./shapes"), { ssr: false });

/**
 * A decorative 3D shape pinned inside the nearest positioned section. It mounts only
 * while near the viewport and unmounts after, so at most one or two WebGL contexts are
 * alive at once. Only where WebGL scenes are allowed (desktop, motion on).
 */
export function Float3D({
  variant,
  className = "top-16 right-[6%]",
}: {
  variant: Variant;
  className?: string;
}) {
  const mode = useSceneMode();
  const box = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = box.current;
    if (!el || mode !== "webgl") return;
    const io = new IntersectionObserver(([e]) => setNear(e.isIntersecting), {
      rootMargin: "200px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, [mode]);

  if (mode !== "webgl") return null;
  return (
    <div
      ref={box}
      className={`pointer-events-none absolute z-0 hidden h-[clamp(220px,24vw,380px)] w-[clamp(220px,24vw,380px)] lg:block ${className}`}
    >
      {near && (
        <Guard>
          <Shape variant={variant} />
        </Guard>
      )}
    </div>
  );
}
