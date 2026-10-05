import { ViewTransition } from "react";
import { About } from "@/components/about";
import { Contact } from "@/components/contact";
import { Marquee } from "@/components/marquee";
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
        <div>
          <Hero />
          <Marquee
            words={["Software engineer", "Data analyst", "AI engineer", "Bengaluru"]}
          />
          <Work />
          <About />
          <Skills />
          <Marquee
            direction={-1}
            words={[
              "TypeScript",
              "Python",
              "PyTorch",
              "Next.js",
              "FastAPI",
              "Supabase",
              "ONNX",
            ]}
          />
          <GitHubSection />
          <Contact />
        </div>
      </ViewTransition>
    </main>
  );
}
