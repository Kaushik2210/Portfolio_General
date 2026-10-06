"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";

// The panel (markdown renderer, project titles) only loads on first open.
const ChatPanel = dynamic(() => import("./panel"), { ssr: false });

export interface ChatOpenDetail {
  mode?: "chat" | "fit";
  prompt?: string;
}

/** Floating launcher plus the panel. Open it from anywhere: dispatch `chat:open`. */
export function ChatRoot() {
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<ChatOpenDetail>({});
  const launcher = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    // Return focus to where the visitor was.
    requestAnimationFrame(() => launcher.current?.focus());
  }, []);

  useEffect(() => {
    const onOpen = (e: Event) => {
      setDetail((e as CustomEvent<ChatOpenDetail>).detail ?? {});
      setOpen(true);
    };
    window.addEventListener("chat:open", onOpen);
    return () => window.removeEventListener("chat:open", onOpen);
  }, []);

  return (
    <>
      {!open && (
        <button
          ref={launcher}
          type="button"
          onClick={() => {
            setDetail({});
            setOpen(true);
          }}
          aria-label="Open chat: ask my portfolio"
          className="border-line bg-surface/80 hover:border-accent fixed right-4 bottom-4 z-[85] flex items-center gap-2 rounded-full border px-4 py-3 text-sm font-medium shadow-lg backdrop-blur-lg transition-colors sm:right-6 sm:bottom-6"
        >
          <span aria-hidden="true" className="bg-accent size-2 rounded-full" />
          <span className="hidden sm:inline">Ask my portfolio</span>
          <span className="sm:hidden">Ask</span>
        </button>
      )}
      {open && (
        <ChatPanel
          key={`${detail.mode}-${detail.prompt}`}
          onClose={close}
          initialMode={detail.mode}
          initialPrompt={detail.prompt}
        />
      )}
    </>
  );
}
