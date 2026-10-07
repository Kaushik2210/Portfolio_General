"use client";

import dynamic from "next/dynamic";
import { startTransition, useEffect, useRef, useState } from "react";
import { useSceneMode } from "@/lib/capability";
import { Guard } from "./guard";
import type { Variant } from "./shapes";

/** Runs `cb` once scrolling has paused for a moment (or after `max` ms regardless). */
function whenScrollSettles(cb: () => void, max = 1600) {
  let t = 0;
  const done = () => {
    window.clearTimeout(t);
    window.clearTimeout(cap);
    window.removeEventListener("scroll", onScroll);
    cb();
  };
  const onScroll = () => {
    window.clearTimeout(t);
    t = window.setTimeout(done, 160);
  };
  const cap = window.setTimeout(done, max);
  window.addEventListener("scroll", onScroll, { passive: true });
  t = window.setTimeout(done, 160);
}

const loadShapes = () => import("./shapes");
const Shape = dynamic(loadShapes, { ssr: false });

/**
 * A decorative 3D shape pinned inside the nearest positioned section. Where WebGL scenes
 * are allowed (desktop, motion on) it is:
 * - warmed up on the first scroll or mouse move, never during page load;
 * - created a screen or so before it is needed, so context and shader setup never lands
 *   on a visible frame;
 * - kept alive while still fairly close, and torn down once far away;
 * - rendering only while actually on screen.
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
  const [visible, setVisible] = useState(false);

  // Warm the code up on the first sign of interaction, never during page load.
  useEffect(() => {
    if (mode !== "webgl") return;
    const warm = () => void loadShapes();
    const opts = { once: true, passive: true } as const;
    window.addEventListener("scroll", warm, opts);
    window.addEventListener("pointermove", warm, opts);
    return () => {
      window.removeEventListener("scroll", warm);
      window.removeEventListener("pointermove", warm);
    };
  }, [mode]);

  useEffect(() => {
    const el = box.current;
    if (!el || mode !== "webgl") return;
    // Only ever turns on here; turned off by the far observer below.
    const idle =
      window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 120));
    // Creating a canvas is heavy: do it in an idle slot, as a low-priority update, never mid-frame.
    const nearIo = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting)
          whenScrollSettles(() =>
            idle(() => startTransition(() => setNear(true)), { timeout: 800 }),
          );
      },
      { rootMargin: "600px" },
    );
    const farIo = new IntersectionObserver(([e]) => !e.isIntersecting && setNear(false), {
      rootMargin: "1800px",
    });
    const seenIo = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    nearIo.observe(el);
    farIo.observe(el);
    seenIo.observe(el);
    return () => {
      nearIo.disconnect();
      farIo.disconnect();
      seenIo.disconnect();
    };
  }, [mode]);

  if (mode !== "webgl") return null;
  return (
    <div
      ref={box}
      className={`pointer-events-none absolute z-0 hidden h-[clamp(220px,24vw,380px)] w-[clamp(220px,24vw,380px)] lg:block ${className}`}
    >
      {near && (
        <Guard>
          <Shape variant={variant} active={visible} />
        </Guard>
      )}
    </div>
  );
}
