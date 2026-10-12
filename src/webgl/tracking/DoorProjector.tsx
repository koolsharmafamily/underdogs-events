'use client';

import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { frame } from '@/state/frame';

// Module-level refs to DOM twins for direct zero-state transform updates (Part 13.4 & Part 15)
export const domTwinRefs: {
  red: HTMLAnchorElement | null;
  diwali: HTMLAnchorElement | null;
} = {
  red: null,
  diwali: null,
};

// Reusable vectors for zero allocation in render loop (Part 13.4)
const vTL = new THREE.Vector3();
const vBR = new THREE.Vector3();

export function DoorProjector() {
  const { camera } = useThree();

  useFrame(() => {
    const p4 = frame.dampedProgress['H4'] ?? 0;
    const p5 = frame.dampedProgress['H5'] ?? 0;

    const isActive = p5 > 0.05 || p4 > 0.75;
    const isVisible = p5 > 0.02 || p4 > 0.65;

    // Guard against redundant DOM style writes when doors are not in view
    if (!isVisible) {
      if (domTwinRefs.red && domTwinRefs.red.style.opacity !== '0') {
        domTwinRefs.red.style.opacity = '0';
        domTwinRefs.red.style.pointerEvents = 'none';
      }
      if (domTwinRefs.diwali && domTwinRefs.diwali.style.opacity !== '0') {
        domTwinRefs.diwali.style.opacity = '0';
        domTwinRefs.diwali.style.pointerEvents = 'none';
      }
      return;
    }

    const width = typeof window !== 'undefined' ? window.innerWidth : 1440;
    const height = typeof window !== 'undefined' ? window.innerHeight : 900;
    const isPortrait = width < height;

    const redX = isPortrait ? 0 : -1.45;
    const diwaliX = isPortrait ? 0 : 1.45;
    const halfW = isPortrait ? 0.45 : 0.72;
    const redBottomY = isPortrait ? 1.55 : 0.0;
    const redTopY = isPortrait ? 2.89 : 2.55;
    const diwaliBottomY = isPortrait ? -0.15 : 0.0;
    const diwaliTopY = isPortrait ? 1.32 : 2.80;

    // Door 1: Red Room
    if (domTwinRefs.red) {
      vTL.set(redX - halfW, redTopY, 0).project(camera);
      vBR.set(redX + halfW, redBottomY, 0).project(camera);

      const x1 = (vTL.x * 0.5 + 0.5) * width;
      const y1 = (-vTL.y * 0.5 + 0.5) * height;
      const x2 = (vBR.x * 0.5 + 0.5) * width;
      const y2 = (-vBR.y * 0.5 + 0.5) * height;

      const left = Math.round(Math.min(x1, x2));
      const top = Math.round(Math.min(y1, y2));
      const w = Math.round(Math.abs(x2 - x1));
      const h = Math.round(Math.abs(y2 - y1));

      domTwinRefs.red.style.transform = `translate3d(${left}px, ${top}px, 0)`;
      domTwinRefs.red.style.width = `${w}px`;
      domTwinRefs.red.style.height = `${h}px`;
      domTwinRefs.red.style.opacity = '1';
      domTwinRefs.red.style.pointerEvents = isActive ? 'auto' : 'none';
    }

    // Door 2: Diwali
    if (domTwinRefs.diwali) {
      vTL.set(diwaliX - halfW, diwaliTopY, 0).project(camera);
      vBR.set(diwaliX + halfW, diwaliBottomY, 0).project(camera);

      const x1 = (vTL.x * 0.5 + 0.5) * width;
      const y1 = (-vTL.y * 0.5 + 0.5) * height;
      const x2 = (vBR.x * 0.5 + 0.5) * width;
      const y2 = (-vBR.y * 0.5 + 0.5) * height;

      const left = Math.round(Math.min(x1, x2));
      const top = Math.round(Math.min(y1, y2));
      const w = Math.round(Math.abs(x2 - x1));
      const h = Math.round(Math.abs(y2 - y1));

      domTwinRefs.diwali.style.transform = `translate3d(${left}px, ${top}px, 0)`;
      domTwinRefs.diwali.style.width = `${w}px`;
      domTwinRefs.diwali.style.height = `${h}px`;
      domTwinRefs.diwali.style.opacity = '1';
      domTwinRefs.diwali.style.pointerEvents = isActive ? 'auto' : 'none';
    }
  });

  return null;
}
