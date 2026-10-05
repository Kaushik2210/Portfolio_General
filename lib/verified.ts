import { TODO } from "./types";

/** True when a data-file string is real content, not the TODO placeholder. */
export const isReal = (v: string | undefined | null): v is string =>
  typeof v === "string" && v.trim() !== "" && v !== TODO;
