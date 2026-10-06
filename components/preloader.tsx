"use client";

import { animate, createTimeline, stagger } from "animejs";
import { useEffect, useRef } from "react";
import { introDone, preloaderGone, usePreloaderGone } from "@/lib/prefs";
import { prefersReducedMotion } from "@/lib/motion/scroll";

const NAME = "S V KAUSHIK";
const SEEN_KEY = "intro-seen";

/** Under 2.5s, skippable, and shown once per tab session. */
export function Preloader() {
  const gone = usePreloaderGone();
  const root = useRef<HTMLDivElement>(null);
  const count = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const skip = useRef<(() => void) | null>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    // The hero starts animating as the overlay begins to slide away, so the hand-off is seamless.
    const begin = () => {
      try {
        sessionStorage.setItem(SEEN_KEY, "1");
      } catch {
        // ignore: the intro just replays next load
      }
      introDone.set(true);
    };
    const end = () => preloaderGone.set(true);

    if (
      document.documentElement.dataset.introSeen ||
      document.documentElement.dataset.noIntro ||
      prefersReducedMotion()
    ) {
      begin();
      end();
      return;
    }

    const chars = el.querySelectorAll<HTMLElement>("[data-char]");
    const progress = { value: 0 };

    const tl = createTimeline({ defaults: { ease: "outExpo" }, onComplete: end });
    tl.add(chars, { translateY: ["110%", "0%"], duration: 700, delay: stagger(40) }, 0)
      .add(
        progress,
        {
          value: 100,
          duration: 1400,
          ease: "inOutQuad",
          onUpdate: () => {
            if (count.current)
              count.current.textContent = String(Math.round(progress.value)).padStart(
                3,
                "0",
              );
          },
        },
        0,
      )
      .add(bar.current!, { scaleX: [0, 1], duration: 1400, ease: "inOutQuad" }, 0)
      .add(el, { translateY: "-100%", duration: 650, ease: "inOutExpo" }, 1550)
      .call(begin, 1500);

    // Failsafe: animation frames pause in background tabs and crawl on slow devices, so a
    // plain timer guarantees the overlay always leaves.
    const failsafe = window.setTimeout(() => {
      begin();
      end();
    }, 4000);

    skip.current = () => {
      tl.pause();
      begin();
      animate(el, { opacity: 0, duration: 200, ease: "linear", onComplete: end });
    };

    return () => {
      window.clearTimeout(failsafe);
      tl.revert();
    };
  }, []);

  useEffect(() => {
    if (gone) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter") skip.current?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [gone]);

  if (gone) return null;

  return (
    <div
      ref={root}
      role="status"
      aria-label="Loading"
      className="preloader bg-bg fixed inset-0 z-[100] flex flex-col justify-between p-[var(--gutter)]"
    >
      <div className="text-fg-muted flex items-start justify-between font-mono text-xs tracking-widest uppercase">
        <span>Portfolio / 2026</span>
        <button
          type="button"
          onClick={() => skip.current?.()}
          className="hover:text-fg underline-offset-4 hover:underline"
        >
          Skip intro
        </button>
      </div>

      <div className="font-display text-[length:var(--text-3xl)] leading-[0.9] font-semibold tracking-tight">
        <span className="sr-only">{NAME}</span>
        <span aria-hidden="true" className="flex flex-wrap">
          {[...NAME].map((c, i) => (
            <span key={i} className="inline-block overflow-hidden pb-[0.08em]">
              <span data-char className="inline-block translate-y-[110%]">
                {c === " " ? " " : c}
              </span>
            </span>
          ))}
        </span>
      </div>

      <div>
        <div className="text-fg-muted mb-3 flex justify-between font-mono text-xs">
          <span>Loading</span>
          <span ref={count}>000</span>
        </div>
        <div className="bg-line h-px">
          <div ref={bar} className="bg-accent h-full origin-left scale-x-0" />
        </div>
      </div>
    </div>
  );
}
