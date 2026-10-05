import type { MetadataRoute } from "next";
import { github, projects } from "@/lib/data";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const modified = new Date(github.generatedAt);
  return [
    { url: base, lastModified: modified, changeFrequency: "weekly", priority: 1 },
    ...projects.map((p) => ({
      url: `${base}/work/${p.slug}`,
      lastModified: modified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
