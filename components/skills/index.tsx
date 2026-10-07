import { Float3D } from "../three/float";
import { linkedin, projects } from "@/lib/data";
import { layoutSkills, skillEdges } from "@/lib/skills-layout";
import { LazyMount } from "../lazy-mount";
import { RoleSwitcher } from "../role-switcher";
import { Section } from "../section";
import { Constellation } from "./constellation";
import { SkillRing } from "./ring";

// Computed once at build time; the layout is deterministic.
const SKILLS = layoutSkills(linkedin.skills);
const EDGES = skillEdges(linkedin.skills);
const TITLES = Object.fromEntries(projects.map((p) => [p.slug, p.title]));

export function Skills() {
  return (
    <Section
      id="skills"
      eyebrow="03 / Skills"
      title="Grouped by what they are for."
      label="Skills"
      shape={
        <>
          <Float3D variant="gyro" className="top-24 right-[10%]" />
          <Float3D variant="galaxy" className="top-[2%] left-[38%]" />
        </>
      }
    >
      <p className="text-fg-muted mb-12 max-w-xl">
        Pick a role and its group comes forward. Hover or focus a skill to see which case
        studies it appears in.
      </p>
      <div className="reveal mb-12">
        <RoleSwitcher />
      </div>
      <Constellation skills={SKILLS} edges={EDGES} titles={TITLES} />
      {/* Tablet and up only: it is hidden (and so never mounted) on phones. */}
      <LazyMount className="hidden md:block" rootMargin="200px">
        <SkillRing
          items={linkedin.skills
            .filter((k) => k.name.length <= 14)
            .slice(0, 14)
            .map((k) => ({ name: k.name, group: k.group }))}
        />
      </LazyMount>
    </Section>
  );
}
