/**
 * Validates data/*.json shape and prints every unverified field.
 * Fails (exit 1) only on structural errors; TODOs are reported, not fatal,
 * unless --strict is passed (use that before a production release).
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (f: string): unknown => JSON.parse(readFileSync(resolve("data", f), "utf8"));
const errors: string[] = [];
const todos: string[] = [];

function walk(v: unknown, path: string) {
  if (v === "TODO_VERIFY" || v === "TODO_SCREENSHOT") todos.push(`${path} = ${v}`);
  else if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${path}[${i}]`));
  else if (v && typeof v === "object")
    for (const [k, x] of Object.entries(v)) walk(x, `${path}.${k}`);
}

const roles = ["sde", "data", "ai"];
const projects = read("projects.json") as Record<string, unknown>[];
const slugs = new Set<string>();
for (const p of projects) {
  const id = String(p.slug);
  if (slugs.has(id)) errors.push(`duplicate project slug: ${id}`);
  slugs.add(id);
  for (const key of [
    "title",
    "tagline",
    "problem",
    "outcome",
    "approach",
    "stack",
    "links",
  ]) {
    if (!p[key]) errors.push(`${id}: missing ${key}`);
  }
  const w = p.weight as Record<string, number> | undefined;
  for (const r of roles) {
    if (typeof w?.[r] !== "number" || w[r] < 0 || w[r] > 1)
      errors.push(`${id}: weight.${r} must be a number in 0..1`);
  }
}

const li = read("linkedin.json") as Record<string, unknown>;
for (const key of [
  "headline",
  "about",
  "experience",
  "education",
  "certifications",
  "skills",
  "achievements",
]) {
  if (!(key in li)) errors.push(`linkedin.json: missing ${key}`);
}
for (const s of (li.skills as { name: string; group: string; projects?: string[] }[]) ??
  []) {
  if (!roles.includes(s.group)) errors.push(`skill ${s.name}: bad group ${s.group}`);
  for (const slug of s.projects ?? []) {
    if (!slugs.has(slug)) errors.push(`skill ${s.name}: unknown project slug ${slug}`);
  }
}

walk(projects, "projects");
walk(li, "linkedin");

console.log(`${projects.length} projects, ${(li.skills as unknown[]).length} skills`);
console.log(`${todos.length} unverified field(s):`);
for (const t of todos) console.log(`  - ${t}`);

if (errors.length) {
  console.error(`\n${errors.length} structural error(s):`);
  for (const e of errors) console.error(`  x ${e}`);
  process.exit(1);
}
if (process.argv.includes("--strict") && todos.length) {
  console.error("\n--strict: unverified fields remain");
  process.exit(1);
}
