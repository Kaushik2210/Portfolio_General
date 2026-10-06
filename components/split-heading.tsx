"use client";

import { useRef } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/motion/gsap";
import { prefersReducedMotion } from "@/lib/motion/scroll";
import { dur, ease } from "@/lib/motion/tokens";

interface Props {
  id?: string;
  /** Heading level. Panels use h3 under a section h2. */
  as?: "h2" | "h3";
  className?: string;
  children: string;
}

/** Section heading whose words rise out of a mask as it scrolls into view. */
export function SplitHeading({ id, as: Tag = "h2", className = "", children }: Props) {
  const el = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      const node = el.current;
      if (!node) return;
      if (prefersReducedMotion()) {
        gsap.set(node, { opacity: 1 });
        return;
      }
      const split = SplitText.create(node, { type: "words", mask: "words" });
      gsap.set(node, { opacity: 1 });
      gsap.from(split.words, {
        yPercent: 115,
        rotationX: -75,
        transformPerspective: 700,
        transformOrigin: "50% 100%",
        duration: dur.hero,
        ease: ease.out,
        stagger: 0.09,
        scrollTrigger: { trigger: node, start: "top 88%", once: true },
      });
    },
    { scope: el },
  );

  return (
    <Tag ref={el} id={id} className={`split-hidden ${className}`}>
      {children}
    </Tag>
  );
}
