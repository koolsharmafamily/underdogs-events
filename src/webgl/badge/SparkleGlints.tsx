'use client';

import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { frame } from '@/state/frame';

interface SparkleGlintsProps {
  active: boolean;
}

export function SparkleGlints({ active }: SparkleGlintsProps) {
  const groupRef = useRef<THREE.Group>(null);
  const glintMeshes = useRef<(THREE.Mesh | null)[]>([]);

  // 4-point star glint texture
  const starTexture = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, 64, 64);
    // Draw 4-point star burst
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.2, 'rgba(255, 240, 200, 0.9)');
    grad.addColorStop(0.6, 'rgba(255, 210, 120, 0.2)');
    grad.addColorStop(1, 'rgba(255, 200, 100, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(32, 32, 28, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(32, 32, 4, 28, 0, 0, Math.PI * 2);
    ctx.fill();

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  const starMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      map: starTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      color: '#FFF2C6',
    });
  }, [starTexture]);

  // Sparkle positions across pavé face and diamond stud eyes
  const glintPoints = useMemo(
    () => [
      { pos: [-0.13, 0.06, 0.08], speed: 4.2, phase: 0 },
      { pos: [0.13, 0.06, 0.08], speed: 3.8, phase: 1.4 },
      { pos: [-0.08, 0.18, 0.07], speed: 5.1, phase: 2.8 },
      { pos: [0.08, 0.18, 0.07], speed: 4.6, phase: 4.1 },
      { pos: [0.0, 0.24, 0.07], speed: 3.5, phase: 0.9 },
      { pos: [-0.22, -0.04, 0.07], speed: 4.9, phase: 3.2 },
      { pos: [0.22, -0.04, 0.07], speed: 4.3, phase: 5.0 },
    ],
    []
  );

  useFrame(() => {
    if (!active || !groupRef.current) return;
    const t = frame.time;

    for (let i = 0; i < glintPoints.length; i++) {
      const p = glintPoints[i];
      const m = glintMeshes.current[i];
      if (m) {
        // Twinkle pulse: mostly subtle, spikes sharply
        const wave = Math.sin(t * p.speed + p.phase);
        const intensity = Math.pow(Math.max(0, wave), 4);
        m.scale.setScalar(0.03 + intensity * 0.09);
        m.rotation.z = t * 0.5 + p.phase;
      }
    }
  });

  return (
    <group ref={groupRef} name="SparkleGlints" visible={active}>
      {glintPoints.map((p, idx) => (
        <mesh
          key={idx}
          ref={(el) => {
            glintMeshes.current[idx] = el;
          }}
          position={p.pos as [number, number, number]}
          material={starMaterial}
        >
          <planeGeometry args={[1, 1]} />
        </mesh>
      ))}
    </group>
  );
}
