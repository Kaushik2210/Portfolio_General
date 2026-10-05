"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";

const Terminal = dynamic(() => import("./terminal"), { ssr: false });

const isTyping = (t: EventTarget | null) =>
  t instanceof HTMLElement &&
  (t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName));

/** Opens on `~` (outside text fields) or the `terminal:open` event. */
export function TerminalRoot({ hasResume }: { hasResume: boolean }) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        (e.key === "~" || e.key === "`") &&
        !e.metaKey &&
        !e.ctrlKey &&
        !isTyping(e.target)
      ) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("terminal:open", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("terminal:open", onOpen);
    };
  }, []);

  return open ? <Terminal hasResume={hasResume} onClose={close} /> : null;
}
