"use client";

import Link from "next/link";
import ReactMarkdown from "react-markdown";

/**
 * Renders model/static markdown. Raw HTML is not rendered (react-markdown's
 * default), images are dropped, and links are restricted to our own paths,
 * mailto: and https:.
 */
export function Markdown({
  children,
  onNavigate,
}: {
  children: string;
  onNavigate?: () => void;
}) {
  return (
    <ReactMarkdown
      disallowedElements={["img"]}
      unwrapDisallowed
      components={{
        a({ href = "", children: c }) {
          const cls =
            "text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent";
          if (href.startsWith("/") && !href.startsWith("//")) {
            return (
              <Link
                href={href}
                onClick={onNavigate}
                transitionTypes={["nav-forward"]}
                className={cls}
              >
                {c}
              </Link>
            );
          }
          if (/^(https:|mailto:)/.test(href)) {
            return (
              <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
                {c}
              </a>
            );
          }
          return <>{c}</>;
        },
        p: ({ children: c }) => <p className="mb-3 last:mb-0">{c}</p>,
        ul: ({ children: c }) => (
          <ul className="marker:text-accent mb-3 list-disc space-y-1 pl-5 last:mb-0">
            {c}
          </ul>
        ),
        ol: ({ children: c }) => (
          <ol className="marker:text-accent mb-3 list-decimal space-y-1 pl-5 last:mb-0">
            {c}
          </ol>
        ),
        strong: ({ children: c }) => (
          <strong className="text-fg font-semibold">{c}</strong>
        ),
        code: ({ children: c }) => (
          <code className="bg-surface-2 rounded px-1 py-0.5 font-mono text-[0.85em]">
            {c}
          </code>
        ),
      }}
    >
      {children}
    </ReactMarkdown>
  );
}
