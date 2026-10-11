'use client';

import React, { useRef } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { frame } from '@/state/frame';

import { Beams } from './Beams';

// Finished GLB models in public/models/
useGLTF.preload('/models/door-redroom.glb');
useGLTF.preload('/models/door-diwali.glb');

export function HomeStage() {
  const redDoorGltf = useGLTF('/models/door-redroom.glb');
  const diwaliDoorGltf = useGLTF('/models/door-diwali.glb');

  const redDoorRef = useRef<THREE.Group>(null);
  const diwaliDoorRef = useRef<THREE.Group>(null);

  // Subtle breathing / light animations per Part 7 H5
  useFrame(() => {
    const t = frame.time;
    // Light leak breathing at 0.2 Hz
    const glow = 1 + Math.sin(t * 1.25) * 0.15;
    if (redDoorRef.current) {
      redDoorRef.current.position.y = 0;
    }
    if (diwaliDoorRef.current) {
      diwaliDoorRef.current.position.y = 0;
    }
  });

  return (
    <group name="HomeStage">
      {/* Volumetric beam cones per Part 5.4 */}
      <Beams />

      {/* Lighting per Part 5.4: Key directional white (1.2), rim magenta spot (#FF4FD8) */}
      <ambientLight intensity={0.4} color="#0B0E14" />
      <directionalLight
        position={[-3, 6, 4]}
        intensity={1.2}
        color="#FFFFFF"
      />
      <spotLight
        position={[0, 4, -3]}
        target-position={[0, 1.5, 0]}
        intensity={2.8}
        color="#FF4FD8"
        angle={0.8}
        penumbra={0.6}
      />
      {/* Split rim lights for H4 (red left, pink-gold right) */}
      <pointLight position={[-2, 1.5, -0.5]} intensity={1.5} color="#FF2A1F" />
      <pointLight position={[2, 1.5, -0.5]} intensity={1.5} color="#FFC46B" />

      {/* Stage Floor: Glossy dark floor (Part 5.4) */}
      <mesh
        name="StageFloor"
        position={[0, 0, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial
          color="#06080C"
          roughness={0.15}
          metalness={0.6}
        />
      </mesh>

      {/* Finished GLB: Door Red Room at (-1.2, 0, 0) */}
      <group
        ref={redDoorRef}
        position={[-1.2, 0, 0]}
        scale={[0.85, 0.85, 0.85]}
      >
        <primitive object={redDoorGltf.scene.clone()} />
      </group>

      {/* Finished GLB: Door Diwali at (+1.2, 0, 0) */}
      <group
        ref={diwaliDoorRef}
        position={[1.2, 0, 0]}
        scale={[0.85, 0.85, 0.85]}
      >
        <primitive object={diwaliDoorGltf.scene.clone()} />
      </group>
    </group>
  );
}
