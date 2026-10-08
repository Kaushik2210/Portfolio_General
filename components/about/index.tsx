import { Float3D } from "../three/float";
import { github, linkedin, projects } from "@/lib/data";
import { buildTimeline } from "@/lib/timeline";
import { isReal } from "@/lib/verified";
import { Section } from "../section";
import { ScrubText } from "./scrub-text";
import { Stats, type Stat } from "./stats";
import { Timeline } from "./timeline";

const fmtInt = (n: number) => n.toLocaleString("en-US");

export function About() {
  const all = buildTimeline(linkedin);
  // Roles and degrees form the timeline; certificates get their own compact list.
  const timeline = all.filter((i) => i.kind !== "certification");
  const certList = all.filter((i) => i.kind === "certification");
  const certs = linkedin.certifications.filter((c) => isReal(c.name)).length;
  const wins = linkedin.achievements.filter((a) => isReal(a.title)).length;
  const calendar = github.contributions;

  // Every figure comes from the synced GitHub data or the verified content files;
  // zero or unverified counters are dropped rather than shown as "0".
  const stats: Stat[] = [
    { label: "Public repositories", value: github.profile.publicRepos, note: "GitHub" },
    ...(calendar
      ? [
          {
            label: "Contributions",
            value: calendar.total,
            note: "past year",
          } satisfies Stat,
        ]
      : []),
    { label: "Case studies", value: projects.length, note: "featured" },
    { label: "Languages", value: github.languages.length, note: "over 1% of my code" },
    ...(certs > 0 ? [{ label: "Certifications", value: certs } satisfies Stat] : []),
    ...(wins > 0 ? [{ label: "Hackathons and awards", value: wins } satisfies Stat] : []),
  ];

  const story = isReal(linkedin.about)
    ? linkedin.about
    : `I build software that explains itself. Full-stack products in TypeScript and Python, and detection systems that return evidence instead of a bare verdict. Most of it is in the open: ${fmtInt(github.profile.publicRepos)} public repositories${
        calendar ? ` and ${fmtInt(calendar.total)} contributions in the past year` : ""
      }.`;

  return (
    <Section
      id="about"
      eyebrow="01 / About"
      title="Software that shows its work."
      world="lime"
      label="About"
      shape={
        <>
          <Float3D
            variant="crystal"
            className="top-[clamp(380px,34vw,560px)] right-[3%]"
          />
          <Float3D variant="rings" className="top-[5%] right-[24%]" />
        </>
      }
    >
      <div className="grid gap-[clamp(40px,8vw,120px)] lg:grid-cols-12">
        <div className="lg:col-span-8">
          <ScrubText
            text={story}
            className="font-display text-[length:var(--text-2xl)] leading-[1.15] tracking-tight"
          />
        </div>
      </div>

      <div className="mt-[clamp(56px,10vw,128px)]">
        <Stats items={stats} />
      </div>

      {timeline.length > 0 ? (
        <div className="mt-[clamp(72px,12vw,160px)]">
          <h3 className="reveal text-fg-muted mb-12 font-mono text-xs tracking-widest uppercase">
            Path so far
          </h3>
          <Timeline items={timeline} />
        </div>
      ) : null}

      {certList.length > 0 && (
        <div className="mt-[clamp(56px,9vw,120px)]">
          <h3 className="reveal text-fg-muted mb-8 font-mono text-xs tracking-widest uppercase">
            Certifications
          </h3>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {certList.map((c) => (
              <li
                key={`${c.title}-${c.period}`}
                className="reveal border-ink rounded-[var(--radius)] border-2 px-4 py-3"
              >
                <p className="font-medium">{c.title}</p>
                <p className="font-mono text-xs opacity-70">
                  {[c.org, c.period].filter(Boolean).join(" / ")}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {timeline.length === 0 && process.env.NODE_ENV !== "production" && (
        <p className="border-line text-fg-muted mt-16 rounded-[var(--radius)] border border-dashed p-6 font-mono text-xs">
          dev only: the timeline is hidden because data/linkedin.json has no verified
          experience, education or certifications yet. See docs/TODO-content.md.
        </p>
      )}
    </Section>
  );
}
