"use client";

import Link from "next/link";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/motion/gsap";
import { useRole } from "@/lib/prefs";
import type { Project } from "@/lib/types";
import { isReal } from "@/lib/verified";
import { RevealScope } from "../reveal-scope";
import type { World } from "../section";
import { SplitHeading } from "../split-heading";
import { Tilt } from "../tilt";
import { Cover } from "./cover";

/** Each project gets its own colour world; adjacent panels always differ. */
const WORLDS: World[] = ["ember", "violet", "pink", "cream", "lime"];

const ROLE_TAG = { sde: "Software", data: "Data", ai: "AI" } as const;

function ProjectPanel({
  project,
  index,
  total,
  world,
}: {
  project: Project;
  index: number;
  total: number;
  world: World;
}) {
  const root = useRef<HTMLElement>(null);
  const num = String(index + 1).padStart(2, "0");
  const top = (Object.entries(project.weight) as [keyof typeof ROLE_TAG, number][]).sort(
    (a, b) => b[1] - a[1],
  )[0][0];
  const metric = project.metrics.find((m) => isReal(m.value));

  // The cover drifts against the scroll inside its frame, and the numeral slides (desktop).
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const trigger = {
          trigger: root.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.6,
        };
        gsap.fromTo(
          ".panel-cover",
          { yPercent: 9 },
          { yPercent: -9, ease: "none", scrollTrigger: trigger },
        );
        gsap.fromTo(
          ".panel-num",
          { xPercent: 12 },
          { xPercent: -14, ease: "none", scrollTrigger: trigger },
        );
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      data-stack
      data-world={world}
      data-hud={`Work · ${project.title}`}
      aria-label={`Project ${num}: ${project.title}`}
      className="bg-bg text-fg relative flex items-center overflow-hidden pt-24 pb-14 lg:min-h-[100svh] lg:pt-[104px] lg:pb-12"
    >
      <span
        aria-hidden="true"
        className="panel-num text-outline-ink font-display pointer-events-none absolute top-1/2 right-0 hidden -translate-y-1/2 text-[clamp(14rem,44vw,48rem)] leading-none font-semibold tracking-tighter opacity-55 select-none md:block"
      >
        {num}
      </span>

      <RevealScope className="relative mx-auto grid w-full max-w-[1440px] items-center gap-8 px-[var(--gutter)] lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">
          <p className="reveal mb-5 flex flex-wrap items-center gap-3 font-mono text-xs tracking-widest uppercase">
            <span className="border-ink text-ink -rotate-2 border-2 bg-[#c6ff3d] px-3 py-1 font-medium shadow-[3px_3px_0_0_var(--ink)]">
              No. {num} / {String(total).padStart(2, "0")}
            </span>
            <span>{ROLE_TAG[top]}</span>
            <span aria-hidden="true">/</span>
            <span>{project.stack.slice(0, 3).join(" · ")}</span>
          </p>

          <SplitHeading
            as="h3"
            className="font-display text-[length:clamp(3rem,min(9.4vw,15svh),9.6rem)] leading-[0.86] font-semibold tracking-tighter"
          >
            {project.title}
          </SplitHeading>

          <p className="reveal mt-5 max-w-xl text-[length:clamp(1.15rem,1.6vw,1.6rem)] leading-snug font-medium">
            {project.tagline}
          </p>

          {metric && (
            <p className="reveal mt-6 flex items-baseline gap-3">
              <span className="font-display text-[length:var(--text-2xl)] leading-none font-semibold">
                {metric.value}
              </span>
              <span className="font-mono text-xs tracking-widest uppercase">
                {metric.label}
              </span>
            </p>
          )}

          <div className="reveal mt-7 flex flex-wrap gap-3">
            <Link
              href={`/work/${project.slug}`}
              transitionTypes={["nav-forward"]}
              data-ripple
              className="bg-accent text-accent-ink border-ink relative inline-flex items-center gap-2 overflow-hidden rounded-full border-2 px-7 py-3.5 text-sm font-semibold shadow-[5px_5px_0_0_var(--ink)] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5"
            >
              Read the case study <span aria-hidden="true">→</span>
            </Link>
            {project.links.demo && (
              <a
                href={project.links.demo}
                target="_blank"
                rel="noopener"
                className="border-ink hover:bg-ink inline-flex items-center gap-2 rounded-full border-2 px-6 py-3.5 text-sm font-semibold transition-colors hover:text-[var(--bg)]"
              >
                Live demo <span aria-hidden="true">↗</span>
              </a>
            )}
          </div>
        </div>

        <div className="reveal mx-auto w-full lg:col-span-5 lg:max-w-[min(100%,calc(58svh*0.8))]">
          <Link
            href={`/work/${project.slug}`}
            transitionTypes={["nav-forward"]}
            data-cursor-label="View"
            aria-label={`Open the ${project.title} case study`}
            className="block"
          >
            <Tilt max={6}>
              <div className="border-ink overflow-hidden rounded-[var(--radius-lg)] border-2 shadow-[8px_8px_0_0_var(--ink)] lg:shadow-[14px_14px_0_0_var(--ink)]">
                <div className="panel-cover scale-[1.18]">
                  <Cover
                    project={project}
                    className="!aspect-[16/11] !rounded-none !border-0 lg:!aspect-[4/5]"
                  />
                </div>
              </div>
            </Tilt>
          </Link>
        </div>
      </RevealScope>
    </section>
  );
}

export function WorkPanels({ projects }: { projects: Project[] }) {
  const [role] = useRole();
  // Weight first; the original order breaks ties.
  const items = [...projects].sort((a, b) => b.weight[role] - a.weight[role]);
  return (
    <>
      {items.map((p, i) => (
        <ProjectPanel
          key={p.slug}
          project={p}
          index={i}
          total={items.length}
          world={WORLDS[i % WORLDS.length]}
        />
      ))}
    </>
  );
}
