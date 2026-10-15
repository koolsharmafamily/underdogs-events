"use client";

import React, { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { SpareLights } from "../LightRig";
import { frame } from "@/state/frame";
import { useStore } from "@/state/store";

/**
 * DiwaliSet - Pure Jewellery Lighting for the Jewelled Badge (its studio
 * environment is baked with the others in StudioEnvironment).
 * All other scene elements are rendered in exquisite, crisp 2D DOM/SVG layers.
 * The WebGL canvas on /diwali is completely alpha-transparent.
 */
export function DiwaliSet() {
  const reflectionLightRef = useRef<THREE.PointLight>(null);
  const keyLightRef = useRef<THREE.DirectionalLight>(null);
  const rimLightRef = useRef<THREE.DirectionalLight>(null);

  useFrame(() => {
    const st = useStore.getState();
    if (st.world !== "diwali" && st.previousWorld !== "diwali") return;
    const t = frame.time;

    // Subtle moving reflection highlight sweeps across pavé diamond face and zari rim around y = 2.22
    if (reflectionLightRef.current) {
      reflectionLightRef.current.position.set(
        Math.cos(t * 0.45) * 1.8,
        2.22 + Math.sin(t * 0.35) * 0.3,
        2.2,
      );
      reflectionLightRef.current.intensity = 1.8 + Math.sin(t * 1.8) * 0.35;
    }
  });

  return (
    <group name="DiwaliSet">
      {/* 1. Ambient warm crimson foundation */}
      <ambientLight intensity={0.7} color="#42050E" />

      {/* 2. Key light: warm gold from top-left */}
      <directionalLight
        ref={keyLightRef}
        position={[-3.5, 5.8, 4.0]}
        intensity={2.8}
        color="#FFE3A3"
      />

      {/* 3. Rim light: pink rim from behind */}
      <directionalLight
        ref={rimLightRef}
        position={[0.5, 3.8, -2.5]}
        intensity={3.2}
        color="#E0217A"
      />

      {/* 4. Fill light: warm gold fill from right */}
      <directionalLight
        position={[3.0, 3.0, 2.8]}
        intensity={1.6}
        color="#E5B25D"
      />

      {/* 5. Moving reflection highlight point light */}
      <pointLight
        ref={reflectionLightRef}
        position={[0, 2.22, 2.2]}
        color="#FFF6D6"
        intensity={1.8}
        distance={6}
        decay={2}
      />
      <SpareLights point={2} />
    </group>
  );
}
