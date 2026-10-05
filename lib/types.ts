export type Role = "sde" | "data" | "ai";

export const TODO = "TODO_VERIFY" as const;
export type Todo = typeof TODO;

/** A field that is either real content or a visible, greppable placeholder. */
export type Verified<T> = T | Todo;

export interface Experience {
  company: Verified<string>;
  title: Verified<string>;
  start: Verified<string>; // YYYY-MM
  end: Verified<string> | "present";
  location: Verified<string>;
  summary: Verified<string>;
  highlights: string[];
}

export interface Education {
  school: Verified<string>;
  degree: Verified<string>;
  field: Verified<string>;
  start: Verified<string>;
  end: Verified<string> | "present";
  grade: Verified<string>;
}

export interface Certification {
  name: Verified<string>;
  issuer: Verified<string>;
  issued: Verified<string>;
  url: Verified<string>;
}

export interface Skill {
  name: string;
  group: Role;
  level?: 1 | 2 | 3;
  /** Slugs of projects in data/projects.json that show this skill. */
  projects?: string[];
}

export interface Achievement {
  title: Verified<string>;
  detail: Verified<string>;
  year: Verified<string>;
}

export interface LinkedInData {
  headline: Verified<string>;
  about: Verified<string>;
  experience: Experience[];
  education: Education[];
  certifications: Certification[];
  skills: Skill[];
  achievements: Achievement[];
}

export interface ProjectMetric {
  label: string;
  value: Verified<string>;
}

export interface Project {
  slug: string;
  title: string;
  tagline: string;
  /** 0..1 weight per role; drives ordering in the role switcher. */
  weight: Record<Role, number>;
  problem: string;
  role: Verified<string>;
  approach: string[];
  stack: string[];
  outcome: string;
  metrics: ProjectMetric[];
  links: { repo: string; demo?: string };
  visual: "TODO_SCREENSHOT" | string;
  /** Present when the case study has a hand-drawn architecture diagram. */
  architecture?: string[];
}

export interface GitHubRepo {
  name: string;
  description: string | null;
  url: string;
  homepage: string | null;
  stars: number;
  forks: number;
  language: string | null;
  topics: string[];
  pushedAt: string;
  readmeSummary: string | null;
}

export interface ContributionDay {
  date: string;
  count: number;
}

export interface GitHubActivity {
  type: string;
  repo: string;
  at: string;
  summary: string;
}

export interface GitHubData {
  generatedAt: string;
  profile: {
    login: string;
    name: string | null;
    bio: string | null;
    location: string | null;
    blog: string | null;
    avatarUrl: string;
    followers: number;
    following: number;
    publicRepos: number;
    createdAt: string;
  };
  repos: GitHubRepo[];
  languages: { name: string; bytes: number; share: number }[];
  /** null when no token was available (the GraphQL API requires auth). */
  contributions: { total: number; days: ContributionDay[] } | null;
  activity: GitHubActivity[];
}
