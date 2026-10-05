import { existsSync } from "node:fs";
import { join } from "node:path";

/** Server-only: the Resume button and palette entry appear once public/resume.pdf exists. */
export const hasResume = (): boolean =>
  existsSync(join(process.cwd(), "public", "resume.pdf"));
