import { github, SITE } from "@/lib/data";
import { LazyMount } from "../lazy-mount";
import { Section } from "../section";
import { Heatmap } from "./heatmap";
import { LangBar } from "./lang-bar";

const EVENT_LABEL: Record<string, string> = {
  PushEvent: "Push",
  CreateEvent: "Create",
  PullRequestEvent: "Pull request",
  IssuesEvent: "Issue",
  WatchEvent: "Star",
  ForkEvent: "Fork",
};

const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });

export function GitHubSection() {
  const { profile, contributions, languages, repos, activity } = github;
  const recent = [...activity].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 8);
  const top = repos.slice(0, 6);

  return (
    <Section
      id="github"
      eyebrow="04 / GitHub"
      title="Shipping in the open."
      world="cream"
      label="GitHub"
    >
      <p className="reveal text-fg-muted mb-12 max-w-xl">
        Pulled from the GitHub API at build time, so these numbers are real and as fresh
        as the last deploy.
      </p>

      {contributions && (
        <div className="reveal">
          <div className="mb-6 flex flex-wrap items-baseline justify-between gap-4">
            <p className="font-display text-[length:var(--text-2xl)] leading-none font-semibold tracking-tight">
              {contributions.total.toLocaleString("en-US")}{" "}
              <span className="text-fg-muted text-base font-normal">
                contributions in the past year
              </span>
            </p>
            <a
              href={SITE.github}
              target="_blank"
              rel="noopener"
              className="text-fg-muted hover:text-accent font-mono text-xs tracking-widest uppercase"
            >
              @{profile.login} <span aria-hidden="true">↗</span>
            </a>
          </div>
          <LazyMount className="min-h-[190px]">
            <Heatmap days={contributions.days} total={contributions.total} />
          </LazyMount>
        </div>
      )}

      <div className="mt-[clamp(48px,8vw,96px)] grid gap-14 lg:grid-cols-12">
        <div className="reveal lg:col-span-5">
          <h3 className="text-accent mb-5 font-mono text-xs tracking-widest uppercase">
            Languages
          </h3>
          <LangBar languages={languages} />
          <p className="text-fg-muted mt-4 font-mono text-xs">
            Each repository counts equally, so one large project cannot dominate.
          </p>
        </div>

        <div className="reveal lg:col-span-7">
          <h3 className="text-accent mb-5 font-mono text-xs tracking-widest uppercase">
            Recent activity
          </h3>
          <ol className="divide-line border-line divide-y border-y">
            {recent.map((a, i) => (
              <li key={`${a.at}-${i}`} className="flex items-baseline gap-4 py-3 text-sm">
                <time
                  dateTime={a.at}
                  className="text-fg-muted w-14 shrink-0 font-mono text-xs"
                >
                  {shortDate(a.at)}
                </time>
                <span className="text-accent w-20 shrink-0 font-mono text-xs">
                  {EVENT_LABEL[a.type] ?? a.type.replace(/Event$/, "")}
                </span>
                <a
                  href={`https://github.com/${a.repo}`}
                  target="_blank"
                  rel="noopener"
                  className="hover:text-accent min-w-0 truncate"
                >
                  {a.repo.split("/")[1]}
                </a>
                <span className="text-fg-muted ml-auto hidden truncate sm:block">
                  {a.summary}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="mt-[clamp(48px,8vw,96px)]">
        <h3 className="reveal text-accent mb-5 font-mono text-xs tracking-widest uppercase">
          Most active repositories
        </h3>
        <ul className="border-line bg-line grid gap-px overflow-hidden rounded-[var(--radius-lg)] border sm:grid-cols-2 lg:grid-cols-3">
          {top.map((r) => (
            <li key={r.name} className="reveal bg-bg">
              <a
                href={r.url}
                target="_blank"
                rel="noopener"
                className="group hover:bg-surface block h-full p-6 transition-colors"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-display group-hover:text-accent truncate text-xl font-semibold">
                    {r.name}
                  </p>
                  {r.stars > 0 && (
                    <span className="text-fg-muted font-mono text-xs">★ {r.stars}</span>
                  )}
                </div>
                <p className="text-fg-muted mt-2 line-clamp-3 text-sm">
                  {r.description ?? r.readmeSummary ?? "No description."}
                </p>
                <p className="text-fg-muted mt-4 font-mono text-xs">
                  {r.language ?? "n/a"} / pushed {shortDate(r.pushedAt)}
                </p>
              </a>
            </li>
          ))}
        </ul>
      </div>

      <p className="reveal text-fg-muted mt-10 font-mono text-xs">
        {profile.publicRepos} public repositories / synced{" "}
        <time dateTime={github.generatedAt}>{shortDate(github.generatedAt)}</time>
      </p>
    </Section>
  );
}
