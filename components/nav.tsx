"use client";

import { usePathname, useRouter } from "next/navigation";
import { animate } from "animejs";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { scrollTo } from "@/lib/motion/scroll";
import { useTheme } from "@/lib/prefs";

const LINKS = [
  { href: "#work", label: "Work" },
  { href: "#about", label: "About" },
  { href: "#skills", label: "Skills" },
  { href: "#github", label: "GitHub" },
  { href: "#contact", label: "Contact" },
] as const;

const subscribeScroll = (cb: () => void) => {
  window.addEventListener("scroll", cb, { passive: true });
  return () => window.removeEventListener("scroll", cb);
};

/** True once the page has scrolled, so the bar can gain a background. */
const useScrolled = () =>
  useSyncExternalStore(
    subscribeScroll,
    () => window.scrollY > 24,
    () => false,
  );

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
  const pathname = usePathname();
  const router = useRouter();
  const scrolled = useScrolled();
  const list = useRef<HTMLUListElement>(null);
  const pill = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  // Track which home section is under the middle of the viewport.
  useEffect(() => {
    if (pathname !== "/") return;
    const targets: { href: string; el: Element }[] = [];
    for (const l of LINKS) {
      const el = document.querySelector(l.href);
      if (el) targets.push({ href: l.href, el });
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting)
            setActive(targets.find((t) => t.el === e.target)?.href ?? null);
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    targets.forEach((t) => io.observe(t.el));
    return () => io.disconnect();
  }, [pathname]);

  // The pill slides to the hovered link, or rests on the active section.
  const target = pathname === "/" ? (hovered ?? active) : hovered;
  useEffect(() => {
    const p = pill.current;
    const a = target
      ? list.current?.querySelector<HTMLElement>(`a[href="${target}"]`)
      : null;
    if (!p) return;
    if (!a) {
      animate(p, { opacity: 0, duration: 250, ease: "outQuad" });
      return;
    }
    animate(p, {
      translateX: a.offsetLeft,
      width: a.offsetWidth,
      opacity: 1,
      duration: 480,
      ease: "outExpo",
    });
  }, [target]);

  const go = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    setOpen(false);
    // Off the home page, anchors become real navigations back to a home section.
    if (pathname !== "/") router.push(`/${href}`);
    else scrollTo(href);
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-[70] border-b transition-[background-color,border-color,backdrop-filter] duration-[var(--dur-base)] ${
        scrolled ? "border-line bg-bg/70 backdrop-blur-lg" : "border-transparent"
      }`}
      style={{ viewTransitionName: "site-header" }}
    >
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

        <ul
          ref={list}
          onPointerLeave={() => setHovered(null)}
          className="border-line bg-surface/60 relative hidden items-center gap-1 rounded-full border px-2 py-1.5 backdrop-blur-lg md:flex"
        >
          <span
            ref={pill}
            aria-hidden="true"
            className="bg-surface-2 pointer-events-none absolute top-1.5 bottom-1.5 left-0 w-0 rounded-full opacity-0"
          />
          {LINKS.map((l) => (
            <li key={l.href} onPointerEnter={() => setHovered(l.href)}>
              <a
                href={l.href}
                onClick={(e) => go(e, l.href)}
                onFocus={() => setHovered(l.href)}
                onBlur={() => setHovered(null)}
                aria-current={
                  pathname === "/" && active === l.href ? "location" : undefined
                }
                className={`relative rounded-full px-3.5 py-1.5 text-sm transition-colors ${
                  target === l.href ? "text-fg" : "text-fg-muted"
                }`}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("palette:open"))}
            aria-label="Open command palette"
            className="border-line text-fg-muted hover:border-accent hover:text-fg hidden items-center gap-2 rounded-full border px-3 py-2 font-mono text-xs transition-colors sm:flex"
          >
            Search{" "}
            <kbd className="border-line rounded border px-1.5 text-[10px]">Ctrl K</kbd>
          </button>
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
