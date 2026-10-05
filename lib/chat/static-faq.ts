import { projects, SITE } from "@/lib/data";

export interface Faq {
  q: string;
  /** Markdown. Links to /work/<slug> render as case-study chips. */
  a: string;
}

const link = (slug: string) => {
  const p = projects.find((x) => x.slug === slug);
  return p ? `[${p.title}](/work/${p.slug})` : slug;
};

const usesStack = (needle: string) =>
  projects.filter((p) =>
    p.stack.some((s) => s.toLowerCase().includes(needle.toLowerCase())),
  );

/**
 * Answers built straight from the data files, shown when the AI is unavailable.
 * Same grounding rule as the bot: only facts that are in the data.
 */
export function staticFaq(): Faq[] {
  const torch = usesStack("pytorch");
  const live = projects.filter((p) => p.links.demo);
  const sde = [...projects].sort((a, b) => b.weight.sde - a.weight.sde)[0];
  const ai = [...projects].sort((a, b) => b.weight.ai - a.weight.ai)[0];

  return [
    {
      q: "What has Kaushik built with PyTorch?",
      a: torch.length
        ? `PyTorch shows up in ${torch.map((p) => link(p.slug)).join(" and ")}.`
        : "No featured project lists PyTorch.",
    },
    {
      q: "Which projects can I try live?",
      a: `${live.length} have a public demo: ${live.map((p) => link(p.slug)).join(", ")}.`,
    },
    {
      q: "What is the best project for a backend or full-stack SDE role?",
      a: `${link(sde.slug)}. ${sde.tagline} ${sde.outcome}`,
    },
    {
      q: "What is the best project for an AI engineer role?",
      a: `${link(ai.slug)}. ${ai.tagline} ${ai.outcome}`,
    },
    {
      q: "How do I contact him?",
      a: `Email [${SITE.email}](mailto:${SITE.email}), or find him on [GitHub](${SITE.github}) and [LinkedIn](${SITE.linkedin}).`,
    },
  ];
}

export const STARTERS = [
  "What has Kaushik built with PyTorch?",
  "Is he a fit for a backend SDE role?",
  "Walk me through the best project",
] as const;
