'use client';

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { frame } from '@/state/frame';
import { useStore } from '@/state/store';
import { groundObjectToY } from '../fx/Flame';

/**
 * 3D Invitation Tray & Procedural Round Velvet Side Table at (0, 0, 2.2), top at y = 0.85:
 * - 0–25%: Slow push in onto table
 * - 25–40%: Seal cracks: Seal_Shard_1..3 part 2–4 cm with rotations, Seal_Crumbs scatter
 * - 40–55%: Envelope_Flap hinges open 0 → 170°
 * - 55–80%: Card slides out, rises and turns to face camera
 * - 80–100%: Hold. Tracked DOM overlay visible
 */

interface NodeTransform {
  pos: THREE.Vector3;
  rot: THREE.Euler;
  scale: THREE.Vector3;
}

function captureTransform(node: THREE.Object3D | null): NodeTransform {
  if (!node) {
    return {
      pos: new THREE.Vector3(),
      rot: new THREE.Euler(),
      scale: new THREE.Vector3(1, 1, 1),
    };
  }
  return {
    pos: node.position.clone(),
    rot: node.rotation.clone(),
    scale: node.scale.clone(),
  };
}

export function InvitationTray() {
  const gltf = useGLTF('/models/redroom-invitation.glb');
  const motionEnabled = useStore((s) => s.motionEnabled);

  const shard1Ref = useRef<THREE.Object3D | null>(null);
  const shard2Ref = useRef<THREE.Object3D | null>(null);
  const shard3Ref = useRef<THREE.Object3D | null>(null);
  const crumbsRef = useRef<THREE.Object3D | null>(null);
  const flapRef = useRef<THREE.Object3D | null>(null);
  const cardRef = useRef<THREE.Object3D | null>(null);

  const { scene, initial } = useMemo(() => {
    const s = gltf.scene.clone(true);
    // Ground tray so its bottom sits exactly on the table top (y = 0 relative to table top group at y = 0.85)
    groundObjectToY(s, 0);

    const s1 = s.getObjectByName('Seal_Shard_1') ?? null;
    const s2 = s.getObjectByName('Seal_Shard_2') ?? null;
    const s3 = s.getObjectByName('Seal_Shard_3') ?? null;
    const crumbs = s.getObjectByName('Seal_Crumbs') ?? null;
    const flap = s.getObjectByName('Envelope_Flap') ?? null;
    const card = s.getObjectByName('Card') ?? null;

    shard1Ref.current = s1;
    shard2Ref.current = s2;
    shard3Ref.current = s3;
    crumbsRef.current = crumbs;
    flapRef.current = flap;
    cardRef.current = card;

    s.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });

    return {
      scene: s,
      initial: {
        shard1: captureTransform(s1),
        shard2: captureTransform(s2),
        shard3: captureTransform(s3),
        crumbs: captureTransform(crumbs),
        flap: captureTransform(flap),
        card: captureTransform(card),
      },
    };
  }, [gltf.scene]);

  useFrame(() => {
    const st = useStore.getState();
    if (st.world !== 'redroom' && st.previousWorld !== 'redroom') return;
    const p4 = frame.dampedProgress['R4'] ?? 0;
    const p5 = frame.dampedProgress['R5'] ?? 0;

    // 1. Seal_Shard_1..3 + Seal_Crumbs crack (25% -> 40% of R4)
    const crackP = !motionEnabled
      ? 1.0
      : THREE.MathUtils.smoothstep(THREE.MathUtils.clamp((p4 - 0.25) / 0.15, 0, 1), 0, 1);

    if (shard1Ref.current) {
      const init = initial.shard1;
      shard1Ref.current.position.set(
        init.pos.x - crackP * 0.028,
        init.pos.y + crackP * 0.003,
        init.pos.z + crackP * 0.016
      );
      shard1Ref.current.rotation.set(
        init.rot.x + crackP * 0.12,
        init.rot.y - crackP * 0.38,
        init.rot.z + crackP * 0.15
      );
    }
    if (shard2Ref.current) {
      const init = initial.shard2;
      shard2Ref.current.position.set(
        init.pos.x + crackP * 0.018,
        init.pos.y + crackP * 0.004,
        init.pos.z + crackP * 0.026
      );
      shard2Ref.current.rotation.set(
        init.rot.x - crackP * 0.15,
        init.rot.y + crackP * 0.42,
        init.rot.z - crackP * 0.12
      );
    }
    if (shard3Ref.current) {
      const init = initial.shard3;
      shard3Ref.current.position.set(
        init.pos.x + crackP * 0.026,
        init.pos.y + crackP * 0.003,
        init.pos.z - crackP * 0.018
      );
      shard3Ref.current.rotation.set(
        init.rot.x + crackP * 0.18,
        init.rot.y + crackP * 0.32,
        init.rot.z - crackP * 0.16
      );
    }
    if (crumbsRef.current) {
      const init = initial.crumbs;
      crumbsRef.current.position.set(
        init.pos.x,
        init.pos.y - crackP * 0.002,
        init.pos.z + crackP * 0.008
      );
      crumbsRef.current.scale.setScalar(1 + crackP * 0.35);
    }

    // 2. Envelope_Flap hinges open 0 -> 170° (2.967 rad) at 40% -> 55% of R4
    const flapP = !motionEnabled
      ? 1.0
      : THREE.MathUtils.smoothstep(THREE.MathUtils.clamp((p4 - 0.4) / 0.15, 0, 1), 0, 1);

    if (flapRef.current) {
      const init = initial.flap;
      const maxFlapAngle = (-170 * Math.PI) / 180;
      flapRef.current.rotation.set(
        init.rot.x + flapP * maxFlapAngle,
        init.rot.y,
        init.rot.z
      );
    }

    // 3. Card slides out, rises, and turns to face camera (55% -> 80% of R4)
    if (cardRef.current) {
      const init = initial.card;
      const slideRaw = !motionEnabled
        ? 1.0
        : p5 > 0.02
          ? 1.0 - THREE.MathUtils.clamp(p5 / 0.35, 0, 1)
          : THREE.MathUtils.clamp((p4 - 0.55) / 0.25, 0, 1);
      const eased = THREE.MathUtils.smoothstep(slideRaw, 0, 1);

      cardRef.current.position.set(
        THREE.MathUtils.lerp(init.pos.x, 0.0, eased),
        THREE.MathUtils.lerp(init.pos.y, 0.24, eased),
        THREE.MathUtils.lerp(init.pos.z, 0.16, eased)
      );
      cardRef.current.rotation.set(
        THREE.MathUtils.lerp(init.rot.x, -0.58, eased),
        THREE.MathUtils.lerp(init.rot.y, 0.0, eased),
        THREE.MathUtils.lerp(init.rot.z, 0.0, eased)
      );
      // Uniform scale only (Global Rule 3)
      const s = THREE.MathUtils.lerp(init.scale.x, init.scale.x * 1.45, eased);
      cardRef.current.scale.setScalar(s);
    }
  });

  return (
    <group name="InvitationTableAndTray" position={[0, 0, 2.2]}>
      {/* Procedural Round Side Table with Red Velvet Cloth (top at y = 0.85) */}
      <group name="ProceduralSideTable">
        {/* Heavy dark gilt pedestal base foot */}
        <mesh position={[0, 0.025, 0]} receiveShadow>
          <cylinderGeometry args={[0.22, 0.28, 0.05, 32]} />
          <meshStandardMaterial color="#3B2A14" metalness={0.8} roughness={0.35} />
        </mesh>
        {/* Turned pedestal column */}
        <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.055, 0.075, 0.78, 24]} />
          <meshStandardMaterial color="#24180B" metalness={0.75} roughness={0.4} />
        </mesh>
        {/* Draped red velvet cloth skirt hanging from table edge */}
        <mesh position={[0, 0.73, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.45, 0.49, 0.22, 36]} />
          <meshStandardMaterial color="#3E0507" roughness={0.85} metalness={0.05} />
        </mesh>
        {/* Gold bullion trim band around velvet cloth */}
        <mesh position={[0, 0.625, 0]}>
          <cylinderGeometry args={[0.492, 0.492, 0.016, 36]} />
          <meshStandardMaterial color="#C8A15A" metalness={0.85} roughness={0.28} />
        </mesh>
        {/* Round red velvet tabletop whose upper surface sits at y = 0.85 */}
        <mesh position={[0, 0.835, 0]} receiveShadow>
          <cylinderGeometry args={[0.45, 0.45, 0.03, 36]} />
          <meshStandardMaterial color="#510805" roughness={0.82} metalness={0.05} />
        </mesh>
      </group>

      {/* Grounded redroom-invitation.glb sitting on top of the table (y = 0.85), uniform scale 1.0 */}
      <group position={[0, 0.85, 0]} scale={[1, 1, 1]}>
        <primitive object={scene} />
      </group>
    </group>
  );
}
