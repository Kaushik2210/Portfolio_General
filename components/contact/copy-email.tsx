"use client";

import { animate } from "animejs";
import { useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/motion/scroll";

/** Click to copy. Falls back to selecting the text if the clipboard is blocked. */
export function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);
  const icon = useRef<HTMLSpanElement>(null);
  const timer = useRef<number | null>(null);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      const sel = window.getSelection();
      const range = document.createRange();
      const node = document.getElementById("copy-email-text");
      if (node && sel) {
        range.selectNodeContents(node);
        sel.removeAllRanges();
        sel.addRange(range);
      }
      return;
    }
    setCopied(true);
    if (icon.current && !prefersReducedMotion()) {
      animate(icon.current, {
        scale: [0.4, 1],
        rotate: [-20, 0],
        duration: 450,
        ease: "outBack",
      });
    }
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={copy}
      data-cursor
      className="group border-line hover:border-accent flex w-full items-center justify-between gap-4 rounded-[var(--radius)] border px-5 py-4 text-left transition-colors"
    >
      <span>
        <span className="text-fg-muted block font-mono text-xs tracking-widest uppercase">
          Email
        </span>
        <span id="copy-email-text" className="mt-1 block text-lg">
          {email}
        </span>
      </span>
      <span ref={icon} aria-hidden="true" className="text-accent">
        {copied ? "Copied ✓" : "Copy"}
      </span>
      <span className="sr-only" role="status">
        {copied ? "Email address copied" : ""}
      </span>
    </button>
  );
}
