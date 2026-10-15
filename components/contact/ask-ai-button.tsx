"use client";

/** Opens the chat panel in fit-check mode from anywhere on the page. */
export function AskAiButton() {
  return (
    <button
      type="button"
      onClick={() =>
        window.dispatchEvent(new CustomEvent("chat:open", { detail: { mode: "fit" } }))
      }
      className="border-line hover:border-accent inline-flex min-h-11 items-center rounded-full border px-5 text-sm transition-colors"
    >
      Fit-check a job description with the AI
    </button>
  );
}
