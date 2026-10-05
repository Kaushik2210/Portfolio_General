import { ViewTransition } from "react";
import { About } from "@/components/about";
import { Contact } from "@/components/contact";
import { GitHubSection } from "@/components/github";
import { Hero } from "@/components/hero";
import { Skills } from "@/components/skills";
import { Work } from "@/components/work";

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
          <Contact />
        </div>
      </ViewTransition>
    </main>
  );
}
