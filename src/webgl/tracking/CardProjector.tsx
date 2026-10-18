"use client";

import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { composition } from "../composition";
import { frame } from "@/state/frame";
import { useStore } from "@/state/store";

/** A screen-space reading surface, revealed after the invitation entrance. */
import { cardOverlayRef } from "./refs";
export { cardOverlayRef };

export function CardProjector() {
  useFrame(() => {
    const motionEnabled = useStore.getState().motionEnabled;
    const p4 = frame.dampedProgress["R4"] ?? 0;
    const p5 = frame.dampedProgress["R5"] ?? 0;
    const isVisible =
      composition.scene === "R4" && motionEnabled && p4 > 0.35 && p5 < 0.25;

    const el = cardOverlayRef.current;
    if (!el) return;

    if (!isVisible) {
      if (el.style.opacity !== "0") {
        el.style.opacity = "0";
        el.style.pointerEvents = "none";
      }
      return;
    }

    const width = typeof window !== "undefined" ? window.innerWidth : 1440;
    const height = typeof window !== "undefined" ? window.innerHeight : 900;
    const isMobile = width < 768;

    // Detect when R4 unpins and scrolls upward out of the viewport as R5 enters
    const exitFade = p5 > 0 ? 1 - THREE.MathUtils.clamp(p5 / 0.22, 0, 1) : 1;
    const exitShiftY = p5 > 0 ? -p5 * height * 0.8 : 0;

    // Generous editorial invitation proportions so all rows + booking details scan in < 5s
    let targetCardHeight = Math.min(height * 0.78, 680);
    let targetCardWidth = Math.min(width * 0.9, Math.max(580, targetCardHeight * 0.95));

    if (isMobile) {
      targetCardWidth = width - 32;
      targetCardHeight = Math.min(height * 0.76, 620);
    }

    // Interpolate card rise from 20% to 48% progress
    const riseP = THREE.MathUtils.clamp((p4 - 0.2) / 0.28, 0, 1);
    const easedRise = THREE.MathUtils.smoothstep(riseP, 0, 1);

    const startTop = height * 0.72;
    const endTop = (height - targetCardHeight) * 0.52;

    const currentTop =
      THREE.MathUtils.lerp(startTop, endTop, easedRise) + exitShiftY;
    const currentLeft = (width - targetCardWidth) * 0.5;

    // Quick crossfade (38–43%): opaque before the 3D tray hides at 44%
    const fadeP = THREE.MathUtils.clamp((p4 - 0.38) / 0.05, 0, 1);
    const r5Fade = 1 - THREE.MathUtils.clamp(p5 / 0.2, 0, 1);
    const finalOpacity = fadeP * r5Fade * exitFade;
    const isHeld = p4 > 0.45 && p5 < 0.08 && exitFade > 0.5;

    el.style.transform = `translate3d(${Math.round(currentLeft)}px, ${Math.round(currentTop)}px, 0)`;
    el.style.width = `${Math.round(targetCardWidth)}px`;
    el.style.height = `${Math.round(targetCardHeight)}px`;
    el.style.opacity = `${finalOpacity}`;
    el.style.pointerEvents = isHeld ? "auto" : "none";
  });

  return null;
}
