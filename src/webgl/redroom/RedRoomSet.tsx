'use client';

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useGLTF, useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { frame } from '@/state/frame';
import { Flame } from '../fx/Flame';
import { SmokeDragon } from './SmokeDragon';
import { MirrorFog } from './MirrorFog';
import { InvitationTray } from './InvitationTray';

// Preload finished Red Room GLB models per BRIEF.md Part 5.3
useGLTF.preload('/models/curtain-open.glb');
useGLTF.preload('/models/redroom-mirror.glb');
useGLTF.preload('/models/redroom-chandelier.glb');
useGLTF.preload('/models/redroom-candelabra.glb');
useGLTF.preload('/models/redroom-candle.glb');

export function RedRoomSet() {
  const curtainGltf = useGLTF('/models/curtain-open.glb');
  const mirrorGltf = useGLTF('/models/redroom-mirror.glb');
  const chandelierGltf = useGLTF('/models/redroom-chandelier.glb');
  const candelabraGltf = useGLTF('/models/redroom-candelabra.glb');
  const candleGltf = useGLTF('/models/redroom-candle.glb');

  // Load official poster texture for framed display on left wall (Part 8 R5)
  const posterTex = useTexture('/media/red-room-poster.webp');

  const chandelierRef = useRef<THREE.Group>(null);
  const curtainLeftRef = useRef<THREE.Group>(null);
  const curtainRightRef = useRef<THREE.Group>(null);
  const candleLight1Ref = useRef<THREE.PointLight>(null);
  const candleLight2Ref = useRef<THREE.PointLight>(null);
  const badgePointLightRef = useRef<THREE.PointLight>(null);

  const entryCurtainTimer = useRef(0);
  const prevStoryIdx = useRef(-1);
  const storyFlareTimer = useRef(0);

  // Reusable cloned scenes
  const candelabraLeft = useMemo(() => candelabraGltf.scene.clone(true), [candelabraGltf]);
  const candelabraRight = useMemo(() => candelabraGltf.scene.clone(true), [candelabraGltf]);
  const chandelier = useMemo(() => chandelierGltf.scene.clone(true), [chandelierGltf]);
  const mirror = useMemo(() => mirrorGltf.scene.clone(true), [mirrorGltf]);
  const curtainLeft = useMemo(() => curtainGltf.scene.clone(true), [curtainGltf]);
  const curtainRight = useMemo(() => curtainGltf.scene.clone(true), [curtainGltf]);

  // Candle ignition states for R3 dress code
  const candleIgniteLevels = useRef([1, 1, 1, 1]);

  useFrame((_, delta) => {
    const t = frame.time;
    const p1 = frame.dampedProgress['R1'] ?? 0;
    const p2 = frame.dampedProgress['R2'] ?? 0;
    const p3 = frame.dampedProgress['R3'] ?? 0;
    const p4 = frame.dampedProgress['R4'] ?? 0;

    // 1. Curtains parting over 1.4s on entry (Part 8 R0)
    entryCurtainTimer.current += delta;
    const curtainNorm = Math.min(1.0, entryCurtainTimer.current / 1.4);
    const curtainEased = THREE.MathUtils.smoothstep(curtainNorm, 0, 1);

    if (curtainLeftRef.current) {
      curtainLeftRef.current.position.x = THREE.MathUtils.lerp(0.0, -2.8, curtainEased);
      curtainLeftRef.current.scale.x = THREE.MathUtils.lerp(1.0, 0.45, curtainEased);
    }
    if (curtainRightRef.current) {
      curtainRightRef.current.position.x = THREE.MathUtils.lerp(0.0, 2.8, curtainEased);
      curtainRightRef.current.scale.x = THREE.MathUtils.lerp(1.0, 0.45, curtainEased);
    }

    // 2. Chandelier swaying +/- 1.5° (0.026 rad) at 0.12 Hz (Part 8 The set)
    if (chandelierRef.current) {
      chandelierRef.current.rotation.z = Math.sin(t * 0.12 * Math.PI * 2) * 0.026;
      chandelierRef.current.rotation.x = Math.cos(t * 0.08 * Math.PI * 2) * 0.015;
    }

    // 3. R2 Story: Candles flare +20% for 300 ms when each line lands
    const storyIdx = p2 < 0.34 ? 0 : p2 < 0.67 ? 1 : 2;
    if (storyIdx !== prevStoryIdx.current) {
      prevStoryIdx.current = storyIdx;
      storyFlareTimer.current = 0.3; // 300 ms flare
    }
    let flareBonus = 0;
    if (storyFlareTimer.current > 0) {
      storyFlareTimer.current -= delta;
      flareBonus = Math.max(0, (storyFlareTimer.current / 0.3) * 0.2);
    }

    // 4. R3 Dress code candle ignition progression
    // Line 1: candle 1 (p3 > 0.1)
    // Line 2: candle 2 (p3 > 0.35)
    // Line 3: candle 3 (p3 > 0.6)
    // Warning: last candles ignite together (p3 > 0.8)
    candleIgniteLevels.current[0] = p3 > 0.05 ? 1.0 : 0.2;
    candleIgniteLevels.current[1] = p3 > 0.35 ? 1.0 : 0.2;
    candleIgniteLevels.current[2] = p3 > 0.60 ? 1.0 : 0.2;
    candleIgniteLevels.current[3] = p3 > 0.80 ? 1.0 : 0.2;

    // 5. Lighting per Part 5.4 & Part 5.3 (At most 3 real point lights total)
    // Candle flicker 8-14 Hz noise (+/- 18%)
    const flicker1 = 1 + (Math.sin(t * 11.2) * 0.1 + Math.cos(t * 13.7) * 0.08) * 0.18;
    const flicker2 = 1 + (Math.sin(t * 8.6) * 0.1 + Math.cos(t * 12.1) * 0.08) * 0.18;

    if (candleLight1Ref.current) {
      candleLight1Ref.current.intensity = (2.2 + flareBonus) * flicker1;
    }
    if (candleLight2Ref.current) {
      candleLight2Ref.current.intensity = (2.0 + flareBonus) * flicker2;
    }
    if (badgePointLightRef.current) {
      badgePointLightRef.current.intensity = 2.8;
    }
  });

  return (
    <group name="RedRoomSet">
      {/* Atmosphere Ambient */}
      <ambientLight intensity={0.25} color="#150202" />

      {/* Real Point Light 1: Left candelabra (#FF9A4A, decay 2) */}
      <pointLight
        ref={candleLight1Ref}
        position={[-2.4, 2.0, 1.0]}
        color="#FF9A4A"
        intensity={2.2}
        distance={12}
        decay={2}
      />

      {/* Real Point Light 2: Right candelabra (#FF9A4A, decay 2) */}
      <pointLight
        ref={candleLight2Ref}
        position={[2.4, 2.0, 1.0]}
        color="#FF9A4A"
        intensity={2.0}
        distance={12}
        decay={2}
      />

      {/* Real Point Light 3: Badge neon illumination (#FF2A1F) */}
      <pointLight
        ref={badgePointLightRef}
        position={[0, 2.0, 0.9]}
        color="#FF2A1F"
        intensity={2.8}
        distance={8}
        decay={2}
      />

      {/* Stage Box Floor: Black-red lacquer with reflections (Part 5.4) */}
      <mesh
        name="RedRoomFloor"
        position={[0, 0, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[24, 20]} />
        <meshStandardMaterial
          color="#060101"
          roughness={0.12}
          metalness={0.7}
        />
      </mesh>

      {/* Stage Back Wall (12m x 6m) */}
      <mesh position={[0, 3.0, -1.2]}>
        <planeGeometry args={[16, 8]} />
        <meshStandardMaterial color="#0A0203" roughness={0.6} />
      </mesh>

      {/* Left Wall with Gilded Framed Poster (Part 8 R5) */}
      <group position={[-4.5, 2.2, 2.0]} rotation={[0, Math.PI * 0.35, 0]}>
        {/* Frame */}
        <mesh scale={[1.4, 1.85, 0.08]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#8E6A28" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Poster Texture Plane */}
        <mesh position={[0, 0, 0.05]} scale={[1.2, 1.65, 1]}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial map={posterTex} toneMapped={false} />
        </mesh>
      </group>

      {/* Back Velvet Curtains (parting over 1.4s on entry) */}
      <group ref={curtainLeftRef} position={[-2.8, 2.8, -0.6]} scale={[0.45, 1.1, 1]}>
        <primitive object={curtainLeft} />
      </group>
      <group ref={curtainRightRef} position={[2.8, 2.8, -0.6]} scale={[-0.45, 1.1, 1]}>
        <primitive object={curtainRight} />
      </group>

      {/* Swaying Chandelier at y = 4.0 */}
      <group ref={chandelierRef} position={[0, 4.0, 0.2]} scale={[0.75, 0.75, 0.75]}>
        <primitive object={chandelier} />
        {/* Chandelier Candle Flames */}
        <Flame position={[-0.4, -0.2, 0]} scale={0.08} />
        <Flame position={[0.4, -0.2, 0]} scale={0.08} />
        <Flame position={[0, -0.2, 0.4]} scale={0.08} />
        <Flame position={[0, -0.2, -0.4]} scale={0.08} />
      </group>

      {/* Gilded Mirror centred on back wall at (0, 1.8, -0.4) */}
      <group position={[0, 1.8, -0.4]} scale={[0.95, 0.95, 0.95]}>
        <primitive object={mirror} />
      </group>
      {/* Fog & finger-wipe overlay right over mirror glass */}
      <MirrorFog />

      {/* Left Candelabra with R3 progressive candle ignitions */}
      <group position={[-2.8, 0.0, 0.6]} scale={[0.7, 0.7, 0.7]}>
        <primitive object={candelabraLeft} />
        <Flame position={[-0.32, 1.7, 0]} scale={0.11} intensity={candleIgniteLevels.current[0]} />
        <Flame position={[0.0, 1.9, 0]} scale={0.12} intensity={candleIgniteLevels.current[1]} />
        <Flame position={[0.32, 1.7, 0]} scale={0.11} intensity={candleIgniteLevels.current[2]} />
      </group>

      {/* Right Candelabra */}
      <group position={[2.8, 0.0, 0.6]} scale={[0.7, 0.7, 0.7]}>
        <primitive object={candelabraRight} />
        <Flame position={[-0.32, 1.7, 0]} scale={0.11} intensity={candleIgniteLevels.current[2]} />
        <Flame position={[0.0, 1.9, 0]} scale={0.12} intensity={candleIgniteLevels.current[3]} />
        <Flame position={[0.32, 1.7, 0]} scale={0.11} intensity={candleIgniteLevels.current[3]} />
      </group>

      {/* The Smoke Dragon (Spline coil, glass head, ember eyes flare, unravel) */}
      <SmokeDragon />

      {/* Interactive Invitation Tray at (0, 0.85, 1.4) */}
      <InvitationTray />
    </group>
  );
}
