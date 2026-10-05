import { ViewTransition } from "react";
import { About } from "@/components/about";
import { GitHubSection } from "@/components/github";
import { Hero } from "@/components/hero";
import { Skills } from "@/components/skills";
import { Work } from "@/components/work";

const PLACEHOLDERS = ["contact"];

const slide = {
  enter: { "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" },
  exit: { "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" },
} as const;

export default function Home() {
  return (
    <main>
      <ViewTransition enter={slide.enter} exit={slide.exit} default="none">
        <div>
          <Hero />
          <Work />
          <About />
          <Skills />
          <GitHubSection />
          {PLACEHOLDERS.map((id) => (
            <Placeholder key={id} id={id} />
          ))}
        </div>
      </ViewTransition>
    </main>
  );
}

function Placeholder({ id }: { id: string }) {
  return (
    <section
      id={id}
      className="border-line flex min-h-screen items-center border-t px-[var(--gutter)]"
    >
      <h2 className="font-display text-[length:var(--text-3xl)] capitalize">{id}</h2>
    </section>
  );
}
