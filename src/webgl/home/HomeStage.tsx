'use client';

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useGLTF, Environment, Lightformer } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { frame } from '@/state/frame';
import { useStore } from '@/state/store';
import { Beams } from './Beams';
import { AnchorFlames, findAnchorNodes, groundObjectToY } from '../fx/Flame';

const SPRING_OMEGA = 2 * Math.PI * 2.2; // f = 2.2 Hz
const SPRING_ZETA = 0.65;

function stepSpring(
  pos: number,
  vel: number,
  target: number,
  dt: number
): [number, number] {
  const force = -SPRING_OMEGA * SPRING_OMEGA * (pos - target) - 2 * SPRING_ZETA * SPRING_OMEGA * vel;
  const nextVel = vel + force * dt;
  const nextPos = pos + nextVel * dt;
  return [nextPos, nextVel];
}

export function HomeStage() {
  const { size } = useThree();
  const world = useStore((s) => s.world);
  const previousWorld = useStore((s) => s.previousWorld);
  const hoverDoor = useStore((s) => s.hoverDoor);
  const loaderPopped = useStore((s) => s.loaderPopped);

  const redDoorGltf = useGLTF('/models/door-redroom.glb');
  const diwaliDoorGltf = useGLTF('/models/door-diwali.glb');

  const redDoorRef = useRef<THREE.Group>(null);
  const diwaliDoorRef = useRef<THREE.Group>(null);

  // Max 3 real point lights in Home (Global Rule 7)
  const rimPointLightRef = useRef<THREE.PointLight>(null);
  const leftPointLightRef = useRef<THREE.PointLight>(null);
  const rightPointLightRef = useRef<THREE.PointLight>(null);

  // Floor glow cards for light leaks under doors
  const redLeakMeshRef = useRef<THREE.Mesh>(null);
  const diwaliLeakMeshRef = useRef<THREE.Mesh>(null);

  // Prepare grounded doors, native hinge nodes (Leaf, Leaf_L, Leaf_R), bells, glass inlays, and flame anchors
  const {
    redScene,
    diwaliScene,
    redLeaf,
    diwaliLeafL,
    diwaliLeafR,
    bellL,
    bellR,
    glassMaterials,
    redLeakMaterials,
    diwaliLeakMaterials,
    doorFlameAnchors,
  } = useMemo(() => {
    const rScene = redDoorGltf.scene.clone(true);
    const dScene = diwaliDoorGltf.scene.clone(true);

    // Ground both standing doors using their world-space Box3 so threshold sits at y = 0 (Global Rule 2)
    groundObjectToY(rScene, 0);
    groundObjectToY(dScene, 0);

    const rLeaf = rScene.getObjectByName('Leaf') ?? null;
    const dLeafL = dScene.getObjectByName('Leaf_L') ?? null;
    const dLeafR = dScene.getObjectByName('Leaf_R') ?? null;
    const bL = dScene.getObjectByName('Bell_L') ?? null;
    const bR = dScene.getObjectByName('Bell_R') ?? null;

    const gMats: THREE.MeshStandardMaterial[] = [];
    const rLeakMats: THREE.MeshStandardMaterial[] = [];
    const dLeakMats: THREE.MeshStandardMaterial[] = [];

    // Clone only animated materials (Glass_Inlays and Light_Leak) per Global Rule 4
    ['Glass_Inlays', 'Glass_Inlays_R'].forEach((name) => {
      const node = dScene.getObjectByName(name) as THREE.Mesh | undefined;
      if (node && node.material) {
        const orig = Array.isArray(node.material) ? node.material[0] : node.material;
        const cloned = (orig as THREE.MeshStandardMaterial).clone();
        cloned.userData.baseEmissive = cloned.emissiveIntensity ?? 0.4;
        node.material = cloned;
        gMats.push(cloned);
      }
    });

    const rLeakGroup = rScene.getObjectByName('Light_Leak');
    if (rLeakGroup) {
      rLeakGroup.traverse((c) => {
        if ((c as THREE.Mesh).isMesh) {
          const m = c as THREE.Mesh;
          const orig = Array.isArray(m.material) ? m.material[0] : m.material;
          if (orig) {
            const cloned = (orig as THREE.MeshStandardMaterial).clone();
            cloned.userData.baseEmissive = cloned.emissiveIntensity ?? 1.0;
            m.material = cloned;
            rLeakMats.push(cloned);
          }
        }
      });
    }

    const dLeakGroup = dScene.getObjectByName('Light_Leak');
    if (dLeakGroup) {
      dLeakGroup.traverse((c) => {
        if ((c as THREE.Mesh).isMesh) {
          const m = c as THREE.Mesh;
          const orig = Array.isArray(m.material) ? m.material[0] : m.material;
          if (orig) {
            const cloned = (orig as THREE.MeshStandardMaterial).clone();
            cloned.userData.baseEmissive = cloned.emissiveIntensity ?? 1.0;
            m.material = cloned;
            dLeakMats.push(cloned);
          }
        }
      });
    }

    // Flame anchors from both doors (Flame_Anchor_L, Flame_Anchor_R on each)
    const rAnchors = findAnchorNodes(rScene, 'Flame_Anchor');
    const dAnchors = findAnchorNodes(dScene, 'Flame_Anchor');

    return {
      redScene: rScene,
      diwaliScene: dScene,
      redLeaf: rLeaf,
      diwaliLeafL: dLeafL,
      diwaliLeafR: dLeafR,
      bellL: bL,
      bellR: bR,
      glassMaterials: gMats,
      redLeakMaterials: rLeakMats,
      diwaliLeakMaterials: dLeakMats,
      doorFlameAnchors: [...rAnchors, ...dAnchors],
    };
  }, [redDoorGltf.scene, diwaliDoorGltf.scene]);

  const flameIntensitiesRef = useRef<number[]>([0, 0, 0, 0]);

  // Spring state for door angles (f = 2.2 Hz) and bell pendulum state
  const redAngle = useRef(0);
  const redVel = useRef(0);
  const diwaliAngle = useRef(0);
  const diwaliVel = useRef(0);
  const bellSwing = useRef(0);
  const bellSwingVel = useRef(0);
  const rimRiseTimer = useRef(0);
  const rimIntensity = useRef(0);

  useFrame((_, delta) => {
    if (world !== 'home' && previousWorld !== 'home') return;
    const dt = Math.min(delta, 1 / 30);
    const t = frame.time;
    const p2 = frame.dampedProgress['H2'] ?? 0;
    const p4 = frame.dampedProgress['H4'] ?? 0;
    const p5 = frame.dampedProgress['H5'] ?? 0;
    const tr = frame.transition;

    // 1. Point Light 1: Rim light behind badge (rises over 900 ms on loader handoff)
    if (loaderPopped) {
      rimRiseTimer.current += dt;
      const targetRim = p4 > 0.05 ? THREE.MathUtils.lerp(2.8, 0.8, p4) : 2.8;
      const tNorm = Math.min(1, rimRiseTimer.current / 0.9);
      rimIntensity.current = THREE.MathUtils.damp(rimIntensity.current, targetRim * tNorm, 6, dt);
    } else {
      rimIntensity.current = 0;
    }

    if (rimPointLightRef.current) {
      if (p2 > 0.05 && p2 < 0.34) {
        const sub = p2 / 0.34;
        rimPointLightRef.current.position.set(
          THREE.MathUtils.lerp(-0.6, 0.6, sub),
          1.5,
          0.35
        );
        rimPointLightRef.current.intensity = 2.6 * Math.sin(sub * Math.PI);
      } else {
        rimPointLightRef.current.position.set(0, 2.4, -1.8);
        rimPointLightRef.current.intensity = rimIntensity.current;
      }
    }

    // 2. Doors placement: Desktop (-1.65, 0, 0) & (1.65, 0, 0) at scale 0.78; Mobile stacked vertically
    const isPortrait = size.width < size.height;
    const redTargetX = isPortrait ? 0 : -1.65;
    const diwaliTargetX = isPortrait ? 0 : 1.65;
    const redOpenY = isPortrait ? 1.55 : 0;
    const diwaliOpenY = isPortrait ? -0.15 : 0;
    const doorTargetScale = isPortrait ? 0.42 : 0.78;

    let redTargetY = -8.0;
    let diwaliTargetY = -8.0;
    let doorsVisible = false;

    const effP4 = Math.max(p4, frame.progress['H4'] ?? 0);
    const effP5 = Math.max(p5, frame.progress['H5'] ?? 0);

    if (effP5 > 0.001 || effP4 > 0.88 || tr.type === 'T1' || tr.type === 'T2') {
      redTargetY = redOpenY;
      diwaliTargetY = diwaliOpenY;
      doorsVisible = true;
    } else if (effP4 > 0.65) {
      doorsVisible = true;
      const riseP = THREE.MathUtils.clamp((effP4 - 0.65) / 0.23, 0, 1);
      redTargetY = THREE.MathUtils.lerp(-8.0, redOpenY, riseP);
      diwaliTargetY = THREE.MathUtils.lerp(-8.0, diwaliOpenY, riseP);
    }

    if (redDoorRef.current) {
      const wasHidden = !redDoorRef.current.visible;
      redDoorRef.current.visible = doorsVisible;
      redDoorRef.current.position.x = redTargetX;
      redDoorRef.current.position.y =
        frame.snapCamera || (wasHidden && effP4 > 0.8)
          ? redTargetY
          : THREE.MathUtils.damp(redDoorRef.current.position.y, redTargetY, 10, dt);
      redDoorRef.current.scale.setScalar(doorTargetScale);
    }

    if (diwaliDoorRef.current) {
      const wasHidden = !diwaliDoorRef.current.visible;
      diwaliDoorRef.current.visible = doorsVisible;
      diwaliDoorRef.current.position.x = diwaliTargetX;
      diwaliDoorRef.current.position.y =
        frame.snapCamera || (wasHidden && effP4 > 0.8)
          ? diwaliTargetY
          : THREE.MathUtils.damp(diwaliDoorRef.current.position.y, diwaliTargetY, 10, dt);
      diwaliDoorRef.current.scale.setScalar(doorTargetScale);
    }

    // 3. Door Articulation via native Leaf / Leaf_L / Leaf_R nodes with f = 2.2 Hz spring
    const targetRedAngle = hoverDoor === 'redroom' ? -0.1745 : 0;
    const targetDiwaliAngle = hoverDoor === 'diwali' ? 0.1745 : 0;

    if (tr.type === 'T1' && tr.doorProgress > 0) {
      redAngle.current = THREE.MathUtils.lerp(-0.1745, -1.309, tr.doorProgress);
      redVel.current = 0;
    } else {
      const [nextR, nextRV] = stepSpring(redAngle.current, redVel.current, targetRedAngle, dt);
      redAngle.current = nextR;
      redVel.current = nextRV;
    }

    const prevDiwali = diwaliAngle.current;
    if (tr.type === 'T2' && tr.doorProgress > 0) {
      diwaliAngle.current = THREE.MathUtils.lerp(0.1745, 1.2217, tr.doorProgress);
      diwaliVel.current = (diwaliAngle.current - prevDiwali) / Math.max(dt, 0.001);
    } else {
      const [nextD, nextDV] = stepSpring(diwaliAngle.current, diwaliVel.current, targetDiwaliAngle, dt);
      diwaliAngle.current = nextD;
      diwaliVel.current = nextDV;
    }

    if (redLeaf) {
      redLeaf.rotation.y = redAngle.current;
    }
    if (diwaliLeafL) {
      diwaliLeafL.rotation.y = -diwaliAngle.current;
    }
    if (diwaliLeafR) {
      diwaliLeafR.rotation.y = diwaliAngle.current;
    }

    // 4. Diwali bells swing when leaves move
    const leafImpulse = (diwaliAngle.current - prevDiwali) * 14.0;
    const bellAccel = -38.0 * bellSwing.current - 3.2 * bellSwingVel.current + leafImpulse;
    bellSwingVel.current += bellAccel * dt;
    bellSwing.current += bellSwingVel.current * dt;
    const idleChime = hoverDoor === 'diwali' ? Math.sin(t * 6.5) * 0.035 : 0;
    if (bellL) {
      bellL.rotation.z = bellSwing.current + idleChime;
      bellL.rotation.x = bellSwing.current * 0.5;
    }
    if (bellR) {
      bellR.rotation.z = -bellSwing.current - idleChime;
      bellR.rotation.x = bellSwing.current * 0.5;
    }

    // 5. Diwali Glass_Inlays glow brighter on hover
    const targetGlassEmissive =
      tr.type === 'T2' ? 2.6 : hoverDoor === 'diwali' ? 1.65 : 0.45;
    for (let i = 0; i < glassMaterials.length; i++) {
      const gm = glassMaterials[i];
      gm.emissiveIntensity = THREE.MathUtils.damp(gm.emissiveIntensity, targetGlassEmissive, 10, dt);
    }

    // 6. Light leaks & Point Lights 2 & 3 (Left Red #FF2A1F, Right Gold #FFC46B)
    const leakBreathe = 1 + Math.sin(t * 1.256) * 0.2;
    const redSpill =
      tr.type === 'T1' ? 2.5 + tr.doorProgress * 4.5 : hoverDoor === 'redroom' ? 2.5 : 1.0;
    const diwaliSpill =
      tr.type === 'T2' ? 2.5 + tr.doorProgress * 5.0 : hoverDoor === 'diwali' ? 2.5 : 1.0;

    const redDim =
      tr.type === 'T2' ? 1.0 - tr.doorProgress * 0.85 : hoverDoor === 'diwali' ? 0.6 : 1.0;
    const diwaliDim =
      tr.type === 'T1' ? 1.0 - tr.doorProgress * 0.85 : hoverDoor === 'redroom' ? 0.6 : 1.0;

    const doorsActive = effP4 > 0.35 || effP5 > 0.01 || tr.type === 'T1' || tr.type === 'T2';

    // Update flame intensities on Flame_Anchor_L / Flame_Anchor_R
    const rFlameInt = doorsVisible ? 1.15 * redDim : 0;
    const dFlameInt = doorsVisible ? 1.15 * diwaliDim : 0;
    flameIntensitiesRef.current[0] = rFlameInt;
    flameIntensitiesRef.current[1] = rFlameInt;
    flameIntensitiesRef.current[2] = dFlameInt;
    flameIntensitiesRef.current[3] = dFlameInt;

    // Update GLB Light_Leak emissive intensities
    for (let i = 0; i < redLeakMaterials.length; i++) {
      const m = redLeakMaterials[i];
      m.emissiveIntensity = doorsActive ? (m.userData.baseEmissive ?? 1) * leakBreathe * redSpill * redDim : 0;
    }
    for (let i = 0; i < diwaliLeakMaterials.length; i++) {
      const m = diwaliLeakMaterials[i];
      m.emissiveIntensity = doorsActive ? (m.userData.baseEmissive ?? 1) * leakBreathe * diwaliSpill * diwaliDim : 0;
    }

    if (leftPointLightRef.current) {
      leftPointLightRef.current.position.set(redTargetX, redOpenY + 0.5, 0.45);
      const splitAmt = Math.min(1, Math.max(p4 * 1.4, doorsActive ? 0.8 : 0));
      leftPointLightRef.current.intensity =
        (p4 > 0.05 || doorsActive) ? 1.8 * splitAmt * leakBreathe * redSpill * redDim : 0;
    }
    if (rightPointLightRef.current) {
      rightPointLightRef.current.position.set(diwaliTargetX, diwaliOpenY + 0.5, 0.45);
      const splitAmt = Math.min(1, Math.max(p4 * 1.4, doorsActive ? 0.8 : 0));
      rightPointLightRef.current.intensity =
        (p4 > 0.05 || doorsActive) ? 1.8 * splitAmt * leakBreathe * diwaliSpill * diwaliDim : 0;
    }

    if (redLeakMeshRef.current) {
      redLeakMeshRef.current.position.set(redTargetX, redOpenY + 0.01, 0.25);
      redLeakMeshRef.current.scale.set(1.1 * redSpill, 0.4 * redSpill, 1);
      const mat = redLeakMeshRef.current.material as THREE.MeshBasicMaterial;
      if (mat) mat.opacity = doorsActive ? Math.min(1, 0.45 * leakBreathe * redSpill * redDim) : 0;
    }
    if (diwaliLeakMeshRef.current) {
      diwaliLeakMeshRef.current.position.set(diwaliTargetX, diwaliOpenY + 0.01, 0.25);
      diwaliLeakMeshRef.current.scale.set(1.1 * diwaliSpill, 0.4 * diwaliSpill, 1);
      const mat = diwaliLeakMeshRef.current.material as THREE.MeshBasicMaterial;
      if (mat) mat.opacity = doorsActive ? Math.min(1, 0.45 * leakBreathe * diwaliSpill * diwaliDim) : 0;
    }
  });

  return (
    <group name="HomeStage">
      {/* Volumetric beam cones per Part 5.4 */}
      <Beams />

      {/* Art-directed reflections per BRIEF.md Part 5.4 */}
      <Environment resolution={256} environmentIntensity={0.55}>
        <Lightformer
          form="rect"
          intensity={2.8}
          color="#FF4FD8"
          scale={[2.5, 12, 1]}
          position={[6.5, 2.5, 0.5]}
          target={[0, 1.5, 0]}
        />
        <Lightformer
          form="rect"
          intensity={2.4}
          color="#FFFFFF"
          scale={[2.0, 12, 1]}
          position={[-6.5, 2.5, 0.5]}
          target={[0, 1.5, 0]}
        />
        <Lightformer
          form="rect"
          intensity={1.5}
          color="#FFFFFF"
          scale={[8, 6, 1]}
          position={[0, 8.5, -1.0]}
          target={[0, 1.5, 0]}
        />
      </Environment>

      {/* Directional & Ambient Lighting per Part 5.4 */}
      <ambientLight intensity={0.35} color="#0B0E14" />
      <directionalLight position={[-4.0, 5.5, 4.0]} intensity={2.4} color="#FFFFFF" />
      <directionalLight position={[3.5, 2.5, 3.5]} intensity={1.5} color="#FFF5FA" />

      {/* Max 3 Real Point Lights in Home (Global Rule 7) */}
      <pointLight
        ref={rimPointLightRef}
        position={[0, 2.4, -1.8]}
        intensity={0}
        color="#D9DCE3"
        distance={6}
      />
      <pointLight
        ref={leftPointLightRef}
        position={[-1.65, 0.5, 0.45]}
        intensity={0}
        color="#FF2A1F"
        distance={5.5}
      />
      <pointLight
        ref={rightPointLightRef}
        position={[1.65, 0.5, 0.45]}
        intensity={0}
        color="#FFC46B"
        distance={5.5}
      />

      {/* Stage Floor: Glossy dark floor (Part 5.4) */}
      <mesh name="StageFloor" position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#06080C" roughness={0.15} metalness={0.6} />
      </mesh>

      {/* Floor glow cards for light leaks under doors */}
      <mesh ref={redLeakMeshRef} position={[-1.65, 0.01, 0.25]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.2, 0.5]} />
        <meshBasicMaterial
          color="#FF2A1F"
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh ref={diwaliLeakMeshRef} position={[1.65, 0.01, 0.25]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.2, 0.5]} />
        <meshBasicMaterial
          color="#F2D38B"
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Door 1: Red Room GLB at (-1.65, 0, 0), uniform scale 0.78, grounded */}
      <group
        ref={redDoorRef}
        visible={false}
        position={[-1.65, -8.0, 0]}
        scale={[0.78, 0.78, 0.78]}
      >
        <primitive object={redScene} />
      </group>

      {/* Door 2: Diwali GLB at (1.65, 0, 0), uniform scale 0.78, grounded */}
      <group
        ref={diwaliDoorRef}
        visible={false}
        position={[1.65, -8.0, 0]}
        scale={[0.78, 0.78, 0.78]}
      >
        <primitive object={diwaliScene} />
      </group>

      {/* Sconce & diya flames anchored to Flame_Anchor_L / Flame_Anchor_R on both doors */}
      <AnchorFlames
        anchors={doorFlameAnchors}
        worldId="home"
        scale={0.18}
        intensitiesRef={flameIntensitiesRef}
      />
    </group>
  );
}
