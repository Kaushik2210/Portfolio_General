"use client";

import { useState } from "react";
import { scrollTo } from "@/lib/motion/scroll";
import { useTheme } from "@/lib/prefs";

const LINKS = [
  { href: "#work", label: "Work" },
  { href: "#about", label: "About" },
  { href: "#skills", label: "Skills" },
  { href: "#github", label: "GitHub" },
  { href: "#contact", label: "Contact" },
] as const;

function ThemeToggle() {
  const [theme, setTheme] = useTheme();
  const next = theme === "dark" ? "light" : "dark";
  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={`Switch to ${next} theme`}
      className="border-line text-fg-muted hover:border-accent hover:text-fg grid size-9 place-items-center rounded-full border transition-colors"
    >
      <svg
        viewBox="0 0 24 24"
        className="size-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        {theme === "dark" ? (
          <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
        ) : (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </>
        )}
      </svg>
    </button>
  );
}

export function Nav() {
  const [open, setOpen] = useState(false);

  const go = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    setOpen(false);
    scrollTo(href);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-[70]">
      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-[1280px] items-center justify-between px-[var(--gutter)] py-4"
      >
        <a
          href="#top"
          onClick={(e) => go(e, "#top")}
          className="font-display text-lg font-semibold tracking-tight"
        >
          S V Kaushik<span className="text-accent">.</span>
        </a>

        <ul className="border-line bg-surface/60 hidden items-center gap-1 rounded-full border px-2 py-1.5 backdrop-blur-lg md:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                onClick={(e) => go(e, l.href)}
                className="text-fg-muted hover:bg-surface-2 hover:text-fg rounded-full px-3.5 py-1.5 text-sm transition-colors"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((o) => !o)}
            className="border-line rounded-full border px-4 py-2 text-sm md:hidden"
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </nav>

      {open && (
        <ul
          id="mobile-menu"
          className="border-line bg-surface/90 mx-[var(--gutter)] rounded-[var(--radius-lg)] border p-2 backdrop-blur-lg md:hidden"
        >
          {LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                onClick={(e) => go(e, l.href)}
                className="hover:bg-surface-2 block rounded-[var(--radius)] px-4 py-3 text-lg"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
