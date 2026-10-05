/**
 * Build-time GitHub sync. Writes data/github.json.
 *
 *   npm run sync
 *
 * Auth (optional, raises limits and enables the contribution calendar):
 *   GITHUB_TOKEN env var, else the token from `gh auth token` if gh is installed.
 * Without a token it falls back to unauthenticated REST and sets contributions: null.
 */
import { execSync } from "node:child_process";
import { mkdirSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import type {
  ContributionDay,
  GitHubActivity,
  GitHubData,
  GitHubRepo,
} from "../lib/types";

const USER = process.env.GITHUB_USERNAME ?? "Kaushik2210";
const OUT = resolve(process.cwd(), "data/github.json");
const MAX_REPOS = 12;

function getToken(): string | null {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;
  try {
    const t = execSync("gh auth token", { stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
    return t || null;
  } catch {
    return null;
  }
}

const token = getToken();
const headers: Record<string, string> = {
  Accept: "application/vnd.github+json",
  "User-Agent": "portfolio-sync",
  "X-GitHub-Api-Version": "2022-11-28",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
};

class RateLimited extends Error {}

async function gh<T>(path: string): Promise<T> {
  const res = await fetch(`https://api.github.com${path}`, { headers });
  if (res.status === 403 || res.status === 429) {
    const remaining = res.headers.get("x-ratelimit-remaining");
    if (remaining === "0" || res.status === 429) {
      const reset = Number(res.headers.get("x-ratelimit-reset") ?? 0) * 1000;
      throw new RateLimited(
        `GitHub rate limit hit${reset ? `, resets ${new Date(reset).toISOString()}` : ""}`,
      );
    }
  }
  if (!res.ok) throw new Error(`GitHub ${res.status} for ${path}`);
  return (await res.json()) as T;
}

/** Run a call, returning null on failure so one bad repo never kills the sync. */
async function soft<T>(label: string, fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof RateLimited) throw err;
    console.warn(`  skip ${label}: ${(err as Error).message}`);
    return null;
  }
}

interface ApiRepo {
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  topics?: string[];
  pushed_at: string;
  fork: boolean;
  archived: boolean;
}

/** First readable prose paragraph of a README, stripped of badges/HTML/markdown. */
function summarize(md: string): string | null {
  const blocks = md
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[\s*\]\([^)]*\)/g, "")
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter((b) => b && !b.startsWith("#") && !b.startsWith("|") && !b.startsWith("```"))
    // Skip link rows (nav bars, badge strips): prose has few links.
    .filter((b) => (b.match(/\]\(/g) ?? []).length < 3);
  const prose = blocks.find((b) => b.replace(/[*_`[\]()]/g, "").length > 60);
  if (!prose) return null;
  const clean = prose
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*_`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return clean.length > 320 ? `${clean.slice(0, 317).trimEnd()}...` : clean;
}

async function readmeSummary(repo: string): Promise<string | null> {
  const r = await soft(`readme ${repo}`, async () => {
    const res = await fetch(`https://api.github.com/repos/${USER}/${repo}/readme`, {
      headers: { ...headers, Accept: "application/vnd.github.raw+json" },
    });
    if (!res.ok) throw new Error(`${res.status}`);
    return res.text();
  });
  return r ? summarize(r) : null;
}

async function contributionCalendar(): Promise<GitHubData["contributions"]> {
  if (!token) {
    console.warn("  no token: skipping contribution calendar (needs GraphQL auth)");
    return null;
  }
  const query = `query($login:String!){user(login:$login){contributionsCollection{contributionCalendar{totalContributions weeks{contributionDays{date contributionCount}}}}}}`;
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables: { login: USER } }),
  });
  if (!res.ok) {
    console.warn(`  graphql ${res.status}: skipping calendar`);
    return null;
  }
  const json = (await res.json()) as {
    data?: {
      user: {
        contributionsCollection: {
          contributionCalendar: {
            totalContributions: number;
            weeks: { contributionDays: { date: string; contributionCount: number }[] }[];
          };
        };
      };
    };
  };
  const cal = json.data?.user.contributionsCollection.contributionCalendar;
  if (!cal) return null;
  const days: ContributionDay[] = cal.weeks.flatMap((w) =>
    w.contributionDays.map((d) => ({ date: d.date, count: d.contributionCount })),
  );
  return { total: cal.totalContributions, days };
}

interface ApiEvent {
  type: string;
  repo: { name: string };
  created_at: string;
  payload: { commits?: { message: string }[]; action?: string; ref_type?: string };
}

function describe(e: ApiEvent): string {
  switch (e.type) {
    case "PushEvent":
      return e.payload.commits?.at(-1)?.message.split("\n")[0] ?? "Pushed commits";
    case "CreateEvent":
      return `Created ${e.payload.ref_type ?? "repository"}`;
    case "PullRequestEvent":
      return `Pull request ${e.payload.action ?? "updated"}`;
    case "IssuesEvent":
      return `Issue ${e.payload.action ?? "updated"}`;
    case "WatchEvent":
      return "Starred a repository";
    default:
      return e.type.replace(/Event$/, "");
  }
}

async function main() {
  console.log(`sync github data for ${USER} (${token ? "authenticated" : "anonymous"})`);

  const profile = await gh<{
    login: string;
    name: string | null;
    bio: string | null;
    location: string | null;
    blog: string | null;
    avatar_url: string;
    followers: number;
    following: number;
    public_repos: number;
    created_at: string;
  }>(`/users/${USER}`);

  const apiRepos = await gh<ApiRepo[]>(
    `/users/${USER}/repos?per_page=100&sort=pushed&type=owner`,
  );
  const own = apiRepos.filter((r) => !r.fork && !r.archived && r.name !== USER);

  // Rank: stars dominate, recency breaks ties and lifts fresh work.
  const now = Date.now();
  const score = (r: ApiRepo) => {
    const ageDays = (now - new Date(r.pushed_at).getTime()) / 86_400_000;
    return r.stargazers_count * 10 + Math.max(0, 90 - ageDays) + (r.description ? 15 : 0);
  };
  const top = [...own].sort((a, b) => score(b) - score(a)).slice(0, MAX_REPOS);

  const repos: GitHubRepo[] = [];
  for (const r of top) {
    repos.push({
      name: r.name,
      description: r.description,
      url: r.html_url,
      homepage: r.homepage || null,
      stars: r.stargazers_count,
      forks: r.forks_count,
      language: r.language,
      topics: r.topics ?? [],
      pushedAt: r.pushed_at,
      readmeSummary: await readmeSummary(r.name),
    });
  }

  // Language share: each repo counts equally (its languages normalised to 100%),
  // so one repo with a vendored virtualenv or build output cannot dominate.
  const bytesByLang = new Map<string, number>();
  const shareByLang = new Map<string, number>();
  let counted = 0;
  for (const r of own) {
    const langs = await soft(`languages ${r.name}`, () =>
      gh<Record<string, number>>(`/repos/${USER}/${r.name}/languages`),
    );
    const repoTotal = Object.values(langs ?? {}).reduce((a, b) => a + b, 0);
    if (!langs || repoTotal === 0) continue;
    counted += 1;
    for (const [name, bytes] of Object.entries(langs)) {
      bytesByLang.set(name, (bytesByLang.get(name) ?? 0) + bytes);
      shareByLang.set(name, (shareByLang.get(name) ?? 0) + bytes / repoTotal);
    }
  }
  const languages = [...shareByLang.entries()]
    .map(([name, s]) => ({
      name,
      bytes: bytesByLang.get(name) ?? 0,
      share: Number((s / (counted || 1)).toFixed(4)),
    }))
    .filter((l) => l.share >= 0.01)
    .sort((a, b) => b.share - a.share)
    .slice(0, 10);

  const events =
    (await soft("events", () =>
      gh<ApiEvent[]>(`/users/${USER}/events/public?per_page=30`),
    )) ?? [];
  const activity: GitHubActivity[] = events.slice(0, 10).map((e) => ({
    type: e.type,
    repo: e.repo.name,
    at: e.created_at,
    summary: describe(e),
  }));

  const contributions = await contributionCalendar();

  const data: GitHubData = {
    generatedAt: new Date().toISOString(),
    profile: {
      login: profile.login,
      name: profile.name,
      bio: profile.bio,
      location: profile.location,
      blog: profile.blog,
      avatarUrl: profile.avatar_url,
      followers: profile.followers,
      following: profile.following,
      publicRepos: profile.public_repos,
      createdAt: profile.created_at,
    },
    repos,
    languages,
    contributions,
    activity,
  };

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, `${JSON.stringify(data, null, 2)}\n`);
  console.log(
    `wrote ${OUT}: ${repos.length} repos, ${languages.length} languages, ${
      contributions ? `${contributions.total} contributions` : "no calendar"
    }`,
  );
}

main().catch((err) => {
  if (existsSync(OUT)) {
    // Keep the last good snapshot so a flaky build never ships an empty section.
    const prev = JSON.parse(readFileSync(OUT, "utf8")) as GitHubData;
    console.warn(
      `sync failed (${(err as Error).message}); keeping snapshot from ${prev.generatedAt}`,
    );
    process.exit(0);
  }
  console.error(err);
  process.exit(1);
});
