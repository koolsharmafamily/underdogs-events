'use client';

import React, { useRef } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { frame } from '@/state/frame';
import { DiyaField } from './DiyaField';
import { PetalField } from './PetalField';
import { DrapesSky } from './DrapesSky';
import { Fireworks } from './Fireworks';
import { DiwaliCard } from './DiwaliCard';
import { DiwaliCardProjector } from '@/webgl/tracking/DiwaliCardProjector';
import { CinemaLightbox } from './CinemaLightbox';

// Preload Diwali assets
useGLTF.preload('/models/curtain-open-diwali.glb');
useGLTF.preload('/models/diwali-card.glb');
useGLTF.preload('/models/diwali-diya-brass.glb');
useGLTF.preload('/models/diwali-diya-terracotta.glb');
useGLTF.preload('/models/diwali-kandil.glb');
useGLTF.preload('/models/diwali-marigold.glb');
useGLTF.preload('/models/diwali-rose-petal.glb');

export function DiwaliSet() {
  const kandilGltf = useGLTF('/models/diwali-kandil.glb');

  const diyaLightRef = useRef<THREE.PointLight>(null);
  const kandilGroupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    const t = frame.time;
    // Diya light breathing near badge
    if (diyaLightRef.current) {
      diyaLightRef.current.intensity = 2.4 + Math.sin(t * 3.8) * 0.25;
    }
    // Subtle kandil lantern swaying (0.12 Hz)
    if (kandilGroupRef.current) {
      kandilGroupRef.current.rotation.z = Math.sin(t * 0.75) * 0.04;
    }
  });

  return (
    <group name="DiwaliSet">
      {/* Zero-State DOM tracking projector for 3D card */}
      <DiwaliCardProjector />

      {/* Lighting per Part 5.4: Directional gold (2.2), Pink fill (0.8), Diya point light (stays within 3 real lights budget) */}
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
        position={[0, 1.8, 0.6]}
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
        <planeGeometry args={[32, 32]} />
        <meshStandardMaterial
          color="#160C14"
          roughness={0.35}
          metalness={0.4}
        />
      </mesh>

      {/* Velvet Drapes that lift in D2 & Haveli Sky Reveal */}
      <DrapesSky />

      {/* Floating Diyas with Procedural Teardrop Flames */}
      <DiyaField count={36} />

      {/* Falling Rose Petals (3 variants), Gold Dust & Floor Marigolds */}
      <PetalField petalCount={380} dustCount={1800} />

      {/* Paced Fireworks System for D2 story lines & D5 outro */}
      <Fireworks particlesPerBurst={2400} />

      {/* 3D Gold Foil Invitation Card rising on spiral */}
      <DiwaliCard />

      {/* D4 Cinema Lightbox with official teaser poster & marquee bulbs */}
      <CinemaLightbox />

      {/* Hanging Kandil Lantern */}
      <group ref={kandilGroupRef} position={[2.4, 3.4, 0.2]} scale={[0.65, 0.65, 0.65]}>
        <primitive object={kandilGltf.scene.clone()} />
      </group>
    </group>
  );
}
