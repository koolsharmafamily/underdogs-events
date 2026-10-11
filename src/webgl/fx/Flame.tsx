'use client';

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { frame } from '@/state/frame';

/**
 * Procedural Camera-Facing Teardrop Flame per BRIEF.md Part 5.3:
 * - Instanced/billboard camera-facing teardrop with core gradient and noise flicker
 * - Additive blending for bloom integration
 * - Zero baked textures
 */

const FlameShader = {
  vertexShader: /* glsl */ `
    uniform vec2 uScale;
    varying vec2 vUv;
    void main() {
      vUv = uv;
      // Billboard to face camera while respecting scale
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
      // Centered UV: x in [-0.5, 0.5], y in [0.0, 1.0]
      vec2 p = vUv - vec2(0.5, 0.0);
      
      // Teardrop shape equation
      float y = clamp(p.y, 0.0, 1.0);
      // Width tapers at top and round bottom
      float w = sqrt(y) * (1.0 - y) * 1.8;
      
      // Flickering horizontal offset
      float flicker = sin(uTime * 22.0 + y * 6.0) * 0.04 * y;
      float dist = abs(p.x - flicker);
      
      if (dist > w || y <= 0.01 || y >= 0.98) {
        discard;
      }
      
      // Normalized radius inside flame
      float edge = 1.0 - smoothstep(0.0, w, dist);
      float vert = 1.0 - y;
      
      // Inner hot core to outer glow
      vec3 col = mix(uColorTip, uColorCore, edge * vert * 1.5);
      float alpha = edge * vert * uIntensity;
      
      gl_FragColor = vec4(col * 2.2, alpha);
    }
  `,
};

interface FlameProps {
  position?: [number, number, number];
  scale?: number;
  intensity?: number;
  colorCore?: string;
  colorTip?: string;
}

export function Flame({
  position = [0, 0, 0],
  scale = 0.12,
  intensity = 1.0,
  colorCore = '#FFF5D0',
  colorTip = '#FF6A00',
}: FlameProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const uniforms = useMemo(() => {
    return {
      uTime: { value: 0 },
      uIntensity: { value: intensity },
      uScale: { value: new THREE.Vector2(scale, scale * 1.8) },
      uColorCore: { value: new THREE.Color(colorCore) },
      uColorTip: { value: new THREE.Color(colorTip) },
    };
  }, [colorCore, colorTip, intensity, scale]);

  useFrame(() => {
    uniforms.uTime.value = frame.time;
    uniforms.uIntensity.value = intensity;
    uniforms.uScale.value.set(scale, scale * 1.8);
  });

  return (
    <group position={position}>
      {/* Flame Billboard */}
      <mesh ref={meshRef}>
        <planeGeometry args={[1, 1]} />
        <shaderMaterial
          vertexShader={FlameShader.vertexShader}
          fragmentShader={FlameShader.fragmentShader}
          uniforms={uniforms}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
