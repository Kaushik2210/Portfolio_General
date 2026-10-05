"use client";

import { useEffect, useRef, useState } from "react";
import { Magnetic } from "@/components/magnetic";
import { RoleSwitcher } from "@/components/role-switcher";
import { ROLE_COPY, ROLE_ORDER } from "@/lib/copy";
import { gsap, ScrollTrigger, SplitText, useGSAP } from "@/lib/motion/gsap";
import { prefersReducedMotion, scrollTo } from "@/lib/motion/scroll";
import { dur, ease, shift, stagger, staggerFor } from "@/lib/motion/tokens";
import { useIntroDone, useRole, useRoleChosen } from "@/lib/prefs";
import { useReducedMotion } from "@/lib/capability";
import { SITE } from "@/lib/data";
import { HeroScene } from "./scene";
import { sceneState } from "./scene-state";

const CYCLE_MS = 2600;

const btn =
  "inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-colors duration-[var(--dur-base)]";

export function HeroClient({ hasResume }: { hasResume: boolean }) {
  const root = useRef<HTMLElement>(null);
  const nameEl = useRef<HTMLHeadingElement>(null);
  const titleEl = useRef<HTMLSpanElement>(null);
  const bodyEl = useRef<HTMLParagraphElement>(null);
  const done = useIntroDone();
  const [role] = useRole();
  const chosen = useRoleChosen();
  const [cycle, setCycle] = useState(0);

  // Until the visitor picks a role, the hero previews all three in turn.
  const reduced = useReducedMotion();
  const shown = chosen ? role : ROLE_ORDER[cycle % ROLE_ORDER.length];

  useEffect(() => {
    if (!done || chosen || reduced) return;
    const id = window.setInterval(() => setCycle((c) => c + 1), CYCLE_MS);
    return () => window.clearInterval(id);
  }, [done, chosen, reduced]);

  useEffect(() => {
    sceneState.role = shown;
    return () => {
      sceneState.role = null;
    };
  }, [shown]);

  // Roll the title and fade the line in when the previewed role changes.
  const first = useRef(true);
  useGSAP(
    () => {
      if (first.current) {
        first.current = false;
        return;
      }
      if (prefersReducedMotion()) return;
      gsap.fromTo(
        titleEl.current,
        { yPercent: 100, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: dur.base + 0.1, ease: ease.out },
      );
      gsap.fromTo(
        bodyEl.current,
        { y: 8, opacity: 0 },
        { y: 0, opacity: 1, duration: dur.base, ease: ease.out },
      );
    },
    { scope: root, dependencies: [shown] },
  );

  // Entrance and scroll choreography. Waits for the preloader hand-off.
  useGSAP(
    () => {
      if (!done) return;
      const el = root.current;
      if (!el) return;

      if (prefersReducedMotion()) {
        gsap.set(el.querySelectorAll(".reveal"), { opacity: 1 });
        sceneState.progress = 1;
        return;
      }

      const split = SplitText.create(nameEl.current!, { type: "chars", mask: "chars" });
      gsap.set(nameEl.current, { opacity: 1 });

      const tl = gsap.timeline({ defaults: { ease: ease.out } });
      tl.from(
        split.chars,
        {
          yPercent: 110,
          duration: dur.hero,
          stagger: staggerFor(split.chars.length, stagger.char),
        },
        0,
      )
        .fromTo(
          ".hero-fade",
          { y: shift.reveal, opacity: 0 },
          { y: 0, opacity: 1, duration: dur.slow, stagger: 0.1 },
          0.35,
        )
        .to(sceneState, { progress: 1, duration: 2.6, ease: "power2.inOut" }, 0.1);

      ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: "bottom top",
        scrub: true,
        onUpdate: (self) => {
          sceneState.scroll = self.progress;
        },
      });
      gsap.to(".hero-content", {
        yPercent: -8,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: 0.6 },
      });
    },
    { scope: root, dependencies: [done] },
  );

  const copy = ROLE_COPY[shown];

  return (
    <section
      ref={root}
      id="top"
      aria-label="Introduction"
      className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden"
    >
      <HeroScene />

      <div className="hero-content relative mx-auto w-full max-w-[1280px] px-[var(--gutter)] pt-32 pb-12 md:pb-16">
        <p className="hero-fade reveal text-fg-muted mb-4 font-mono text-xs tracking-widest uppercase">
          {SITE.location} / Portfolio 2026
        </p>

        <h1
          ref={nameEl}
          className="reveal font-display text-[length:var(--text-hero)] leading-[0.88] font-semibold tracking-tighter"
        >
          S V Kaushik
        </h1>

        <p className="hero-fade reveal font-display mt-6 flex flex-wrap items-baseline gap-x-4 text-[length:var(--text-2xl)] leading-tight">
          <span className="text-accent" aria-hidden="true">
            /
          </span>
          <span className="inline-block overflow-hidden pb-1" aria-live="off">
            <span ref={titleEl} className="inline-block">
              {reduced ? "Software Engineer, Data Analyst, AI Engineer" : copy.title}
            </span>
          </span>
        </p>

        <p
          ref={bodyEl}
          className="hero-fade reveal text-fg-muted mt-4 max-w-xl text-lg leading-relaxed"
        >
          {copy.line}
        </p>

        <div className="hero-fade reveal mt-8 flex flex-wrap items-center gap-3">
          <Magnetic>
            <a
              href="#work"
              onClick={(e) => {
                e.preventDefault();
                scrollTo("#work");
              }}
              className={`${btn} bg-accent text-accent-ink hover:brightness-110`}
            >
              View work <span aria-hidden="true">↓</span>
            </a>
          </Magnetic>
          <Magnetic>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent("chat:open"))}
              className={`${btn} border-line bg-surface/60 hover:border-accent border backdrop-blur-lg`}
            >
              Talk to my AI
            </button>
          </Magnetic>
          {hasResume && (
            <Magnetic>
              <a
                href="/resume.pdf"
                target="_blank"
                rel="noopener"
                className={`${btn} text-fg-muted hover:text-fg`}
              >
                Resume
              </a>
            </Magnetic>
          )}
        </div>

        <div className="hero-fade reveal mt-10">
          <RoleSwitcher chosen={chosen} preview={shown} />
        </div>
      </div>
    </section>
  );
}
