import { Float3D } from "../three/float";
import { projects } from "@/lib/data";
import { Eyebrow } from "../eyebrow";
import { RevealScope } from "../reveal-scope";
import { RoleSwitcher } from "../role-switcher";
import { SplitHeading } from "../split-heading";
import { WorkPanels } from "./panels";

/** A title panel, then one full-screen panel per project. Each panel stacks over the last. */
export function Work() {
  return (
    <>
      <section
        id="work"
        data-stack
        data-world="ink"
        data-hud="Work"
        aria-labelledby="work-title"
        className="bg-bg text-fg relative flex items-center overflow-hidden pt-28 pb-14 lg:min-h-[100svh] lg:pt-[112px] lg:pb-16"
      >
        <span
          aria-hidden="true"
          className="text-outline font-display pointer-events-none absolute top-1/2 right-0 hidden -translate-y-1/2 text-[clamp(14rem,44vw,48rem)] leading-none font-semibold tracking-tighter opacity-40 select-none md:block"
        >
          {String(projects.length).padStart(2, "0")}
        </span>
        <Float3D variant="prism" className="top-[14%] right-[6%]" />
        <RevealScope className="relative z-10 mx-auto w-full max-w-[1440px] px-[var(--gutter)]">
          <Eyebrow className="mb-5">02 / Work</Eyebrow>
          <SplitHeading
            id="work-title"
            className="font-display text-[length:clamp(3.4rem,13vw,13rem)] leading-[0.84] font-semibold tracking-tighter"
          >
            Selected work.
          </SplitHeading>
          <p className="reveal text-fg-muted mt-8 max-w-xl text-lg">
            {projects.length} projects, one panel each. Keep scrolling: they stack. Switch
            the role and the order changes to lead with what fits.
          </p>
          <div className="reveal mt-8">
            <RoleSwitcher />
          </div>
        </RevealScope>
      </section>
      <WorkPanels projects={projects} />
    </>
  );
}
