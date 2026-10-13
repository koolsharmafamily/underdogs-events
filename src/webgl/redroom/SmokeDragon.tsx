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
  const frontClawLRef = useRef<THREE.Group>(null);
  const frontClawRRef = useRef<THREE.Group>(null);
  const backClawLRef = useRef<THREE.Group>(null);
  const backClawRRef = useRef<THREE.Group>(null);
  const smokePointsRef = useRef<THREE.Points>(null);

  // Materials created once with high-end dark lacquer and glowing red/ember accents
  const materials = useMemo(() => {
    // 1. Dark smoked obsidian body scales with crimson specular sheen
    const scaleMat = new THREE.MeshStandardMaterial({
      color: '#1C0305',
      roughness: 0.22,
      metalness: 0.82,
      emissive: '#3D0509',
      emissiveIntensity: 0.25,
    });

    // 2. Crimson underbelly plating
    const bellyMat = new THREE.MeshStandardMaterial({
      color: '#42060B',
      roughness: 0.35,
      metalness: 0.45,
    });

    // 3. Glowing fiery dorsal spine fins and horns
    const finMat = new THREE.MeshStandardMaterial({
      color: '#9E120D',
      roughness: 0.25,
      metalness: 0.6,
      emissive: '#FF2A1F',
      emissiveIntensity: 0.9,
    });

    // 4. Piercing glowing ember eyes
    const eyeMat = new THREE.MeshBasicMaterial({
      color: '#FFA03A',
    });

    // 5. Gilded talons / claws
    const talonMat = new THREE.MeshStandardMaterial({
      color: '#D4AF6A',
      roughness: 0.25,
      metalness: 0.85,
    });

    return { scaleMat, bellyMat, finMat, eyeMat, talonMat };
  }, []);

  // Shared geometries
  const geometries = useMemo(() => {
    // Head cranium & snout
    const snoutGeo = new THREE.ConeGeometry(0.14, 0.38, 7);
    const browGeo = new THREE.BoxGeometry(0.24, 0.08, 0.18);
    const hornGeo = new THREE.ConeGeometry(0.04, 0.36, 6);
    const jawGeo = new THREE.ConeGeometry(0.11, 0.28, 6);
    const eyeGeo = new THREE.SphereGeometry(0.032, 10, 10);
    const whiskerGeo = new THREE.CylinderGeometry(0.008, 0.003, 0.45, 5);

    // Segment pieces
    const segGeo = new THREE.CylinderGeometry(1, 1, 1, 8);
    const finGeo = new THREE.ConeGeometry(0.08, 0.24, 4);

    // Claw piece
    const legUpperGeo = new THREE.CylinderGeometry(0.04, 0.03, 0.22, 6);
    const talonGeo = new THREE.ConeGeometry(0.02, 0.10, 4);

    return {
      snoutGeo,
      browGeo,
      hornGeo,
      jawGeo,
      eyeGeo,
      whiskerGeo,
      segGeo,
      finGeo,
      legUpperGeo,
      talonGeo,
    };
  }, []);

  // Particle smoke trail billowing behind the dragon
  const smokeCount = tier === 'T1' ? 400 : tier === 'T2' ? 900 : 1600;
  const smokeData = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(smokeCount * 3);
    const vels = new Float32Array(smokeCount * 3);
    const ages = new Float32Array(smokeCount);

    for (let i = 0; i < smokeCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 0.4;
      pos[i * 3 + 1] = 2.2 + (Math.random() - 0.5) * 0.4;
      pos[i * 3 + 2] = 0.6 + (Math.random() - 0.5) * 0.4;
      vels[i * 3] = (Math.random() - 0.5) * 0.3;
      vels[i * 3 + 1] = Math.random() * 0.25 + 0.05;
      vels[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
      ages[i] = Math.random() * 2.0;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return { geo, vels, ages, count: smokeCount };
  }, [smokeCount]);

  // Pre-allocated vectors for frame loop
  const pVecA = useMemo(() => new THREE.Vector3(), []);
  const pVecB = useMemo(() => new THREE.Vector3(), []);
  const dirVec = useMemo(() => new THREE.Vector3(), []);

  // Parametric trajectory for dragon spine in 3D Red Room space
  const sampleSpine = (timeVal: number, lift: number, out: THREE.Vector3) => {
    const angle = timeVal * 0.52;
    const rad = 1.35 + Math.sin(timeVal * 0.72) * 0.3;
    const x = Math.sin(angle) * rad + Math.cos(timeVal * 1.1) * 0.25;
    const y = 2.15 + Math.sin(timeVal * 0.95) * 0.32 + Math.cos(timeVal * 0.4) * 0.18 + lift;
    const z = 0.65 + Math.cos(angle) * 0.55 - lift * 0.45;
    out.set(x, y, z);
  };

  useFrame((_, delta) => {
    const st = useStore.getState();
    if (st.world !== 'redroom' && st.previousWorld !== 'redroom') return;

    const t = frame.time;
    const p1 = frame.dampedProgress['R1'] ?? 0;
    const p2 = frame.dampedProgress['R2'] ?? 0;
    const p3 = frame.dampedProgress['R3'] ?? 0;

    // As user scrolls past R1 into R2 & R3, dragon gracefully glides upward into ceiling space (y -> 4.5)
    // so it NEVER obscures the mirror fog or dress code text!
    const scrollLift = Math.max(0, (p1 - 0.4) * 2.6) + (p2 + p3) * 3.2;

    // Pointer subtle steering within 1.5m
    const ptrX = frame.pointer.damped.x * 0.35;
    const ptrY = frame.pointer.damped.y * 0.25;

    // 1. Update Head Transform
    sampleSpine(t, scrollLift, pVecA);
    sampleSpine(t + 0.08, scrollLift, pVecB);
    pVecA.x += ptrX;
    pVecA.y += ptrY;
    pVecB.x += ptrX;
    pVecB.y += ptrY;

    if (headRef.current) {
      headRef.current.position.copy(pVecA);
      headRef.current.lookAt(pVecB);
      // Breathing tilt
      headRef.current.rotation.z += Math.sin(t * 1.6) * 0.12;

      // Whiskers waving
      if (whiskerLRef.current) whiskerLRef.current.rotation.z = Math.sin(t * 4.2) * 0.2 + 0.3;
      if (whiskerRRef.current) whiskerRRef.current.rotation.z = -Math.sin(t * 4.2) * 0.2 - 0.3;

      // Subtle jaw breathing opening
      if (jawRef.current) jawRef.current.rotation.x = Math.max(0, Math.sin(t * 1.8) * 0.18);
    }

    // 2. Update 24 Segment Vertebrae following along the spine with kinematic time delay
    let leadPos = pVecA;
    for (let i = 0; i < SEGMENTS_COUNT; i++) {
      const seg = segmentRefs.current[i];
      if (!seg) continue;

      const lagTime = t - (i + 1) * 0.048;
      sampleSpine(lagTime, scrollLift, pVecA);

      // Organic lateral and vertical sine wave undulation along spine
      const wavePhase = t * 3.4 - i * 0.28;
      const waveAmp = (i / SEGMENTS_COUNT) * 0.12;
      pVecA.x += Math.sin(wavePhase) * waveAmp;
      pVecA.y += Math.cos(wavePhase * 0.7) * (waveAmp * 0.6);

      seg.position.copy(pVecA);
      seg.lookAt(leadPos);

      // Spine bank / roll tilt
      seg.rotation.z += Math.sin(wavePhase) * 0.18;

      leadPos = pVecA;
    }

    // 3. Update 4 Claws paddling in phase
    const clawPhase = t * 3.4;
    if (frontClawLRef.current) frontClawLRef.current.rotation.x = Math.sin(clawPhase) * 0.35 + 0.2;
    if (frontClawRRef.current) frontClawRRef.current.rotation.x = Math.sin(clawPhase + Math.PI) * 0.35 + 0.2;
    if (backClawLRef.current) backClawLRef.current.rotation.x = Math.sin(clawPhase + 1.2) * 0.35 + 0.2;
    if (backClawRRef.current) backClawRRef.current.rotation.x = Math.sin(clawPhase + 1.2 + Math.PI) * 0.35 + 0.2;

    // 4. Update Particle Smoke & Ember Trail from dragon body
    if (smokePointsRef.current) {
      const posArray = smokePointsRef.current.geometry.attributes.position.array as Float32Array;
      const count = smokeData.count;

      for (let i = 0; i < count; i++) {
        smokeData.ages[i] += delta;

        // If particle exceeded lifetime, respawn at dragon segment ~12 (mid-body)
        if (smokeData.ages[i] > 2.2) {
          smokeData.ages[i] = 0;
          const segIdx = Math.floor(Math.random() * 18);
          const sObj = segmentRefs.current[segIdx];
          if (sObj) {
            posArray[i * 3] = sObj.position.x + (Math.random() - 0.5) * 0.15;
            posArray[i * 3 + 1] = sObj.position.y + (Math.random() - 0.5) * 0.15;
            posArray[i * 3 + 2] = sObj.position.z + (Math.random() - 0.5) * 0.15;
          }
        } else {
          // Drift and billow upward
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
      <group ref={headRef} position={[0, 2.2, 0.6]}>
        {/* Point light casting warm ember dragon eye illumination */}
        <pointLight color="#FF4A1F" intensity={1.8} distance={3.5} decay={2} />

        {/* Snout & Cranium */}
        <mesh
          position={[0, 0, 0.16]}
          rotation={[Math.PI / 2, 0, 0]}
          geometry={geometries.snoutGeo}
          material={materials.scaleMat}
        />

        {/* Brow Ridge */}
        <mesh
          position={[0, 0.08, 0]}
          geometry={geometries.browGeo}
          material={materials.scaleMat}
        />

        {/* Left Swept Horn */}
        <mesh
          position={[-0.11, 0.18, -0.12]}
          rotation={[-0.65, -0.22, -0.32]}
          geometry={geometries.hornGeo}
          material={materials.finMat}
        />

        {/* Right Swept Horn */}
        <mesh
          position={[0.11, 0.18, -0.12]}
          rotation={[-0.65, 0.22, 0.32]}
          geometry={geometries.hornGeo}
          material={materials.finMat}
        />

        {/* Left Whisker (Barbel) */}
        <mesh
          ref={whiskerLRef}
          position={[-0.10, -0.04, 0.22]}
          rotation={[-0.3, -0.3, 0.3]}
          geometry={geometries.whiskerGeo}
          material={materials.finMat}
        />

        {/* Right Whisker (Barbel) */}
        <mesh
          ref={whiskerRRef}
          position={[0.10, -0.04, 0.22]}
          rotation={[-0.3, 0.3, -0.3]}
          geometry={geometries.whiskerGeo}
          material={materials.finMat}
        />

        {/* Articulated Lower Jaw */}
        <group ref={jawRef} position={[0, -0.06, 0.05]}>
          <mesh
            position={[0, -0.02, 0.12]}
            rotation={[Math.PI / 2 - 0.2, 0, 0]}
            geometry={geometries.jawGeo}
            material={materials.scaleMat}
          />
        </group>

        {/* Glowing Ember Eyes */}
        <mesh
          position={[-0.08, 0.08, 0.06]}
          geometry={geometries.eyeGeo}
          material={materials.eyeMat}
        />
        <mesh
          position={[0.08, 0.08, 0.06]}
          geometry={geometries.eyeGeo}
          material={materials.eyeMat}
        />
      </group>

      {/* 2. Articulated 24 Body Vertebrae Segments */}
      {Array.from({ length: SEGMENTS_COUNT }).map((_, idx) => {
        // Tapered anatomical profile:
        // Neck (0..3) ~0.12m -> Chest/Torso (4..10) ~0.18m -> Abdomen (11..18) ~0.14m -> Tail (19..23) ~0.04m
        const norm = idx / SEGMENTS_COUNT;
        const radius = (Math.sin(norm * Math.PI) * 0.12 + 0.05) * (1 - norm * 0.55);
        const length = 0.14;

        // Front Claws attached at vertebra 6, Back Claws attached at vertebra 15
        const isFrontLegAnchor = idx === 5;
        const isBackLegAnchor = idx === 14;

        return (
          <group
            key={`dragon-seg-${idx}`}
            ref={(el) => {
              segmentRefs.current[idx] = el;
            }}
            position={[0, 2.0, 0]}
          >
            {/* Cylindrical Torso Segment */}
            <mesh
              rotation={[Math.PI / 2, 0, 0]}
              scale={[radius, length, radius]}
              geometry={geometries.segGeo}
              material={materials.scaleMat}
            />

            {/* Underbelly Plate */}
            <mesh
              position={[0, -radius * 0.65, 0]}
              scale={[radius * 0.82, length * 0.95, radius * 0.35]}
              rotation={[Math.PI / 2, 0, 0]}
              geometry={geometries.segGeo}
              material={materials.bellyMat}
            />

            {/* Glowing Dorsal Spine Fin */}
            <mesh
              position={[0, radius + 0.09, 0]}
              rotation={[-0.2, 0, 0]}
              scale={[1, 1 - norm * 0.45, 1]}
              geometry={geometries.finGeo}
              material={materials.finMat}
            />

            {/* Front Left & Right Claws */}
            {isFrontLegAnchor && (
              <>
                <group ref={frontClawLRef} position={[-radius * 0.9, -0.04, 0]}>
                  <mesh
                    rotation={[0, 0, 0.6]}
                    geometry={geometries.legUpperGeo}
                    material={materials.scaleMat}
                  />
                  <mesh
                    position={[-0.12, -0.14, 0.04]}
                    rotation={[-0.4, 0, 0.8]}
                    geometry={geometries.talonGeo}
                    material={materials.talonMat}
                  />
                </group>
                <group ref={frontClawRRef} position={[radius * 0.9, -0.04, 0]}>
                  <mesh
                    rotation={[0, 0, -0.6]}
                    geometry={geometries.legUpperGeo}
                    material={materials.scaleMat}
                  />
                  <mesh
                    position={[0.12, -0.14, 0.04]}
                    rotation={[-0.4, 0, -0.8]}
                    geometry={geometries.talonGeo}
                    material={materials.talonMat}
                  />
                </group>
              </>
            )}

            {/* Back Left & Right Claws */}
            {isBackLegAnchor && (
              <>
                <group ref={backClawLRef} position={[-radius * 0.9, -0.04, 0]}>
                  <mesh
                    rotation={[0, 0, 0.5]}
                    geometry={geometries.legUpperGeo}
                    material={materials.scaleMat}
                  />
                  <mesh
                    position={[-0.10, -0.12, 0.04]}
                    rotation={[-0.3, 0, 0.7]}
                    geometry={geometries.talonGeo}
                    material={materials.talonMat}
                  />
                </group>
                <group ref={backClawRRef} position={[radius * 0.9, -0.04, 0]}>
                  <mesh
                    rotation={[0, 0, -0.5]}
                    geometry={geometries.legUpperGeo}
                    material={materials.scaleMat}
                  />
                  <mesh
                    position={[0.10, -0.12, 0.04]}
                    rotation={[-0.3, 0, -0.7]}
                    geometry={geometries.talonGeo}
                    material={materials.talonMat}
                  />
                </group>
              </>
            )}

            {/* Tail Flame Tip at very end */}
            {idx === SEGMENTS_COUNT - 1 && (
              <mesh
                position={[0, 0.02, -0.14]}
                rotation={[-Math.PI / 2, 0, 0]}
                scale={[0.07, 0.28, 0.07]}
                geometry={geometries.finGeo}
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
