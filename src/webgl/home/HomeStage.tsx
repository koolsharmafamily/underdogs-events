'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { frame } from '@/state/frame';
import { useStore } from '@/state/store';
import { Beams } from './Beams';

// Finished GLB models in public/models/
useGLTF.preload('/models/door-redroom.glb');
useGLTF.preload('/models/door-diwali.glb');

export function HomeStage() {
  const hoverDoor = useStore((s) => s.hoverDoor);
  const loaderPopped = useStore((s) => s.loaderPopped);

  const redDoorGltf = useGLTF('/models/door-redroom.glb');
  const diwaliDoorGltf = useGLTF('/models/door-diwali.glb');

  const redDoorRef = useRef<THREE.Group>(null);
  const diwaliDoorRef = useRef<THREE.Group>(null);

  // Hinge groups for physical door articulation (Part 7 H5 & Part 10 T1/T2)
  const redHingeRef = useRef<THREE.Group>(null);
  const diwaliLeftHingeRef = useRef<THREE.Group>(null);
  const diwaliRightHingeRef = useRef<THREE.Group>(null);

  // Lights
  const magentaSpotRef = useRef<THREE.SpotLight>(null);
  const streakLightRef = useRef<THREE.PointLight>(null);
  const splitLeftLightRef = useRef<THREE.PointLight>(null);
  const splitRightLightRef = useRef<THREE.PointLight>(null);
  const redLeakLightRef = useRef<THREE.PointLight>(null);
  const diwaliLeakLightRef = useRef<THREE.PointLight>(null);

  // Leak meshes
  const redLeakMeshRef = useRef<THREE.Mesh>(null);
  const diwaliLeakMeshRef = useRef<THREE.Mesh>(null);

  // Cloned scenes with articulated hinge pivots
  const { redScene, diwaliScene } = useMemo(() => {
    const rScene = redDoorGltf.scene.clone(true);
    const dScene = diwaliDoorGltf.scene.clone(true);

    // Setup Red Room hinge pivot at x = -0.55
    const rHinge = new THREE.Group();
    rHinge.name = 'RedRoomHingePivot';
    rHinge.position.set(-0.55, 0, 0);

    const rLeafNodes = ['Velvet_Tufted', 'Brass_Edge_Trim', 'Tuft_Buttons'];
    rLeafNodes.forEach((name) => {
      const node = rScene.getObjectByName(name);
      if (node) {
        node.position.x += 0.55;
        rHinge.add(node);
      }
    });
    rScene.add(rHinge);

    // Setup Diwali left hinge at x = -0.55 & right hinge at x = +0.55
    const dLeftHinge = new THREE.Group();
    dLeftHinge.name = 'DiwaliLeftHingePivot';
    dLeftHinge.position.set(-0.55, 0, 0);

    const dRightHinge = new THREE.Group();
    dRightHinge.name = 'DiwaliRightHingePivot';
    dRightHinge.position.set(0.55, 0, 0);

    const dLeftNodes = ['Leaf_Body_L', 'Lotus_Petals_L', 'Lotus_Centres_L', 'Studs_L', 'Glass_Inlays'];
    dLeftNodes.forEach((name) => {
      const node = dScene.getObjectByName(name);
      if (node) {
        node.position.x += 0.55;
        dLeftHinge.add(node);
      }
    });

    const dRightNodes = ['Leaf_Body_R', 'Lotus_Petals_R', 'Lotus_Centres_R', 'Studs_R', 'Glass_Inlays_R'];
    dRightNodes.forEach((name) => {
      const node = dScene.getObjectByName(name);
      if (node) {
        node.position.x -= 0.55;
        dRightHinge.add(node);
      }
    });

    dScene.add(dLeftHinge);
    dScene.add(dRightHinge);

    return { redScene: rScene, diwaliScene: dScene };
  }, [redDoorGltf, diwaliDoorGltf]);

  // Wire hinge refs to newly instantiated groups
  useEffect(() => {
    if (redDoorRef.current) {
      redHingeRef.current = redDoorRef.current.getObjectByName('RedRoomHingePivot') as THREE.Group;
    }
    if (diwaliDoorRef.current) {
      diwaliLeftHingeRef.current = diwaliDoorRef.current.getObjectByName('DiwaliLeftHingePivot') as THREE.Group;
      diwaliRightHingeRef.current = diwaliDoorRef.current.getObjectByName('DiwaliRightHingePivot') as THREE.Group;
    }
  }, [redScene, diwaliScene]);

  // Damped spring values for door angles (f = 1.6 Hz, zeta = 0.6)
  const redAngle = useRef(0);
  const diwaliAngle = useRef(0);
  const rimRiseTimer = useRef(0);
  const rimIntensity = useRef(0);

  useFrame((_, delta) => {
    const t = frame.time;
    const p2 = frame.dampedProgress['H2'] ?? 0;
    const p4 = frame.dampedProgress['H4'] ?? 0;
    const p5 = frame.dampedProgress['H5'] ?? 0;
    const tr = frame.transition;

    // 1. Magenta Rim Light Rise over 900 ms on loader handoff (Part 7 H0)
    if (loaderPopped) {
      rimRiseTimer.current += delta;
      const targetRim = p4 > 0.05 ? THREE.MathUtils.lerp(2.8, 0.4, p4) : 2.8;
      const tNorm = Math.min(1, rimRiseTimer.current / 0.9);
      rimIntensity.current = THREE.MathUtils.damp(rimIntensity.current, targetRim * tNorm, 4, delta);
    } else {
      rimIntensity.current = 0;
    }

    if (magentaSpotRef.current) {
      magentaSpotRef.current.intensity = rimIntensity.current;
    }

    // 2. H2 Statement 1: Magenta Light Streak sliding along chrome rim
    if (streakLightRef.current) {
      if (p2 > 0.05 && p2 < 0.34) {
        const sub = p2 / 0.34;
        streakLightRef.current.position.set(
          THREE.MathUtils.lerp(-0.6, 0.6, sub),
          1.5,
          0.1
        );
        streakLightRef.current.intensity = 2.4 * Math.sin(sub * Math.PI);
      } else {
        streakLightRef.current.intensity = 0;
      }
    }

    // 3. H4 Split Rim Light: Left Red (#FF2A1F), Right Pink-Gold (#FFC46B to #FF6FB0)
    if (splitLeftLightRef.current && splitRightLightRef.current) {
      if (p4 > 0.05 || tr.type === 'T1' || tr.type === 'T2') {
        const splitAmt = Math.min(1, Math.max(p4 * 1.5, tr.doorProgress));
        const t1Flood = tr.type === 'T1' ? tr.doorProgress * 6.0 : 0;
        const t2Flood = tr.type === 'T2' ? tr.doorProgress * 6.0 : 0;
        splitLeftLightRef.current.intensity = splitAmt * 2.2 + t1Flood;
        splitRightLightRef.current.intensity = splitAmt * 2.2 + t2Flood;
      } else {
        splitLeftLightRef.current.intensity = 0;
        splitRightLightRef.current.intensity = 0;
      }
    }

    // 4. Doors emerging out of darkness at end of H4 (Part 7 H4: end of scene)
    let doorTargetY = -8.0;
    const doorTargetScale = 0.85;
    let doorsVisible = false;

    if (p5 > 0.01 || tr.type === 'T1' || tr.type === 'T2') {
      doorTargetY = 0;
      doorsVisible = true;
    } else if (p4 > 0.5) {
      doorsVisible = true;
      const riseP = (p4 - 0.5) / 0.5;
      doorTargetY = THREE.MathUtils.lerp(-8.0, 0, riseP);
    }

    if (redDoorRef.current) {
      redDoorRef.current.visible = doorsVisible;
      redDoorRef.current.position.y = frame.snapCamera
        ? doorTargetY
        : THREE.MathUtils.damp(redDoorRef.current.position.y, doorTargetY, 5, delta);
      redDoorRef.current.scale.setScalar(doorTargetScale);
    }
    if (diwaliDoorRef.current) {
      diwaliDoorRef.current.visible = doorsVisible;
      diwaliDoorRef.current.position.y = frame.snapCamera
        ? doorTargetY
        : THREE.MathUtils.damp(diwaliDoorRef.current.position.y, doorTargetY, 5, delta);
      diwaliDoorRef.current.scale.setScalar(doorTargetScale);
    }

    // 5. Door Articulation on Hover / Focus (Part 7 H5) & Transitions T1 / T2 (Part 10)
    // Hover: 10° = 0.1745 rad
    // T1 (0.00–0.55 s): Red door swings open 0 -> 75° (-1.309 rad)
    // T2 (0.00–0.55 s): Both Diwali door leaves open 0 -> 70° (1.2217 rad) + bells sway
    let targetRedAngle = hoverDoor === 'redroom' ? -0.1745 : 0;
    let targetDiwaliAngle = hoverDoor === 'diwali' ? 0.1745 : 0;

    if (tr.type === 'T1' && tr.doorProgress > 0) {
      targetRedAngle = THREE.MathUtils.lerp(-0.1745, -1.309, tr.doorProgress);
      redAngle.current = targetRedAngle;
    } else {
      redAngle.current = THREE.MathUtils.damp(redAngle.current, targetRedAngle, 6, delta);
    }

    if (tr.type === 'T2' && tr.doorProgress > 0) {
      const bellSway = Math.sin(t * 26) * 0.018 * Math.sin(tr.doorProgress * Math.PI);
      targetDiwaliAngle = THREE.MathUtils.lerp(0.1745, 1.2217, tr.doorProgress) + bellSway;
      diwaliAngle.current = targetDiwaliAngle;
    } else {
      diwaliAngle.current = THREE.MathUtils.damp(diwaliAngle.current, targetDiwaliAngle, 6, delta);
    }

    if (redHingeRef.current) {
      redHingeRef.current.rotation.y = redAngle.current;
    }
    if (diwaliLeftHingeRef.current) {
      diwaliLeftHingeRef.current.rotation.y = -diwaliAngle.current;
    }
    if (diwaliRightHingeRef.current) {
      diwaliRightHingeRef.current.rotation.y = diwaliAngle.current;
    }

    // 6. Light Leaks breathing at 0.2 Hz + 2.5x spill on hover + flood on T1/T2
    const leakBreathe = 1 + Math.sin(t * 1.256) * 0.2;
    const redSpill =
      tr.type === 'T1'
        ? 2.5 + tr.doorProgress * 4.5
        : hoverDoor === 'redroom'
          ? 2.5
          : 1.0;
    const diwaliSpill =
      tr.type === 'T2'
        ? 2.5 + tr.doorProgress * 5.0
        : hoverDoor === 'diwali'
          ? 2.5
          : 1.0;

    // Dim other door by 40% on hover, or 85% during transition
    const redDim =
      tr.type === 'T2'
        ? 1.0 - tr.doorProgress * 0.85
        : hoverDoor === 'diwali'
          ? 0.6
          : 1.0;
    const diwaliDim =
      tr.type === 'T1'
        ? 1.0 - tr.doorProgress * 0.85
        : hoverDoor === 'redroom'
          ? 0.6
          : 1.0;

    const doorsActive = p4 > 0.6 || p5 > 0.01 || tr.type === 'T1' || tr.type === 'T2';

    if (redLeakLightRef.current) {
      redLeakLightRef.current.intensity = doorsActive ? 1.5 * leakBreathe * redSpill * redDim : 0;
    }
    if (diwaliLeakLightRef.current) {
      diwaliLeakLightRef.current.intensity = doorsActive ? 1.5 * leakBreathe * diwaliSpill * diwaliDim : 0;
    }

    if (redLeakMeshRef.current) {
      redLeakMeshRef.current.scale.set(1.1 * redSpill, 0.4 * redSpill, 1);
      const mat = redLeakMeshRef.current.material as THREE.MeshBasicMaterial;
      if (mat) mat.opacity = doorsActive ? Math.min(1, 0.45 * leakBreathe * redSpill * redDim) : 0;
    }
    if (diwaliLeakMeshRef.current) {
      diwaliLeakMeshRef.current.scale.set(1.1 * diwaliSpill, 0.4 * diwaliSpill, 1);
      const mat = diwaliLeakMeshRef.current.material as THREE.MeshBasicMaterial;
      if (mat) mat.opacity = doorsActive ? Math.min(1, 0.45 * leakBreathe * diwaliSpill * diwaliDim) : 0;
    }
  });

  return (
    <group name="HomeStage">
      {/* Volumetric beam cones per Part 5.4 */}
      <Beams />

      {/* Lighting per Part 5.4: Key directional white (1.2) */}
      <ambientLight intensity={0.4} color="#0B0E14" />
      <directionalLight
        position={[-3, 6, 4]}
        intensity={1.2}
        color="#FFFFFF"
      />

      {/* Rim magenta spot behind badge (rising over 900 ms on loader handoff) */}
      <spotLight
        ref={magentaSpotRef}
        position={[0, 4, -3]}
        target-position={[0, 1.5, 0]}
        intensity={0}
        color="#FF4FD8"
        angle={0.8}
        penumbra={0.6}
      />

      {/* H2 Statement 1: Magenta Light Streak sliding along chrome rim */}
      <pointLight
        ref={streakLightRef}
        position={[0, 1.5, 0.1]}
        intensity={0}
        color="#FF4FD8"
        distance={2.5}
      />

      {/* H4 Split Rim Lights: Left Red (#FF2A1F), Right Pink-Gold (#FFC46B to #FF6FB0) */}
      <pointLight
        ref={splitLeftLightRef}
        position={[-2.4, 1.6, -0.6]}
        intensity={0}
        color="#FF2A1F"
        distance={6}
      />
      <pointLight
        ref={splitRightLightRef}
        position={[2.4, 1.6, -0.6]}
        intensity={0}
        color="#FFC46B"
        distance={6}
      />

      {/* Door Light Leaks under threshold */}
      <pointLight
        ref={redLeakLightRef}
        position={[-1.2, 0.08, 0.1]}
        intensity={0}
        color="#FF2A1F"
        distance={3.5}
      />
      <pointLight
        ref={diwaliLeakLightRef}
        position={[1.2, 0.08, 0.1]}
        intensity={0}
        color="#F2D38B"
        distance={3.5}
      />

      {/* Stage Floor: Glossy dark floor (Part 5.4) */}
      <mesh
        name="StageFloor"
        position={[0, 0, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial
          color="#06080C"
          roughness={0.15}
          metalness={0.6}
        />
      </mesh>

      {/* Floor glow cards for light leaks under doors */}
      <mesh
        ref={redLeakMeshRef}
        position={[-1.2, 0.01, 0.25]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[1.2, 0.5]} />
        <meshBasicMaterial
          color="#FF2A1F"
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh
        ref={diwaliLeakMeshRef}
        position={[1.2, 0.01, 0.25]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[1.2, 0.5]} />
        <meshBasicMaterial
          color="#F2D38B"
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Door 1: Red Room GLB standing at (-1.2, 0, 0) */}
      <group
        ref={redDoorRef}
        visible={false}
        position={[-1.2, -8.0, 0]}
        scale={[0.85, 0.85, 0.85]}
      >
        <primitive object={redScene} />
      </group>

      {/* Door 2: Diwali GLB standing at (+1.2, 0, 0) */}
      <group
        ref={diwaliDoorRef}
        visible={false}
        position={[1.2, -8.0, 0]}
        scale={[0.85, 0.85, 0.85]}
      >
        <primitive object={diwaliScene} />
      </group>
    </group>
  );
}
