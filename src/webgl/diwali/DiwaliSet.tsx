'use client';

import React, { useRef } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { frame } from '@/state/frame';

// Preload finished Diwali GLB models
useGLTF.preload('/models/curtain-open-diwali.glb');
useGLTF.preload('/models/diwali-card.glb');
useGLTF.preload('/models/diwali-diya-brass.glb');
useGLTF.preload('/models/diwali-diya-terracotta.glb');
useGLTF.preload('/models/diwali-kandil.glb');
useGLTF.preload('/models/diwali-marigold.glb');
useGLTF.preload('/models/diwali-rose-petal.glb');

export function DiwaliSet() {
  const drapesGltf = useGLTF('/models/curtain-open-diwali.glb');
  const cardGltf = useGLTF('/models/diwali-card.glb');
  const diyaBrassGltf = useGLTF('/models/diwali-diya-brass.glb');
  const diyaTerraGltf = useGLTF('/models/diwali-diya-terracotta.glb');
  const kandilGltf = useGLTF('/models/diwali-kandil.glb');
  const marigoldGltf = useGLTF('/models/diwali-marigold.glb');
  const petalGltf = useGLTF('/models/diwali-rose-petal.glb');

  const diyaLightRef = useRef<THREE.PointLight>(null);
  const diyaGroupRef = useRef<THREE.Group>(null);
  const petalsGroupRef = useRef<THREE.Group>(null);

  // Bobbing diyas and fluttering petals
  useFrame(() => {
    const t = frame.time;
    // Diya bobbing at 0.15 Hz ±0.04m (Part 9)
    if (diyaGroupRef.current) {
      diyaGroupRef.current.position.y = Math.sin(t * 0.95) * 0.04;
    }
    // Subtle diya light breathing
    if (diyaLightRef.current) {
      diyaLightRef.current.intensity = 2.4 + Math.sin(t * 4.2) * 0.15;
    }
    // Petals slow tumble
    if (petalsGroupRef.current) {
      petalsGroupRef.current.rotation.y = t * 0.08;
    }
  });

  return (
    <group name="DiwaliSet">
      {/* Lighting per Part 5.4: Directional gold (2.2), Pink fill (0.8), Diya point light */}
      <ambientLight intensity={0.4} color="#350E22" />
      <directionalLight
        position={[-3, 6, 5]}
        intensity={2.2}
        color="#FFD9A0"
      />
      <directionalLight
        position={[4, 3, 2]}
        intensity={0.8}
        color="#FF6FB0"
      />
      <pointLight
        ref={diyaLightRef}
        position={[0, 1.6, 0.8]}
        color="#FFA84A"
        intensity={2.4}
        distance={9}
        decay={2}
      />

      {/* Floor: Ivory marble floor with soft reflections (Part 5.4) */}
      <mesh
        name="DiwaliFloor"
        position={[0, 0, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial
          color="#160C14"
          roughness={0.35}
          metalness={0.4}
        />
      </mesh>

      {/* Finished GLB: Rani-pink velvet drapes with gold borders */}
      <group position={[0, 0, 0]} scale={[1, 1, 1]}>
        <primitive object={drapesGltf.scene.clone()} />
      </group>

      {/* Finished GLB: Floating Diyas */}
      <group ref={diyaGroupRef}>
        <group position={[-1.6, 1.4, 0.6]} scale={[0.55, 0.55, 0.55]}>
          <primitive object={diyaBrassGltf.scene.clone()} />
        </group>
        <group position={[1.6, 1.5, 0.4]} scale={[0.55, 0.55, 0.55]}>
          <primitive object={diyaTerraGltf.scene.clone()} />
        </group>
        <group position={[-0.8, 1.8, -0.6]} scale={[0.45, 0.45, 0.45]}>
          <primitive object={diyaBrassGltf.scene.clone()} />
        </group>
        <group position={[0.9, 1.7, -0.5]} scale={[0.45, 0.45, 0.45]}>
          <primitive object={diyaTerraGltf.scene.clone()} />
        </group>
      </group>

      {/* Finished GLB: Kandil hanging lantern */}
      <group position={[2.2, 3.2, 0.2]} scale={[0.6, 0.6, 0.6]}>
        <primitive object={kandilGltf.scene.clone()} />
      </group>

      {/* Finished GLB: Marigold flowers on floor */}
      <group position={[0, 0.05, 0.8]} scale={[0.7, 0.7, 0.7]}>
        <primitive object={marigoldGltf.scene.clone()} />
      </group>

      {/* Finished GLB: Rose petals floating */}
      <group ref={petalsGroupRef} position={[0, 1.2, 0.5]} scale={[0.6, 0.6, 0.6]}>
        <primitive object={petalGltf.scene.clone()} />
      </group>

      {/* Finished GLB: Diwali Invitation Card at (0, 1.3, 1.2) */}
      <group position={[0, 1.3, 1.2]} scale={[0.75, 0.75, 0.75]}>
        <primitive object={cardGltf.scene.clone()} />
      </group>
    </group>
  );
}
