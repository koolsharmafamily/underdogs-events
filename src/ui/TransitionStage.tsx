"use client";
import { useEffect, useRef } from "react";
import { registerTransitionStage } from "@/motion/transitions";
import gsap from "gsap";
import { frame } from "@/state/frame";
import { badgeScreenBounds } from "@/webgl/badge/screenBounds";
import { useStore } from "@/state/store";
import { pathToWorld, worldToSkin } from "@/motion/transitions";

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
    // Only cut the badge aperture when the DESTINATION skin is loaded, compiled
    // and has rendered at least one frame. Never cut an empty hole.
    const trackBadge = () => {
      if (!stage.current) return;
      const b = badgeScreenBounds;
      const store = useStore.getState();
      const currentWorld = pathToWorld(typeof window !== "undefined" ? window.location.pathname : "/");
      const targetSkin = store.targetSkinOverride ?? worldToSkin(currentWorld);
      const isTargetReady = b.ready && b.readySkin === targetSkin;

      stage.current.style.maskImage =
        frame.transition.phase !== "idle" && isTargetReady
          ? `radial-gradient(circle at ${b.x}px ${b.y}px, transparent ${b.size * 0.53}px, #000 ${b.size * 0.53 + 2}px)`
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
          background: "radial-gradient(circle at center, #FFFFFF 0%, #FFF1C9 35%, #FFE3A3 65%, #C69442 100%)",
        }}
      />
      <div ref={curtains} className="absolute inset-0 invisible">
        <div ref={left} className="transition-curtain left-0" />
        <div ref={right} className="transition-curtain right-0" />
      </div>
    </div>
  );
}
