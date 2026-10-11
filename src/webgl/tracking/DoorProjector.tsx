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

export function DoorProjector() {
  const { camera } = useThree();

  // Reusable vectors for zero allocation in render loop (Part 13.4)
  const vTL = new THREE.Vector3();
  const vBR = new THREE.Vector3();

  useFrame(() => {
    const p4 = frame.dampedProgress['H4'] ?? 0;
    const p5 = frame.dampedProgress['H5'] ?? 0;

    const isActive = p5 > 0.05 || p4 > 0.75;
    const isVisible = p5 > 0.02 || p4 > 0.65;

    const width = typeof window !== 'undefined' ? window.innerWidth : 1440;
    const height = typeof window !== 'undefined' ? window.innerHeight : 900;

    // Door 1: Red Room centered at [-1.2, 1.2, 0] with width ~1.1, height ~2.4
    if (domTwinRefs.red) {
      if (!isVisible) {
        domTwinRefs.red.style.opacity = '0';
        domTwinRefs.red.style.pointerEvents = 'none';
      } else {
        vTL.set(-1.2 - 0.5, 2.05, 0).project(camera);
        vBR.set(-1.2 + 0.5, 0.0, 0).project(camera);

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
    }

    // Door 2: Diwali centered at [+1.2, 1.2, 0] with width ~1.0, height ~2.05
    if (domTwinRefs.diwali) {
      if (!isVisible) {
        domTwinRefs.diwali.style.opacity = '0';
        domTwinRefs.diwali.style.pointerEvents = 'none';
      } else {
        vTL.set(1.2 - 0.5, 2.05, 0).project(camera);
        vBR.set(1.2 + 0.5, 0.0, 0).project(camera);

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
    }
  });

  return null;
}
