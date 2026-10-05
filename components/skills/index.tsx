import { linkedin, projects } from "@/lib/data";
import { layoutSkills, skillEdges } from "@/lib/skills-layout";
import { RoleSwitcher } from "../role-switcher";
import { Section } from "../section";
import { Constellation } from "./constellation";

// Computed once at build time; the layout is deterministic.
const SKILLS = layoutSkills(linkedin.skills);
const EDGES = skillEdges(linkedin.skills);
const TITLES = Object.fromEntries(projects.map((p) => [p.slug, p.title]));

export function Skills() {
  return (
    <Section id="skills" eyebrow="03 / Skills" title="Grouped by what they are for.">
      <p className="text-fg-muted mb-12 max-w-xl">
        Pick a role and its group comes forward. Hover or focus a skill to see which case
        studies it appears in.
      </p>
      <div className="reveal mb-12">
        <RoleSwitcher />
      </div>
      <Constellation skills={SKILLS} edges={EDGES} titles={TITLES} />
    </Section>
  );
}
