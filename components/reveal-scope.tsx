"use client";

import { useRef } from "react";
import { useScrollReveal } from "@/lib/motion/reveal";

/** Wrap a block: any `.reveal` inside fades up on scroll. */
export function RevealScope({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useScrollReveal(ref);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
