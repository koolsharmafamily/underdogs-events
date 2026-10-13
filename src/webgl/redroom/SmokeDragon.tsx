'use client';

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { frame } from '@/state/frame';
import { useStore } from '@/state/store';
import { useQuality } from '../QualityProvider';

const SEGMENTS_COUNT = 24;

export function SmokeDragon() {
  const { tier } = useQuality();
  const rootRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const jawRef = useRef<THREE.Group>(null);
  const whiskerLRef = useRef<THREE.Mesh>(null);
  const whiskerRRef = useRef<THREE.Mesh>(null);
  const segmentRefs = useRef<(THREE.Group | null)[]>([]);
  const frontLegLRef = useRef<THREE.Group>(null);
  const frontLegRRef = useRef<THREE.Group>(null);
  const backLegLRef = useRef<THREE.Group>(null);
  const backLegRRef = useRef<THREE.Group>(null);
  const smokePointsRef = useRef<THREE.Points>(null);

  // Materials: Rich crimson scales, gilded imperial gold underbelly & horns, glowing ember fins
  const materials = useMemo(() => {
    // 1. Rich imperial crimson scales with metallic ruby sheen
    const scaleMat = new THREE.MeshStandardMaterial({
      color: '#8A1118',
      roughness: 0.28,
      metalness: 0.62,
      emissive: '#45060A',
      emissiveIntensity: 0.35,
    });

    // 2. Gilded imperial gold underbelly plating
    const bellyMat = new THREE.MeshStandardMaterial({
      color: '#C99738',
      roughness: 0.3,
      metalness: 0.8,
      emissive: '#3D2802',
      emissiveIntensity: 0.25,
    });

    // 3. Glowing fiery dorsal spine fins
    const finMat = new THREE.MeshStandardMaterial({
      color: '#FF2A15',
      roughness: 0.2,
      metalness: 0.4,
      emissive: '#FF2A15',
      emissiveIntensity: 1.1,
    });

    // 4. Swept imperial antlers / horns & claws
    const goldHornMat = new THREE.MeshStandardMaterial({
      color: '#E0B553',
      roughness: 0.22,
      metalness: 0.88,
      emissive: '#523A08',
      emissiveIntensity: 0.3,
    });

    // 5. Piercing fiery ember eyes
    const eyeMat = new THREE.MeshBasicMaterial({
      color: '#FFAE33',
    });

    return { scaleMat, bellyMat, finMat, goldHornMat, eyeMat };
  }, []);

  // Shared geometries for maximum performance (0 memory churn)
  const geometries = useMemo(() => {
    // Head: Snout cranium, brow, horns, jaw, eyes, whiskers
    const snoutGeo = new THREE.ConeGeometry(0.15, 0.42, 8);
    const browGeo = new THREE.BoxGeometry(0.26, 0.10, 0.20);
    const hornGeo = new THREE.ConeGeometry(0.045, 0.42, 6);
    const jawGeo = new THREE.ConeGeometry(0.12, 0.32, 7);
    const eyeGeo = new THREE.SphereGeometry(0.038, 10, 10);
    const whiskerGeo = new THREE.CylinderGeometry(0.009, 0.003, 0.55, 6);

    // Segment pieces (unit cylinder along Y axis so we can orient between spine points)
    const segGeo = new THREE.CylinderGeometry(1, 1, 1, 10);
    const bellyGeo = new THREE.CylinderGeometry(0.85, 0.85, 0.95, 8);
    const finGeo = new THREE.ConeGeometry(0.08, 0.28, 4);

    // Claws / Legs
    const upperLegGeo = new THREE.CylinderGeometry(0.045, 0.035, 0.26, 6);
    const lowerLegGeo = new THREE.CylinderGeometry(0.032, 0.022, 0.22, 6);
    const talonGeo = new THREE.ConeGeometry(0.02, 0.12, 4);

    // Tail fin plume
    const tailPlumeGeo = new THREE.ConeGeometry(0.12, 0.5, 4);

    return {
      snoutGeo,
      browGeo,
      hornGeo,
      jawGeo,
      eyeGeo,
      whiskerGeo,
      segGeo,
      bellyGeo,
      finGeo,
      upperLegGeo,
      lowerLegGeo,
      talonGeo,
      tailPlumeGeo,
    };
  }, []);

  // Volumetric ember particle trail
  const smokeCount = tier === 'T1' ? 300 : tier === 'T2' ? 700 : 1200;
  const smokeData = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(smokeCount * 3);
    const vels = new Float32Array(smokeCount * 3);
    const ages = new Float32Array(smokeCount);

    for (let i = 0; i < smokeCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 0.3;
      pos[i * 3 + 1] = 2.4 + (Math.random() - 0.5) * 0.3;
      pos[i * 3 + 2] = -0.2 + (Math.random() - 0.5) * 0.3;
      vels[i * 3] = (Math.random() - 0.5) * 0.2;
      vels[i * 3 + 1] = Math.random() * 0.2 + 0.05;
      vels[i * 3 + 2] = (Math.random() - 0.5) * 0.2;
      ages[i] = Math.random() * 2.0;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return { geo, vels, ages, count: smokeCount };
  }, [smokeCount]);

  // Pre-allocated vectors & quaternions for 60fps frame loop
  const pA = useMemo(() => new THREE.Vector3(), []);
  const pB = useMemo(() => new THREE.Vector3(), []);
  const spinePosArray = useMemo(
    () => Array.from({ length: SEGMENTS_COUNT + 2 }, () => new THREE.Vector3()),
    []
  );
  const upAxis = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  const forwardVec = useMemo(() => new THREE.Vector3(), []);
  const segQuat = useMemo(() => new THREE.Quaternion(), []);

  /**
   * Flight path in 3D Red Room space:
   * - Sweeps gracefully left and right: x in [-2.0, 2.0]
   * - Mid-high altitude: y in [2.2, 2.85] (above table y=0.85 and title text y<=1.0, below chandelier y>=3.5)
   * - When crossing center (|x| < 0.8), z <= 0.0 (strictly BEHIND the badge at z=0.6)
   * - When coming forward (z > 0.4), |x| >= 1.25 (out on wide flanks, never covering badge)
   * - On scroll into R2-R3: lifts seamlessly into upper ceiling (y -> 4.8)
   */
  const sampleSpine = (timeVal: number, lift: number, out: THREE.Vector3) => {
    const angle = timeVal * 0.48;
    const x = Math.sin(angle) * 1.85 + Math.cos(timeVal * 0.24) * 0.25;
    const y = 2.45 + Math.sin(timeVal * 0.82) * 0.28 + Math.cos(timeVal * 0.36) * 0.14 + lift;
    // z is behind badge (z <= 0.0) when x is near 0; swings forward only at outer wings
    const z = -0.15 + Math.sin(angle * 2.0) * 0.55 - lift * 0.35;
    out.set(x, y, z);
  };

  useFrame((_, delta) => {
    const st = useStore.getState();
    if (st.world !== 'redroom' && st.previousWorld !== 'redroom') return;

    const t = frame.time;
    const p1 = frame.dampedProgress['R1'] ?? 0;
    const p2 = frame.dampedProgress['R2'] ?? 0;
    const p3 = frame.dampedProgress['R3'] ?? 0;

    // As user scrolls past R1 into R2 & R3, dragon glides up into ceiling darkness
    const scrollLift = Math.max(0, (p1 - 0.4) * 2.4) + (p2 + p3) * 3.4;

    // Pointer subtle steering
    const ptrX = frame.pointer.damped.x * 0.3;
    const ptrY = frame.pointer.damped.y * 0.2;

    // 1. Calculate positions along the spine for Head + all 24 Vertebrae
    // Step size ~0.10s provides ~0.16m natural spacing between segments
    const dtStep = 0.105;
    for (let k = 0; k < SEGMENTS_COUNT + 2; k++) {
      const sampleTime = t - k * dtStep;
      sampleSpine(sampleTime, scrollLift, spinePosArray[k]);
      spinePosArray[k].x += ptrX;
      spinePosArray[k].y += ptrY;

      // Add undulating serpentine swimming wave (amplitude increases down the body)
      if (k > 0) {
        const wavePhase = t * 3.2 - k * 0.32;
        const waveAmp = (k / SEGMENTS_COUNT) * 0.14;
        spinePosArray[k].x += Math.sin(wavePhase) * waveAmp;
        spinePosArray[k].y += Math.cos(wavePhase * 0.8) * (waveAmp * 0.5);
      }
    }

    const headPos = spinePosArray[0];
    const neckPos = spinePosArray[1];

    // 2. Position and Orient Head
    if (headRef.current) {
      headRef.current.position.copy(headPos);
      headRef.current.lookAt(neckPos);
      // Breathing / undulating banking roll
      headRef.current.rotation.z += Math.sin(t * 1.5) * 0.15;

      // Whiskers swimming wave
      if (whiskerLRef.current) {
        whiskerLRef.current.rotation.z = 0.35 + Math.sin(t * 4.5) * 0.22;
        whiskerLRef.current.rotation.x = -0.3 + Math.cos(t * 3.8) * 0.15;
      }
      if (whiskerRRef.current) {
        whiskerRRef.current.rotation.z = -0.35 - Math.sin(t * 4.5) * 0.22;
        whiskerRRef.current.rotation.x = -0.3 + Math.cos(t * 3.8) * 0.15;
      }

      // Subtle jaw breathing opening
      if (jawRef.current) {
        jawRef.current.rotation.x = Math.max(0, Math.sin(t * 1.8) * 0.22);
      }
    }

    // 3. Position and Orient each of the 24 Body Vertebrae
    for (let i = 0; i < SEGMENTS_COUNT; i++) {
      const segGroup = segmentRefs.current[i];
      if (!segGroup) continue;

      const curPos = spinePosArray[i + 1];
      const prevPos = spinePosArray[i];

      // Segment placed at mid-point between vertebrae
      pA.copy(curPos).add(prevPos).multiplyScalar(0.5);
      segGroup.position.copy(pA);

      // Orient segment cylinder axis (Y) from curPos to prevPos
      forwardVec.copy(prevPos).sub(curPos);
      const segLength = forwardVec.length();
      if (segLength > 0.001) {
        forwardVec.normalize();
        segQuat.setFromUnitVectors(upAxis, forwardVec);
        segGroup.quaternion.copy(segQuat);
      }

      // Add serpentine bank roll
      const wavePhase = t * 3.2 - (i + 1) * 0.32;
      segGroup.rotateY(Math.sin(wavePhase) * 0.2);
    }

    // 4. Update 4 Claws paddling in phase with serpentine wave
    const clawPhase = t * 3.2;
    if (frontLegLRef.current) {
      frontLegLRef.current.rotation.x = Math.sin(clawPhase) * 0.35 + 0.2;
      frontLegLRef.current.rotation.z = 0.5 + Math.cos(clawPhase) * 0.15;
    }
    if (frontLegRRef.current) {
      frontLegRRef.current.rotation.x = Math.sin(clawPhase + Math.PI) * 0.35 + 0.2;
      frontLegRRef.current.rotation.z = -0.5 - Math.cos(clawPhase) * 0.15;
    }
    if (backLegLRef.current) {
      backLegLRef.current.rotation.x = Math.sin(clawPhase + 1.2) * 0.35 + 0.2;
      backLegLRef.current.rotation.z = 0.45 + Math.cos(clawPhase + 1.2) * 0.15;
    }
    if (backLegRRef.current) {
      backLegRRef.current.rotation.x = Math.sin(clawPhase + 1.2 + Math.PI) * 0.35 + 0.2;
      backLegRRef.current.rotation.z = -0.45 - Math.cos(clawPhase + 1.2) * 0.15;
    }

    // 5. Update Particle Smoke & Ember Trail drifting behind dragon
    if (smokePointsRef.current) {
      const posArray = smokePointsRef.current.geometry.attributes.position.array as Float32Array;
      const count = smokeData.count;

      for (let i = 0; i < count; i++) {
        smokeData.ages[i] += delta;

        // If particle expired, respawn at a random dragon body segment
        if (smokeData.ages[i] > 2.0) {
          smokeData.ages[i] = 0;
          const segIdx = Math.floor(Math.random() * SEGMENTS_COUNT);
          const sPos = spinePosArray[segIdx + 1];
          posArray[i * 3] = sPos.x + (Math.random() - 0.5) * 0.18;
          posArray[i * 3 + 1] = sPos.y + (Math.random() - 0.5) * 0.18;
          posArray[i * 3 + 2] = sPos.z + (Math.random() - 0.5) * 0.18;
        } else {
          posArray[i * 3] += smokeData.vels[i * 3] * delta;
          posArray[i * 3 + 1] += smokeData.vels[i * 3 + 1] * delta;
          posArray[i * 3 + 2] += smokeData.vels[i * 3 + 2] * delta;
        }
      }

      smokePointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group ref={rootRef} name="SmokeDragon3D">
      {/* 1. Sculpted Dragon Head */}
      <group ref={headRef} position={[0, 2.45, -0.15]}>
        {/* Warm ember dragon point light casting illumination */}
        <pointLight color="#FF5A1F" intensity={3.2} distance={4.0} decay={2} />

        {/* Snout & Cranium (oriented along Z) */}
        <mesh
          position={[0, 0, -0.18]}
          rotation={[-Math.PI / 2, 0, 0]}
          geometry={geometries.snoutGeo}
          material={materials.scaleMat}
        />

        {/* Brow Ridge */}
        <mesh
          position={[0, 0.08, -0.02]}
          geometry={geometries.browGeo}
          material={materials.scaleMat}
        />

        {/* Left Swept Horn / Antler */}
        <mesh
          position={[-0.12, 0.20, 0.10]}
          rotation={[0.65, -0.25, -0.35]}
          geometry={geometries.hornGeo}
          material={materials.goldHornMat}
        />

        {/* Right Swept Horn / Antler */}
        <mesh
          position={[0.12, 0.20, 0.10]}
          rotation={[0.65, 0.25, 0.35]}
          geometry={geometries.hornGeo}
          material={materials.goldHornMat}
        />

        {/* Left Flowing Whisker (Barbel) */}
        <mesh
          ref={whiskerLRef}
          position={[-0.11, -0.04, -0.22]}
          rotation={[-0.3, -0.3, 0.35]}
          geometry={geometries.whiskerGeo}
          material={materials.goldHornMat}
        />

        {/* Right Flowing Whisker (Barbel) */}
        <mesh
          ref={whiskerRRef}
          position={[0.11, -0.04, -0.22]}
          rotation={[-0.3, 0.3, -0.35]}
          geometry={geometries.whiskerGeo}
          material={materials.goldHornMat}
        />

        {/* Articulated Lower Jaw */}
        <group ref={jawRef} position={[0, -0.06, -0.06]}>
          <mesh
            position={[0, -0.02, -0.12]}
            rotation={[-Math.PI / 2 + 0.2, 0, 0]}
            geometry={geometries.jawGeo}
            material={materials.scaleMat}
          />
        </group>

        {/* Glowing Ember Eyes */}
        <mesh
          position={[-0.09, 0.09, -0.06]}
          geometry={geometries.eyeGeo}
          material={materials.eyeMat}
        />
        <mesh
          position={[0.09, 0.09, -0.06]}
          geometry={geometries.eyeGeo}
          material={materials.eyeMat}
        />
      </group>

      {/* 2. Articulated 24 Body Vertebrae Segments */}
      {Array.from({ length: SEGMENTS_COUNT }).map((_, idx) => {
        // Anatomical taper along spine:
        // Neck (0..3) radius ~0.11m -> Midbody (4..12) radius ~0.16m -> Hind (13..18) radius ~0.12m -> Tail (19..23) ~0.04m
        const norm = idx / SEGMENTS_COUNT;
        const radius = (Math.sin(norm * Math.PI) * 0.11 + 0.05) * (1 - norm * 0.45);
        const segLen = 0.18;

        const isFrontLegAnchor = idx === 5;
        const isBackLegAnchor = idx === 14;

        return (
          <group
            key={`dragon-seg-${idx}`}
            ref={(el) => {
              segmentRefs.current[idx] = el;
            }}
            position={[0, 2.45, 0]}
          >
            {/* Cylindrical Scale Torso Segment (oriented along local Y) */}
            <mesh
              scale={[radius, segLen, radius]}
              geometry={geometries.segGeo}
              material={materials.scaleMat}
            />

            {/* Gilded Underbelly Plating on bottom side (-Z in local cylinder) */}
            <mesh
              position={[0, 0, -radius * 0.55]}
              scale={[radius * 0.8, segLen * 0.95, radius * 0.35]}
              geometry={geometries.bellyGeo}
              material={materials.bellyMat}
            />

            {/* Glowing Dorsal Spine Fin on top side (+Z in local cylinder) */}
            <mesh
              position={[0, 0, radius + 0.08]}
              rotation={[Math.PI / 2, 0, 0]}
              scale={[1, 1 - norm * 0.45, 1]}
              geometry={geometries.finGeo}
              material={materials.finMat}
            />

            {/* Front Left & Right Claws */}
            {isFrontLegAnchor && (
              <>
                <group ref={frontLegLRef} position={[-radius * 0.9, 0, 0]}>
                  <mesh
                    position={[-0.08, -0.06, 0]}
                    rotation={[0, 0, 0.7]}
                    geometry={geometries.upperLegGeo}
                    material={materials.scaleMat}
                  />
                  <mesh
                    position={[-0.18, -0.16, 0.04]}
                    rotation={[-0.3, 0, 0.9]}
                    geometry={geometries.lowerLegGeo}
                    material={materials.scaleMat}
                  />
                  <mesh
                    position={[-0.22, -0.26, 0.08]}
                    rotation={[-0.4, 0, 1.1]}
                    geometry={geometries.talonGeo}
                    material={materials.goldHornMat}
                  />
                </group>
                <group ref={frontLegRRef} position={[radius * 0.9, 0, 0]}>
                  <mesh
                    position={[0.08, -0.06, 0]}
                    rotation={[0, 0, -0.7]}
                    geometry={geometries.upperLegGeo}
                    material={materials.scaleMat}
                  />
                  <mesh
                    position={[0.18, -0.16, 0.04]}
                    rotation={[-0.3, 0, -0.9]}
                    geometry={geometries.lowerLegGeo}
                    material={materials.scaleMat}
                  />
                  <mesh
                    position={[0.22, -0.26, 0.08]}
                    rotation={[-0.4, 0, -1.1]}
                    geometry={geometries.talonGeo}
                    material={materials.goldHornMat}
                  />
                </group>
              </>
            )}

            {/* Back Left & Right Claws */}
            {isBackLegAnchor && (
              <>
                <group ref={backLegLRef} position={[-radius * 0.9, 0, 0]}>
                  <mesh
                    position={[-0.07, -0.05, 0]}
                    rotation={[0, 0, 0.6]}
                    geometry={geometries.upperLegGeo}
                    material={materials.scaleMat}
                  />
                  <mesh
                    position={[-0.16, -0.14, 0.04]}
                    rotation={[-0.25, 0, 0.8]}
                    geometry={geometries.lowerLegGeo}
                    material={materials.scaleMat}
                  />
                  <mesh
                    position={[-0.20, -0.22, 0.07]}
                    rotation={[-0.35, 0, 1.0]}
                    geometry={geometries.talonGeo}
                    material={materials.goldHornMat}
                  />
                </group>
                <group ref={backLegRRef} position={[radius * 0.9, 0, 0]}>
                  <mesh
                    position={[0.07, -0.05, 0]}
                    rotation={[0, 0, -0.6]}
                    geometry={geometries.upperLegGeo}
                    material={materials.scaleMat}
                  />
                  <mesh
                    position={[0.16, -0.14, 0.04]}
                    rotation={[-0.25, 0, -0.8]}
                    geometry={geometries.lowerLegGeo}
                    material={materials.scaleMat}
                  />
                  <mesh
                    position={[0.20, -0.22, 0.07]}
                    rotation={[-0.35, 0, -1.0]}
                    geometry={geometries.talonGeo}
                    material={materials.goldHornMat}
                  />
                </group>
              </>
            )}

            {/* Tail Flame Tip at very end */}
            {idx === SEGMENTS_COUNT - 1 && (
              <mesh
                position={[0, -segLen * 0.6, 0]}
                rotation={[Math.PI, 0, 0]}
                geometry={geometries.tailPlumeGeo}
                material={materials.finMat}
              />
            )}
          </group>
        );
      })}

      {/* 3. Volumetric Ember Smoke Trail Billowing Behind */}
      <points ref={smokePointsRef} geometry={smokeData.geo}>
        <pointsMaterial
          size={0.065}
          color="#FF551F"
          transparent
          opacity={0.65}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
}
