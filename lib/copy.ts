import type { Role } from "./types";

/**
 * Hero copy per role. Every claim maps to a project in data/projects.json:
 * sde -> Overrank, gitVisualise; data -> Orbital Sentinel, NetSentinel;
 * ai -> VeriFrame, PORTCULLIS, ATTESTA.
 */
export const ROLE_COPY: Record<Role, { title: string; label: string; line: string }> = {
  sde: {
    title: "Software Engineer",
    label: "SDE",
    line: "Full-stack TypeScript and Python systems, from a realtime campus leaderboard to a zero-dependency developer tool, shipped and live.",
  },
  data: {
    title: "Data Analyst",
    label: "Data",
    line: "Telemetry and anomaly analysis, from NASA spacecraft data to network traffic, where every result shows the evidence behind it.",
  },
  ai: {
    title: "AI Engineer",
    label: "AI",
    line: "Detection and LLM systems that report calibrated confidence and show their work: deepfakes, prompt injection and autonomous SOC verdicts.",
  },
};

export const ROLE_ORDER: Role[] = ["sde", "data", "ai"];
