import Link from "next/link";
import type { Project } from "@/lib/types";
import { Tilt } from "../tilt";
import { Cover } from "./cover";

/** First sentence of the problem statement, used as the hover preview. */
const firstSentence = (s: string) => s.match(/^.*?[.!?](\s|$)/)?.[0].trim() ?? s;

export function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <Link
      href={`/work/${project.slug}`}
      transitionTypes={["nav-forward"]}
      data-flip-id={project.slug}
      data-cursor
      data-cursor-label="View"
      className="group block w-full shrink-0 focus-visible:outline-offset-8 lg:data-[pinned=true]:w-[min(560px,42vw)]"
    >
      <Tilt>
        <article>
          <div className="relative">
            <Cover
              project={project}
              className="transition-transform duration-[var(--dur-slow)] ease-[var(--ease-out)] group-hover:scale-[1.015]"
            />
            <div
              className="from-bg/95 via-bg/80 pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 rounded-b-[var(--radius)] bg-gradient-to-t to-transparent p-5 pt-16 opacity-0 transition-[opacity,transform] duration-[var(--dur-base)] ease-[var(--ease-out)] group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
              aria-hidden="true"
            >
              <p className="text-accent font-mono text-[11px] tracking-widest uppercase">
                Problem
              </p>
              <p className="text-fg mt-1 text-sm">{firstSentence(project.problem)}</p>
            </div>
          </div>

          <div className="mt-5 flex items-baseline justify-between gap-4">
            <h3 className="font-display text-[length:var(--text-2xl)] leading-none font-semibold tracking-tight">
              {project.title}
            </h3>
            <span className="text-fg-muted font-mono text-xs tabular-nums">
              {String(index + 1).padStart(2, "0")}
            </span>
          </div>
          <p className="text-fg-muted mt-3 max-w-prose">{project.tagline}</p>

          <ul className="mt-4 flex flex-wrap gap-2" aria-label="Tech stack">
            {project.stack.slice(0, 4).map((s) => (
              <li
                key={s}
                className="border-line text-fg-muted rounded-full border px-3 py-1 font-mono text-[11px]"
              >
                {s}
              </li>
            ))}
          </ul>
        </article>
      </Tilt>
    </Link>
  );
}
