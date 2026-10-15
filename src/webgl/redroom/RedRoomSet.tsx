"use client";

import React, { useRef, useMemo, useEffect } from "react";
import * as THREE from "three";
import { useGLTF, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { StageFloor } from "../StageFloor";
import { batchStaticSiblings } from "../batchStaticSiblings";
import { SpareLights } from "../LightRig";
import { cheapGlass } from "../glass";
import { frame } from "@/state/frame";
import { useStore } from "@/state/store";
import { AnchorFlames, findAnchorNodes, groundObjectToY } from "../fx/Flame";
import { MirrorFog } from "./MirrorFog";
import { InvitationTray } from "./InvitationTray";

interface CandleClusterItem {
  variant: 0 | 1 | 2; // 0 = Candle_A, 1 = Candle_B, 2 = Candle_C
  pos: [number, number, number];
  scale: number;
  rotY: number;
}

// 5 clusters of 3 candles (15 candles total):
// 1. Left of mirror base on floor
// 2. Right of mirror base on floor
// 3. On the invitation side table (y = 0.85)
// 4. Floor in front of left proscenium curtain
// 5. Floor in front of right proscenium curtain
const CANDLE_INSTANCES: CandleClusterItem[] = [
  // Cluster 1: Left of mirror base on floor
  { variant: 0, pos: [-0.92, 0, -0.48], scale: 1.05, rotY: 0.4 },
  { variant: 1, pos: [-1.06, 0, -0.38], scale: 1.0, rotY: 1.8 },
  { variant: 2, pos: [-0.84, 0, -0.34], scale: 1.1, rotY: 3.1 },
  // Cluster 2: Right of mirror base on floor
  { variant: 0, pos: [0.92, 0, -0.48], scale: 1.0, rotY: 2.2 },
  { variant: 1, pos: [1.06, 0, -0.38], scale: 1.08, rotY: 0.9 },
  { variant: 2, pos: [0.84, 0, -0.34], scale: 0.95, rotY: 4.5 },
  // Cluster 3: On the invitation side table (top at y = 0.85, table at z = 2.2)
  { variant: 0, pos: [0.27, 0.85, 2.04], scale: 0.78, rotY: 1.2 },
  { variant: 1, pos: [0.34, 0.85, 2.13], scale: 0.82, rotY: 2.7 },
  { variant: 2, pos: [0.23, 0.85, 2.16], scale: 0.85, rotY: 4.1 },
  // Cluster 4: Floor in front of left curtain side
  { variant: 0, pos: [-2.18, 0, 2.12], scale: 1.12, rotY: 0.7 },
  { variant: 1, pos: [-2.32, 0, 2.24], scale: 1.02, rotY: 2.4 },
  { variant: 2, pos: [-2.08, 0, 2.26], scale: 1.08, rotY: 3.9 },
  // Cluster 5: Floor in front of right curtain side
  { variant: 0, pos: [2.18, 0, 2.12], scale: 1.06, rotY: 1.5 },
  { variant: 1, pos: [2.32, 0, 2.24], scale: 1.1, rotY: 3.3 },
  { variant: 2, pos: [2.08, 0, 2.26], scale: 1.0, rotY: 5.0 },
];

export function RedRoomSet() {
  const world = useStore((s) => s.world);
  const previousWorld = useStore((s) => s.previousWorld);
  const curtainGltf = useGLTF("/models/curtain-open.glb");
  const mirrorGltf = useGLTF("/models/redroom-mirror.glb");
  const chandelierGltf = useGLTF("/models/redroom-chandelier.glb");
  const candelabraGltf = useGLTF("/models/redroom-candelabra.glb");
  const candleGltf = useGLTF("/models/redroom-candle.glb");

  // Official poster texture for framed display on left wall (Part 8 R5)
  const posterTex = useTexture("/media/red-room-poster.webp");

  const chandelierRef = useRef<THREE.Group>(null);
  const candleLight1Ref = useRef<THREE.PointLight>(null);
  const candleLight2Ref = useRef<THREE.PointLight>(null);
  const badgePointLightRef = useRef<THREE.PointLight>(null);

  const prevStoryIdx = useRef(-1);
  const storyFlareTimer = useRef(0);

  // Prepare grounded static GLB scenes, instanced candles, and all Flame_Anchor_* empties
  const {
    prosceniumCurtain,
    mirror,
    chandelier,
    candelabraLeft,
    candelabraRight,
    candleSubMeshes,
    allFlameAnchors,
    staticAnchorsGroup,
  } = useMemo(() => {
    // 1. ONE instance of curtain-open.glb as static proscenium at z = 2.6, uniform scale 0.85, grounded
    const pCurtain = curtainGltf.scene.clone(true);
    groundObjectToY(pCurtain, 0);
    batchStaticSiblings(pCurtain, true);

    // 2. Gilded mirror grounded at bottom = (0, 0.3, -0.6), scale 1.0
    const mir = mirrorGltf.scene.clone(true);
    groundObjectToY(mir, 0);
    batchStaticSiblings(mir, true);

    // 3. Chandelier hanging from its origin (0, 5.2, 0.4), scale 1.0 (lowest crystals at y ≈ 3.0)
    const chand = cheapGlass(chandelierGltf.scene.clone(true));
    batchStaticSiblings(chand, true);
    const chandAnchors = findAnchorNodes(chand, "Flame_Anchor"); // 8 anchors: Flame_Anchor_1..8

    // 4. Two candelabras grounded on top of 0.9m plinths at (-2.6, 0.9, 0.2) and (2.6, 0.9, 0.2), scale 1.0
    const candL = candelabraGltf.scene.clone(true);
    const candR = candelabraGltf.scene.clone(true);
    groundObjectToY(candL, 0);
    groundObjectToY(candR, 0);
    batchStaticSiblings(candL, true);
    batchStaticSiblings(candR, true);
    const candLAnchors = findAnchorNodes(candL, "Flame_Anchor"); // 5 anchors: Flame_Anchor_1..5
    const candRAnchors = findAnchorNodes(candR, "Flame_Anchor"); // 5 anchors: Flame_Anchor_1..5

    // 5. InstancedMesh data for redroom-candle.glb variants Candle_A, Candle_B, Candle_C
    // Center each variant's local X offset (-0.11 for A, 0 for B, +0.11 for C) and ground to y = 0
    const variantNames = ["Candle_A", "Candle_B", "Candle_C"] as const;
    const anchorNames = [
      "Flame_Anchor_A",
      "Flame_Anchor_B",
      "Flame_Anchor_C",
    ] as const;

    const subMeshes: {
      variant: number;
      geometry: THREE.BufferGeometry;
      material: THREE.Material;
    }[] = [];

    const variantAnchorHeights = [0.306, 0.206, 0.126];

    variantNames.forEach((vName, vIdx) => {
      const groupNode = candleGltf.scene.getObjectByName(vName);
      const anchorNode = candleGltf.scene.getObjectByName(anchorNames[vIdx]);
      if (anchorNode) {
        const wp = new THREE.Vector3();
        anchorNode.getWorldPosition(wp);
        variantAnchorHeights[vIdx] = wp.y;
      }
      if (groupNode) {
        // Ground the complete variant, preserving the relative wick/wax placement.
        groupNode.updateWorldMatrix(true, true);
        const box = new THREE.Box3().setFromObject(groupNode);
        const center = box.getCenter(new THREE.Vector3());
        variantAnchorHeights[vIdx] -= box.min.y;
        groupNode.traverse((child) => {
          if (!(child as THREE.Mesh).isMesh) return;
          const mesh = child as THREE.Mesh;
          const geometry = mesh.geometry.clone().applyMatrix4(mesh.matrixWorld);
          geometry.translate(-center.x, -box.min.y, -center.z);
          subMeshes.push({
            variant: vIdx,
            geometry,
            material: Array.isArray(mesh.material)
              ? mesh.material[0]
              : mesh.material,
          });
        });
      }
    });

    // Create anchor Object3Ds for the 15 instanced candles using their Flame_Anchor_A/B/C heights
    const sGroup = new THREE.Group();
    sGroup.name = "InstancedCandleFlameAnchors";
    const candleAnchorNodes: THREE.Object3D[] = [];
    CANDLE_INSTANCES.forEach((item, idx) => {
      const anchorObj = new THREE.Object3D();
      anchorObj.name = `CandleCluster_Flame_Anchor_${idx + 1}`;
      const h = variantAnchorHeights[item.variant] * item.scale;
      anchorObj.position.set(item.pos[0], item.pos[1] + h, item.pos[2]);
      sGroup.add(anchorObj);
      candleAnchorNodes.push(anchorObj);
    });

    return {
      prosceniumCurtain: pCurtain,
      mirror: mir,
      chandelier: chand,
      candelabraLeft: candL,
      candelabraRight: candR,
      candleSubMeshes: subMeshes,
      // Order: [0..4] Left candelabra 1..5, [5..9] Right candelabra 1..5, [10..17] Chandelier 1..8, [18..32] 15 floor/table candles
      allFlameAnchors: [
        ...candLAnchors,
        ...candRAnchors,
        ...chandAnchors,
        ...candleAnchorNodes,
      ],
      staticAnchorsGroup: sGroup,
    };
  }, [
    curtainGltf.scene,
    mirrorGltf.scene,
    chandelierGltf.scene,
    candelabraGltf.scene,
    candleGltf.scene,
  ]);

  // Populate InstancedMeshes for Candle_A/B/C once on mount
  const candleMeshRefs = useRef<(THREE.InstancedMesh | null)[]>([]);
  useEffect(() => {
    const dummy = new THREE.Object3D();
    candleSubMeshes.forEach((sm, smIdx) => {
      const im = candleMeshRefs.current[smIdx];
      if (!im) return;
      const items = CANDLE_INSTANCES.filter((c) => c.variant === sm.variant);
      items.forEach((item, i) => {
        dummy.position.set(item.pos[0], item.pos[1], item.pos[2]);
        dummy.rotation.set(0, item.rotY, 0);
        dummy.scale.setScalar(item.scale);
        dummy.updateMatrix();
        im.setMatrixAt(i, dummy.matrix);
      });
      im.instanceMatrix.needsUpdate = true;
    });
  }, [candleSubMeshes]);

  // Flame intensities array (33 total: 10 candelabra + 8 chandelier + 15 clustered candles)
  const flameIntensitiesRef = useRef<number[]>(new Array(33).fill(1.0));

  useFrame((_, delta) => {
    if (world !== "redroom" && previousWorld !== "redroom") return;
    const t = frame.time;
    const p2 = frame.dampedProgress["R2"] ?? 0;
    const p3 = frame.dampedProgress["R3"] ?? 0;
    const p4 = frame.dampedProgress["R4"] ?? 0;

    // 1. Chandelier swaying ±1.5° (0.02618 rad) at 0.12 Hz from its origin (0, 5.2, 0.4)
    if (chandelierRef.current) {
      chandelierRef.current.rotation.z =
        Math.sin(t * 0.12 * Math.PI * 2) * 0.02618;
      chandelierRef.current.rotation.x =
        Math.cos(t * 0.08 * Math.PI * 2) * 0.014;
    }

    // 3. R2 Story: Candles flare +20% for 300 ms when each line lands
    const storyIdx = p2 < 0.34 ? 0 : p2 < 0.67 ? 1 : 2;
    if (storyIdx !== prevStoryIdx.current) {
      prevStoryIdx.current = storyIdx;
      storyFlareTimer.current = 0.3;
    }
    let flareBonus = 0;
    if (storyFlareTimer.current > 0) {
      storyFlareTimer.current -= delta;
      flareBonus = Math.max(0, (storyFlareTimer.current / 0.3) * 0.25);
    }

    // 4. R3 Dress code candle ignition progression on Flame_Anchor_1..5:
    // Left candelabra anchors 1–3 ignite on lines 1–3; right candelabra anchors 4–5 (and remaining) ignite on line 4
    const inR3 = p3 > 0.01 && p4 < 0.05;
    const c1 = !inR3 || p3 > 0.02 ? 1.15 + flareBonus : 0.22;
    const c2 = !inR3 || p3 > 0.24 ? 1.15 + flareBonus : 0.22;
    const c3 = !inR3 || p3 > 0.48 ? 1.15 + flareBonus : 0.22;
    const c45 = !inR3 || p3 > 0.7 ? 1.2 + flareBonus : 0.22;

    // Left candelabra Flame_Anchor_1..5 (indices 0..4)
    flameIntensitiesRef.current[0] = c1;
    flameIntensitiesRef.current[1] = c2;
    flameIntensitiesRef.current[2] = c3;
    flameIntensitiesRef.current[3] = c45;
    flameIntensitiesRef.current[4] = c45;
    // Right candelabra Flame_Anchor_1..5 (indices 5..9)
    flameIntensitiesRef.current[5] = c1;
    flameIntensitiesRef.current[6] = c2;
    flameIntensitiesRef.current[7] = c3;
    flameIntensitiesRef.current[8] = c45;
    flameIntensitiesRef.current[9] = c45;
    // Chandelier (10..17) & Clustered candles (18..32)
    for (let i = 10; i < 33; i++) {
      flameIntensitiesRef.current[i] = 1.05 + flareBonus;
    }

    // 5. Max 3 Real Point Lights with 8–14 Hz candle noise flicker
    const flicker1 =
      1 + (Math.sin(t * 11.2) * 0.1 + Math.cos(t * 13.7) * 0.08) * 0.18;
    const flicker2 =
      1 + (Math.sin(t * 8.6) * 0.1 + Math.cos(t * 12.1) * 0.08) * 0.18;

    if (candleLight1Ref.current) {
      candleLight1Ref.current.intensity = (2.4 + flareBonus) * flicker1;
    }
    if (candleLight2Ref.current) {
      candleLight2Ref.current.intensity = (2.2 + flareBonus) * flicker2;
    }
    if (badgePointLightRef.current) {
      badgePointLightRef.current.intensity = 2.4;
    }
  });

  return (
    <group name="RedRoomSet">
      {/* Atmosphere Ambient + angled crimson key & warm fill for gilded frames, velvet & bronze */}
      <ambientLight intensity={0.15} color="#1C0304" />
      <directionalLight
        position={[-4.0, 5.0, 3.5]}
        intensity={0.45}
        color="#FFE0B0"
      />
      <directionalLight
        position={[3.5, 4.0, 3.0]}
        intensity={0.2}
        color="#FFB36B"
      />

      <SpareLights directional={1} />

      {/* Real Point Light 1: Left candelabra (#FF9A4A, decay 2) */}
      <pointLight
        ref={candleLight1Ref}
        position={[-2.6, 2.1, 0.5]}
        color="#FF9A4A"
        intensity={2.4}
        distance={12}
        decay={2}
      />

      {/* Real Point Light 2: Right candelabra (#FF9A4A, decay 2) */}
      <pointLight
        ref={candleLight2Ref}
        position={[2.6, 2.1, 0.5]}
        color="#FF9A4A"
        intensity={2.2}
        distance={12}
        decay={2}
      />

      {/* Real Point Light 3: Badge neon & table illumination (#FF2A1F) */}
      <pointLight
        ref={badgePointLightRef}
        position={[0, 1.85, 0.9]}
        color="#FF2A1F"
        intensity={2.4}
        distance={8}
        decay={2}
      />

      {/* Stage Box Floor: Black-red lacquer with reflections (Part 5.4) */}
      <StageFloor world="redroom" />

      {/* Stage Back Wall */}
      <mesh position={[0, 3.0, -1.2]}>
        <planeGeometry args={[16, 8]} />
        <meshStandardMaterial color="#0A0203" roughness={0.6} />
      </mesh>

      {/* Left Wall with Gilded Framed Poster (Part 8 R5) */}
      <group position={[-4.5, 2.2, 2.0]} rotation={[0, Math.PI * 0.35, 0]}>
        <mesh scale={[1.4, 1.85, 0.08]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            color="#8E6A28"
            metalness={0.8}
            roughness={0.3}
          />
        </mesh>
        <mesh position={[0, 0, 0.05]} scale={[1.2, 1.65, 1]}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial map={posterTex} toneMapped={false} />
        </mesh>
      </group>

      {/* ONE instance of curtain-open.glb as static proscenium at z = 2.6, uniform scale 0.85, grounded */}
      <group
        name="StaticProsceniumCurtain"
        position={[0, 0, 2.6]}
        scale={[0.85, 0.85, 0.85]}
      >
        <primitive object={prosceniumCurtain} />
      </group>

      {/* Swaying Chandelier hanging from ceiling at (0, 5.75, 0.4), scale 0.95 */}
      <group
        ref={chandelierRef}
        position={[0, 5.75, 0.4]}
        scale={[0.95, 0.95, 0.95]}
      >
        <primitive object={chandelier} />
      </group>

      {/* Gilded Mirror centred on back wall, bottom at (0, 0.3, -0.6), uniform scale 1.0 */}
      <group position={[0, 0.3, -0.6]} scale={[1, 1, 1]}>
        <primitive object={mirror} />
      </group>
      {/* Fog & finger-wipe shader applied directly to Mirror_Glass node */}
      <MirrorFog mirrorScene={mirror} />

      {/* Left Velvet-Draped Plinth (0.9m tall) + Grounded Candelabra at (-2.6, 0, 0.2), scale 1.0 */}
      <group name="LeftCandelabraPlinth" position={[-2.6, 0, 0.2]}>
        {/* Base gold trim ring */}
        <mesh position={[0, 0.015, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.31, 0.31, 0.03, 32]} />
          <meshStandardMaterial
            color="#D4AF6A"
            metalness={0.85}
            roughness={0.25}
          />
        </mesh>
        {/* Velvet-draped shaft */}
        <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.26, 0.3, 0.87, 32]} />
          <meshStandardMaterial
            color="#52060A"
            roughness={0.76}
            metalness={0.08}
          />
        </mesh>
        {/* Top gold trim capital */}
        <mesh position={[0, 0.885, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.27, 0.27, 0.03, 32]} />
          <meshStandardMaterial
            color="#D4AF6A"
            metalness={0.85}
            roughness={0.25}
          />
        </mesh>
        <group position={[0, 0.9, 0]} scale={[1, 1, 1]}>
          <primitive object={candelabraLeft} />
        </group>
      </group>

      {/* Right Velvet-Draped Plinth (0.9m tall) + Grounded Candelabra at (2.6, 0, 0.2), scale 1.0 */}
      <group name="RightCandelabraPlinth" position={[2.6, 0, 0.2]}>
        {/* Base gold trim ring */}
        <mesh position={[0, 0.015, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.31, 0.31, 0.03, 32]} />
          <meshStandardMaterial
            color="#D4AF6A"
            metalness={0.85}
            roughness={0.25}
          />
        </mesh>
        {/* Velvet-draped shaft */}
        <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.26, 0.3, 0.87, 32]} />
          <meshStandardMaterial
            color="#52060A"
            roughness={0.76}
            metalness={0.08}
          />
        </mesh>
        {/* Top gold trim capital */}
        <mesh position={[0, 0.885, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.27, 0.27, 0.03, 32]} />
          <meshStandardMaterial
            color="#D4AF6A"
            metalness={0.85}
            roughness={0.25}
          />
        </mesh>
        <group position={[0, 0.9, 0]} scale={[1, 1, 1]}>
          <primitive object={candelabraRight} />
        </group>
      </group>

      {/* Instanced Candles (Candle_A, Candle_B, Candle_C in 5 clusters of 3 = 15 candles) */}
      <group name="InstancedCandles">
        {candleSubMeshes.map((sm, idx) => (
          <instancedMesh
            key={idx}
            ref={(el) => {
              candleMeshRefs.current[idx] = el;
            }}
            args={[sm.geometry, sm.material, 5]}
          />
        ))}
        <primitive object={staticAnchorsGroup} />
      </group>

      {/* All 33 Flames anchored to Flame_Anchor_1..5 (candelabras), Flame_Anchor_1..8 (chandelier), and Flame_Anchor_A/B/C (candles) */}
      <AnchorFlames
        anchors={allFlameAnchors}
        worldId="redroom"
        scale={0.18}
        intensitiesRef={flameIntensitiesRef}
      />

      {/* Interactive Invitation Tray on Procedural Round Velvet Side Table at (0, 0, 2.2) */}
      <InvitationTray />
    </group>
  );
}
