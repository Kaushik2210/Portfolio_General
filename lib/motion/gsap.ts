import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { Observer } from "gsap/Observer";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(
    ScrollTrigger,
    SplitText,
    Flip,
    MotionPathPlugin,
    Observer,
    useGSAP,
  );
}

export { gsap, ScrollTrigger, SplitText, Flip, MotionPathPlugin, Observer, useGSAP };
