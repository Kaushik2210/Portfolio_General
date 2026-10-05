"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { projects, SITE } from "@/lib/data";
import { staticFaq, STARTERS } from "@/lib/chat/static-faq";
import { Markdown } from "./markdown";

type Mode = "chat" | "fit";
interface Msg {
  role: "user" | "assistant";
  content: string;
}
type Problem = null | { kind: "offline" | "rate" | "error"; text: string };

const MAX_MSG = 1500;
const MAX_JD = 6500;
const MAX_TURNS = 20;
const TITLES = new Map(projects.map((p) => [p.slug, p.title]));

/** Case studies an answer links to, shown as source chips under it. */
function sourcesOf(text: string): string[] {
  const slugs = [...text.matchAll(/\/work\/([a-z0-9-]+)/g)].map((m) => m[1]);
  return [...new Set(slugs)].filter((s) => TITLES.has(s));
}

interface Props {
  onClose: () => void;
  initialMode?: Mode;
  initialPrompt?: string;
}

export default function ChatPanel({
  onClose,
  initialMode = "chat",
  initialPrompt,
}: Props) {
  const titleId = useId();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [full, setFull] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [jd, setJd] = useState("");
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<Problem>(null);
  const [available, setAvailable] = useState<boolean | null>(null);

  const root = useRef<HTMLDivElement>(null);
  const log = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLTextAreaElement>(null);
  const abort = useRef<AbortController | null>(null);
  const sentInitial = useRef(false);

  useEffect(() => () => abort.current?.abort(), []);

  // Keep the newest text in view while streaming.
  useEffect(() => {
    const el = log.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, problem]);

  const send = useCallback(async (text: string, sendMode: Mode, history: Msg[]) => {
    const next: Msg[] = [...history, { role: "user", content: text }];
    setMessages([...next, { role: "assistant", content: "" }]);
    setProblem(null);
    setBusy(true);

    const ctl = new AbortController();
    abort.current = ctl;
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ mode: sendMode, messages: next }),
        signal: ctl.signal,
      });

      if (!res.ok || !res.body) {
        const body = (await res.json().catch(() => ({}))) as {
          error?: string;
          retryAfter?: number;
        };
        setMessages(next);
        if (res.status === 503) {
          setAvailable(false);
          setProblem({ kind: "offline", text: "" });
        } else if (res.status === 429) {
          setProblem({
            kind: "rate",
            text: `You are sending messages quickly. Try again in ${body.retryAfter ?? 60} seconds.`,
          });
        } else {
          setProblem({ kind: "error", text: "Something went wrong. Please try again." });
        }
        return;
      }

      const reader = res.body.getReader();
      const dec = new TextDecoder();
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = dec.decode(value, { stream: true });
        setMessages((m) => {
          const copy = m.slice();
          const last = copy[copy.length - 1];
          copy[copy.length - 1] = { ...last, content: last.content + chunk };
          return copy;
        });
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setProblem({ kind: "error", text: "The connection dropped. Please try again." });
      }
    } finally {
      setBusy(false);
    }
  }, []);

  // Ask the server whether the AI is configured, so the offline state shows up front.
  // A prompt handed in by the command palette is sent once availability is known.
  useEffect(() => {
    let live = true;
    fetch("/api/chat", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { available?: boolean }) => {
        if (!live) return;
        const ok = d.available !== false;
        setAvailable(ok);
        if (ok && initialPrompt && !sentInitial.current) {
          sentInitial.current = true;
          void send(initialPrompt, "chat", []);
        }
      })
      .catch(() => live && setAvailable(false));
    return () => {
      live = false;
    };
  }, [initialPrompt, send]);

  useEffect(() => {
    field.current?.focus();
  }, [mode]);

  // Esc closes; Tab stays inside the dialog.
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      onClose();
      return;
    }
    if (e.key !== "Tab" || !root.current) return;
    const items = root.current.querySelectorAll<HTMLElement>(
      "button:not([disabled]), a[href], textarea:not([disabled]), [tabindex]:not([tabindex='-1'])",
    );
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const reset = () => {
    abort.current?.abort();
    setMessages([]);
    setProblem(null);
    setBusy(false);
  };

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || busy || messages.length >= MAX_TURNS) return;
    setInput("");
    void send(text, mode, messages);
  };

  const submitFit = () => {
    const text = jd.trim();
    if (text.length < 40 || busy) return;
    void send(text, "fit", []);
  };

  const offline = available === false || problem?.kind === "offline";
  const atLimit = messages.length >= MAX_TURNS;
  const fitResult = mode === "fit" && messages.length > 0;

  return (
    <div
      ref={root}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      data-lenis-prevent
      onKeyDown={onKeyDown}
      className={`border-line bg-bg/95 fixed z-[110] flex flex-col overflow-hidden border shadow-2xl backdrop-blur-xl ${
        full
          ? "inset-2 rounded-[var(--radius-lg)] sm:inset-6"
          : "inset-x-2 bottom-2 h-[min(82svh,680px)] rounded-[var(--radius-lg)] sm:inset-x-auto sm:right-5 sm:bottom-5 sm:w-[430px]"
      }`}
    >
      <header className="border-line flex items-center gap-3 border-b px-5 py-4">
        <div className="min-w-0 flex-1">
          <h2 id={titleId} className="font-display text-lg leading-none font-semibold">
            Ask my portfolio
          </h2>
          <p className="text-fg-muted mt-1 truncate font-mono text-[11px]">
            {SITE.name}&apos;s assistant. Answers only from his real work.
          </p>
        </div>
        {messages.length > 0 && (
          <button
            type="button"
            onClick={reset}
            className="text-fg-muted hover:text-fg rounded-full px-3 py-1.5 text-xs"
          >
            Reset
          </button>
        )}
        <button
          type="button"
          onClick={() => setFull((f) => !f)}
          aria-pressed={full}
          aria-label={full ? "Exit full screen" : "Full screen"}
          className="border-line text-fg-muted hover:border-accent hover:text-fg hidden size-8 place-items-center rounded-full border sm:grid"
        >
          <svg
            viewBox="0 0 24 24"
            className="size-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            {full ? (
              <path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" />
            ) : (
              <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
            )}
          </svg>
        </button>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close chat"
          className="border-line text-fg-muted hover:border-accent hover:text-fg grid size-8 place-items-center rounded-full border"
        >
          <svg
            viewBox="0 0 24 24"
            className="size-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </header>

      <div
        role="tablist"
        aria-label="Mode"
        className="border-line flex gap-1 border-b px-4 py-2"
      >
        {(["chat", "fit"] as const).map((m) => (
          <button
            key={m}
            role="tab"
            type="button"
            aria-selected={mode === m}
            onClick={() => {
              if (m !== mode) {
                reset();
                setMode(m);
              }
            }}
            className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
              mode === m ? "bg-accent text-accent-ink" : "text-fg-muted hover:text-fg"
            }`}
          >
            {m === "chat" ? "Ask" : "Fit-check a job"}
          </button>
        ))}
      </div>

      <div
        ref={log}
        role="log"
        aria-live="polite"
        aria-relevant="additions text"
        className="min-h-0 flex-1 overflow-y-auto px-5 py-5 text-sm leading-relaxed"
      >
        {offline ? (
          <Offline />
        ) : mode === "fit" && !fitResult ? (
          <div>
            <p className="text-fg-muted">
              Paste a job description. I will map Kaushik&apos;s real experience to it and
              be direct about the gaps.
            </p>
            <label htmlFor="jd" className="sr-only">
              Job description
            </label>
            <textarea
              id="jd"
              ref={field}
              value={jd}
              maxLength={MAX_JD}
              onChange={(e) => setJd(e.target.value)}
              rows={9}
              placeholder="Paste the job description here..."
              className="border-line bg-surface text-fg placeholder:text-fg-muted focus:border-accent mt-4 w-full resize-none rounded-[var(--radius)] border p-3 text-sm"
            />
            <div className="mt-2 flex items-center justify-between">
              <span className="text-fg-muted font-mono text-[11px]">
                {jd.length}/{MAX_JD}
              </span>
              <button
                type="button"
                disabled={jd.trim().length < 40 || busy}
                onClick={submitFit}
                className="bg-accent text-accent-ink rounded-full px-5 py-2 text-sm font-medium disabled:opacity-40"
              >
                Check fit
              </button>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div>
            <p className="text-fg-muted">
              Ask about his projects, skills or background. Try one of these:
            </p>
            <ul className="mt-4 flex flex-col gap-2">
              {STARTERS.map((s) => (
                <li key={s}>
                  <button
                    type="button"
                    disabled={available === null}
                    onClick={() => void send(s, "chat", [])}
                    className="border-line hover:border-accent w-full rounded-[var(--radius)] border px-4 py-3 text-left text-sm transition-colors disabled:opacity-50"
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <ul className="space-y-5">
            {messages.map((m, i) => (
              <li key={i} className={m.role === "user" ? "flex justify-end" : ""}>
                {m.role === "user" ? (
                  <p className="bg-surface-2 max-w-[85%] rounded-[var(--radius)] px-4 py-2.5 whitespace-pre-wrap">
                    {mode === "fit" && i === 0
                      ? "Fit-check for the pasted job description"
                      : m.content}
                  </p>
                ) : (
                  <div>
                    {m.content ? (
                      <Markdown onNavigate={onClose}>{m.content}</Markdown>
                    ) : (
                      busy && (
                        <span className="inline-flex gap-1 py-2" aria-label="Thinking">
                          {[0, 1, 2].map((d) => (
                            <span
                              key={d}
                              className="bg-fg-muted size-1.5 animate-pulse rounded-full"
                              style={{ animationDelay: `${d * 150}ms` }}
                            />
                          ))}
                        </span>
                      )
                    )}
                    {!(busy && i === messages.length - 1) &&
                      sourcesOf(m.content).length > 0 && (
                        <ul className="mt-3 flex flex-wrap gap-2" aria-label="Sources">
                          {sourcesOf(m.content).map((s) => (
                            <li key={s}>
                              <Link
                                href={`/work/${s}`}
                                onClick={onClose}
                                transitionTypes={["nav-forward"]}
                                className="border-line text-fg-muted hover:border-accent hover:text-fg rounded-full border px-3 py-1 font-mono text-[11px]"
                              >
                                {TITLES.get(s)} <span aria-hidden="true">↗</span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        {problem && problem.kind !== "offline" && (
          <p
            role="alert"
            className="border-accent/50 text-fg mt-4 rounded-[var(--radius)] border px-4 py-3"
          >
            {problem.text}
          </p>
        )}
      </div>

      {!offline && (mode === "chat" || fitResult) && (
        <form onSubmit={submit} className="border-line border-t p-3">
          {atLimit ? (
            <p className="text-fg-muted px-2 py-2 text-xs">
              This conversation reached its length limit.{" "}
              <button
                type="button"
                onClick={reset}
                className="text-accent underline underline-offset-4"
              >
                Start a new one
              </button>
            </p>
          ) : (
            <div className="flex items-end gap-2">
              <label htmlFor="chat-input" className="sr-only">
                Your question
              </label>
              <textarea
                id="chat-input"
                ref={field}
                value={input}
                rows={1}
                maxLength={MAX_MSG}
                disabled={busy}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submit();
                  }
                }}
                placeholder={fitResult ? "Ask a follow-up..." : "Ask about his work..."}
                className="border-line bg-surface text-fg placeholder:text-fg-muted focus:border-accent max-h-32 min-h-10 flex-1 resize-none rounded-[var(--radius)] border px-3 py-2 text-sm disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                aria-label="Send"
                className="bg-accent text-accent-ink grid size-10 shrink-0 place-items-center rounded-full disabled:opacity-40"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="size-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
            </div>
          )}
        </form>
      )}
    </div>
  );
}

/** Shown when no API key is configured: static answers from the same data. */
function Offline() {
  const faq = staticFaq();
  return (
    <div>
      <p className="border-line text-fg-muted rounded-[var(--radius)] border border-dashed p-4">
        The live assistant is offline right now. Here are answers to the common questions,
        straight from the portfolio data. For anything else, email{" "}
        <a
          className="text-accent underline underline-offset-4"
          href={`mailto:${SITE.email}`}
        >
          {SITE.email}
        </a>
        .
      </p>
      <ul className="mt-5 space-y-5">
        {faq.map((f) => (
          <li key={f.q}>
            <p className="text-fg font-medium">{f.q}</p>
            <div className="text-fg-muted mt-1">
              <Markdown>{f.a}</Markdown>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
