'use client';

import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { frame } from '@/state/frame';

export function CinemaLightbox() {
  const posterTex = useTexture('/media/diwali-teaser.webp');
  posterTex.colorSpace = THREE.SRGBColorSpace;

  const groupRef = useRef<THREE.Group>(null);
  const bulbMatsRef = useRef<THREE.MeshStandardMaterial[]>([]);

  // 16 marquee bulbs along perimeter
  const bulbCount = 16;
  const bulbs = useMemo(() => {
    const list = [];
    const w = 1.35;
    const h = 1.85;

    // Distribute around rectangle perimeter
    // Top: 5, Right: 3, Bottom: 5, Left: 3
    for (let i = 0; i < 5; i++) {
      list.push({ x: -w / 2 + (i / 4) * w, y: h / 2, z: 0.06 });
    }
    for (let i = 1; i <= 3; i++) {
      list.push({ x: w / 2, y: h / 2 - (i / 4) * h, z: 0.06 });
    }
    for (let i = 4; i >= 0; i--) {
      list.push({ x: -w / 2 + (i / 4) * w, y: -h / 2, z: 0.06 });
    }
    for (let i = 3; i >= 1; i--) {
      list.push({ x: -w / 2, y: h / 2 - (i / 4) * h, z: 0.06 });
    }
    return list;
  }, []);

  useFrame(() => {
    const p4 = frame.dampedProgress['D4'] ?? 0;
    const p5 = frame.dampedProgress['D5'] ?? 0;
    const t = frame.time;

    if (!groupRef.current) return;

    // Lightbox appears during D4 only (Part 9 D4)
    const isD4 = p4 > 0.02 && p5 < 0.25;
    groupRef.current.visible = isD4;

    if (isD4) {
      if (p5 > 0.02) {
        const exitP = THREE.MathUtils.clamp(p5 / 0.2, 0, 1);
        groupRef.current.position.y = 1.6 - exitP * 2.5;
        groupRef.current.scale.setScalar(1.0 - exitP * 0.4);
      } else {
        groupRef.current.position.y = 1.6;
        groupRef.current.scale.setScalar(1.0);
      }

      // Bulbs switch on in sequence (300 ms total) when scene enters (Part 9 D4)
      const seqP = THREE.MathUtils.clamp((p4 - 0.02) / 0.15, 0, 1);
      const activeBulbs = Math.floor(seqP * bulbCount);

      bulbMatsRef.current.forEach((mat, idx) => {
        if (!mat) return;
        if (idx <= activeBulbs) {
          // Subtle warm bulb chasing flicker
          const chase = Math.sin(t * 8.0 + idx * 0.4) * 0.2 + 0.8;
          mat.emissiveIntensity = 2.2 * chase;
        } else {
          mat.emissiveIntensity = 0.05;
        }
      });
    }
  });

  return (
    <group ref={groupRef} name="CinemaLightbox" position={[0, 1.6, -0.5]}>
      {/* 3D Gold Frame */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.5, 2.0, 0.1]} />
        <meshStandardMaterial
          color="#D4AF6A"
          metalness={0.9}
          roughness={0.25}
        />
      </mesh>

      {/* Poster Plane */}
      <mesh position={[0, 0, 0.052]}>
        <planeGeometry args={[1.3, 1.8]} />
        <meshBasicMaterial map={posterTex} toneMapped={false} />
      </mesh>

      {/* Marquee Bulbs around perimeter */}
      {bulbs.map((b, i) => (
        <mesh key={i} position={[b.x, b.y, b.z]}>
          <sphereGeometry args={[0.025, 12, 12]} />
          <meshStandardMaterial
            ref={(el) => {
              if (el) bulbMatsRef.current[i] = el;
            }}
            color="#FFF4D0"
            emissive="#FFD27A"
            emissiveIntensity={0.1}
            roughness={0.1}
          />
        </mesh>
      ))}
    </group>
  );
}
