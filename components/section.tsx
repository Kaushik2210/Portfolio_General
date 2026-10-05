import { Eyebrow } from "./eyebrow";
import { RevealScope } from "./reveal-scope";
import { SplitHeading } from "./split-heading";

interface Props {
  id: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}

/** Consistent section frame: mono eyebrow, display title, 1280px content column. */
export function Section({ id, eyebrow, title, children, className = "" }: Props) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={`border-line border-t py-[clamp(64px,12vw,160px)] ${className}`}
    >
      <RevealScope className="mx-auto max-w-[1280px] px-[var(--gutter)]">
        <Eyebrow className="mb-4">{eyebrow}</Eyebrow>
        <SplitHeading
          id={`${id}-title`}
          className="font-display text-[length:var(--text-3xl)] leading-[0.95] font-semibold tracking-tight"
        >
          {title}
        </SplitHeading>
        <div className="mt-[clamp(32px,6vw,80px)]">{children}</div>
      </RevealScope>
    </section>
  );
}
