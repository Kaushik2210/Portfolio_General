"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/motion/gsap";
import { prefersReducedMotion } from "@/lib/motion/scroll";

/** Mono section label that scrambles into place the first time it is seen. */
export function Eyebrow({
  children,
  className = "",
}: {
  children: string;
  className?: string;
}) {
  const el = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      const node = el.current;
      if (!node || prefersReducedMotion()) return;
      gsap.to(node, {
        duration: 1.1,
        scrambleText: { text: children, chars: "01/<>_#", speed: 0.5, revealDelay: 0.2 },
        scrollTrigger: { trigger: node, start: "top 90%", once: true },
      });
    },
    { scope: el, dependencies: [children] },
  );

  return (
    <p
      ref={el}
      className={`reveal text-accent font-mono text-xs tracking-widest uppercase ${className}`}
    >
      {children}
    </p>
  );
}
