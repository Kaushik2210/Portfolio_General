"use client";

import { useRef, useSyncExternalStore } from "react";
import { gsap, ScrollTrigger, SplitText, useGSAP } from "@/lib/motion/gsap";
import { prefersReducedMotion, scrollTo } from "@/lib/motion/scroll";

/** Giant wordmark: letters rise as the footer scrolls into view. */
export function Wordmark({ text }: { text: string }) {
  const el = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion() || !el.current) return;
      const split = SplitText.create(el.current, {
        type: "chars",
        mask: "chars",
        aria: "none",
      });
      // The whole word tips up out of the floor as the footer arrives.
      gsap.fromTo(
        el.current,
        { rotationX: 55, transformPerspective: 800, transformOrigin: "50% 100%" },
        {
          rotationX: 0,
          ease: "none",
          scrollTrigger: {
            trigger: el.current,
            start: "top 100%",
            end: "top 55%",
            scrub: 0.6,
          },
        },
      );
      gsap.from(split.chars, {
        yPercent: 105,
        ease: "power3.out",
        stagger: 0.05,
        scrollTrigger: {
          trigger: el.current,
          start: "top 98%",
          end: "bottom 80%",
          scrub: 0.6,
        },
      });
      return () => ScrollTrigger.refresh();
    },
    { scope: el },
  );

  return (
    <p
      ref={el}
      aria-hidden="true"
      className="font-display text-[length:clamp(3rem,17.2vw,22rem)] leading-[0.82] font-semibold tracking-tighter whitespace-nowrap select-none"
    >
      {text}
    </p>
  );
}

const fmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Kolkata",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

const subscribeClock = (onChange: () => void) => {
  const id = window.setInterval(onChange, 1000);
  return () => window.clearInterval(id);
};

/** Bengaluru local time, ticking each second. Blank on the server so markup matches. */
export function LocalTime() {
  const time = useSyncExternalStore(
    subscribeClock,
    () => fmt.format(new Date()),
    () => "",
  );
  return (
    <p className="text-fg-muted font-mono text-xs tracking-widest uppercase">
      Bengaluru <span className="text-fg tabular-nums">{time || "--:--:--"}</span> IST
    </p>
  );
}

export function BackToTop() {
  return (
    <button
      type="button"
      onClick={() => scrollTo(0)}
      className="border-line hover:border-accent rounded-full border px-5 py-2.5 text-sm transition-colors"
    >
      Back to top <span aria-hidden="true">↑</span>
    </button>
  );
}

export function TerminalLink() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent("terminal:open"))}
      className="text-fg-muted hover:text-accent font-mono text-xs underline-offset-4 hover:underline"
    >
      Open terminal mode (press ~)
    </button>
  );
}
