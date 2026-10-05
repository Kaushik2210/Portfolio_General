import type { Metadata } from "next";
import Link from "next/link";
import { projects } from "@/lib/data";

export const metadata: Metadata = {
  title: "404: page not found",
  robots: { index: false },
};

export default function NotFound() {
  const suggestion = projects[0];
  return (
    <main className="flex min-h-[100svh] items-center px-[var(--gutter)] py-32">
      <div className="mx-auto w-full max-w-[1280px]">
        <p className="text-accent font-mono text-xs tracking-widest uppercase">
          Error 404
        </p>
        <h1 className="font-display mt-4 text-[length:var(--text-hero)] leading-[0.88] font-semibold tracking-tighter">
          Off the map.
        </h1>
        <p className="text-fg-muted mt-6 max-w-xl text-xl">
          This route did not make it to production. It happens to the best branches.
        </p>

        <pre
          aria-hidden="true"
          className="border-line bg-surface text-fg-muted mt-10 max-w-xl overflow-x-auto rounded-[var(--radius)] border p-5 font-mono text-xs leading-relaxed"
        >
          {`$ git checkout this-page
error: pathspec 'this-page' did not match any file(s)
$ git log --oneline -1
${"a1b2c3d"} the page was never merged`}
        </pre>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/"
            className="bg-accent text-accent-ink rounded-full px-6 py-3 text-sm font-medium hover:brightness-110"
          >
            Back home
          </Link>
          <Link
            href={`/work/${suggestion.slug}`}
            className="border-line hover:border-accent rounded-full border px-6 py-3 text-sm"
          >
            Read a case study instead
          </Link>
        </div>
      </div>
    </main>
  );
}
