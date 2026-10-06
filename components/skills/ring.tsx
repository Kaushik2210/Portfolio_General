"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/motion/gsap";
import { prefersReducedMotion } from "@/lib/motion/scroll";
import type { Role } from "@/lib/types";

interface Item {
  name: string;
  group: Role;
}

const BG: Record<Role, string> = { sde: "bg-accent", data: "bg-data", ai: "bg-c3" };

/**
 * A 3D carousel of skills (CSS preserve-3d). It turns on its own, can be
 * grabbed and flung with momentum, and items on the far side fade back.
 * Decorative: the real skill list sits right beside it.
 */
export function SkillRing({ items }: { items: Item[] }) {
  const stage = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const radius = 390;
  const step = 360 / items.length;

  useGSAP(
    () => {
      const el = ring.current;
      const host = stage.current;
      if (!el || !host) return;

      const state = { rot: 0 };
      const cards = [...el.querySelectorAll<HTMLElement>("[data-ring-item]")];

      const paint = () => {
        gsap.set(el, { rotationY: state.rot });
        cards.forEach((c, i) => {
          // How much this card faces the viewer: 1 front, -1 behind.
          const facing = Math.cos(((i * step + state.rot) * Math.PI) / 180);
          const t = (facing + 1) / 2;
          c.style.opacity = String(0.25 + 0.75 * t);
          c.style.filter = t < 0.55 ? "saturate(0.5)" : "none";
        });
      };
      paint();

      const spin = prefersReducedMotion()
        ? null
        : gsap.to(state, {
            rot: "+=360",
            duration: 48,
            ease: "none",
            repeat: -1,
            onUpdate: paint,
          });

      // Drag to spin, release to coast.
      let dragging = false;
      let lastX = 0;
      let velocity = 0;
      const down = (e: PointerEvent) => {
        dragging = true;
        lastX = e.clientX;
        velocity = 0;
        spin?.pause();
        gsap.killTweensOf(state);
        host.setPointerCapture(e.pointerId);
        host.style.cursor = "grabbing";
      };
      const move = (e: PointerEvent) => {
        if (!dragging) return;
        const dx = e.clientX - lastX;
        lastX = e.clientX;
        velocity = dx;
        state.rot += dx * 0.45;
        paint();
      };
      const up = () => {
        if (!dragging) return;
        dragging = false;
        host.style.cursor = "grab";
        gsap.to(state, {
          rot: `+=${velocity * 22}`,
          duration: 1.6,
          ease: "power3.out",
          onUpdate: paint,
          onComplete: () => void spin?.resume(),
        });
      };
      host.addEventListener("pointerdown", down);
      host.addEventListener("pointermove", move);
      host.addEventListener("pointerup", up);
      host.addEventListener("pointercancel", up);

      return () => {
        host.removeEventListener("pointerdown", down);
        host.removeEventListener("pointermove", move);
        host.removeEventListener("pointerup", up);
        host.removeEventListener("pointercancel", up);
      };
    },
    { scope: stage },
  );

  return (
    <div className="mt-[clamp(56px,10vw,128px)]">
      <p className="reveal text-fg-muted mb-6 font-mono text-xs tracking-widest uppercase">
        Spin the stack <span className="text-accent">/ drag me</span>
      </p>
      <div
        ref={stage}
        aria-hidden="true"
        className="border-line bg-surface/40 relative h-[400px] cursor-grab touch-pan-y overflow-hidden rounded-[var(--radius-lg)] border select-none"
        style={{ perspective: "1200px", perspectiveOrigin: "50% 30%" }}
      >
        <div
          ref={ring}
          className="absolute top-1/2 left-1/2 h-0 w-0"
          style={{
            transformStyle: "preserve-3d",
            transform: "translateY(-20px) rotateX(-5deg)",
          }}
        >
          {items.map((it, i) => (
            <div
              key={it.name}
              data-ring-item
              className={`${BG[it.group]} border-ink font-display text-ink absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 px-6 py-3 text-xl font-semibold whitespace-nowrap shadow-[5px_5px_0_0_var(--ink)]`}
              style={{
                transform: `rotateY(${i * step}deg) translateZ(${radius}px)`,
                backfaceVisibility: "hidden",
              }}
            >
              {it.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
