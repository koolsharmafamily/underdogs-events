'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { frame } from '@/state/frame';
import { useStore } from '@/state/store';
import { useQuality } from '../QualityProvider';

/**
 * The Smoke Dragon per BRIEF.md Part 8 R1 & Part 14 Phase 4:
 * - 0.0–2.2 s: Head leads body along spline coiling 1.5 turns around badge (radius 0.9–1.3)
 * - 2.2–3.0 s: Head rises above badge, faces camera. Jaw opens 18°, eyes flare ×3, 300 ember sparks burst
 * - 3.0 s onward: Idle: coil breathes (±4% radius at 0.15 Hz), smoke curls off body, embers drift
 * - Scroll 60% → 100% of R1: Dragon unravels from tail to head into room haze. Head dissolves last (reversible)
 * - Pointer: within 1.5 m, swirls smoke away. Head never moves more than 0.2
 * - Particle counts per Part 5.5: T3 60k, T2 25k, T1 8k
 */

// Spline generator coiling 1.5 turns around badge at (0, 2.0, 0.8)
function getSplinePoint(t: number, out: THREE.Vector3, breathe: number = 1.0) {
  // t from 0 (tail) to 1 (head)
  // Behind mirror left edge at t=0: (-1.4, 2.2, -0.2)
  if (t <= 0.1) {
    const sub = t / 0.1;
    out.set(
      THREE.MathUtils.lerp(-1.4, -1.0, sub),
      THREE.MathUtils.lerp(2.2, 1.8, sub),
      THREE.MathUtils.lerp(-0.2, 0.2, sub)
    );
    return;
  }

  // Coil 1.5 turns (3*PI) around badge
  const normT = (t - 0.1) / 0.9;
  const angle = -0.5 * Math.PI + normT * 3.0 * Math.PI;
  const radius = THREE.MathUtils.lerp(1.3, 0.95, normT) * breathe;
  const y = THREE.MathUtils.lerp(1.6, 2.35, normT);
  const zOffset = 0.8 + Math.cos(angle) * radius * 0.55;
  const x = Math.sin(angle) * radius;

  out.set(x, y, zOffset);
}

const DragonSmokeShader = {
  vertexShader: /* glsl */ `
    uniform float uTime;
    uniform float uAnimTime;
    uniform float uUnravel;
    uniform vec3 uPointer;
    uniform float uBreathe;
    attribute float aProgress;
    attribute vec3 aOffset;
    attribute float aSize;
    attribute float aSpeed;
    varying float vAlpha;
    varying vec3 vColor;

    // Simplex-style 3D noise approximation
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    float snoise(vec3 v) {
      const vec2 C = vec2(1.0/6.0, 1.0/3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
      vec3 i  = floor(v + dot(v, C.yyy));
      vec3 x0 = v - i + dot(i, C.xxx);
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min(g.xyz, l.zxy);
      vec3 i2 = max(g.xyz, l.zxy);
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      i = mod289(i);
      vec4 p = permute(permute(permute(
                i.z + vec4(0.0, i1.z, i2.z, 1.0))
              + i.y + vec4(0.0, i1.y, i2.y, 1.0))
              + i.x + vec4(0.0, i1.x, i2.x, 1.0));
      vec4 j = p - 49.0 * floor(p * (1.0 / 49.0));
      vec4 x_ = floor(j * (1.0 / 7.0));
      vec4 y_ = floor(j - 7.0 * x_);
      vec4 x = x_ * (2.0 / 7.0) + 0.5 / 7.0 - 1.0;
      vec4 y = y_ * (2.0 / 7.0) + 0.5 / 7.0 - 1.0;
      vec4 h = 1.0 - abs(x) - abs(y);
      vec4 b0 = vec4(x.xy, y.xy);
      vec4 b1 = vec4(x.zw, y.zw);
      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
      vec3 p0 = vec3(a0.xy, h.x);
      vec3 p1 = vec3(a0.zw, h.y);
      vec3 p2 = vec3(a1.xy, h.z);
      vec3 p3 = vec3(a1.zw, h.w);
      vec4 norm = inversesqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
      p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
    }

    void main() {
      // Dragon entrance growth along spline from 0 to 1 over uAnimTime (0 to 2.2s)
      float growLimit = clamp(uAnimTime / 2.2, 0.0, 1.0);
      if (aProgress > growLimit) {
        gl_Position = vec4(2.0, 2.0, 2.0, 0.0); // off-screen
        vAlpha = 0.0;
        return;
      }

      // Spline position based on aProgress
      vec3 pos = position;

      // Curl noise drift
      vec3 curl = vec3(
        snoise(pos * 1.5 + vec3(uTime * 0.35, 0.0, 0.0)),
        snoise(pos * 1.5 + vec3(0.0, uTime * 0.35, 0.0)),
        snoise(pos * 1.5 + vec3(0.0, 0.0, uTime * 0.35))
      ) * 0.12;

      // Pointer swirl within 1.5m
      float pDist = distance(pos, uPointer);
      if (pDist < 1.5) {
        vec3 pDiff = normalize(pos - uPointer);
        float pForce = (1.0 - pDist / 1.5);
        curl += vec3(-pDiff.z, pDiff.y * 0.5, pDiff.x) * pForce * 0.4;
      }

      // Reversible unraveling on scroll (60% to 100% of R1) from tail to head
      if (uUnravel > 0.0) {
        float unravelThreshold = uUnravel;
        if (aProgress < unravelThreshold) {
          float distFromThreshold = (unravelThreshold - aProgress);
          // Scatter outwards into haze
          pos += aOffset * distFromThreshold * 3.5 + vec3(0.0, distFromThreshold * 1.2, 0.0);
          vAlpha = max(0.0, 1.0 - distFromThreshold * 3.0);
        } else {
          vAlpha = 1.0;
        }
      } else {
        vAlpha = 1.0;
      }

      pos += aOffset * aSize * 0.5 + curl;

      // Taper body: thick in center (0.22), thin at tail and neck
      float bodyThickness = sin(aProgress * 3.14159) * 0.22 + 0.04;
      
      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_PointSize = (aSize * bodyThickness * 140.0) / -mvPosition.z;
      gl_Position = projectionMatrix * mvPosition;

      // Deep smoked crimson charcoal with vibrant ember highlights
      vec3 smokeCol = vec3(0.24, 0.04, 0.03);
      vec3 emberCol = vec3(1.0, 0.38, 0.12);
      vColor = mix(smokeCol, emberCol, pow(aProgress, 2.2) * 0.85);
      vAlpha *= (0.28 + 0.45 * sin(aProgress * 3.14159));
    }
  `,
  fragmentShader: /* glsl */ `
    varying float vAlpha;
    varying vec3 vColor;

    void main() {
      // Soft radial particle puff
      vec2 coord = gl_PointCoord - vec2(0.5);
      float dist = length(coord);
      if (dist > 0.5) discard;
      float alpha = smoothstep(0.5, 0.0, dist) * vAlpha;
      gl_FragColor = vec4(vColor * 1.8, alpha);
    }
  `,
};

export function SmokeDragon() {
  const { tier } = useQuality();
  const pointsRef = useRef<THREE.Points>(null);
  const headGroupRef = useRef<THREE.Group>(null);
  const jawRef = useRef<THREE.Group>(null);
  const eyeLRef = useRef<THREE.Mesh>(null);
  const eyeRRef = useRef<THREE.Mesh>(null);
  const emberSparksRef = useRef<THREE.Points>(null);

  const animTimer = useRef(0);

  // Optimized particle count by tier for zero overdraw stutter
  const particleCount = tier === 'T1' ? 4000 : tier === 'T2' ? 9000 : 16000;

  // Geometry attributes
  const { geometry, uniforms } = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const offsets = new Float32Array(particleCount * 3);
    const progresses = new Float32Array(particleCount);
    const sizes = new Float32Array(particleCount);
    const speeds = new Float32Array(particleCount);

    const tempV = new THREE.Vector3();

    for (let i = 0; i < particleCount; i++) {
      const p = i / particleCount;
      progresses[i] = p;

      getSplinePoint(p, tempV);
      positions[i * 3] = tempV.x;
      positions[i * 3 + 1] = tempV.y;
      positions[i * 3 + 2] = tempV.z;

      // Random jitter puff offset around body
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = Math.pow(Math.random(), 0.5);
      offsets[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      offsets[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      offsets[i * 3 + 2] = r * Math.cos(phi);

      sizes[i] = 0.4 + Math.random() * 0.6;
      speeds[i] = 0.8 + Math.random() * 0.4;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aOffset', new THREE.BufferAttribute(offsets, 3));
    geo.setAttribute('aProgress', new THREE.BufferAttribute(progresses, 1));
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1));

    const uni = {
      uTime: { value: 0 },
      uAnimTime: { value: 0 },
      uUnravel: { value: 0 },
      uPointer: { value: new THREE.Vector3(999, 999, 999) },
      uBreathe: { value: 1.0 },
    };

    return { geometry: geo, uniforms: uni };
  }, [particleCount]);

  // Ember sparks burst geometry (300 particles per Part 8 R1)
  const sparks = useMemo(() => {
    const count = 300;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const vels = new Float32Array(count * 3);
    const lives = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      pos[i * 3] = 0;
      pos[i * 3 + 1] = 2.45;
      pos[i * 3 + 2] = 1.15;

      vels[i * 3] = (Math.random() - 0.5) * 1.8;
      vels[i * 3 + 1] = Math.random() * 2.2 + 0.4;
      vels[i * 3 + 2] = Math.random() * 2.0 + 0.8;
      lives[i] = Math.random() * 0.8;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return { geo, vels, lives, count };
  }, []);

  const tempHeadVec = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    const st = useStore.getState();
    if (st.world !== 'redroom' && st.previousWorld !== 'redroom') return;

    // Mobile: pause particles during transitions to conserve bandwidth
    if (frame.transition.phase !== 'idle' && typeof window !== 'undefined' && window.innerWidth < 768) {
      return;
    }

    const t = frame.time;
    animTimer.current += delta;
    const animT = animTimer.current;

    const p1 = frame.dampedProgress['R1'] ?? 0;

    // 1. Unraveling from tail to head on scroll 60% -> 100% of R1 (reversible)
    let unravel = 0;
    if (p1 > 0.6) {
      unravel = THREE.MathUtils.clamp((p1 - 0.6) / 0.4, 0, 1);
    }

    // 2. Coil breathing: +/- 4% radius at 0.15 Hz
    const breathe = 1.0 + Math.sin(t * 0.15 * Math.PI * 2) * 0.04;

    uniforms.uTime.value = t;
    uniforms.uAnimTime.value = animT;
    uniforms.uUnravel.value = unravel;
    uniforms.uBreathe.value = breathe;

    // Pointer coordinates mapped to scene
    uniforms.uPointer.value.set(
      frame.pointer.damped.x * 2.5,
      frame.pointer.damped.y * 1.8 + 1.8,
      1.0
    );

    // 3. Head animation:
    // 0.0 - 2.2s follows tip of spline
    // 2.2 - 3.0s rises to (0.0, 2.45, 1.15) facing camera; jaw opens 18°
    if (headGroupRef.current) {
      if (animT < 2.2) {
        getSplinePoint(Math.min(1.0, animT / 2.2), tempHeadVec, breathe);
        headGroupRef.current.position.copy(tempHeadVec);
        headGroupRef.current.rotation.set(0, animT * 1.2, 0);
      } else {
        const riseP = Math.min(1.0, (animT - 2.2) / 0.8);
        headGroupRef.current.position.set(
          0.0 + frame.pointer.damped.x * 0.15,
          THREE.MathUtils.lerp(2.35, 2.45, riseP) + frame.pointer.damped.y * 0.1,
          THREE.MathUtils.lerp(1.0, 1.15, riseP)
        );
        headGroupRef.current.rotation.set(0.12, 0, 0);

        // Jaw hinges open 18° (0.314 rad) per Part 8 R1
        if (jawRef.current) {
          jawRef.current.rotation.x = riseP * 0.314;
        }

        // Eyes flare x3
        const flare = 1.0 + Math.sin(riseP * Math.PI) * 2.0;
        if (eyeLRef.current && eyeRRef.current) {
          (eyeLRef.current.material as THREE.MeshBasicMaterial).color.setRGB(1.0 * flare, 0.3 * flare, 0.1);
          (eyeRRef.current.material as THREE.MeshBasicMaterial).color.setRGB(1.0 * flare, 0.3 * flare, 0.1);
        }

        // Dissolve head into embers last when unraveling > 0.85
        if (unravel > 0.85) {
          const headDissolve = 1.0 - (unravel - 0.85) / 0.15;
          headGroupRef.current.scale.setScalar(Math.max(0.001, headDissolve));
        } else {
          headGroupRef.current.scale.setScalar(1.0);
        }
      }
    }

    // 4. Ember sparks burst update
    if (emberSparksRef.current) {
      if (animT >= 2.2 && animT <= 3.4) {
        emberSparksRef.current.visible = true;
        const positions = emberSparksRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < sparks.count; i++) {
          positions[i * 3] += sparks.vels[i * 3] * delta;
          positions[i * 3 + 1] += sparks.vels[i * 3 + 1] * delta - 0.6 * delta; // gravity
          positions[i * 3 + 2] += sparks.vels[i * 3 + 2] * delta;
        }
        emberSparksRef.current.geometry.attributes.position.needsUpdate = true;
      } else {
        emberSparksRef.current.visible = false;
      }
    }
  });

  return (
    <group name="SmokeDragon">
      {/* Dragon Smoke Body */}
      <points ref={pointsRef} geometry={geometry}>
        <shaderMaterial
          vertexShader={DragonSmokeShader.vertexShader}
          fragmentShader={DragonSmokeShader.fragmentShader}
          uniforms={uniforms}
          transparent
          blending={THREE.NormalBlending}
          depthWrite={false}
        />
      </points>

      {/* 3D Smoked-Glass Dragon Head Shell with Cranium, Horns, Jaw & Ember Eyes */}
      <group ref={headGroupRef} position={[-1.4, 2.2, -0.2]}>
        {/* Upper Cranium / Snout */}
        <mesh position={[0, 0.05, 0.04]} rotation={[0.2, 0, 0]}>
          <coneGeometry args={[0.13, 0.32, 6]} />
          <meshStandardMaterial
            color="#32060A"
            roughness={0.16}
            metalness={0.7}
            emissive="#7A0D15"
            emissiveIntensity={0.35}
          />
        </mesh>

        {/* Brow Ridge */}
        <mesh position={[0, 0.09, -0.04]}>
          <boxGeometry args={[0.24, 0.07, 0.16]} />
          <meshStandardMaterial
            color="#220406"
            roughness={0.2}
            metalness={0.75}
          />
        </mesh>

        {/* Left Horn */}
        <mesh position={[-0.10, 0.16, -0.12]} rotation={[-0.55, -0.2, -0.3]}>
          <coneGeometry args={[0.035, 0.28, 5]} />
          <meshStandardMaterial
            color="#4A0B10"
            roughness={0.25}
            metalness={0.8}
            emissive="#FF2A1F"
            emissiveIntensity={0.2}
          />
        </mesh>

        {/* Right Horn */}
        <mesh position={[0.10, 0.16, -0.12]} rotation={[-0.55, 0.2, 0.3]}>
          <coneGeometry args={[0.035, 0.28, 5]} />
          <meshStandardMaterial
            color="#4A0B10"
            roughness={0.25}
            metalness={0.8}
            emissive="#FF2A1F"
            emissiveIntensity={0.2}
          />
        </mesh>

        {/* Articulated Lower Jaw */}
        <group ref={jawRef} position={[0, -0.04, -0.02]}>
          <mesh position={[0, -0.02, 0.10]} rotation={[-0.18, 0, 0]}>
            <coneGeometry args={[0.09, 0.22, 5]} />
            <meshStandardMaterial
              color="#280508"
              roughness={0.2}
              metalness={0.65}
            />
          </mesh>
        </group>

        {/* Glowing Ember Eyes */}
        <mesh ref={eyeLRef} position={[-0.075, 0.09, 0.08]}>
          <sphereGeometry args={[0.026, 12, 12]} />
          <meshBasicMaterial color="#FF551F" />
        </mesh>
        <mesh ref={eyeRRef} position={[0.075, 0.09, 0.08]}>
          <sphereGeometry args={[0.026, 12, 12]} />
          <meshBasicMaterial color="#FF551F" />
        </mesh>
      </group>

      {/* Burst Ember Sparks */}
      <points ref={emberSparksRef} visible={false} geometry={sparks.geo}>
        <pointsMaterial
          size={0.035}
          color="#FFA03A"
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
}
