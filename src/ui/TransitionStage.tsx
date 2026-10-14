"use client";
import { useEffect, useRef } from "react";
import { registerTransitionStage } from "@/motion/transitions";
import gsap from "gsap";
import { frame } from "@/state/frame";
import { badgeScreenBounds } from "@/webgl/badge/screenBounds";
export function TransitionStage() {
  const stage = useRef<HTMLDivElement>(null),
    veil = useRef<HTMLDivElement>(null),
    wash = useRef<HTMLDivElement>(null);
  const curtains = useRef<HTMLDivElement>(null),
    left = useRef<HTMLDivElement>(null),
    right = useRef<HTMLDivElement>(null);
  useEffect(() => {
    registerTransitionStage({
      stageEl: stage.current,
      veilEl: veil.current,
      washEl: wash.current,
      curtainWrapEl: curtains.current,
      leftCurtainEl: left.current,
      rightCurtainEl: right.current,
    });
    // Keep the persistent WebGL badge visible through the cover. The aperture
    // follows its projected bounds; there is no replacement still or second canvas.
    const trackBadge = () => {
      if (!stage.current) return;
      const b = badgeScreenBounds;
      stage.current.style.maskImage = frame.transition.phase !== "idle" && b.ready
        ? `radial-gradient(circle at ${b.x}px ${b.y}px,transparent ${b.size*.53}px,#000 ${b.size*.53+2}px)`
        : "none";
    };
    gsap.ticker.add(trackBadge);
    return () => { gsap.ticker.remove(trackBadge); registerTransitionStage(null); };
  }, []);
  return (
    <div
      ref={stage}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[100] overflow-hidden"
    >
      <div
        ref={veil}
        data-transition-veil
        className="absolute inset-0 opacity-0"
        style={{ background: "#07070B" }}
      />
      <div
        ref={wash}
        className="absolute inset-0 opacity-0"
        style={{
          background: "radial-gradient(ellipse at center,#FFF6DC,#D2A159)",
        }}
      />
      <div ref={curtains} className="absolute inset-0 invisible">
        <div ref={left} className="transition-curtain left-0" />
        <div ref={right} className="transition-curtain right-0" />
      </div>
    </div>
  );
}
