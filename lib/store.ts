import { useSyncExternalStore } from "react";

/**
 * Tiny external store backed by localStorage. Read through useSyncExternalStore
 * so the server renders `fallback` and the client swaps to the stored value
 * after hydration without a setState-in-effect.
 */
export function createPersistedStore<T extends string>(
  key: string,
  fallback: T,
  valid: readonly T[],
) {
  const listeners = new Set<() => void>();
  let cached: T | null = null;
  let stored = false;

  const get = (): T => {
    if (cached !== null) return cached;
    let value: T = fallback;
    try {
      const raw = localStorage.getItem(key);
      if (raw && (valid as readonly string[]).includes(raw)) {
        value = raw as T;
        stored = true;
      }
    } catch {
      // storage can throw (private mode, blocked site data); fall back quietly
    }
    cached = value;
    return value;
  };

  const set = (value: T) => {
    cached = value;
    stored = true;
    try {
      localStorage.setItem(key, value);
    } catch {
      // not persisted, still applied for this session
    }
    listeners.forEach((l) => l());
  };

  const subscribe = (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  };

  const useValue = (): T => useSyncExternalStore(subscribe, get, () => fallback);

  /** True once the visitor has chosen a value (now or in an earlier visit). */
  const useHasChosen = (): boolean =>
    useSyncExternalStore(
      subscribe,
      () => {
        get();
        return stored;
      },
      () => false,
    );

  return { get, set, subscribe, useValue, useHasChosen };
}

/** In-memory boolean store for one-shot flags (e.g. the intro finished). */
export function createFlag(initial = false) {
  const listeners = new Set<() => void>();
  let value = initial;
  return {
    get: () => value,
    set(next: boolean) {
      if (next === value) return;
      value = next;
      listeners.forEach((l) => l());
    },
    subscribe(l: () => void) {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    useValue: () =>
      useSyncExternalStore(
        (l) => {
          listeners.add(l);
          return () => listeners.delete(l);
        },
        () => value,
        () => initial,
      ),
  };
}
