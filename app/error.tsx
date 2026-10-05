"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Digest only: it correlates with the server log without exposing details.
    console.error("route error", error.digest);
  }, [error]);

  return (
    <main className="flex min-h-[100svh] items-center px-[var(--gutter)] py-32">
      <div className="mx-auto w-full max-w-[1280px]">
        <p className="text-accent font-mono text-xs tracking-widest uppercase">
          Something broke
        </p>
        <h1 className="font-display mt-4 text-[length:var(--text-3xl)] leading-[0.95] font-semibold tracking-tight">
          That did not go to plan.
        </h1>
        <p className="text-fg-muted mt-6 max-w-xl">
          The page hit an unexpected error. Trying again usually fixes it.
        </p>
        <button
          type="button"
          onClick={reset}
          className="bg-accent text-accent-ink mt-8 rounded-full px-6 py-3 text-sm font-medium hover:brightness-110"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
