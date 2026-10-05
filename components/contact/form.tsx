"use client";

import { useActionState } from "react";
import { sendMessage, type ContactState } from "./actions";

const initial: ContactState = { status: "idle" };

const input =
  "mt-2 w-full rounded-[var(--radius)] border border-line bg-surface px-4 py-3 text-fg placeholder:text-fg-muted focus:border-accent aria-[invalid=true]:border-accent";

export function ContactForm() {
  const [state, action, pending] = useActionState(sendMessage, initial);
  const err = state.fieldErrors ?? {};

  if (state.status === "ok") {
    return (
      <div
        role="status"
        className="border-accent/60 bg-surface rounded-[var(--radius-lg)] border p-8"
      >
        <p className="font-display text-[length:var(--text-2xl)] leading-tight font-semibold">
          Message sent.
        </p>
        <p className="text-fg-muted mt-3">
          Thanks for reaching out. I read everything and will reply by email.
        </p>
      </div>
    );
  }

  return (
    <form
      action={action}
      noValidate
      className="space-y-5"
      aria-describedby="contact-status"
    >
      {/* Honeypot: hidden from people and assistive tech, bots fill it. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div>
        <label htmlFor="c-name" className="text-sm font-medium">
          Name
        </label>
        <input
          id="c-name"
          name="name"
          autoComplete="name"
          required
          maxLength={80}
          defaultValue={state.values?.name}
          aria-invalid={Boolean(err.name)}
          aria-describedby={err.name ? "c-name-err" : undefined}
          className={input}
        />
        {err.name && (
          <p id="c-name-err" className="text-accent mt-1.5 text-sm">
            {err.name}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="c-email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="c-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={160}
          defaultValue={state.values?.email}
          aria-invalid={Boolean(err.email)}
          aria-describedby={err.email ? "c-email-err" : undefined}
          className={input}
        />
        {err.email && (
          <p id="c-email-err" className="text-accent mt-1.5 text-sm">
            {err.email}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="c-message" className="text-sm font-medium">
          Message
        </label>
        <textarea
          id="c-message"
          name="message"
          rows={6}
          required
          maxLength={2000}
          defaultValue={state.values?.message}
          aria-invalid={Boolean(err.message)}
          aria-describedby={err.message ? "c-message-err" : undefined}
          className={`${input} resize-y`}
        />
        {err.message && (
          <p id="c-message-err" className="text-accent mt-1.5 text-sm">
            {err.message}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="bg-accent text-accent-ink rounded-full px-7 py-3 text-sm font-medium transition-[filter] hover:brightness-110 disabled:opacity-60"
        >
          {pending ? "Sending..." : "Send message"}
        </button>
        <p id="contact-status" role="status" className="text-fg-muted text-sm">
          {state.status === "error" && state.message}
        </p>
      </div>
    </form>
  );
}
