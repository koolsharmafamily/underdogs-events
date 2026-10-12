'use client';

import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { frame } from '@/state/frame';
import { useStore } from '@/state/store';

export function Beams() {
  const world = useStore((s) => s.world);
  const previousWorld = useStore((s) => s.previousWorld);
  const beamGroupRef = useRef<THREE.Group>(null);
  const beam1Ref = useRef<THREE.Mesh>(null);
  const beam2Ref = useRef<THREE.Mesh>(null);
  const beam3Ref = useRef<THREE.Mesh>(null);

  // Volumetric beam cones sweeping ±18° at 0.05 Hz per Part 5.4
  useFrame(() => {
    if (world !== 'home' && previousWorld !== 'home') return;
    const t = frame.time;
    const sweep = Math.sin(t * 0.314) * THREE.MathUtils.degToRad(18); // 0.05 Hz

    if (beam1Ref.current) beam1Ref.current.rotation.z = sweep + 0.15;
    if (beam2Ref.current) beam2Ref.current.rotation.z = -sweep - 0.2;
    if (beam3Ref.current) beam3Ref.current.rotation.x = Math.cos(t * 0.25) * 0.12;
  });

  return (
    <group ref={beamGroupRef} name="VolumetricBeams" position={[0, 4.5, -3.2]}>
      {/* Beam 1: Magenta (cone) */}
      <mesh
        ref={beam1Ref}
        position={[-1.8, 0, 0]}
        rotation={[Math.PI / 1.15, 0, 0.2]}
      >
        <coneGeometry args={[1.2, 8.0, 32, 1, true]} />
        <meshBasicMaterial
          color="#D73EBC"
          transparent
          opacity={0.035}
          side={THREE.FrontSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Beam 2: Magenta (cone) */}
      <mesh
        ref={beam2Ref}
        position={[1.8, 0, 0]}
        rotation={[Math.PI / 1.15, 0, -0.2]}
      >
        <coneGeometry args={[1.2, 8.0, 32, 1, true]} />
        <meshBasicMaterial
          color="#D73EBC"
          transparent
          opacity={0.035}
          side={THREE.FrontSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Beam 3: White center (cone) */}
      <mesh
        ref={beam3Ref}
        position={[0, 0.5, 0]}
        rotation={[Math.PI / 1.12, 0, 0]}
      >
        <coneGeometry args={[0.9, 8.5, 32, 1, true]} />
        <meshBasicMaterial
          color="#FFFFFF"
          transparent
          opacity={0.02}
          side={THREE.FrontSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
