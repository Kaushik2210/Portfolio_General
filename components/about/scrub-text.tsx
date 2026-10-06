"use client";

import { useRef } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/motion/gsap";
import { prefersReducedMotion } from "@/lib/motion/scroll";

/** Words light up from muted to full contrast as the paragraph scrolls through. */
export function ScrubText({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const el = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion() || !el.current) return;
      const split = SplitText.create(el.current, { type: "words", aria: "none" });
      gsap.fromTo(
        split.words,
        { opacity: 0.75 },
        {
          opacity: 1,
          ease: "none",
          stagger: 0.06,
          scrollTrigger: {
            trigger: el.current,
            start: "top 92%",
            end: "bottom 78%",
            scrub: 0.6,
          },
        },
      );
    },
    { scope: el },
  );

  return (
    <p ref={el} className={className}>
      {text}
    </p>
  );
}
