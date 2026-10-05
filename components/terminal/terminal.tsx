"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { SITE } from "@/lib/data";
import { roleStore, themeStore } from "@/lib/prefs";
import type { Role } from "@/lib/types";
import {
  about,
  COMMANDS,
  contact,
  HELP,
  listProjects,
  projectSlugs,
  skills,
} from "./commands";

interface Line {
  kind: "in" | "out" | "err";
  text: string;
}

const PROMPT = "kaushik@portfolio:~$";

export default function Terminal({
  hasResume,
  onClose,
}: {
  hasResume: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [lines, setLines] = useState<Line[]>([
    { kind: "out", text: `${SITE.name} portfolio shell. Type 'help' to begin.` },
  ]);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const history = useRef<string[]>([]);
  const cursor = useRef(-1);
  const input = useRef<HTMLInputElement>(null);
  const screen = useRef<HTMLDivElement>(null);
  const abort = useRef<AbortController | null>(null);

  useEffect(() => {
    input.current?.focus();
    return () => abort.current?.abort();
  }, []);

  useEffect(() => {
    const el = screen.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  const print = useCallback((kind: Line["kind"], text: string[]) => {
    setLines((l) => [...l, ...text.map((t) => ({ kind, text: t }))]);
  }, []);

  const ask = useCallback(
    async (question: string) => {
      if (!question) return print("err", ["usage: ask <question>"]);
      setBusy(true);
      setLines((l) => [...l, { kind: "out", text: "" }]);
      const ctl = new AbortController();
      abort.current = ctl;
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            mode: "chat",
            messages: [{ role: "user", content: question.slice(0, 1500) }],
          }),
          signal: ctl.signal,
        });
        if (!res.ok || !res.body) {
          const offline = res.status === 503;
          setLines((l) => l.slice(0, -1));
          print("err", [
            offline
              ? `assistant offline. Email ${SITE.email} instead.`
              : res.status === 429
                ? "rate limited. Try again in a few minutes."
                : "request failed. Try again.",
          ]);
          return;
        }
        const reader = res.body.getReader();
        const dec = new TextDecoder();
        for (;;) {
          const { value: chunk, done } = await reader.read();
          if (done) break;
          const text = dec.decode(chunk, { stream: true });
          setLines((l) => {
            const copy = l.slice();
            copy[copy.length - 1] = {
              ...copy[copy.length - 1],
              text: copy[copy.length - 1].text + text,
            };
            return copy;
          });
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") print("err", ["connection dropped."]);
      } finally {
        setBusy(false);
      }
    },
    [print],
  );

  const run = useCallback(
    (raw: string) => {
      const [cmd, ...rest] = raw.trim().split(/\s+/);
      const arg = rest.join(" ");
      switch (cmd?.toLowerCase()) {
        case "":
        case undefined:
          return;
        case "help":
          return print("out", HELP);
        case "about":
          return print("out", about());
        case "projects":
        case "ls":
          return print("out", listProjects(rest[0]));
        case "open": {
          const slug = rest[0]?.toLowerCase();
          if (!slug || !projectSlugs().includes(slug)) {
            return print("err", [
              `open: unknown slug '${rest[0] ?? ""}'. Try 'projects'.`,
            ]);
          }
          print("out", [`opening ${slug}...`]);
          router.push(`/work/${slug}`);
          return onClose();
        }
        case "skills":
          return print("out", skills());
        case "contact":
          return print("out", contact());
        case "resume":
          if (!hasResume)
            return print("err", ["resume: not available yet. Try 'contact'."]);
          window.open("/resume.pdf", "_blank", "noopener");
          return print("out", ["opening resume.pdf in a new tab..."]);
        case "ask":
          return void ask(arg);
        case "role": {
          const r = (["sde", "data", "ai"] as const).find(
            (x) => x === rest[0]?.toLowerCase(),
          );
          if (!r) return print("err", ["usage: role <sde|data|ai>"]);
          roleStore.set(r as Role);
          return print("out", [`role view set to ${r.toUpperCase()}.`]);
        }
        case "theme": {
          const next = themeStore.get() === "dark" ? "light" : "dark";
          themeStore.set(next);
          return print("out", [`theme: ${next}`]);
        }
        case "clear":
          return setLines([]);
        case "exit":
        case "quit":
          return onClose();
        default:
          return print("err", [`command not found: ${cmd}. Type 'help'.`]);
      }
    },
    [ask, hasResume, onClose, print, router],
  );

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const text = value;
    setValue("");
    cursor.current = -1;
    if (text.trim()) history.current.unshift(text);
    setLines((l) => [...l, { kind: "in", text }]);
    run(text);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      cursor.current = Math.min(cursor.current + 1, history.current.length - 1);
      setValue(history.current[cursor.current] ?? "");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      cursor.current = Math.max(cursor.current - 1, -1);
      setValue(cursor.current === -1 ? "" : history.current[cursor.current]);
    } else if (e.key === "Tab") {
      e.preventDefault();
      const [first, ...rest] = value.split(" ");
      if (rest.length === 0) {
        const m = COMMANDS.filter((c) => c.startsWith(first.toLowerCase()));
        if (m.length === 1) setValue(`${m[0]} `);
      } else if (first === "open") {
        const m = projectSlugs().filter((s) =>
          s.startsWith(rest.join(" ").toLowerCase()),
        );
        if (m.length === 1) setValue(`open ${m[0]}`);
      }
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Terminal mode"
      data-lenis-prevent
      className="bg-bg/70 fixed inset-0 z-[120] flex items-end justify-center p-3 backdrop-blur-sm sm:items-center sm:p-8"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="border-line flex h-[min(80svh,640px)] w-full max-w-3xl flex-col overflow-hidden rounded-[var(--radius-lg)] border bg-[#06070a] font-mono text-[13px] text-[#d9d5cc] shadow-2xl"
        onClick={() => input.current?.focus()}
      >
        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
          <span aria-hidden="true" className="size-3 rounded-full bg-[#ff5f57]" />
          <span aria-hidden="true" className="size-3 rounded-full bg-[#febc2e]" />
          <span aria-hidden="true" className="size-3 rounded-full bg-[#28c840]" />
          <span className="ml-3 text-xs text-white/50">portfolio: zsh</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close terminal"
            className="ml-auto text-xs text-white/50 hover:text-white"
          >
            esc
          </button>
        </div>

        <div
          ref={screen}
          role="log"
          aria-live="polite"
          className="min-h-0 flex-1 space-y-0.5 overflow-y-auto p-4"
        >
          {lines.map((l, i) => (
            <p
              key={i}
              className={`break-words whitespace-pre-wrap ${l.kind === "err" ? "text-[#ff7a5c]" : l.kind === "in" ? "text-white" : ""}`}
            >
              {l.kind === "in" && <span className="mr-2 text-[#6ee7d8]">{PROMPT}</span>}
              {l.text}
            </p>
          ))}
        </div>

        <form
          onSubmit={submit}
          className="flex items-center gap-2 border-t border-white/10 px-4 py-3"
        >
          <label htmlFor="term-input" className="text-[#6ee7d8]">
            {PROMPT}
          </label>
          <input
            id="term-input"
            ref={input}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={busy}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            maxLength={500}
            className="min-w-0 flex-1 bg-transparent text-white outline-none"
          />
        </form>
      </div>
    </div>
  );
}
