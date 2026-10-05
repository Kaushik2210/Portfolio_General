"use client";

import { useRef } from "react";
import { ROLE_COPY, ROLE_ORDER } from "@/lib/copy";
import { useRole } from "@/lib/prefs";
import type { Role } from "@/lib/types";

/** "View as: SDE | Data | AI". Re-orders projects and skills across the site. */
export function RoleSwitcher({
  chosen = true,
  preview,
}: {
  chosen?: boolean;
  /** Role the hero is previewing while the visitor has not chosen one yet. */
  preview?: Role;
}) {
  const [role, setRole] = useRole();
  const refs = useRef<Record<Role, HTMLButtonElement | null>>({
    sde: null,
    data: null,
    ai: null,
  });
  const shown = chosen || !preview ? role : preview;
  const index = ROLE_ORDER.indexOf(shown);

  const onKey = (e: React.KeyboardEvent) => {
    const step =
      e.key === "ArrowRight" || e.key === "ArrowDown"
        ? 1
        : e.key === "ArrowLeft" || e.key === "ArrowUp"
          ? -1
          : 0;
    if (!step) return;
    e.preventDefault();
    const next = ROLE_ORDER[(index + step + ROLE_ORDER.length) % ROLE_ORDER.length];
    setRole(next);
    refs.current[next]?.focus();
  };

  return (
    <div className="flex items-center gap-3">
      <span
        id="view-as"
        className="text-fg-muted font-mono text-xs tracking-widest uppercase"
      >
        View as
      </span>
      <div
        role="radiogroup"
        aria-labelledby="view-as"
        onKeyDown={onKey}
        className="border-line bg-surface/60 relative grid grid-cols-3 rounded-full border p-1 backdrop-blur-lg"
      >
        <span
          aria-hidden="true"
          className="bg-accent absolute inset-y-1 left-1 w-[calc((100%-0.5rem)/3)] rounded-full transition-[transform,opacity] duration-[var(--dur-base)] ease-[var(--ease-out)]"
          style={{ transform: `translateX(${index * 100}%)`, opacity: chosen ? 1 : 0.35 }}
        />
        {ROLE_ORDER.map((r) => (
          <button
            key={r}
            ref={(el) => {
              refs.current[r] = el;
            }}
            type="button"
            role="radio"
            aria-checked={role === r}
            tabIndex={role === r ? 0 : -1}
            onClick={() => setRole(r)}
            className={`relative z-10 rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-[var(--dur-base)] ${
              shown === r && chosen ? "text-accent-ink" : "text-fg-muted hover:text-fg"
            }`}
          >
            {ROLE_COPY[r].label}
          </button>
        ))}
      </div>
    </div>
  );
}
