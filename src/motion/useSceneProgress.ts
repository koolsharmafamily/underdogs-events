"use client";

import { useLayoutEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { frame } from "@/state/frame";

gsap.registerPlugin(ScrollTrigger);

export function useSceneProgress(
  id: string,
  ref: RefObject<HTMLElement | null>,
) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    // A soft plateau around the composed frame, with continuous joins. This
    // changes choreography progress only; native scrolling is never snapped.
    const settle = (p: number) => {
      if (p < 0.42) return 0.5 * (1 - Math.pow(1 - p / 0.42, 2));
      if (p <= 0.58) return 0.5;
      return 0.5 + 0.5 * Math.pow((p - 0.58) / 0.42, 2);
    };

    const st = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: () => {
        const h = el.offsetHeight;
        const winH = window.innerHeight;
        return h > winH ? "bottom bottom" : "bottom top";
      },
      onUpdate: (self) => {
        frame.progress[id] = settle(self.progress);
      },
      onRefresh: (self) => {
        frame.progress[id] = settle(self.progress);
      },
    });

    frame.progress[id] = settle(st.progress);
    frame.dampedProgress[id] = settle(st.progress);

    return () => {
      st.kill();
      delete frame.progress[id];
      delete frame.dampedProgress[id];
    };
  }, [id, ref]);
}
