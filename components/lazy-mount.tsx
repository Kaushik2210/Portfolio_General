"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Renders children only once the box nears the viewport. Used for decorative
 * SVG with hundreds of nodes, so it does not add to first-load hydration cost.
 * Give it a className that reserves the final size to avoid layout shift.
 */
export function LazyMount({
  children,
  className,
  rootMargin = "500px",
}: {
  children: React.ReactNode;
  className?: string;
  rootMargin?: string;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShow(true);
          io.disconnect();
        }
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  return (
    <div ref={box} className={className}>
      {show ? children : null}
    </div>
  );
}
