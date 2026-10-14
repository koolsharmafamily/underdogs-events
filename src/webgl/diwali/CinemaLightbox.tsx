"use client";

import React, { useMemo, useRef, useLayoutEffect } from "react";
import * as THREE from "three";
import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { composition } from "../composition";
import { frame } from "@/state/frame";
import { useStore } from "@/state/store";

export function CinemaLightbox() {
  const posterTex = useTexture("/media/diwali-teaser.webp");
  posterTex.colorSpace = THREE.SRGBColorSpace;

  const groupRef = useRef<THREE.Group>(null);
  const bulbMesh = useRef<THREE.InstancedMesh>(null);
  const bulbColor = useMemo(() => new THREE.Color(), []);

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

  useLayoutEffect(() => {
    if (!bulbMesh.current) return;
    const matrix = new THREE.Matrix4();
    bulbs.forEach((b, i) => {
      bulbMesh.current!.setMatrixAt(i, matrix.makeTranslation(b.x, b.y, b.z));
      bulbMesh.current!.setColorAt(i, new THREE.Color("#FFD27A"));
    });
    bulbMesh.current.instanceMatrix.needsUpdate = true;
  }, [bulbs]);

  useFrame(() => {
    const st = useStore.getState();
    if (st.world !== "diwali" && st.previousWorld !== "diwali") return;
    const p4 = frame.dampedProgress["D4"] ?? 0;
    const p5 = frame.dampedProgress["D5"] ?? 0;
    const t = frame.time;

    if (!groupRef.current) return;

    // Lightbox appears during D4 only (Part 9 D4)
    const isD4 = composition.scene === "D4";
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

      if (bulbMesh.current) {
        for (let idx = 0; idx < bulbCount; idx++) {
          const glow =
            idx <= activeBulbs
              ? 1.8 + Math.sin(t * 0.8 + idx * 0.4) * 0.12
              : 0.05;
          bulbMesh.current.setColorAt(
            idx,
            bulbColor.set("#FFD27A").multiplyScalar(glow),
          );
        }
        if (bulbMesh.current.instanceColor)
          bulbMesh.current.instanceColor.needsUpdate = true;
      }
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
      <instancedMesh ref={bulbMesh} args={[undefined, undefined, bulbCount]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshBasicMaterial color="#FFFFFF" toneMapped={false} />
      </instancedMesh>
    </group>
  );
}
