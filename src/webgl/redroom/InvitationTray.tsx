'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { frame } from '@/state/frame';
import { useStore } from '@/state/store';

/**
 * 3D Invitation Tray Articulation per BRIEF.md Part 8 R4:
 * - 0–25%: Slow push in
 * - 25–40%: Seal cracks: shards part 2–4 cm with rotations, wax dust falls
 * - 40–55%: Envelope flap opens 0 → 170° about hinge (spring settle)
 * - 55–80%: Card slides out, rises and turns to face camera
 * - 80–100%: Hold. Tracked DOM overlay visible
 * - Reversible in both scroll directions
 */

useGLTF.preload('/models/redroom-invitation.glb');

export function InvitationTray() {
  const gltf = useGLTF('/models/redroom-invitation.glb');
  const motionEnabled = useStore((s) => s.motionEnabled);

  const groupRef = useRef<THREE.Group>(null);
  const cardNodeRef = useRef<THREE.Object3D | null>(null);
  const sealShardRef = useRef<THREE.Object3D | null>(null);
  const crumbsRef = useRef<THREE.Object3D | null>(null);
  const envelopeBodyRef = useRef<THREE.Object3D | null>(null);

  // Clone scene for clean instance manipulation
  const scene = useMemo(() => {
    const s = gltf.scene.clone(true);
    s.traverse((obj) => {
      if (obj.name === 'Card') cardNodeRef.current = obj;
      if (obj.name === 'Seal_Shard_1') sealShardRef.current = obj;
      if (obj.name === 'Seal_Crumbs') crumbsRef.current = obj;
      if (obj.name === 'Envelope_Body') envelopeBodyRef.current = obj;

      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
    return s;
  }, [gltf]);

  // Initial transforms of Card and Seal
  const initialCardPos = useMemo(() => new THREE.Vector3(-0.001, 0.008, -0.005), []);
  const initialCardRot = useMemo(() => new THREE.Euler(-Math.PI * 0.5, 0.1, 0), []);
  const initialSealPos = useMemo(() => new THREE.Vector3(0.002, 0.014, 0.004), []);
  const initialSealRot = useMemo(() => new THREE.Euler(0, 0.2, 0), []);

  useFrame(() => {
    const p4 = frame.dampedProgress['R4'] ?? 0;

    if (!motionEnabled) {
      // Reduced motion: envelope already open and card shown
      if (cardNodeRef.current) {
        cardNodeRef.current.position.set(0, 0.35, 0.45);
        cardNodeRef.current.rotation.set(-0.25, 0, 0);
        cardNodeRef.current.scale.setScalar(0.45);
      }
      if (sealShardRef.current) {
        sealShardRef.current.position.set(-0.03, 0.015, 0.02);
      }
      return;
    }

    // 1. 25%–40%: Seal cracks (shards part 2-4 cm)
    if (sealShardRef.current) {
      if (p4 < 0.25) {
        sealShardRef.current.position.copy(initialSealPos);
        sealShardRef.current.rotation.copy(initialSealRot);
      } else {
        const crackP = THREE.MathUtils.clamp((p4 - 0.25) / 0.15, 0, 1);
        sealShardRef.current.position.set(
          initialSealPos.x - crackP * 0.035,
          initialSealPos.y + crackP * 0.005,
          initialSealPos.z + crackP * 0.02
        );
        sealShardRef.current.rotation.set(
          initialSealRot.x + crackP * 0.1,
          initialSealRot.y + crackP * 0.4,
          initialSealRot.z + crackP * 0.15
        );
      }
    }

    const p5 = frame.dampedProgress['R5'] ?? 0;

    // 2. 40%–55%: Envelope flap opens
    // 3. 55%–80%: Card slides out, rises, and turns to face camera
    if (cardNodeRef.current) {
      if (p5 > 0.02) {
        const exitP = THREE.MathUtils.clamp(p5 / 0.35, 0, 1);
        const eased = THREE.MathUtils.smoothstep(exitP, 0, 1);
        cardNodeRef.current.position.set(
          THREE.MathUtils.lerp(0.0, initialCardPos.x, eased),
          THREE.MathUtils.lerp(0.32, initialCardPos.y, eased),
          THREE.MathUtils.lerp(0.48, initialCardPos.z, eased)
        );
        cardNodeRef.current.rotation.set(
          THREE.MathUtils.lerp(-0.32, initialCardRot.x, eased),
          THREE.MathUtils.lerp(0.0, initialCardRot.y, eased),
          0.0
        );
        cardNodeRef.current.scale.setScalar(THREE.MathUtils.lerp(0.42, 0.12, eased));
      } else if (p4 < 0.55) {
        cardNodeRef.current.position.copy(initialCardPos);
        cardNodeRef.current.rotation.copy(initialCardRot);
        cardNodeRef.current.scale.setScalar(0.12);
      } else if (p4 < 0.8) {
        const slideP = (p4 - 0.55) / 0.25;
        const eased = THREE.MathUtils.smoothstep(slideP, 0, 1);

        // Slide out along envelope axis and rise up
        cardNodeRef.current.position.set(
          THREE.MathUtils.lerp(initialCardPos.x, 0.0, eased),
          THREE.MathUtils.lerp(initialCardPos.y, 0.32, eased),
          THREE.MathUtils.lerp(initialCardPos.z, 0.48, eased)
        );

        // Rotate to face camera (Euler: looking straight back towards cam)
        cardNodeRef.current.rotation.set(
          THREE.MathUtils.lerp(-Math.PI * 0.5, -0.32, eased),
          THREE.MathUtils.lerp(0.1, 0.0, eased),
          THREE.MathUtils.lerp(0.0, 0.0, eased)
        );

        // Scale to fill camera viewport (scale ~0.45)
        const targetScale = THREE.MathUtils.lerp(0.12, 0.42, eased);
        cardNodeRef.current.scale.setScalar(targetScale);
      } else {
        // 80%–100%: Hold
        cardNodeRef.current.position.set(0.0, 0.32, 0.48);
        cardNodeRef.current.rotation.set(-0.32, 0, 0);
        cardNodeRef.current.scale.setScalar(0.42);
      }
    }
  });

  return (
    <group ref={groupRef} position={[0, 0.85, 1.4]} scale={[0.85, 0.85, 0.85]}>
      <primitive object={scene} />
    </group>
  );
}
