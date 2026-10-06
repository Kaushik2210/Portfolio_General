"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/motion/gsap";
import { getLenis, prefersReducedMotion, setLenis } from "@/lib/motion/scroll";

/** Lenis smooth scroll driven by GSAP's ticker so ScrollTrigger stays in sync. */
export function SmoothScroll() {
  const pathname = usePathname();
  const mounted = useRef(false);
  const popped = useRef(false);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({
      autoRaf: false,
      lerp: 0.085,
      wheelMultiplier: 0.95,
      anchors: false,
    });
    setLenis(lenis);
    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  // Failsafe: anything still hidden that is on screen or already scrolled past gets shown,
  // so a fast fling or an anchor jump can never leave text invisible.
  useEffect(() => {
    if (prefersReducedMotion()) return;
    let t = 0;
    const sweep = () => {
      document.querySelectorAll<HTMLElement>(".reveal, .split-hidden").forEach((el) => {
        if (getComputedStyle(el).opacity !== "0") return;
        if (el.getBoundingClientRect().top > window.innerHeight * 0.9) return;
        gsap.to(el, {
          opacity: 1,
          y: 0,
          filter: "none",
          duration: 0.6,
          ease: "power2.out",
          overwrite: "auto",
        });
      });
    };
    const onScroll = () => {
      window.clearTimeout(t);
      t = window.setTimeout(sweep, 700);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Browser back/forward: leave scroll restoration to Next.
  useEffect(() => {
    const onPop = () => {
      popped.current = true;
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Lenis keeps its own scroll position across client navigations, so a forward
  // navigation would land mid-page. Reset to the top (or the #hash target).
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    if (popped.current) {
      popped.current = false;
      return;
    }
    const lenis = getLenis();
    if (!lenis) return;

    // Wait two frames so the new page's pins and layout exist before measuring.
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        ScrollTrigger.refresh();
        lenis.scrollTo(window.location.hash || 0, { immediate: true, force: true });
      });
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [pathname]);

  return null;
}
