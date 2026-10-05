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
import { HeroScene } from "./scene";
import { sceneState } from "./scene-state";

const CYCLE_MS = 2600;

const btn =
  "relative overflow-hidden inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-colors duration-[var(--dur-base)]";

export function HeroClient({
  hasResume,
  location,
}: {
  hasResume: boolean;
  location: string;
}) {
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

      // Reduced motion and phones: no entrance choreography, the content is simply there.
      if (prefersReducedMotion() || document.documentElement.dataset.noIntro) {
        gsap.set(el.querySelectorAll(".hero-fade, .hero-name"), { opacity: 1 });
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

      let cleanup: (() => void) | undefined;
      // Depth parallax: layers drift against the pointer at different rates (mouse only).
      if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        const layers = [
          { sel: ".hero-name", x: -22, y: -10 },
          { sel: ".hero-role", x: -12, y: -6 },
          { sel: ".hero-body", x: -6, y: -3 },
        ].map((l) => {
          const node = el.querySelector(l.sel);
          return node
            ? {
                ...l,
                qx: gsap.quickTo(node, "x", { duration: 0.9, ease: "power3.out" }),
                qy: gsap.quickTo(node, "y", { duration: 0.9, ease: "power3.out" }),
              }
            : null;
        });
        const onMove = (e: PointerEvent) => {
          const nx = e.clientX / window.innerWidth - 0.5;
          const ny = e.clientY / window.innerHeight - 0.5;
          for (const l of layers) {
            if (!l) continue;
            l.qx(nx * l.x);
            l.qy(ny * l.y);
          }
        };
        window.addEventListener("pointermove", onMove, { passive: true });
        cleanup = () => window.removeEventListener("pointermove", onMove);
      }

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

      return () => cleanup?.();
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

      {/* Maximalist dressing: all decorative, hidden from assistive tech. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <p className="text-outline font-display absolute top-1/2 right-0 hidden translate-x-[6%] -translate-y-1/2 text-[clamp(14rem,38vw,42rem)] leading-none font-semibold tracking-tighter opacity-30 select-none md:block">
          SVK
        </p>
        {["top-24 left-3", "top-24 right-3", "bottom-3 left-3", "bottom-3 right-3"].map(
          (pos) => (
            <span key={pos} className={`absolute ${pos} text-fg-muted font-mono text-lg`}>
              +
            </span>
          ),
        )}
        <p className="text-fg-muted absolute top-28 right-[var(--gutter)] hidden text-right font-mono text-[11px] leading-relaxed tracking-widest uppercase lg:block">
          Fig. 01
          <br />
          12.9716° N / 77.5946° E<br />
          Bengaluru, IN
        </p>
        <div className="absolute right-[8vw] bottom-[18vh] hidden size-44 -rotate-12 md:block">
          <svg viewBox="0 0 200 200" className="spin-slow size-full">
            <defs>
              <path
                id="badge-circle"
                d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0"
              />
            </defs>
            <circle cx="100" cy="100" r="99" fill="var(--c4)" />
            <circle
              cx="100"
              cy="100"
              r="62"
              fill="none"
              stroke="var(--ink)"
              strokeWidth="1.5"
              strokeDasharray="3 5"
            />
            <text
              fontSize="15.5"
              fontWeight="700"
              letterSpacing="2.4"
              fill="var(--ink)"
              className="font-mono"
            >
              <textPath href="#badge-circle">
                SOFTWARE ✦ DATA ✦ AI ✦ SOFTWARE ✦ DATA ✦ AI ✦
              </textPath>
            </text>
          </svg>
          <span className="font-display text-ink absolute inset-0 grid place-items-center text-5xl">
            ✦
          </span>
        </div>
      </div>

      <div className="hero-content relative mx-auto w-full max-w-[1280px] px-[var(--gutter)] pt-32 pb-12 md:pb-16">
        <p className="hero-fade text-fg-muted mb-4 font-mono text-xs tracking-widest uppercase">
          {location} / Portfolio 2026
        </p>

        <h1
          ref={nameEl}
          className="hero-name font-display text-[length:var(--text-hero)] leading-[0.88] font-semibold tracking-tighter"
        >
          S V Kaushik
        </h1>

        <p className="hero-fade hero-role font-display mt-6 flex flex-wrap items-baseline gap-x-4 text-[length:var(--text-2xl)] leading-tight">
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
          className="hero-fade hero-body text-fg-muted mt-4 max-w-xl text-lg leading-relaxed"
        >
          {copy.line}
        </p>
        <ul aria-label="Focus areas" className="hero-fade mt-6 flex flex-wrap gap-3">
          {[
            ["Full-stack TypeScript", "bg-c3", "-rotate-2"],
            ["Anomaly detection", "bg-c4", "rotate-1"],
            ["LLM systems", "bg-c5", "-rotate-1"],
          ].map(([t, bg, rot]) => (
            <li
              key={t}
              className={`${bg} ${rot} border-ink text-ink rounded-full border-2 px-4 py-1.5 font-mono text-xs font-medium tracking-wide shadow-[4px_4px_0_0_var(--ink)]`}
            >
              {t}
            </li>
          ))}
        </ul>

        <div className="hero-fade mt-8 flex flex-wrap items-center gap-3">
          <Magnetic>
            <a
              href="#work"
              data-ripple
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
              data-ripple
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

        <div className="hero-fade mt-10">
          <RoleSwitcher chosen={chosen} preview={shown} />
        </div>
      </div>
    </section>
  );
}
