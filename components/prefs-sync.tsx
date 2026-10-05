"use client";

import { useEffect } from "react";
import { useRole, useTheme } from "@/lib/prefs";

/** Mirrors theme and role onto <html> so CSS can react to them. Renders nothing. */
export function PrefsSync() {
  const [theme] = useTheme();
  const [role] = useRole();

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    document.documentElement.dataset.role = role;
  }, [role]);

  return null;
}
