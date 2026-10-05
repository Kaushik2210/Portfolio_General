import { useSyncExternalStore } from "react";

export type SceneMode = "webgl" | "fallback";

interface NavigatorHints extends Navigator {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
}

function detect(): SceneMode {
  const nav = navigator as NavigatorHints;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const narrow = window.innerWidth < 768;
  const lowPower =
    (nav.hardwareConcurrency ?? 8) <= 2 ||
    (nav.deviceMemory ?? 8) <= 2 ||
    nav.connection?.saveData === true;
  if (reduced || coarse || narrow || lowPower) return "fallback";

  try {
    const canvas = document.createElement("canvas");
    const gl = (canvas.getContext("webgl2") ?? canvas.getContext("webgl")) as
      WebGLRenderingContext | WebGL2RenderingContext | null;
    if (!gl) return "fallback";
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    return "fallback";
  }
  return "webgl";
}

let cached: SceneMode | null = null;
const snapshot = (): SceneMode => (cached ??= detect());
const subscribe = () => () => {};

/** "fallback" on the server and on mobile, reduced-motion, low-power or no-WebGL clients. */
export const useSceneMode = (): SceneMode =>
  useSyncExternalStore(subscribe, snapshot, () => "fallback");

const REDUCED = "(prefers-reduced-motion: reduce)";

/** Live `prefers-reduced-motion`. False on the server so markup matches hydration. */
export const useReducedMotion = (): boolean =>
  useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(REDUCED);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(REDUCED).matches,
    () => false,
  );
