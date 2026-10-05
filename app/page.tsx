import { Suspense, ViewTransition } from "react";
import { About } from "@/components/about";
import { Contact } from "@/components/contact";
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
          {/* Suspense lets React hydrate each section in its own interruptible slice. */}
          <Suspense fallback={null}>
            <Work />
          </Suspense>
          <Suspense fallback={null}>
            <About />
          </Suspense>
          <Suspense fallback={null}>
            <Skills />
          </Suspense>
          <Suspense fallback={null}>
            <GitHubSection />
          </Suspense>
          <Suspense fallback={null}>
            <Contact />
          </Suspense>
        </div>
      </ViewTransition>
    </main>
  );
}
