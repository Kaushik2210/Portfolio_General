import { existsSync } from "node:fs";
import { join } from "node:path";
import { HeroClient } from "./hero-client";

/** Server wrapper: the Resume button only appears once public/resume.pdf exists. */
export function Hero() {
  const hasResume = existsSync(join(process.cwd(), "public", "resume.pdf"));
  return <HeroClient hasResume={hasResume} />;
}
