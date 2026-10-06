import { Eyebrow } from "./eyebrow";
import { RevealScope } from "./reveal-scope";
import { SplitHeading } from "./split-heading";

export type World = "lime" | "violet" | "pink" | "cream" | "ember";

interface Props {
  id: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
  className?: string;
  /** Colour world for the whole section. Omit for the default ink theme. */
  world?: World;
  /** Short name shown in the scroll HUD. */
  label?: string;
}

/**
 * Consistent section frame: giant numeral, mono eyebrow, huge display title.
 * Marked `data-stack` so it takes part in the curtain-stacking scroll effect.
 */
export function Section({
  id,
  eyebrow,
  title,
  children,
  className = "",
  world,
  label,
}: Props) {
  return (
    <section
      id={id}
      data-stack
      data-world={world ?? "ink"}
      data-hud={label ?? eyebrow}
      aria-labelledby={`${id}-title`}
      className={`border-line bg-bg text-fg relative overflow-x-clip py-[clamp(72px,13vw,180px)] ${className}`}
    >
      <span
        aria-hidden="true"
        className="text-outline font-display pointer-events-none absolute top-4 right-[var(--gutter)] hidden text-[clamp(8rem,24vw,24rem)] leading-none font-semibold tracking-tighter opacity-70 select-none md:block"
      >
        {eyebrow.match(/^\d+/)?.[0]}
      </span>
      <RevealScope className="mx-auto max-w-[1440px] px-[var(--gutter)]">
        <Eyebrow className="mb-5">{eyebrow}</Eyebrow>
        <SplitHeading
          id={`${id}-title`}
          className="font-display text-[length:clamp(3rem,10.5vw,10rem)] leading-[0.88] font-semibold tracking-tighter"
        >
          {title}
        </SplitHeading>
        <div className="mt-[clamp(40px,7vw,96px)]">{children}</div>
      </RevealScope>
    </section>
  );
}
