'use client';

import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { frame } from '@/state/frame';
import { Flame } from '@/webgl/fx/Flame';

interface DiyaItem {
  id: number;
  type: 'brass' | 'terracotta';
  basePos: [number, number, number];
  scale: number;
  speed: number;
  phase: number;
  flameScale: number;
}

export function DiyaField({ count = 36 }: { count?: number }) {
  const brassGltf = useGLTF('/models/diwali-diya-brass.glb');
  const terraGltf = useGLTF('/models/diwali-diya-terracotta.glb');

  // Generate deterministic field of diyas
  const diyas = useMemo<DiyaItem[]>(() => {
    const items: DiyaItem[] = [];
    // Seeded distribution covering z: -3 to +2, y: 0.4 to 3.2, x: -3.5 to +3.5
    for (let i = 0; i < count; i++) {
      const isBrass = i % 2 === 0;
      // Golden ratio dispersion for nice coverage
      const phi = i * 1.6180339887;
      const radius = 1.0 + (i / count) * 2.8;
      const angle = phi * Math.PI * 2;

      // Keep center somewhat open for badge at [0, 1.9, 0]
      let x = Math.cos(angle) * radius;
      if (Math.abs(x) < 0.65) {
        x = x < 0 ? x - 0.65 : x + 0.65;
      }
      const y = 0.5 + ((i * 37) % 100) * 0.027; // 0.5 to 3.2
      const z = -2.8 + ((i * 53) % 100) * 0.048; // -2.8 to +2.0

      const speed = 0.8 + ((i * 17) % 10) * 0.05; // 0.1 - 0.2 Hz
      const phase = (i * 2.4) % (Math.PI * 2);
      const scale = 0.42 + ((i * 23) % 10) * 0.02; // 0.42 - 0.62

      items.push({
        id: i,
        type: isBrass ? 'brass' : 'terracotta',
        basePos: [x, y, z],
        scale,
        speed,
        phase,
        flameScale: 0.05 + ((i * 7) % 5) * 0.006,
      });
    }
    return items;
  }, [count]);

  const groupRef = useRef<THREE.Group>(null);
  const diyaRefs = useRef<(THREE.Group | null)[]>([]);

  useFrame(() => {
    const t = frame.time;
    for (let i = 0; i < diyas.length; i++) {
      const item = diyas[i];
      const el = diyaRefs.current[i];
      if (el) {
        // Bobbing ±0.04m at 0.1-0.2 Hz
        const bob = Math.sin(t * item.speed + item.phase) * 0.04;
        el.position.y = item.basePos[1] + bob;
      }
    }
  });

  return (
    <group ref={groupRef} name="DiyaField">
      {diyas.map((item, idx) => {
        const sceneClone = (item.type === 'brass' ? brassGltf.scene : terraGltf.scene).clone();
        return (
          <group
            key={item.id}
            ref={(el) => {
              diyaRefs.current[idx] = el;
            }}
            position={item.basePos}
            scale={[item.scale, item.scale, item.scale]}
          >
            <primitive object={sceneClone} />
            {/* Procedural flame sitting on diya wick (offset y ~0.08) */}
            <Flame
              position={[0, 0.08, 0.02]}
              scale={item.flameScale}
              colorCore="#FFF2D6"
              colorTip="#FF8020"
              intensity={1.2}
            />
          </group>
        );
      })}
    </group>
  );
}
