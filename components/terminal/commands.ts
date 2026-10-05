import { github, linkedin, projects, projectsForRole, SITE } from "@/lib/data";
import type { Role } from "@/lib/types";

export const COMMANDS = [
  "help",
  "about",
  "projects",
  "open",
  "skills",
  "contact",
  "resume",
  "ask",
  "role",
  "theme",
  "clear",
  "exit",
] as const;

export const HELP = [
  "Commands:",
  "  help                 this list",
  "  about                who I am",
  "  projects [sde|data|ai]   case studies, ordered for a role",
  "  open <slug>          open a case study",
  "  skills               skills grouped by role",
  "  contact              email and links",
  "  resume               open the resume",
  "  ask <question>       ask the AI assistant",
  "  role <sde|data|ai>   switch the site's role view",
  "  theme                toggle dark / light",
  "  clear                clear the screen",
  "  exit                 close (or press Esc)",
];

export function about(): string[] {
  const p = github.profile;
  const langs = github.languages
    .slice(0, 4)
    .map((l) => l.name)
    .join(", ");
  return [
    `${SITE.name}, ${SITE.location}`,
    ...(p.bio ? [p.bio.replace(/\s+/g, " ")] : []),
    `${p.publicRepos} public repositories${
      github.contributions
        ? `, ${github.contributions.total.toLocaleString("en-US")} contributions in the past year`
        : ""
    }.`,
    `Most-used languages: ${langs}.`,
    "Type 'projects' to see the work.",
  ];
}

export function listProjects(arg?: string): string[] {
  const role = (["sde", "data", "ai"] as const).find((r) => r === arg?.toLowerCase());
  const list = role ? projectsForRole(role) : projects;
  return [
    role ? `Case studies, ordered for ${role.toUpperCase()}:` : "Case studies:",
    ...list.map(
      (p, i) => `  ${String(i + 1).padStart(2, "0")}  ${p.slug.padEnd(18)} ${p.tagline}`,
    ),
    "Use: open <slug>",
  ];
}

export function skills(): string[] {
  const groups: Record<Role, string> = { sde: "SDE", data: "Data", ai: "AI" };
  return (Object.keys(groups) as Role[]).map(
    (r) =>
      `${groups[r].padEnd(5)} ${linkedin.skills
        .filter((s) => s.group === r)
        .map((s) => s.name)
        .join(", ")}`,
  );
}

export function contact(): string[] {
  return [
    `email     ${SITE.email}`,
    `github    ${SITE.github}`,
    `linkedin  ${SITE.linkedin}`,
  ];
}

export const projectSlugs = () => projects.map((p) => p.slug);
