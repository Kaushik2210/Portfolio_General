import { isReal } from "./verified";
import type { LinkedInData } from "./types";

export interface TimelineItem {
  kind: "experience" | "education" | "certification";
  title: string;
  org: string;
  period: string;
  summary?: string;
  highlights: string[];
  /** Verification link (certifications only). */
  url?: string;
  /** YYYY-MM, used only for sorting (newest first). */
  sortKey: string;
}

const fmt = (ym: string): string => {
  const [y, m] = ym.split("-");
  if (!m) return y;
  const name = new Date(Number(y), Number(m) - 1).toLocaleString("en-US", {
    month: "short",
  });
  return `${name} ${y}`;
};

const period = (start: string, end: string): string =>
  `${isReal(start) ? fmt(start) : ""}${isReal(start) ? " – " : ""}${
    end === "present" ? "Present" : isReal(end) ? fmt(end) : ""
  }`.trim();

/** Builds timeline entries from linkedin.json, dropping anything unverified. */
export function buildTimeline(data: LinkedInData): TimelineItem[] {
  const items: TimelineItem[] = [];

  for (const e of data.experience) {
    if (!isReal(e.company) || !isReal(e.title)) continue;
    items.push({
      kind: "experience",
      title: e.title,
      org: e.company,
      period: period(e.start, e.end),
      summary: isReal(e.summary) ? e.summary : undefined,
      highlights: e.highlights.filter(isReal),
      sortKey: isReal(e.start) ? e.start : "0000-00",
    });
  }

  for (const e of data.education) {
    if (!isReal(e.school)) continue;
    const degree = [e.degree, e.field].filter(isReal).join(", ");
    items.push({
      kind: "education",
      title: degree || "Education",
      org: e.school,
      period: period(e.start, e.end),
      summary: isReal(e.grade) ? `Grade: ${e.grade}` : undefined,
      highlights: [],
      sortKey: isReal(e.start) ? e.start : "0000-00",
    });
  }

  for (const c of data.certifications) {
    if (!isReal(c.name)) continue;
    items.push({
      kind: "certification",
      title: c.name,
      org: isReal(c.issuer) ? c.issuer : "",
      period: isReal(c.issued) ? fmt(c.issued) : "",
      url: isReal(c.url) ? c.url : undefined,
      highlights: [],
      sortKey: isReal(c.issued) ? c.issued : "0000-00",
    });
  }

  return items.sort((a, b) => b.sortKey.localeCompare(a.sortKey));
}
