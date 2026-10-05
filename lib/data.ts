import githubJson from "@/data/github.json";
import linkedinJson from "@/data/linkedin.json";
import projectsJson from "@/data/projects.json";
import { TODO } from "./types";
import type { GitHubData, LinkedInData, Project, Role } from "./types";

// JSON imports are widened to `string`, so these casts are the schema boundary.
// `npm run check:content` guards the shape at build time.
export const github = githubJson as unknown as GitHubData;
export const linkedin = linkedinJson as unknown as LinkedInData;
export const projects = projectsJson as unknown as Project[];

export const SITE = {
  name: "S V Kaushik",
  fullName: "Sodagum Venkata Kaushik",
  github: "https://github.com/Kaushik2210",
  linkedin: "https://www.linkedin.com/in/sodagum-venkata-kaushik/",
  email: "svkaushik2210@gmail.com",
  location: "Bengaluru, India",
} as const;

export const ROLES: { id: Role; label: string }[] = [
  { id: "sde", label: "SDE" },
  { id: "data", label: "Data" },
  { id: "ai", label: "AI" },
];

export const isTodo = (v: unknown): v is typeof TODO => v === TODO;

/** Projects ordered for a role: weight first, original order breaks ties. */
export function projectsForRole(role: Role): Project[] {
  return [...projects].sort((a, b) => b.weight[role] - a.weight[role]);
}
