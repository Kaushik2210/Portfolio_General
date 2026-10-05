import { projects } from "@/lib/data";
import { RevealScope } from "../reveal-scope";
import { RoleSwitcher } from "../role-switcher";
import { Gallery } from "./gallery";

export function Work() {
  return (
    <section id="work" aria-labelledby="work-title" className="border-line border-t">
      <RevealScope className="mx-auto max-w-[1280px] px-[var(--gutter)] pt-[clamp(64px,12vw,160px)] pb-[clamp(40px,6vw,80px)]">
        <p className="reveal text-accent mb-4 font-mono text-xs tracking-widest uppercase">
          01 / Work
        </p>
        <h2
          id="work-title"
          className="reveal font-display text-[length:var(--text-3xl)] leading-[0.95] font-semibold tracking-tight"
        >
          Selected work.
        </h2>
        <p className="reveal text-fg-muted mt-6 max-w-xl">
          {projects.length} projects, ordered for the role you pick above. Each opens a
          case study: problem, approach, result.
        </p>
        <div className="reveal mt-8">
          <RoleSwitcher />
        </div>
      </RevealScope>
      <div className="pb-[clamp(64px,10vw,128px)]">
        <Gallery />
      </div>
    </section>
  );
}
