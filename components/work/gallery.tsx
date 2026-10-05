"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap, Flip, ScrollTrigger, useGSAP } from "@/lib/motion/gsap";
import { prefersReducedMotion } from "@/lib/motion/scroll";
import { dur, ease } from "@/lib/motion/tokens";
import { roleStore, useRole } from "@/lib/prefs";
import type { Project } from "@/lib/types";
import { ProjectCard } from "./card";

/**
 * Desktop with motion: the section pins and the track scrubs sideways.
 * Otherwise (mobile, touch, reduced motion, no JS): a plain vertical stack.
 * Changing the role re-orders the cards with a Flip animation.
 */
export function Gallery({ projects }: { projects: Project[] }) {
  const [role] = useRole();
  // Weight first; the original order breaks ties.
  const items = [...projects].sort((a, b) => b.weight[role] - a.weight[role]);

  const root = useRef<HTMLDivElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLUListElement>(null);
  const flipState = useRef<Flip.FlipState | null>(null);

  // Capture card positions just before React re-orders them. The store notifies
  // listeners synchronously, before the re-render is flushed.
  useGSAP(
    () => {
      return roleStore.subscribe(() => {
        const cards = track.current?.querySelectorAll("[data-flip-id]");
        if (cards?.length) flipState.current = Flip.getState(cards);
      });
    },
    { scope: root },
  );

  useLayoutEffect(() => {
    const state = flipState.current;
    if (!state) return;
    flipState.current = null;
    if (prefersReducedMotion()) return;
    Flip.from(state, {
      duration: dur.slow,
      ease: ease.inOut,
      stagger: 0.04,
      absolute: false,
      onComplete: () => ScrollTrigger.refresh(),
    });
  }, [role]);

  // Pinned horizontal scroll, desktop only. matchMedia reverts it on resize.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        "(min-width: 1024px) and (hover: hover) and (prefers-reduced-motion: no-preference)",
        () => {
          const rootEl = root.current;
          const pinEl = pin.current;
          const trackEl = track.current;
          if (!rootEl || !pinEl || !trackEl) return;

          rootEl.dataset.mode = "pinned";
          trackEl
            .querySelectorAll("[data-flip-id]")
            .forEach((c) => c.setAttribute("data-pinned", "true"));

          const distance = () => Math.max(0, trackEl.scrollWidth - window.innerWidth);
          gsap.to(trackEl, {
            x: () => -distance(),
            ease: "none",
            scrollTrigger: {
              trigger: rootEl,
              start: "top top",
              end: () => `+=${distance()}`,
              pin: pinEl,
              scrub: 0.6,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });

          return () => {
            delete rootEl.dataset.mode;
            trackEl
              .querySelectorAll("[data-flip-id]")
              .forEach((c) => c.removeAttribute("data-pinned"));
          };
        },
      );
    },
    { scope: root },
  );

  return (
    <div ref={root} className="group/gallery">
      <div
        ref={pin}
        className="group-data-[mode=pinned]/gallery:flex group-data-[mode=pinned]/gallery:h-[100svh] group-data-[mode=pinned]/gallery:flex-col group-data-[mode=pinned]/gallery:justify-center group-data-[mode=pinned]/gallery:overflow-hidden"
      >
        <ul
          ref={track}
          aria-label="Projects"
          className="grid gap-14 px-[var(--gutter)] group-data-[mode=pinned]/gallery:flex group-data-[mode=pinned]/gallery:w-max group-data-[mode=pinned]/gallery:gap-10 group-data-[mode=pinned]/gallery:will-change-transform sm:grid-cols-2"
        >
          {items.map((p, i) => (
            <li key={p.slug} className="flex">
              <ProjectCard project={p} index={i} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
