'use client';

import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { frame } from '@/state/frame';
import { useStore } from '@/state/store';
import { groundObjectToY } from '../fx/Flame';

/**
 * Procedural layered Haveli silhouette texture (layered parallax planes of arches and palms).
 */
function createHaveliTexture(layer: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 1024, 512);

  const fillColor = layer === 0 ? '#1C061E' : layer === 1 ? '#2E0B2B' : '#45103A';
  ctx.fillStyle = fillColor;

  ctx.beginPath();
  const baseY = 340 + layer * 35;
  ctx.moveTo(0, 512);
  ctx.lineTo(0, baseY);

  const arches = 6;
  const archW = 1024 / arches;
  for (let i = 0; i < arches; i++) {
    const x0 = i * archW;
    const xMid = x0 + archW * 0.5;
    const x1 = (i + 1) * archW;

    const peakY = baseY - 70 - (i % 2 === 0 ? 30 : 0) + layer * 15;
    ctx.lineTo(x0, baseY - 20);
    ctx.quadraticCurveTo(x0 + archW * 0.2, peakY, xMid, peakY - 15);
    ctx.quadraticCurveTo(x0 + archW * 0.8, peakY, x1, baseY - 20);
    ctx.lineTo(x1, baseY);
  }

  ctx.lineTo(1024, 512);
  ctx.closePath();
  ctx.fill();

  if (layer === 0) {
    const drawPalm = (px: number, py: number) => {
      ctx.strokeStyle = fillColor;
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(px, 512);
      ctx.quadraticCurveTo(px + 15, py + 80, px + 25, py);
      ctx.stroke();

      ctx.lineWidth = 4;
      for (let a = -1.2; a <= 1.2; a += 0.35) {
        ctx.beginPath();
        ctx.moveTo(px + 25, py);
        ctx.quadraticCurveTo(
          px + 25 + Math.cos(a) * 60,
          py + Math.sin(a) * 40 - 20,
          px + 25 + Math.cos(a) * 80,
          py + Math.sin(a) * 60 + 10
        );
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

  const skyGroupRef = useRef<THREE.Group>(null);
  const haveli1Ref = useRef<THREE.Mesh>(null);
  const haveli2Ref = useRef<THREE.Mesh>(null);

  // ONE instance of curtain-open-diwali.glb as front proscenium; back_L and back_R lift in D2
  const { prosceniumScene, backL, backR, backInitial } = useMemo(() => {
    const scene = drapesGltf.scene.clone(true);
    groundObjectToY(scene, 0);

    const bL = scene.getObjectByName('back_L') ?? null;
    const bR = scene.getObjectByName('back_R') ?? null;

    return {
      prosceniumScene: scene,
      backL: bL,
      backR: bR,
      backInitial: {
        posYL: bL ? bL.position.y : 2.25,
        scaleYL: bL ? bL.scale.y : 2.25,
        posYR: bR ? bR.position.y : 2.25,
        scaleYR: bR ? bR.scale.y : 2.25,
      },
    };
  }, [drapesGltf.scene]);

  const [tex1, tex2] = useMemo(() => {
    if (typeof document === 'undefined') return [null, null];
    return [createHaveliTexture(0), createHaveliTexture(1)];
  }, []);

  const skyTexture = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

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
    const st = useStore.getState();
    if (st.world !== 'diwali' && st.previousWorld !== 'diwali') return;
    const p2 = frame.dampedProgress['D2'] ?? 0;

    // From line 3 (p2 >= 0.35), back_L and back_R lift: translate up + compress toward top (y = 4.5)
    const liftP = THREE.MathUtils.clamp((p2 - 0.35) / 0.48, 0, 1);
    const easedLift = THREE.MathUtils.smoothstep(liftP, 0, 1);
    const gatherFactor = 1.0 - easedLift * 0.86; // Compresses drape height toward valance at y = 4.5

    if (backL) {
      backL.scale.y = backInitial.scaleYL * gatherFactor;
      if (backInitial.posYL > 0.1) {
        // Mesh origin at center (2.25) with top at 4.5
        backL.position.y = 4.5 - backInitial.posYL * gatherFactor;
      } else {
        // Mesh origin at bottom (0) with top at 4.5
        backL.position.y = 4.5 * (1.0 - gatherFactor);
      }
    }

    if (backR) {
      backR.scale.y = backInitial.scaleYR * gatherFactor;
      if (backInitial.posYR > 0.1) {
        backR.position.y = 4.5 - backInitial.posYR * gatherFactor;
      } else {
        backR.position.y = 4.5 * (1.0 - gatherFactor);
      }
    }

    if (skyGroupRef.current) {
      skyGroupRef.current.position.y = THREE.MathUtils.lerp(-1.2, 0.0, easedLift);
    }

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

      {/* ONE instance of curtain-open-diwali.glb as front proscenium (panel_L/R, valance, tiebacks) + lifting back_L/back_R */}
      <group name="DiwaliProsceniumDrapes" position={[0, 0, -0.4]} scale={[1, 1, 1]}>
        <primitive object={prosceniumScene} />
      </group>
    </group>
  );
}
