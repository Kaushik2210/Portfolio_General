"use client";

import { useEffect, useRef, useState } from "react";
import { Magnetic } from "@/components/magnetic";
import { RoleSwitcher } from "@/components/role-switcher";
import { useReducedMotion } from "@/lib/capability";
import { ROLE_COPY, ROLE_ORDER } from "@/lib/copy";
import { gsap, SplitText, useGSAP } from "@/lib/motion/gsap";
import { prefersReducedMotion, scrollTo } from "@/lib/motion/scroll";
import { dur, ease, stagger, staggerFor } from "@/lib/motion/tokens";
import { useIntroDone, useRole, useRoleChosen } from "@/lib/prefs";
import { HeroScene } from "./scene";
import { sceneState } from "./scene-state";

const CYCLE_MS = 2600;

const btn =
  "relative overflow-hidden inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-colors duration-[var(--dur-base)]";

const STICKERS: { t: string; cls: string; pos: string }[] = [
  { t: "Full-stack TypeScript", cls: "bg-c3 -rotate-6", pos: "top-[21%] left-[36%]" },
  { t: "Anomaly detection", cls: "bg-c4 rotate-3", pos: "top-[44%] right-[2%]" },
  { t: "LLM systems", cls: "bg-c5 -rotate-3", pos: "top-[60%] left-[42%]" },
];

export function HeroClient({
  hasResume,
  location,
}: {
  hasResume: boolean;
  location: string;
}) {
  const root = useRef<HTMLElement>(null);
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

  // The title scrambles into place when the previewed role changes.
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
        { opacity: 0.4 },
        {
          opacity: 1,
          duration: 0.7,
          ease: ease.out,
          scrambleText: { text: ROLE_COPY[shown].title, chars: "upperCase", speed: 0.9 },
        },
      );
      gsap.fromTo(
        bodyEl.current,
        { y: 8, opacity: 0 },
        { y: 0, opacity: 1, duration: dur.base, ease: ease.out },
      );
    },
    { scope: root, dependencies: [shown] },
  );

  // Entrance on preloader hand-off, then the pinned scroll scene (desktop only).
  useGSAP(
    () => {
      if (!done) return;
      const el = root.current;
      if (!el) return;

      // Reduced motion and phones: no choreography, the content is simply there.
      if (prefersReducedMotion() || document.documentElement.dataset.noIntro) {
        gsap.set(el.querySelectorAll(".hero-fade, .hero-name"), { opacity: 1 });
        sceneState.scroll = 0;
        return;
      }

      const splits = gsap.utils
        .toArray<HTMLElement>(".hero-line")
        .map((l) => SplitText.create(l, { type: "chars", mask: "chars", aria: "none" }));
      gsap.set(el.querySelector(".hero-name"), { opacity: 1 });

      const intro = gsap.timeline({ defaults: { ease: ease.out } });
      splits.forEach((s, i) =>
        intro.from(
          s.chars,
          {
            yPercent: 115,
            rotate: i === 0 ? 8 : -8,
            duration: dur.hero,
            stagger: staggerFor(s.chars.length, stagger.char),
          },
          i * 0.12,
        ),
      );
      intro.fromTo(
        ".hero-fade",
        { y: 28, opacity: 0 },
        { y: 0, opacity: 1, duration: dur.slow, stagger: 0.08 },
        0.4,
      );

      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px)", () => {
        // The scene: name tears apart, the crystal swells, a lime iris opens.
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: el,
            start: "top top",
            end: "+=170%",
            scrub: 0.7,
            pin: true,
            anticipatePin: 1,
            onUpdate: (self) => {
              sceneState.scroll = self.progress;
            },
          },
        });
        tl.to(".hero-line-1", { xPercent: -34, scale: 1.12 }, 0)
          .to(".hero-line-2", { xPercent: 30, scale: 1.12 }, 0)
          .to(".hero-bottom", { y: 140, opacity: 0, duration: 0.35 }, 0)
          .to(".hero-sticker", { y: -160, opacity: 0, duration: 0.4, stagger: 0.04 }, 0)
          .to(
            ".hero-iris",
            { clipPath: "circle(150% at 50% 52%)", ease: "power2.in", duration: 0.5 },
            0.5,
          );
        return () => {
          sceneState.scroll = 0;
        };
      });
    },
    { scope: root, dependencies: [done] },
  );

  const copy = ROLE_COPY[shown];

  return (
    <section
      ref={root}
      id="top"
      data-world="ink"
      data-hud="Intro"
      aria-label="Introduction"
      className="bg-bg text-fg relative isolate flex min-h-[100svh] flex-col justify-between overflow-hidden"
    >
      <HeroScene />

      {/* Corner furniture. Decorative. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[15]">
        {["top-24 left-3", "top-24 right-3", "bottom-3 left-3", "bottom-3 right-3"].map(
          (p) => (
            <span key={p} className={`absolute ${p} text-fg-muted font-mono text-lg`}>
              +
            </span>
          ),
        )}
        {STICKERS.map((s) => (
          <span
            key={s.t}
            className={`hero-sticker border-ink text-ink absolute hidden rounded-full border-2 px-4 py-1.5 font-mono text-xs font-medium shadow-[4px_4px_0_0_var(--ink)] lg:block ${s.cls} ${s.pos}`}
          >
            {s.t}
          </span>
        ))}
      </div>

      <div className="relative z-10 flex flex-1 flex-col justify-between px-[var(--gutter)] pt-24 pb-24">
        <div className="hero-fade text-fg-muted flex items-center justify-between font-mono text-[11px] tracking-widest uppercase">
          <span>SVK / 2026</span>
          <span className="hidden md:inline">Software · Data · AI</span>
          <span>{location}</span>
        </div>

        {/* The name. Overprinted against the crystal with a difference blend on desktop. */}
        <h1
          className="hero-name font-display my-auto leading-[0.78] font-semibold tracking-tighter text-[#f4f0e6] lg:mix-blend-difference"
          style={{ fontSize: "clamp(4.2rem, 21.5vw, 26rem)" }}
        >
          <span className="sr-only">S V Kaushik</span>
          <span
            aria-hidden="true"
            className="hero-line-1 block origin-left whitespace-nowrap"
          >
            <span className="hero-line block">S V</span>
          </span>
          <span
            aria-hidden="true"
            className="hero-line-2 block origin-right whitespace-nowrap"
          >
            <span className="hero-line block">KAUSHIK</span>
          </span>
        </h1>

        <div className="hero-bottom grid items-end gap-8 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p className="hero-fade font-display text-[length:var(--text-2xl)] leading-none">
              <span className="text-accent" aria-hidden="true">
                /{" "}
              </span>
              <span ref={titleEl}>{reduced ? "Software, Data, AI" : copy.title}</span>
            </p>
            <p
              ref={bodyEl}
              className="hero-fade text-fg-muted mt-3 max-w-lg text-lg leading-relaxed"
            >
              {copy.line}
            </p>
            <div className="hero-fade mt-6">
              <RoleSwitcher chosen={chosen} preview={shown} />
            </div>
          </div>
          <div className="hero-fade flex flex-wrap items-center gap-3 lg:col-span-6 lg:justify-end">
            <Magnetic>
              <a
                href="#work"
                data-ripple
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo("#work");
                }}
                className={`${btn} bg-c4 text-ink border-ink border-2 shadow-[4px_4px_0_0_var(--ink)] hover:brightness-105`}
              >
                View work <span aria-hidden="true">↓</span>
              </a>
            </Magnetic>
            <Magnetic>
              <button
                type="button"
                data-ripple
                onClick={() => window.dispatchEvent(new CustomEvent("chat:open"))}
                className={`${btn} hover:text-ink border-2 border-[#f4f0e6] text-[#f4f0e6] hover:bg-[#f4f0e6]`}
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
        </div>
      </div>

      {/* The iris: opens on scroll and becomes the next (lime) world. Desktop only. */}
      <div
        aria-hidden="true"
        data-world="lime"
        className="hero-iris bg-bg text-fg absolute inset-0 z-20 hidden place-items-center lg:grid"
        style={{ clipPath: "circle(0% at 50% 52%)" }}
      >
        <div className="px-[var(--gutter)] text-center">
          <p className="font-display text-[clamp(6rem,19vw,22rem)] leading-[0.82] font-semibold tracking-tighter">
            HELLO,
            <br />
            WORLD.
          </p>
          <p className="mt-8 font-mono text-sm tracking-widest uppercase">
            I&apos;m Kaushik. It only gets louder from here ↓
          </p>
        </div>
      </div>
    </section>
  );
}
