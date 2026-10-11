'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { frame } from '@/state/frame';

/**
 * Mirror Fog & Finger-Wipe Shader per BRIEF.md Part 8 R2 & R6:
 * - Condensation drawn over the mirror glass
 * - "RED ROOM" wiped clear as if by a finger (scroll 20% to 60% of R2)
 * - Line 2: blurred dark-red silhouette passes left-to-right behind glass
 * - R6 Easter egg: Dragon's ember eyes reappear in mirror reflection for 1.2s
 */

const MirrorFogShader = {
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform float uTime;
    uniform float uWipeProgress;
    uniform float uSilhouetteX;
    uniform float uEasterEgg;
    uniform sampler2D uWipeMap;
    varying vec2 vUv;

    // Simple pseudo-noise
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    void main() {
      // 1. Condensation fog noise
      float n = hash(vUv * 40.0) * 0.15;
      float fogBase = 0.85 + n;

      // 2. Sample finger-wipe text mask ("RED ROOM")
      vec4 wipeSample = texture2D(uWipeMap, vUv);
      float isLetter = wipeSample.r;
      float letterOrder = vUv.x; // wipes left to right

      // Finger wipe removes fog as uWipeProgress increases from 0 to 1
      float wipeReveal = smoothstep(letterOrder - 0.15, letterOrder, uWipeProgress);
      float clearedFog = isLetter * wipeReveal;
      float fogAmount = clamp(fogBase - clearedFog * 0.95, 0.05, 0.9);

      // Deep dark reflective mirror color underneath
      vec3 mirrorBase = vec3(0.04, 0.01, 0.015);
      vec3 fogCol = vec3(0.18, 0.08, 0.09);

      // 3. Passing dark-red silhouette behind glass
      float silDist = distance(vUv, vec2(uSilhouetteX, 0.5));
      float silhouette = smoothstep(0.35, 0.05, silDist) * 0.45;
      vec3 silCol = vec3(0.45, 0.04, 0.03);

      vec3 finalCol = mix(mirrorBase, fogCol, fogAmount);
      finalCol = mix(finalCol, silCol, silhouette * (1.0 - clearedFog));

      // 4. R6 Easter egg: Dragon ember eyes in reflection
      if (uEasterEgg > 0.0) {
        float eyeL = smoothstep(0.04, 0.0, distance(vUv, vec2(0.42, 0.62)));
        float eyeR = smoothstep(0.04, 0.0, distance(vUv, vec2(0.58, 0.62)));
        vec3 ember = vec3(1.0, 0.25, 0.05) * 3.0;
        finalCol += (eyeL + eyeR) * ember * uEasterEgg;
      }

      gl_FragColor = vec4(finalCol, 0.92);
    }
  `,
};

export function MirrorFog() {
  const meshRef = useRef<THREE.Mesh>(null);
  const silhouetteTimer = useRef(0);
  const easterEggTimer = useRef(0);

  // Generate crisp "RED ROOM" text texture for finger-wiping
  const wipeTexture = useMemo(() => {
    if (typeof document === 'undefined') return new THREE.Texture();
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, 1024, 1024);

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 130px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.letterSpacing = '12px';
      ctx.fillText('RED ROOM', 512, 512);

      // Soft finger blur edge
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 18;
      ctx.fillText('RED ROOM', 512, 512);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, []);

  const uniforms = useMemo(() => {
    return {
      uTime: { value: 0 },
      uWipeProgress: { value: 0 },
      uSilhouetteX: { value: -0.5 },
      uEasterEgg: { value: 0 },
      uWipeMap: { value: wipeTexture },
    };
  }, [wipeTexture]);

  useFrame((_, delta) => {
    const t = frame.time;
    const p2 = frame.dampedProgress['R2'] ?? 0;
    const p6 = frame.dampedProgress['R6'] ?? 0;

    uniforms.uTime.value = t;

    // Finger wipe scrubs with scroll from 20% to 60% of R2
    if (p2 < 0.2) {
      uniforms.uWipeProgress.value = 0;
    } else if (p2 > 0.6) {
      uniforms.uWipeProgress.value = 1.0;
    } else {
      uniforms.uWipeProgress.value = (p2 - 0.2) / 0.4;
    }

    // Silhouette passes left to right during line 2 (p2 between 0.34 and 0.67) over 3s
    if (p2 >= 0.34 && p2 <= 0.67) {
      silhouetteTimer.current += delta;
      const silP = (silhouetteTimer.current / 3.0) % 1.0;
      uniforms.uSilhouetteX.value = THREE.MathUtils.lerp(-0.3, 1.3, silP);
    } else {
      uniforms.uSilhouetteX.value = -0.5;
    }

    // Easter egg in R6: 1.2s flash of ember eyes in mirror
    if (p6 > 0.05) {
      easterEggTimer.current += delta;
      if (easterEggTimer.current < 1.2) {
        uniforms.uEasterEgg.value = Math.sin((easterEggTimer.current / 1.2) * Math.PI);
      } else {
        uniforms.uEasterEgg.value = 0;
      }
    } else {
      easterEggTimer.current = 0;
      uniforms.uEasterEgg.value = 0;
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={[0, 1.85, -0.38]}
      scale={[1.15, 1.85, 1]}
    >
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        vertexShader={MirrorFogShader.vertexShader}
        fragmentShader={MirrorFogShader.fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}
