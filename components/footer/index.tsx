import { Float3D } from "../three/float";
import { SITE } from "@/lib/data";
import { BackToTop, LocalTime, TerminalLink, Wordmark } from "./parts";

export function Footer() {
  return (
    <footer className="border-line relative overflow-hidden border-t pt-[clamp(48px,8vw,96px)]">
      <Float3D variant="orbit" className="top-4 right-[18%]" />
      <Float3D
        variant="gems"
        className="top-[6%] left-[26%] !h-[clamp(140px,14vw,220px)] !w-[clamp(320px,32vw,520px)]"
      />
      <Float3D variant="embers" className="bottom-0 left-0 !h-[72%] !w-full" />
      <div className="mx-auto max-w-[1280px] px-[var(--gutter)]">
        <div className="flex flex-wrap items-center justify-between gap-6 lg:pr-44">
          <LocalTime />
          <BackToTop />
        </div>
      </div>

      <div className="mt-[clamp(32px,6vw,72px)] px-[var(--gutter)]">
        <Wordmark text="S V KAUSHIK" />
      </div>

      <div className="border-line text-fg-muted mx-auto mt-6 flex max-w-[1280px] flex-wrap items-center justify-between gap-4 border-t px-[var(--gutter)] py-6 font-mono text-xs">
        <p>
          &copy; {new Date().getFullYear()} {SITE.name}. Built with Next.js, GSAP and
          Three.js.
        </p>
        <TerminalLink />
      </div>
    </footer>
  );
}
