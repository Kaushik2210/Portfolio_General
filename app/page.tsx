import { ViewTransition } from "react";
import { About } from "@/components/about";
import { Contact } from "@/components/contact";
import { Float3D } from "@/components/three/float";
import { Hud } from "@/components/hud";
import { Marquee } from "@/components/marquee";
import { ScrubBand } from "@/components/scrub-band";
import { SectionStack } from "@/components/stack";
import { GitHubSection } from "@/components/github";
import { Hero } from "@/components/hero";
import { linkedin, SITE } from "@/lib/data";
import { siteUrl } from "@/lib/site";
import { Skills } from "@/components/skills";
import { Work } from "@/components/work";

const slide = {
  enter: { "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" },
  exit: { "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" },
} as const;

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: SITE.fullName,
  alternateName: SITE.name,
  url: siteUrl(),
  email: `mailto:${SITE.email}`,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Bengaluru",
    addressCountry: "IN",
  },
  sameAs: [SITE.github, SITE.linkedin],
  knowsAbout: linkedin.skills.map((s) => s.name),
};

export default function Home() {
  return (
    <main id="main" tabIndex={-1}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <ViewTransition enter={slide.enter} exit={slide.exit} default="none">
        <div className="overflow-x-clip">
          <Hero />
          <About />
          <Work />

          {/* Tape across the page: two colour bands crossing, then type that travels. */}
          <div
            data-stack
            data-world="ink"
            data-hud="Tape"
            className="bg-bg relative overflow-x-clip py-[clamp(48px,8vw,120px)]"
          >
            <Float3D variant="helix" className="top-[4%] left-[3%] !z-20" />
            <Float3D variant="orbit" className="right-[3%] bottom-[8%] !z-20" />
            <Marquee
              tone="accent"
              tilt={-1.6}
              words={["Software engineer", "Data analyst", "AI engineer", "Bengaluru"]}
            />
            <div className="-mt-[clamp(40px,7vw,96px)] hidden md:block">
              <Marquee
                tone="lime"
                tilt={1.4}
                direction={-1}
                words={[
                  "Ship it",
                  "Show the evidence",
                  "Explain the model",
                  "Measure twice",
                ]}
              />
            </div>
            <div className="hidden md:block">
              <ScrubBand
                rows={[
                  ["EXPLAIN THE MODEL", 1],
                  ["SHOW THE EVIDENCE", -1],
                ]}
              />
            </div>
          </div>

          <Skills />
          <GitHubSection />
          <Contact />
        </div>
      </ViewTransition>
      <SectionStack />
      <Hud />
    </main>
  );
}
