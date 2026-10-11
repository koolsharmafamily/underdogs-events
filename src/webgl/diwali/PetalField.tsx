'use client';

import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { frame } from '@/state/frame';

interface PetalFieldProps {
  petalCount?: number;
  dustCount?: number;
}

export function PetalField({ petalCount = 400, dustCount = 1800 }: PetalFieldProps) {
  const petalGltf = useGLTF('/models/diwali-rose-petal.glb');
  const marigoldGltf = useGLTF('/models/diwali-marigold.glb');

  // Extract geometries & materials for petals
  const { geometries, materials } = useMemo(() => {
    const geoms: THREE.BufferGeometry[] = [];
    const mats: THREE.Material[] = [];

    petalGltf.scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        geoms.push(mesh.geometry);
        mats.push(mesh.material as THREE.Material);
      }
    });

    // Fallbacks if not found
    const geom = geoms[0] || new THREE.PlaneGeometry(0.06, 0.08);
    const raniMat = mats[0] || new THREE.MeshStandardMaterial({ color: '#C5287B', roughness: 0.6 });
    const blushMat = mats[1] || new THREE.MeshStandardMaterial({ color: '#FFB3C6', roughness: 0.6 });
    const ivoryMat = mats[2] || new THREE.MeshStandardMaterial({ color: '#FFF5EB', roughness: 0.6 });

    return {
      geometries: [geom],
      materials: [raniMat, blushMat, ivoryMat],
    };
  }, [petalGltf]);

  // Petal initial states
  const petalData = useMemo(() => {
    const data = [];
    for (let i = 0; i < petalCount; i++) {
      data.push({
        x: (Math.random() - 0.5) * 7,
        y: Math.random() * 6 + 0.2,
        z: -2.5 + Math.random() * 5.0,
        rotX: Math.random() * Math.PI * 2,
        rotY: Math.random() * Math.PI * 2,
        rotZ: Math.random() * Math.PI * 2,
        speedY: 0.35 + Math.random() * 0.45,
        rotSpeedX: (Math.random() - 0.5) * 2.0,
        rotSpeedY: (Math.random() - 0.5) * 2.5,
        rotSpeedZ: (Math.random() - 0.5) * 1.5,
        flutterPhase: Math.random() * Math.PI * 2,
        scale: 0.016 + Math.random() * 0.012,
        colorVariant: i % 3, // 0 = rani, 1 = blush, 2 = ivory
      });
    }
    return data;
  }, [petalCount]);

  // Instanced meshes for the 3 petal color variants
  const instancedRefs = [
    useRef<THREE.InstancedMesh>(null),
    useRef<THREE.InstancedMesh>(null),
    useRef<THREE.InstancedMesh>(null),
  ];

  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Gold dust motes
  const { dustGeo, dustMat } = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(dustCount * 3);
    const sizes = new Float32Array(dustCount);

    for (let i = 0; i < dustCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 1] = Math.random() * 5.5 + 0.1;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
      sizes[i] = Math.random() * 0.02 + 0.008;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const mat = new THREE.PointsMaterial({
      color: '#FFDF88',
      size: 0.025,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    return { dustGeo: geo, dustMat: mat };
  }, [dustCount]);

  const dustRef = useRef<THREE.Points>(null);

  // Marigold floor instances near badge
  const marigoldClones = useMemo(() => {
    const arr = [];
    const positions: [number, number, number][] = [
      [-0.45, 0.04, 0.75],
      [0.52, 0.04, 0.82],
      [-0.8, 0.04, 1.1],
      [0.85, 0.04, 1.05],
      [-0.2, 0.04, 1.25],
      [0.3, 0.04, 1.3],
    ];
    for (let i = 0; i < positions.length; i++) {
      arr.push({
        pos: positions[i],
        scale: 0.45 + (i % 3) * 0.08,
        rotY: i * 1.1,
      });
    }
    return arr;
  }, []);

  useFrame((_, delta) => {
    const t = frame.time;
    const p2 = frame.dampedProgress['D2'] ?? 0;
    // D2 finale: petals increase ×1.5 speed/density feeling
    const speedMult = 1.0 + p2 * 0.5;

    // Track instance counts per variant
    const counts = [0, 0, 0];

    for (let i = 0; i < petalData.length; i++) {
      const p = petalData[i];

      // Update positions
      p.y -= p.speedY * speedMult * delta;
      // Reset if below floor
      if (p.y < 0.02) {
        p.y = 5.8 + Math.random() * 0.5;
        p.x = (Math.random() - 0.5) * 7;
        p.z = -2.5 + Math.random() * 5.0;
      }

      // Flutter drift
      const flutter = Math.sin(t * 2.5 + p.flutterPhase) * 0.008;
      const x = p.x + flutter;
      const z = p.z + Math.cos(t * 1.8 + p.flutterPhase) * 0.006;

      // Update rotation
      p.rotX += p.rotSpeedX * delta;
      p.rotY += p.rotSpeedY * delta;
      p.rotZ += p.rotSpeedZ * delta;

      dummy.position.set(x, p.y, z);
      dummy.rotation.set(p.rotX, p.rotY, p.rotZ);
      dummy.scale.setScalar(p.scale);
      dummy.updateMatrix();

      const variant = p.colorVariant;
      const mesh = instancedRefs[variant].current;
      if (mesh) {
        mesh.setMatrixAt(counts[variant], dummy.matrix);
        counts[variant]++;
      }
    }

    instancedRefs.forEach((r) => {
      if (r.current) r.current.instanceMatrix.needsUpdate = true;
    });

    // Slow drift of gold dust
    if (dustRef.current) {
      const posAttr = dustRef.current.geometry.attributes.position;
      const arr = posAttr.array as Float32Array;
      for (let i = 1; i < arr.length; i += 3) {
        arr[i] -= 0.08 * delta;
        if (arr[i] < 0.05) {
          arr[i] = 5.5;
        }
      }
      posAttr.needsUpdate = true;
    }
  });

  const variantCounts = [
    Math.ceil(petalCount / 3),
    Math.ceil(petalCount / 3),
    petalCount - Math.ceil(petalCount / 3) * 2,
  ];

  return (
    <group name="PetalField">
      {/* 3 Instanced Meshes for Rose Petals */}
      {materials.map((mat, idx) => (
        <instancedMesh
          key={idx}
          ref={instancedRefs[idx]}
          args={[geometries[0], mat, variantCounts[idx] || 150]}
        />
      ))}

      {/* Gold Dust Particles */}
      <points ref={dustRef} geometry={dustGeo} material={dustMat} />

      {/* Marigold flowers on floor */}
      {marigoldClones.map((m, i) => (
        <group
          key={i}
          position={m.pos}
          scale={[m.scale, m.scale, m.scale]}
          rotation={[0, m.rotY, 0]}
        >
          <primitive object={marigoldGltf.scene.clone()} />
        </group>
      ))}
    </group>
  );
}
