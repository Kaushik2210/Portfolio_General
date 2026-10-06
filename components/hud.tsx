"use client";

import { useEffect, useRef } from "react";

/**
 * Fixed scroll readout: "03 / 07  Work". It makes the scroll position legible
 * at all times. Hidden on small screens.
 */
export function Hud() {
  const num = useRef<HTMLSpanElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const secs = [...document.querySelectorAll<HTMLElement>("[data-hud]")];
    if (!secs.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const i = secs.indexOf(e.target as HTMLElement);
          if (num.current)
            num.current.textContent = `${String(i + 1).padStart(2, "0")} / ${String(secs.length).padStart(2, "0")}`;
          if (label.current)
            label.current.textContent =
              (e.target as HTMLElement).dataset.hud?.replace(/^\d+\s*\/\s*/, "") ?? "";
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    secs.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed top-1/2 left-4 z-[84] hidden -translate-y-1/2 rotate-180 items-center gap-3 font-mono text-[11px] tracking-widest uppercase mix-blend-difference [writing-mode:vertical-rl] lg:flex"
      style={{ color: "#fff" }}
    >
      <span ref={num} className="tabular-nums">
        01 / 01
      </span>
      <span className="h-10 w-px bg-white" />
      <span ref={label}>Intro</span>
    </div>
  );
}
