"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/motion/gsap";
import { prefersReducedMotion } from "@/lib/motion/scroll";
import type { TimelineItem } from "@/lib/timeline";

const KIND_LABEL: Record<TimelineItem["kind"], string> = {
  experience: "Experience",
  education: "Education",
  certification: "Certification",
};

/** Vertical timeline; the spine draws as you scroll, entries reveal in order. */
export function Timeline({ items }: { items: TimelineItem[] }) {
  const root = useRef<HTMLOListElement>(null);
  const spine = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion() || !spine.current) return;
      gsap.fromTo(
        spine.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top 70%",
            end: "bottom 60%",
            scrub: 0.6,
          },
        },
      );
    },
    { scope: root },
  );

  if (items.length === 0) return null;

  return (
    <ol
      ref={root}
      aria-label="Experience, education and certifications"
      className="relative"
    >
      <div
        aria-hidden="true"
        className="bg-line absolute top-2 bottom-2 left-[7px] w-px md:left-1/2"
      >
        <div ref={spine} className="bg-accent size-full origin-top" />
      </div>

      {items.map((item, i) => (
        <li
          key={`${item.kind}-${item.org}-${item.title}`}
          className={`reveal relative pb-14 pl-9 last:pb-0 md:w-1/2 md:pl-0 ${
            i % 2 === 0 ? "md:pr-12" : "md:ml-auto md:pl-12"
          }`}
        >
          <span
            aria-hidden="true"
            className={`border-accent bg-bg absolute top-2 left-0 size-[15px] rounded-full border-2 ${
              i % 2 === 0 ? "md:-right-[7.5px] md:left-auto" : "md:-left-[7.5px]"
            }`}
          />
          <p className="text-fg-muted font-mono text-xs tracking-widest uppercase">
            {KIND_LABEL[item.kind]}
            {item.period && <span className="text-accent"> / {item.period}</span>}
          </p>
          <h3 className="font-display mt-2 text-[length:var(--text-xl,1.75rem)] leading-tight font-semibold">
            {item.title}
          </h3>
          {item.org && <p className="text-fg-muted">{item.org}</p>}
          {item.summary && (
            <p className="text-fg-muted mt-3 max-w-prose">{item.summary}</p>
          )}
          {item.highlights.length > 0 && (
            <ul className="text-fg-muted marker:text-accent mt-3 list-disc space-y-1 pl-5 text-sm">
              {item.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ol>
  );
}
