'use client';

import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { frame } from '@/state/frame';

/**
 * Procedural layered Haveli silhouette texture (2-3 layered parallax planes of arches and palms).
 */
function createHaveliTexture(layer: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 1024, 512);

  // Colors: rani-deep and indigo gradients
  const fillColor = layer === 0 ? '#1C061E' : layer === 1 ? '#2E0B2B' : '#45103A';
  ctx.fillStyle = fillColor;

  // Draw haveli silhouette base
  ctx.beginPath();
  const baseY = 340 + layer * 35;
  ctx.moveTo(0, 512);
  ctx.lineTo(0, baseY);

  // Repeat arch pattern across width
  const arches = 6;
  const archW = 1024 / arches;
  for (let i = 0; i < arches; i++) {
    const x0 = i * archW;
    const xMid = x0 + archW * 0.5;
    const x1 = (i + 1) * archW;

    // Jharokha / scalloped arch top
    const peakY = baseY - 70 - (i % 2 === 0 ? 30 : 0) + layer * 15;
    ctx.lineTo(x0, baseY - 20);
    ctx.quadraticCurveTo(x0 + archW * 0.2, peakY, xMid, peakY - 15);
    ctx.quadraticCurveTo(x0 + archW * 0.8, peakY, x1, baseY - 20);
    ctx.lineTo(x1, baseY);
  }

  ctx.lineTo(1024, 512);
  ctx.closePath();
  ctx.fill();

  // Add palm tree silhouettes at edges
  if (layer === 0) {
    const drawPalm = (px: number, py: number) => {
      ctx.strokeStyle = fillColor;
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(px, 512);
      ctx.quadraticCurveTo(px + 15, py + 80, px + 25, py);
      ctx.stroke();

      // Palm fronds
      ctx.lineWidth = 4;
      for (let a = -1.2; a <= 1.2; a += 0.35) {
        ctx.beginPath();
        ctx.moveTo(px + 25, py);
        ctx.quadraticCurveTo(px + 25 + Math.cos(a) * 60, py + Math.sin(a) * 40 - 20, px + 25 + Math.cos(a) * 80, py + Math.sin(a) * 60 + 10);
        ctx.stroke();
      }
    };
    drawPalm(80, 240);
    drawPalm(940, 220);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function DrapesSky() {
  const drapesGltf = useGLTF('/models/curtain-open-diwali.glb');

  const backDrapeRef = useRef<THREE.Group>(null);
  const skyGroupRef = useRef<THREE.Group>(null);
  const haveli1Ref = useRef<THREE.Mesh>(null);
  const haveli2Ref = useRef<THREE.Mesh>(null);

  const clonedDrapes = useMemo(() => drapesGltf.scene.clone(true), [drapesGltf.scene]);

  // Haveli textures
  const [tex1, tex2] = useMemo(() => {
    if (typeof document === 'undefined') return [null, null];
    return [createHaveliTexture(0), createHaveliTexture(1)];
  }, []);

  // Sky gradient plane
  const skyTexture = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Night sky gradient: --dw-night (#14161F) to deep violet (#2A0A1C to #3E0C2D)
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#0E1018');
    grad.addColorStop(0.45, '#1B142A');
    grad.addColorStop(0.8, '#320C26');
    grad.addColorStop(1, '#1A0615');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  useFrame(() => {
    const p2 = frame.dampedProgress['D2'] ?? 0;
    // From line 3 (p2 >= 0.4), the back drapes lift:
    // velvet panels rise with folds bunching at the top
    const liftP = THREE.MathUtils.clamp((p2 - 0.38) / 0.5, 0, 1);
    const easedLift = THREE.MathUtils.smoothstep(liftP, 0, 1);

    if (backDrapeRef.current) {
      // Lift upward by 4.2m and bunch scale Y slightly
      backDrapeRef.current.position.y = easedLift * 4.2;
      backDrapeRef.current.scale.y = 1.0 - easedLift * 0.35;
    }

    if (skyGroupRef.current) {
      // Fade in sky opacity / presence
      skyGroupRef.current.position.y = THREE.MathUtils.lerp(-1.2, 0.0, easedLift);
    }

    // Parallax on haveli layers via pointer
    const ptrX = frame.pointer.damped.x;
    if (haveli1Ref.current) {
      haveli1Ref.current.position.x = ptrX * 0.25;
    }
    if (haveli2Ref.current) {
      haveli2Ref.current.position.x = ptrX * 0.12;
    }
  });

  return (
    <group name="DrapesSky">
      {/* Night Sky Dome/Plane at z = -6.5 */}
      <group ref={skyGroupRef} position={[0, -1.2, -6.5]}>
        <mesh position={[0, 4.0, 0]}>
          <planeGeometry args={[26, 14]} />
          {skyTexture && (
            <meshBasicMaterial
              map={skyTexture}
              toneMapped={false}
              depthWrite={false}
            />
          )}
        </mesh>

        {/* Layer 1: Distant Haveli Silhouette */}
        {tex2 && (
          <mesh ref={haveli2Ref} position={[0, 2.2, 0.4]}>
            <planeGeometry args={[22, 6.5]} />
            <meshBasicMaterial
              map={tex2}
              transparent
              opacity={0.85}
              depthWrite={false}
            />
          </mesh>
        )}

        {/* Layer 2: Near Haveli Silhouette with Palms */}
        {tex1 && (
          <mesh ref={haveli1Ref} position={[0, 1.8, 0.8]}>
            <planeGeometry args={[24, 7.0]} />
            <meshBasicMaterial
              map={tex1}
              transparent
              opacity={0.95}
              depthWrite={false}
            />
          </mesh>
        )}
      </group>

      {/* Back Velvet Drapes that lift on D2 */}
      <group ref={backDrapeRef} position={[0, 0, -3.2]}>
        <primitive object={clonedDrapes} />
      </group>
    </group>
  );
}
