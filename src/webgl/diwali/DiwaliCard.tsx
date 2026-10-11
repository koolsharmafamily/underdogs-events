'use client';

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { frame } from '@/state/frame';

export function DiwaliCard() {
  const cardGltf = useGLTF('/models/diwali-card.glb');
  const groupRef = useRef<THREE.Group>(null);
  const cardNodeRef = useRef<THREE.Group>(null);

  const clonedCard = useMemo(() => cardGltf.scene.clone(true), [cardGltf.scene]);

  useFrame(() => {
    const p3 = frame.dampedProgress['D3'] ?? 0;
    const p4 = frame.dampedProgress['D4'] ?? 0;

    if (!cardNodeRef.current) return;

    // D3: Rises from below on a slow half-turn spiral, trailing gold dust (Part 9 D3)
    // Settle facing camera at 70% vh
    if (p4 > 0.05) {
      // Smooth retraction when advancing to D4
      const exitP = THREE.MathUtils.clamp(p4 / 0.35, 0, 1);
      const easedExit = THREE.MathUtils.smoothstep(exitP, 0, 1);
      cardNodeRef.current.position.set(
        0,
        THREE.MathUtils.lerp(1.3, -1.5, easedExit),
        THREE.MathUtils.lerp(1.2, 0.4, easedExit)
      );
      cardNodeRef.current.scale.setScalar(THREE.MathUtils.lerp(0.85, 0.2, easedExit));
      cardNodeRef.current.rotation.set(0, Math.PI * easedExit, 0);
    } else if (p3 < 0.1) {
      // Below screen initial rest
      cardNodeRef.current.position.set(0, -1.8, 0.2);
      cardNodeRef.current.rotation.set(0, Math.PI, 0);
      cardNodeRef.current.scale.setScalar(0.2);
    } else if (p3 < 0.75) {
      // Rise and spiral up
      const spiralP = (p3 - 0.1) / 0.65;
      const eased = THREE.MathUtils.smoothstep(spiralP, 0, 1);

      cardNodeRef.current.position.set(
        Math.sin(eased * Math.PI) * 0.25,
        THREE.MathUtils.lerp(-1.8, 1.3, eased),
        THREE.MathUtils.lerp(0.2, 1.2, eased)
      );

      // Half-turn spiral rotation around Y (Math.PI -> 0)
      cardNodeRef.current.rotation.set(
        -0.08 * (1 - eased),
        THREE.MathUtils.lerp(Math.PI, 0.0, eased),
        Math.sin(eased * Math.PI) * 0.08
      );

      const targetScale = THREE.MathUtils.lerp(0.2, 0.85, eased);
      cardNodeRef.current.scale.setScalar(targetScale);
    } else {
      // 75%–100%: Hold facing camera
      cardNodeRef.current.position.set(0, 1.3, 1.2);
      cardNodeRef.current.rotation.set(0, 0, 0);
      cardNodeRef.current.scale.setScalar(0.85);
    }
  });

  return (
    <group ref={groupRef} name="DiwaliCardHolder">
      <group ref={cardNodeRef} position={[0, -1.8, 0.2]} scale={[0.2, 0.2, 0.2]}>
        <primitive object={clonedCard} />
      </group>
    </group>
  );
}
