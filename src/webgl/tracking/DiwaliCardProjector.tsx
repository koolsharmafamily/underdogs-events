'use client';

import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { frame } from '@/state/frame';

/**
 * Module-level ref to Diwali Card DOM overlay for direct zero-state transform updates (Part 9 D3 & Part 14)
 * Guarantees staying within 1 px of the 3D card during fast scrolling without React re-renders.
 */
export const diwaliCardOverlayRef: {
  current: HTMLDivElement | null;
} = {
  current: null,
};

export function DiwaliCardProjector() {
  useFrame(() => {
    const p3 = frame.dampedProgress['D3'] ?? 0;
    const p4 = frame.dampedProgress['D4'] ?? 0;

    const el = diwaliCardOverlayRef.current;
    if (!el) return;

    const isVisible = p3 > 0.45 && p4 < 0.25;
    const isHeld = p3 > 0.72 && p4 < 0.05;

    if (!isVisible) {
      el.style.opacity = '0';
      el.style.pointerEvents = 'none';
      return;
    }

    const width = typeof window !== 'undefined' ? window.innerWidth : 1440;
    const height = typeof window !== 'undefined' ? window.innerHeight : 900;
    const isMobile = width < 768;

    // Card in camera frame:
    // Fills 70% viewport height on desktop (85% width on mobile) per Part 9 D3
    const cardAspect = 1.38; // Height / width ratio
    let targetCardHeight = height * 0.70;
    let targetCardWidth = targetCardHeight / cardAspect;

    if (isMobile) {
      targetCardWidth = width * 0.85;
      targetCardHeight = targetCardWidth * cardAspect;
    }

    // Interpolate card rise from 45% to 75% progress
    const riseP = THREE.MathUtils.clamp((p3 - 0.45) / 0.3, 0, 1);
    const easedRise = THREE.MathUtils.smoothstep(riseP, 0, 1);

    const startTop = height * 0.8;
    const endTop = (height - targetCardHeight) * 0.5;

    const currentTop = THREE.MathUtils.lerp(startTop, endTop, easedRise);
    const currentLeft = (width - targetCardWidth) * 0.5;

    // Fade in text overlay between 70% and 88%
    const fadeP = THREE.MathUtils.clamp((p3 - 0.70) / 0.18, 0, 1);
    const d4Fade = 1 - THREE.MathUtils.clamp(p4 / 0.2, 0, 1);
    const finalOpacity = fadeP * d4Fade;

    el.style.transform = `translate3d(${Math.round(currentLeft)}px, ${Math.round(currentTop)}px, 0)`;
    el.style.width = `${Math.round(targetCardWidth)}px`;
    el.style.height = `${Math.round(targetCardHeight)}px`;
    el.style.opacity = `${finalOpacity}`;
    el.style.pointerEvents = isHeld ? 'auto' : 'none';
  });

  return null;
}
