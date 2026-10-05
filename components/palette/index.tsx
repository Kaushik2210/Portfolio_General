"use client";

import { Command } from "cmdk";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ROLE_COPY, ROLE_ORDER } from "@/lib/copy";
import { projects, SITE } from "@/lib/data";
import { scrollTo } from "@/lib/motion/scroll";
import { roleStore, themeStore } from "@/lib/prefs";

const NAV = [
  { id: "top", label: "Home" },
  { id: "work", label: "Work" },
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "github", label: "GitHub activity" },
  { id: "contact", label: "Contact" },
] as const;

const item =
  "flex cursor-pointer items-center justify-between gap-3 rounded-[var(--radius-sm)] px-3 py-2.5 text-sm text-fg-muted aria-selected:bg-surface-2 aria-selected:text-fg";
const heading =
  "[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:tracking-widest [&_[cmdk-group-heading]]:text-accent [&_[cmdk-group-heading]]:uppercase";

/** Cmd/Ctrl+K: navigate, switch role, toggle theme, open the resume, ask the AI. */
export function CommandPalette({ hasResume }: { hasResume: boolean }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("palette:open", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("palette:open", onOpen);
    };
  }, []);

  const change = useCallback((o: boolean) => {
    setOpen(o);
    if (!o) setQuery("");
  }, []);

  const run = useCallback(
    (fn: () => void) => {
      change(false);
      // Let the dialog unmount before moving focus or scrolling.
      requestAnimationFrame(fn);
    },
    [change],
  );

  const go = (id: string) =>
    run(() => {
      if (pathname !== "/") router.push(id === "top" ? "/" : `/#${id}`);
      else scrollTo(id === "top" ? 0 : `#${id}`);
    });

  const fire = (name: string, detail?: object) =>
    run(() => window.dispatchEvent(new CustomEvent(name, { detail })));

  const q = query.trim();

  return (
    <Command.Dialog
      open={open}
      onOpenChange={change}
      label="Command palette"
      overlayClassName="fixed inset-0 z-[130] bg-bg/60 backdrop-blur-sm"
      contentClassName="fixed top-[12svh] left-1/2 z-[131] w-[min(640px,calc(100vw-1.5rem))] -translate-x-1/2 overflow-hidden rounded-[var(--radius-lg)] border border-line bg-surface shadow-2xl"
    >
      <div className="border-line flex items-center gap-3 border-b px-4">
        <span aria-hidden="true" className="text-accent font-mono">
          ⌘
        </span>
        <Command.Input
          value={query}
          onValueChange={setQuery}
          placeholder="Search, jump, or ask..."
          className="text-fg placeholder:text-fg-muted h-14 w-full bg-transparent text-base outline-none"
        />
        <kbd className="border-line text-fg-muted hidden rounded border px-1.5 py-0.5 font-mono text-[10px] sm:block">
          esc
        </kbd>
      </div>

      <Command.List
        data-lenis-prevent
        className={`max-h-[min(55svh,420px)] overflow-y-auto p-2 ${heading}`}
      >
        <Command.Empty className="text-fg-muted px-4 py-8 text-center text-sm">
          Nothing matches. Try asking the AI.
        </Command.Empty>

        {q.length > 2 && (
          <Command.Group heading="Ask">
            <Command.Item
              value={`ask ai ${q}`}
              forceMount
              onSelect={() => fire("chat:open", { prompt: q.slice(0, 1500) })}
              className={item}
            >
              <span>
                Ask the AI: <span className="text-fg">&ldquo;{q}&rdquo;</span>
              </span>
              <span aria-hidden="true">↵</span>
            </Command.Item>
          </Command.Group>
        )}

        <Command.Group heading="Go to">
          {NAV.map((n) => (
            <Command.Item
              key={n.id}
              value={`go ${n.label}`}
              onSelect={() => go(n.id)}
              className={item}
            >
              {n.label}
            </Command.Item>
          ))}
        </Command.Group>

        <Command.Group heading="Case studies">
          {projects.map((p) => (
            <Command.Item
              key={p.slug}
              value={`case study ${p.title}`}
              keywords={[p.tagline, ...p.stack]}
              onSelect={() => run(() => router.push(`/work/${p.slug}`))}
              className={item}
            >
              {p.title}
              <span className="truncate font-mono text-[11px]">
                {p.stack.slice(0, 2).join(" / ")}
              </span>
            </Command.Item>
          ))}
        </Command.Group>

        <Command.Group heading="View as">
          {ROLE_ORDER.map((r) => (
            <Command.Item
              key={r}
              value={`view as ${ROLE_COPY[r].label} ${ROLE_COPY[r].title}`}
              onSelect={() => run(() => roleStore.set(r))}
              className={item}
            >
              {ROLE_COPY[r].title}
              <span className="font-mono text-[11px]">{ROLE_COPY[r].label}</span>
            </Command.Item>
          ))}
        </Command.Group>

        <Command.Group heading="Actions">
          <Command.Item
            value="ask the ai chat"
            onSelect={() => fire("chat:open")}
            className={item}
          >
            Ask the AI about his work
          </Command.Item>
          <Command.Item
            value="fit check job description"
            onSelect={() => fire("chat:open", { mode: "fit" })}
            className={item}
          >
            Fit-check a job description
          </Command.Item>
          <Command.Item
            value="toggle theme dark light"
            onSelect={() =>
              run(() => themeStore.set(themeStore.get() === "dark" ? "light" : "dark"))
            }
            className={item}
          >
            Toggle theme
          </Command.Item>
          <Command.Item
            value="open terminal mode"
            onSelect={() => fire("terminal:open")}
            className={item}
          >
            Open terminal mode
            <kbd className="border-line rounded border px-1.5 py-0.5 font-mono text-[10px]">
              ~
            </kbd>
          </Command.Item>
          {hasResume && (
            <Command.Item
              value="open resume pdf"
              onSelect={() => run(() => window.open("/resume.pdf", "_blank", "noopener"))}
              className={item}
            >
              Open resume
            </Command.Item>
          )}
          <Command.Item
            value="copy email address"
            onSelect={() => run(() => void navigator.clipboard?.writeText(SITE.email))}
            className={item}
          >
            Copy email
            <span className="font-mono text-[11px]">{SITE.email}</span>
          </Command.Item>
          <Command.Item
            value="github profile"
            onSelect={() => run(() => window.open(SITE.github, "_blank", "noopener"))}
            className={item}
          >
            Open GitHub
          </Command.Item>
          <Command.Item
            value="linkedin profile"
            onSelect={() => run(() => window.open(SITE.linkedin, "_blank", "noopener"))}
            className={item}
          >
            Open LinkedIn
          </Command.Item>
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  );
}
