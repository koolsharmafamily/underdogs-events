'use client';

import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { frame } from '@/state/frame';
import { useStore } from '@/state/store';

interface FireworkBurst {
  active: boolean;
  startTime: number;
  origin: THREE.Vector3;
  color: THREE.Color;
  size: number;
  velocities: Float32Array;
  positions: Float32Array;
  colors: Float32Array;
}

export function Fireworks({ particlesPerBurst = 300 }: { particlesPerBurst?: number }) {
  const lightRef = useRef<THREE.PointLight>(null);
  const hadActiveRef = useRef(false);

  // Bursts state
  const BURST_COLORS = useMemo(
    () => [
      new THREE.Color('#FF4FD8'), // Line 1: pink
      new THREE.Color('#FFD27A'), // Line 2: gold
      new THREE.Color('#FFFFFF'), // Line 3: white
      new THREE.Color('#FF6FB0'), // Line 4: pink
      new THREE.Color('#FFE082'), // Line 5: big gold finale
    ],
    []
  );

  const BURST_ORIGINS = useMemo(
    () => [
      new THREE.Vector3(-1.8, 3.8, -4.5),
      new THREE.Vector3(1.6, 4.2, -4.2),
      new THREE.Vector3(-0.6, 4.5, -4.8),
      new THREE.Vector3(1.2, 3.9, -4.3),
      new THREE.Vector3(0.0, 4.6, -4.5), // Center big finale
    ],
    []
  );

  // Pre-allocate buffer data for max 5 active bursts simultaneously
  const maxBursts = 5;
  const totalParticles = particlesPerBurst * maxBursts;

  const { geometry, material, burstPool } = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(totalParticles * 3);
    const col = new Float32Array(totalParticles * 3);
    const sizes = new Float32Array(totalParticles);

    for (let i = 0; i < totalParticles; i++) {
      pos[i * 3 + 1] = -100; // Park offscreen
      sizes[i] = 0.035;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Create soft round particle texture
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.3, 'rgba(255,255,255,0.8)');
    grad.addColorStop(0.8, 'rgba(255,255,255,0.1)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);

    const tex = new THREE.CanvasTexture(canvas);

    const mat = new THREE.PointsMaterial({
      size: 0.05,
      map: tex,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const pool: FireworkBurst[] = [];
    for (let b = 0; b < maxBursts; b++) {
      const vels = new Float32Array(particlesPerBurst * 3);
      const poses = new Float32Array(particlesPerBurst * 3);
      const cols = new Float32Array(particlesPerBurst * 3);

      pool.push({
        active: false,
        startTime: 0,
        origin: new THREE.Vector3(),
        color: new THREE.Color(),
        size: 1.0,
        velocities: vels,
        positions: poses,
        colors: cols,
      });
    }

    return { geometry: geo, material: mat, burstPool: pool };
  }, [particlesPerBurst, totalParticles]);

  const lastLineRef = useRef(-1);
  const outroTriggeredRef = useRef(false);

  // Trigger burst helper
  const triggerBurst = (index: number, color: THREE.Color, origin: THREE.Vector3, scale = 1.0) => {
    const burst = burstPool[index % maxBursts];
    burst.active = true;
    burst.startTime = frame.time;
    burst.origin.copy(origin);
    burst.color.copy(color);
    burst.size = scale;

    // Generate spherical explosion velocities
    for (let i = 0; i < particlesPerBurst; i++) {
      // Uniform point on sphere
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const speed = (2.2 + Math.random() * 2.8) * scale;

      const vx = speed * Math.sin(phi) * Math.cos(theta);
      const vy = speed * Math.sin(phi) * Math.sin(theta);
      const vz = speed * Math.cos(phi);

      burst.velocities[i * 3] = vx;
      burst.velocities[i * 3 + 1] = vy;
      burst.velocities[i * 3 + 2] = vz;

      burst.positions[i * 3] = origin.x;
      burst.positions[i * 3 + 1] = origin.y;
      burst.positions[i * 3 + 2] = origin.z;

      burst.colors[i * 3] = color.r;
      burst.colors[i * 3 + 1] = color.g;
      burst.colors[i * 3 + 2] = color.b;
    }

    // Flash light
    if (lightRef.current) {
      lightRef.current.position.copy(origin);
      lightRef.current.color.copy(color);
      lightRef.current.intensity = 4.5 * scale;
    }
  };

  useFrame((_, delta) => {
    const st = useStore.getState();
    if (st.world !== 'diwali' && st.previousWorld !== 'diwali') return;
    const t = frame.time;
    const p2 = frame.dampedProgress['D2'] ?? 0;
    const p5 = frame.dampedProgress['D5'] ?? 0;

    // Line trigger in D2: 5 lines across [0, 1]
    const currentLine = Math.min(4, Math.floor(p2 * 5));
    if (p2 > 0.05 && currentLine !== lastLineRef.current) {
      lastLineRef.current = currentLine;
      const col = BURST_COLORS[currentLine];
      const orig = BURST_ORIGINS[currentLine];
      const scale = currentLine === 4 ? 1.6 : 1.0;
      triggerBurst(currentLine, col, orig, scale);
    }

    // Outro triple burst in D5
    if (p5 > 0.15 && !outroTriggeredRef.current) {
      outroTriggeredRef.current = true;
      triggerBurst(0, BURST_COLORS[1], new THREE.Vector3(-1.5, 4.2, -4.5), 1.2);
      triggerBurst(1, BURST_COLORS[0], new THREE.Vector3(1.5, 4.4, -4.5), 1.2);
      triggerBurst(2, BURST_COLORS[4], new THREE.Vector3(0.0, 4.8, -4.8), 1.6);
    } else if (p5 < 0.05) {
      outroTriggeredRef.current = false;
    }

    // Check if any bursts are active or need parking
    let anyActive = false;
    for (let b = 0; b < maxBursts; b++) {
      if (burstPool[b].active) {
        anyActive = true;
        break;
      }
    }

    if (!anyActive && !hadActiveRef.current) {
      if (lightRef.current && lightRef.current.intensity > 0) {
        lightRef.current.intensity = 0;
      }
      return;
    }

    hadActiveRef.current = anyActive;

    // Update active particle positions
    const posAttr = geometry.attributes.position;
    const colAttr = geometry.attributes.color;
    const posArr = posAttr.array as Float32Array;
    const colArr = colAttr.array as Float32Array;

    let highestLightIntensity = 0;
    const gravity = -2.8;
    const drag = 0.96;

    for (let b = 0; b < maxBursts; b++) {
      const burst = burstPool[b];
      const offset = b * particlesPerBurst * 3;

      if (!burst.active) continue;

      const elapsed = t - burst.startTime;
      if (elapsed > 2.2) {
        burst.active = false;
        // Park particles
        for (let i = 0; i < particlesPerBurst; i++) {
          posArr[offset + i * 3 + 1] = -100;
        }
        continue;
      }

      // Decay light over 0.8 s
      const lightDecay = Math.max(0, 1.0 - elapsed / 0.8);
      highestLightIntensity = Math.max(highestLightIntensity, lightDecay * 4.5 * burst.size);

      // Particle physics
      const fade = Math.max(0, 1.0 - elapsed / 1.8);
      for (let i = 0; i < particlesPerBurst; i++) {
        const idx = offset + i * 3;
        const bIdx = i * 3;

        // Apply drag and gravity
        burst.velocities[bIdx] *= drag;
        burst.velocities[bIdx + 1] = burst.velocities[bIdx + 1] * drag + gravity * delta;
        burst.velocities[bIdx + 2] *= drag;

        burst.positions[bIdx] += burst.velocities[bIdx] * delta;
        burst.positions[bIdx + 1] += burst.velocities[bIdx + 1] * delta;
        burst.positions[bIdx + 2] += burst.velocities[bIdx + 2] * delta;

        posArr[idx] = burst.positions[bIdx];
        posArr[idx + 1] = burst.positions[bIdx + 1];
        posArr[idx + 2] = burst.positions[bIdx + 2];

        colArr[idx] = burst.color.r * fade;
        colArr[idx + 1] = burst.color.g * fade;
        colArr[idx + 2] = burst.color.b * fade;
      }
    }

    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;

    // Decay shared burst point light
    if (lightRef.current) {
      lightRef.current.intensity = highestLightIntensity;
    }
  });

  return (
    <group name="FireworksSystem">
      {/* 1 Shared burst point light decaying over 0.8s (Part 9 D2) */}
      <pointLight
        ref={lightRef}
        position={[0, 4.0, -4.5]}
        color="#FFD27A"
        intensity={0}
        distance={14}
        decay={2}
      />
      <points geometry={geometry} material={material} />
    </group>
  );
}
