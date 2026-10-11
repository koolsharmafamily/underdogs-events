'use client';

import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { frame } from '@/state/frame';

interface DiyaConfig {
  type: 'brass' | 'terracotta';
  pos: [number, number, number];
  scale: number;
  speed: number;
  phase: number;
}

const DIYA_CONFIGS: DiyaConfig[] = [
  // 5 Brass diyas
  { type: 'brass', pos: [-1.9, 1.1, -0.6], scale: 0.52, speed: 0.85, phase: 0.0 },
  { type: 'brass', pos: [1.8, 1.3, -0.8], scale: 0.50, speed: 0.95, phase: 1.2 },
  { type: 'brass', pos: [-2.5, 2.3, 0.3], scale: 0.58, speed: 0.80, phase: 2.4 },
  { type: 'brass', pos: [2.3, 2.1, 0.2], scale: 0.55, speed: 0.90, phase: 3.6 },
  { type: 'brass', pos: [-0.95, 0.75, 1.2], scale: 0.48, speed: 1.05, phase: 4.8 },
  // 5 Terracotta diyas
  { type: 'terracotta', pos: [1.05, 0.8, 1.1], scale: 0.48, speed: 0.92, phase: 0.6 },
  { type: 'terracotta', pos: [-1.6, 2.7, -1.2], scale: 0.56, speed: 0.88, phase: 1.8 },
  { type: 'terracotta', pos: [1.65, 2.6, -1.0], scale: 0.54, speed: 0.82, phase: 3.0 },
  { type: 'terracotta', pos: [-2.2, 1.5, -1.8], scale: 0.52, speed: 1.00, phase: 4.2 },
  { type: 'terracotta', pos: [2.15, 1.45, -1.6], scale: 0.50, speed: 0.90, phase: 5.4 },
];

const FlameShader = {
  vertexShader: /* glsl */ `
    uniform vec2 uScale;
    varying vec2 vUv;
    void main() {
      vUv = uv;
      vec4 mvPosition = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
      mvPosition.xy += position.xy * uScale;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: /* glsl */ `
    uniform float uTime;
    uniform float uIntensity;
    uniform vec3 uColorCore;
    uniform vec3 uColorTip;
    varying vec2 vUv;

    void main() {
      vec2 p = vUv - vec2(0.5, 0.0);
      float y = clamp(p.y, 0.0, 1.0);
      float w = sqrt(y) * (1.0 - y) * 1.8;
      float flicker = sin(uTime * 22.0 + y * 6.0) * 0.04 * y;
      float dist = abs(p.x - flicker);
      if (dist > w || y <= 0.01 || y >= 0.98) {
        discard;
      }
      float edge = 1.0 - smoothstep(0.0, w, dist);
      float vert = 1.0 - y;
      vec3 col = mix(uColorTip, uColorCore, edge * vert * 1.5);
      float alpha = edge * vert * uIntensity;
      gl_FragColor = vec4(col * 2.2, alpha);
    }
  `,
};

export function DiyaField({ count = 10 }: { count?: number }) {
  const brassGltf = useGLTF('/models/diwali-diya-brass.glb');
  const terraGltf = useGLTF('/models/diwali-diya-terracotta.glb');

  const activeConfigs = useMemo(() => {
    return DIYA_CONFIGS.slice(0, Math.min(count, DIYA_CONFIGS.length));
  }, [count]);

  // Pre-clone models once in useMemo to eliminate GC churn and render thrashing
  const clonedModels = useMemo(() => {
    return activeConfigs.map((cfg) => {
      const src = cfg.type === 'brass' ? brassGltf.scene : terraGltf.scene;
      return src.clone(true);
    });
  }, [activeConfigs, brassGltf.scene, terraGltf.scene]);

  // Shared flame geometry & material
  const flameGeo = useMemo(() => new THREE.PlaneGeometry(1, 1), []);
  const flameMat = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: FlameShader.vertexShader,
      fragmentShader: FlameShader.fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uIntensity: { value: 1.2 },
        uScale: { value: new THREE.Vector2(0.06, 0.11) },
        uColorCore: { value: new THREE.Color('#FFF2D6') },
        uColorTip: { value: new THREE.Color('#FF8020') },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }, []);

  const diyaRefs = useRef<(THREE.Group | null)[]>([]);

  useFrame(() => {
    const t = frame.time;
    // Update shared flame time uniform once per frame
    flameMat.uniforms.uTime.value = t;

    // Bobbing ±0.04m at 0.1-0.2 Hz
    for (let i = 0; i < activeConfigs.length; i++) {
      const el = diyaRefs.current[i];
      if (el) {
        const cfg = activeConfigs[i];
        const bob = Math.sin(t * cfg.speed + cfg.phase) * 0.04;
        el.position.y = cfg.pos[1] + bob;
      }
    }
  });

  return (
    <group name="DiyaField">
      {activeConfigs.map((cfg, idx) => (
        <group
          key={idx}
          ref={(el) => {
            diyaRefs.current[idx] = el;
          }}
          position={cfg.pos}
          scale={[cfg.scale, cfg.scale, cfg.scale]}
        >
          <primitive object={clonedModels[idx]} />
          {/* Shared procedural flame sitting on diya wick */}
          <mesh
            geometry={flameGeo}
            material={flameMat}
            position={[0, 0.08, 0.02]}
          />
        </group>
      ))}
    </group>
  );
}
