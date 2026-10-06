"use client";

import { Component, type ReactNode } from "react";

/** A failed WebGL context must never take the page down: show the fallback instead. */
export class Guard extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (this.props.fallback ?? null) : this.props.children;
  }
}
