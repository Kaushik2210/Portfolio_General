import { hasResume } from "@/lib/resume";
import { HeroClient } from "./hero-client";

/** Server wrapper: the Resume button only appears once public/resume.pdf exists. */
export function Hero() {
  return <HeroClient hasResume={hasResume()} />;
}
