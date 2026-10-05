import { projects } from "@/lib/data";
import { Eyebrow } from "../eyebrow";
import { SplitHeading } from "../split-heading";
import { RevealScope } from "../reveal-scope";
import { RoleSwitcher } from "../role-switcher";
import { Gallery } from "./gallery";

export function Work() {
  return (
    <section id="work" aria-labelledby="work-title" className="border-line border-t">
      <RevealScope className="mx-auto max-w-[1280px] px-[var(--gutter)] pt-[clamp(64px,12vw,160px)] pb-[clamp(40px,6vw,80px)]">
        <Eyebrow className="mb-4">01 / Work</Eyebrow>
        <SplitHeading
          id="work-title"
          className="font-display text-[length:var(--text-3xl)] leading-[0.95] font-semibold tracking-tight"
        >
          Selected work.
        </SplitHeading>
        <p className="reveal text-fg-muted mt-6 max-w-xl">
          {projects.length} projects. Switch the role to re-order them; each opens a case
          study with the problem, the approach and the result.
        </p>
        <div className="reveal mt-8">
          <RoleSwitcher />
        </div>
      </RevealScope>
      <div className="pb-[clamp(64px,10vw,128px)]">
        <Gallery projects={projects} />
      </div>
    </section>
  );
}
