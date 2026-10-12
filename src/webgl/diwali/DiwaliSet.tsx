'use client';

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { frame } from '@/state/frame';
import { useStore } from '@/state/store';
import { DiyaField } from './DiyaField';
import { PetalField } from './PetalField';
import { DrapesSky } from './DrapesSky';
import { Fireworks } from './Fireworks';
import { DiwaliCard } from './DiwaliCard';
import { DiwaliCardProjector } from '@/webgl/tracking/DiwaliCardProjector';
import { CinemaLightbox } from './CinemaLightbox';
import { AnchorFlames, getAnchorOffsetFromRoot } from '../fx/Flame';

// Preload Diwali assets
useGLTF.preload('/models/curtain-open-diwali.glb');
useGLTF.preload('/models/diwali-card.glb');
useGLTF.preload('/models/diwali-diya-brass.glb');
useGLTF.preload('/models/diwali-diya-terracotta.glb');
useGLTF.preload('/models/diwali-kandil.glb');
useGLTF.preload('/models/diwali-marigold.glb');
useGLTF.preload('/models/diwali-rose-petal.glb');

interface KandilSpec {
  pos: [number, number, number];
  scale: number;
  freq: number;
  phase: number;
}

// 5 hanging kandil lanterns at x = -3.2, -1.8, 1.8, 3.2 (y = 3.6..4.4, z = -0.5..0.5) and 1 high at back centre (scale ×2.5)
const KANDIL_SPECS: KandilSpec[] = [
  { pos: [-3.2, 3.85, 0.25], scale: 2.5, freq: 0.68, phase: 0.0 },
  { pos: [-1.8, 4.15, -0.25], scale: 2.5, freq: 0.74, phase: 1.3 },
  { pos: [1.8, 4.1, -0.2], scale: 2.5, freq: 0.71, phase: 2.6 },
  { pos: [3.2, 3.8, 0.3], scale: 2.5, freq: 0.65, phase: 3.9 },
  { pos: [0.0, 4.38, -0.45], scale: 2.5, freq: 0.62, phase: 5.1 }, // High at back centre
];

export function DiwaliSet() {
  const kandilGltf = useGLTF('/models/diwali-kandil.glb');

  // Max 3 real point lights in Diwali (Global Rule 7)
  const diyaLightRef = useRef<THREE.PointLight>(null);
  const kandilLightRef = useRef<THREE.PointLight>(null);
  const badgeRimLightRef = useRef<THREE.PointLight>(null);

  const kandilMeshRefs = useRef<(THREE.InstancedMesh | null)[]>([]);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const anchorVec = useMemo(() => new THREE.Vector3(), []);

  // Extract sub-meshes from diwali-kandil.glb for InstancedMesh rendering + Light_Anchor offset
  const { kandilSubMeshes, lightAnchorOffset, kandilAnchorNodes, kandilAnchorsGroup } = useMemo(() => {
    const subs: { geometry: THREE.BufferGeometry; material: THREE.Material }[] = [];
    kandilGltf.scene.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        const m = node as THREE.Mesh;
        const origMat = Array.isArray(m.material) ? m.material[0] : m.material;
        const mat = origMat.clone() as THREE.MeshStandardMaterial;
        // Enhance warm inner lantern glow on Paper_Rani without altering its color
        if (mat.name === 'Paper_Rani' && mat.emissive) {
          mat.emissiveIntensity = Math.max(mat.emissiveIntensity ?? 0.5, 0.85);
        }
        subs.push({ geometry: m.geometry, material: mat });
      }
    });

    const offset = getAnchorOffsetFromRoot(kandilGltf.scene, 'Light_Anchor');
    const group = new THREE.Group();
    group.name = 'KandilLightAnchors';
    const anchors: THREE.Object3D[] = KANDIL_SPECS.map((spec, idx) => {
      const obj = new THREE.Object3D();
      obj.name = `Kandil_Light_Anchor_${idx + 1}`;
      obj.position.set(spec.pos[0], spec.pos[1], spec.pos[2]);
      group.add(obj);
      return obj;
    });

    return {
      kandilSubMeshes: subs,
      lightAnchorOffset: offset,
      kandilAnchorNodes: anchors,
      kandilAnchorsGroup: group,
    };
  }, [kandilGltf.scene]);

  useFrame(() => {
    const st = useStore.getState();
    if (st.world !== 'diwali' && st.previousWorld !== 'diwali') return;
    const t = frame.time;

    // 1. Diya & Kandil point lights gentle warm breathing (Max 3 real point lights total)
    if (diyaLightRef.current) {
      diyaLightRef.current.intensity = 2.5 + Math.sin(t * 3.8) * 0.25;
    }
    if (kandilLightRef.current) {
      kandilLightRef.current.intensity = 1.9 + Math.cos(t * 2.4) * 0.18;
    }
    if (badgeRimLightRef.current) {
      badgeRimLightRef.current.intensity = 2.1;
    }

    // 2. Update 5 instanced Kandil lanterns with slow independent sway from their hanging origins
    for (let i = 0; i < KANDIL_SPECS.length; i++) {
      const spec = KANDIL_SPECS[i];
      const swayZ = Math.sin(t * spec.freq + spec.phase) * 0.045;
      const swayX = Math.cos(t * (spec.freq * 0.8) + spec.phase) * 0.025;

      dummy.position.set(spec.pos[0], spec.pos[1], spec.pos[2]);
      dummy.rotation.set(swayX, spec.phase * 0.3, swayZ);
      dummy.scale.setScalar(spec.scale);
      dummy.updateMatrix();

      for (let m = 0; m < kandilMeshRefs.current.length; m++) {
        const im = kandilMeshRefs.current[m];
        if (im) im.setMatrixAt(i, dummy.matrix);
      }

      // Update Light_Anchor world position for this lantern
      anchorVec.copy(lightAnchorOffset).applyMatrix4(dummy.matrix);
      kandilAnchorNodes[i].position.copy(anchorVec);
    }

    for (let m = 0; m < kandilMeshRefs.current.length; m++) {
      const im = kandilMeshRefs.current[m];
      if (im) im.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group name="DiwaliSet">
      {/* Zero-State DOM tracking projector for 3D card */}
      <DiwaliCardProjector />

      {/* Directional & Ambient Lighting per Part 5.4 */}
      <ambientLight intensity={0.38} color="#350E22" />
      <directionalLight position={[-4.0, 5.5, 4.0]} intensity={2.6} color="#FFD9A0" />
      <directionalLight position={[4.0, 3.0, 3.0]} intensity={1.4} color="#FF6FB0" />

      {/* Max 3 Real Point Lights in Diwali (Global Rule 7) */}
      {/* Point Light 1: Diya floor & badge warm glow */}
      <pointLight
        ref={diyaLightRef}
        position={[0, 1.5, 0.8]}
        color="#FFA84A"
        intensity={2.5}
        distance={10}
        decay={2}
      />
      {/* Point Light 2: Shared overhead Kandil lantern warm light */}
      <pointLight
        ref={kandilLightRef}
        position={[0, 3.9, 0.0]}
        color="#FFB85C"
        intensity={1.9}
        distance={12}
        decay={2}
      />
      {/* Point Light 3: Jewelled badge gold rim highlight */}
      <pointLight
        ref={badgeRimLightRef}
        position={[0, 2.0, -0.9]}
        color="#FFE09E"
        intensity={2.1}
        distance={8}
        decay={2}
      />

      {/* Floor: Ivory-plum marble floor with soft reflections (Part 5.4) */}
      <mesh name="DiwaliFloor" position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[32, 32]} />
        <meshStandardMaterial color="#160C14" roughness={0.32} metalness={0.45} />
      </mesh>

      {/* Single Front Proscenium (curtain-open-diwali.glb) + Lifting back_L/back_R Drapes & Haveli Sky */}
      <DrapesSky />

      {/* Instanced Diyas (12 floor terracotta in arc + 24 desktop / 10 mobile floating) with flames on Flame_Anchor */}
      <DiyaField />

      {/* Instanced Rose Petals (400 desktop / 120 mobile, scale ×3) & CatmullRomCurve3 Marigold Garlands + 20 Floor Heads */}
      <PetalField dustCount={220} />

      {/* Paced Fireworks System for D2 story lines & D5 outro */}
      <Fireworks particlesPerBurst={300} />

      {/* 3D Gold Foil Invitation Card rising on spiral */}
      <DiwaliCard />

      {/* D4 Cinema Lightbox with official teaser poster & marquee bulbs */}
      <CinemaLightbox />

      {/* 5 Instanced Hanging Kandil Lanterns (scale ×2.5) + Glow at Light_Anchor */}
      <group name="InstancedKandils">
        {kandilSubMeshes.map((sm, idx) => (
          <instancedMesh
            key={`kandil-${idx}`}
            ref={(el) => {
              kandilMeshRefs.current[idx] = el;
            }}
            args={[sm.geometry, sm.material, KANDIL_SPECS.length]}
            frustumCulled={false}
          />
        ))}
        <primitive object={kandilAnchorsGroup} />
        <AnchorFlames
          anchors={kandilAnchorNodes}
          worldId="diwali"
          scale={0.34}
          baseIntensity={0.85}
          colorCore="#FFF6D6"
          colorTip="#FF9A3C"
        />
      </group>
    </group>
  );
}
