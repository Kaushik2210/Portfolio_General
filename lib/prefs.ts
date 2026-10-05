import { createFlag, createPersistedStore } from "./store";
import type { Role } from "./types";

export const THEMES = ["dark", "light"] as const;
export type Theme = (typeof THEMES)[number];

export const themeStore = createPersistedStore<Theme>("theme", "dark", THEMES);

export const ROLE_IDS = ["sde", "data", "ai"] as const satisfies readonly Role[];
export const roleStore = createPersistedStore<Role>("role", "sde", ROLE_IDS);

/** true once the preloader starts handing off, so the hero can begin animating under it. */
export const introDone = createFlag(false);
/** true once the preloader overlay has fully left and can unmount. */
export const preloaderGone = createFlag(false);

export const useTheme = () => [themeStore.useValue(), themeStore.set] as const;
export const useRole = () => [roleStore.useValue(), roleStore.set] as const;
export const useRoleChosen = () => roleStore.useHasChosen();
export const useIntroDone = () => introDone.useValue();
export const usePreloaderGone = () => preloaderGone.useValue();
