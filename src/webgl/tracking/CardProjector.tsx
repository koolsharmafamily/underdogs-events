'use client';

import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { frame } from '@/state/frame';

/**
 * Module-level ref to Card DOM overlay for direct zero-state transform updates (Part 8 R4 & Part 14)
 * Guarantees staying within 1 px of the 3D card during fast scrolling without React re-renders.
 */
export const cardOverlayRef: {
  current: HTMLDivElement | null;
  cardMeshWorldMatrix: THREE.Matrix4 | null;
} = {
  current: null,
  cardMeshWorldMatrix: null,
};

export function CardProjector() {
  const { camera } = useThree();

  const vTL = new THREE.Vector3();
  const vBR = new THREE.Vector3();

  useFrame(() => {
    const p4 = frame.dampedProgress['R4'] ?? 0;
    const p5 = frame.dampedProgress['R5'] ?? 0;
    const isVisible = p4 > 0.55 && p5 < 0.25;
    const isHeld = p4 > 0.78 && p5 < 0.05;

    const el = cardOverlayRef.current;
    if (!el) return;

    if (!isVisible) {
      el.style.opacity = '0';
      el.style.pointerEvents = 'none';
      return;
    }

    const width = typeof window !== 'undefined' ? window.innerWidth : 1440;
    const height = typeof window !== 'undefined' ? window.innerHeight : 900;
    const isMobile = width < 768;

    // Card in camera frame:
    // When fully raised at p4 >= 0.8:
    // Card faces camera, centered at eye level:
    // fills 70% viewport height on desktop (85% width on mobile)
    const cardAspect = 1.42; // Card aspect ratio (height / width)
    
    let targetCardHeight = height * 0.70;
    let targetCardWidth = targetCardHeight / cardAspect;

    if (isMobile) {
      targetCardWidth = width * 0.85;
      targetCardHeight = targetCardWidth * cardAspect;
    }

    // Interpolate card rise from 55% to 80% progress
    const riseP = THREE.MathUtils.clamp((p4 - 0.55) / 0.25, 0, 1);
    const easedRise = THREE.MathUtils.smoothstep(riseP, 0, 1);

    const startTop = height * 0.75;
    const endTop = (height - targetCardHeight) * 0.5;

    const currentTop = THREE.MathUtils.lerp(startTop, endTop, easedRise);
    const currentLeft = (width - targetCardWidth) * 0.5;

    // Fade in overlay text between 78% and 92%
    const fadeP = THREE.MathUtils.clamp((p4 - 0.78) / 0.14, 0, 1);
    const r5Fade = 1 - THREE.MathUtils.clamp(p5 / 0.2, 0, 1);
    const finalOpacity = fadeP * r5Fade;

    el.style.transform = `translate3d(${Math.round(currentLeft)}px, ${Math.round(currentTop)}px, 0)`;
    el.style.width = `${Math.round(targetCardWidth)}px`;
    el.style.height = `${Math.round(targetCardHeight)}px`;
    el.style.opacity = `${finalOpacity}`;
    el.style.pointerEvents = isHeld ? 'auto' : 'none';
  });

  return null;
}
