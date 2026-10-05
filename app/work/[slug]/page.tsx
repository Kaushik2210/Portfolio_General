import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";
import { RevealScope } from "@/components/reveal-scope";
import { Architecture } from "@/components/work/architecture";
import { Cover } from "@/components/work/cover";
import { projects } from "@/lib/data";
import { isReal } from "@/lib/verified";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return {};
  return {
    title: `${project.title} case study`,
    description: project.tagline,
    alternates: { canonical: `/work/${project.slug}` },
  };
}

const slide = {
  enter: { "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" },
  exit: { "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" },
} as const;

const linkBtn =
  "inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm transition-colors hover:border-accent";

export default async function CaseStudyPage({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const i = projects.findIndex((p) => p.slug === slug);
  if (i === -1) notFound();

  const project = projects[i];
  const next = projects[(i + 1) % projects.length];
  const prev = projects[(i - 1 + projects.length) % projects.length];
  const metrics = project.metrics.filter((m) => isReal(m.value));
  const todo: string[] = [
    ...(isReal(project.role) ? [] : ["role"]),
    ...(project.visual === "TODO_SCREENSHOT" ? ["screenshot"] : []),
    ...project.metrics.filter((m) => !isReal(m.value)).map((m) => `metric: ${m.label}`),
  ];

  return (
    <main>
      <ViewTransition enter={slide.enter} exit={slide.exit} default="none">
        <article className="pt-28 pb-[clamp(64px,10vw,128px)]">
          <RevealScope className="mx-auto max-w-[1280px] px-[var(--gutter)]">
            <Link
              href="/#work"
              transitionTypes={["nav-back"]}
              className="reveal text-fg-muted hover:text-fg font-mono text-xs tracking-widest uppercase"
            >
              <span aria-hidden="true">←</span> All work
            </Link>

            <p className="reveal text-accent mt-10 font-mono text-xs tracking-widest uppercase">
              Case study / {String(i + 1).padStart(2, "0")}
            </p>
            <h1 className="reveal font-display mt-3 text-[length:var(--text-hero)] leading-[0.9] font-semibold tracking-tighter">
              {project.title}
            </h1>
            <p className="reveal text-fg-muted mt-6 max-w-3xl text-xl">
              {project.tagline}
            </p>

            <div className="reveal mt-8 flex flex-wrap gap-3">
              <a
                href={project.links.repo}
                target="_blank"
                rel="noopener"
                className={linkBtn}
              >
                Source on GitHub <span aria-hidden="true">↗</span>
              </a>
              {project.links.demo && (
                <a
                  href={project.links.demo}
                  target="_blank"
                  rel="noopener"
                  className={`${linkBtn} bg-accent text-accent-ink hover:brightness-110`}
                >
                  Live demo <span aria-hidden="true">↗</span>
                </a>
              )}
            </div>

            <div className="mt-14">
              <Cover project={project} className="!aspect-[16/9]" />
            </div>

            <dl className="reveal border-line mt-12 grid gap-8 border-y py-8 sm:grid-cols-3">
              {isReal(project.role) && (
                <div>
                  <dt className="text-fg-muted font-mono text-xs tracking-widest uppercase">
                    Role
                  </dt>
                  <dd className="mt-2">{project.role}</dd>
                </div>
              )}
              <div className={isReal(project.role) ? "sm:col-span-2" : "sm:col-span-3"}>
                <dt className="text-fg-muted font-mono text-xs tracking-widest uppercase">
                  Stack
                </dt>
                <dd className="mt-2 flex flex-wrap gap-2">
                  {project.stack.map((s) => (
                    <span
                      key={s}
                      className="border-line text-fg-muted rounded-full border px-3 py-1 font-mono text-xs"
                    >
                      {s}
                    </span>
                  ))}
                </dd>
              </div>
            </dl>

            {metrics.length > 0 && (
              <ul
                aria-label="Key facts"
                className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
              >
                {metrics.map((m) => (
                  <li key={m.label} className="reveal border-line border-t pt-4">
                    <p
                      className={`font-display leading-tight font-semibold ${
                        m.value.length > 16 ? "text-xl" : "text-[length:var(--text-2xl)]"
                      }`}
                    >
                      {m.value}
                    </p>
                    <p className="text-fg-muted mt-1 text-sm">{m.label}</p>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-[clamp(56px,10vw,128px)] grid gap-14 lg:grid-cols-12">
              <h2 className="reveal text-accent font-mono text-xs tracking-widest uppercase lg:col-span-4">
                01 / Problem
              </h2>
              <p className="reveal text-[length:var(--text-lg,1.25rem)] leading-relaxed lg:col-span-8">
                {project.problem}
              </p>

              <h2 className="reveal text-accent font-mono text-xs tracking-widest uppercase lg:col-span-4">
                02 / Approach
              </h2>
              <ol className="space-y-6 lg:col-span-8">
                {project.approach.map((step, n) => (
                  <li key={step} className="reveal flex gap-5 leading-relaxed">
                    <span className="text-accent font-mono text-sm tabular-nums">
                      {String(n + 1).padStart(2, "0")}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>

              <h2 className="reveal text-accent font-mono text-xs tracking-widest uppercase lg:col-span-4">
                03 / Result
              </h2>
              <p className="reveal font-display text-[length:var(--text-2xl)] leading-[1.15] tracking-tight lg:col-span-8">
                {project.outcome}
              </p>
            </div>

            {project.architecture && (
              <div className="mt-[clamp(56px,10vw,128px)]">
                <h2 className="reveal text-accent mb-8 font-mono text-xs tracking-widest uppercase">
                  Architecture
                </h2>
                <Architecture nodes={project.architecture} />
              </div>
            )}

            {process.env.NODE_ENV !== "production" && todo.length > 0 && (
              <p className="border-line text-fg-muted mt-16 rounded-[var(--radius)] border border-dashed p-5 font-mono text-xs">
                dev only, still to verify: {todo.join(", ")}. See docs/TODO-content.md.
              </p>
            )}

            <nav
              aria-label="More case studies"
              className="border-line mt-[clamp(64px,10vw,128px)] grid gap-6 border-t pt-10 sm:grid-cols-2"
            >
              <Link
                href={`/work/${prev.slug}`}
                transitionTypes={["nav-back"]}
                className="group block"
              >
                <p className="text-fg-muted font-mono text-xs tracking-widest uppercase">
                  <span aria-hidden="true">←</span> Previous
                </p>
                <p className="font-display group-hover:text-accent mt-2 text-[length:var(--text-2xl)] transition-colors">
                  {prev.title}
                </p>
              </Link>
              <Link
                href={`/work/${next.slug}`}
                transitionTypes={["nav-forward"]}
                className="group block sm:text-right"
              >
                <p className="text-fg-muted font-mono text-xs tracking-widest uppercase">
                  Next <span aria-hidden="true">→</span>
                </p>
                <p className="font-display group-hover:text-accent mt-2 text-[length:var(--text-2xl)] transition-colors">
                  {next.title}
                </p>
              </Link>
            </nav>
          </RevealScope>
        </article>
      </ViewTransition>
    </main>
  );
}
