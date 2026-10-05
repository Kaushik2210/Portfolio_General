"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";

// cmdk and its dialog only load the first time the palette is opened.
const Palette = dynamic(() => import("./palette"), { ssr: false });

/** Cmd/Ctrl+K or the `palette:open` event toggles the palette. */
export function CommandPalette({ hasResume }: { hasResume: boolean }) {
  const [open, setOpen] = useState(false);
  const [everOpened, setEverOpened] = useState(false);

  const change = useCallback((o: boolean) => {
    setOpen(o);
    if (o) setEverOpened(true);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => {
          if (!o) setEverOpened(true);
          return !o;
        });
      }
    };
    const onOpen = () => change(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("palette:open", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("palette:open", onOpen);
    };
  }, [change]);

  return everOpened ? (
    <Palette hasResume={hasResume} open={open} onOpenChange={change} />
  ) : null;
}
