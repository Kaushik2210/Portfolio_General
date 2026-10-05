/**
 * Mutable bridge between GSAP (which drives the timeline and scroll) and the
 * R3F render loop (which reads it every frame). Kept out of React state so
 * animating it never re-renders anything.
 */
import type { Role } from "@/lib/types";

export interface SceneState {
  /** 0 = scattered noise, 1 = resolved network. */
  progress: number;
  /** 0 = hero in view, 1 = scrolled past. */
  scroll: number;
  /** Role tint override while the hero previews roles; null = use the visitor choice. */
  role: Role | null;
}

export const sceneState: SceneState = { progress: 0, scroll: 0, role: null };
