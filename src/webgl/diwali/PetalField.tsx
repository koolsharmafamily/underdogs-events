'use client';

import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { frame } from '@/state/frame';
import { useStore } from '@/state/store';

interface PetalFieldProps {
  dustCount?: number;
}

export function PetalField({ dustCount = 240 }: PetalFieldProps) {
  const { size } = useThree();
  const isMobile = size.width < 768;
  const petalCount = isMobile ? 120 : 400;
  const headsPerGarland = isMobile ? 50 : 120;

  const petalGltf = useGLTF('/models/diwali-rose-petal.glb');
  const marigoldGltf = useGLTF('/models/diwali-marigold.glb');

  // 1. Extract and center geometries & materials for the 3 rose petal variants (Petal_Rani, Petal_Blush, Petal_Ivory)
  const petalVariants = useMemo(() => {
    const names = ['Petal_Rani', 'Petal_Blush', 'Petal_Ivory'] as const;
    return names.map((name) => {
      const node = petalGltf.scene.getObjectByName(name) as THREE.Mesh | undefined;
      if (node && node.isMesh) {
        const g = node.geometry.clone();
        g.computeBoundingBox();
        if (g.boundingBox) {
          const cx = (g.boundingBox.min.x + g.boundingBox.max.x) * 0.5;
          const cy = (g.boundingBox.min.y + g.boundingBox.max.y) * 0.5;
          const cz = (g.boundingBox.min.z + g.boundingBox.max.z) * 0.5;
          g.translate(-cx, -cy, -cz);
        }
        const mat = Array.isArray(node.material) ? node.material[0] : node.material;
        return { geometry: g, material: mat };
      }
      return {
        geometry: new THREE.PlaneGeometry(0.03, 0.035),
        material: new THREE.MeshStandardMaterial({ color: '#C5287B', roughness: 0.6 }),
      };
    });
  }, [petalGltf.scene]);

  // 2. Extract and center geometries & materials for Marigold_Orange and Marigold_Yellow, and generate CatmullRomCurve3 garlands + floor heads
  const {
    orangeGeo,
    orangeMat,
    yellowGeo,
    yellowMat,
    orangeTransforms,
    yellowTransforms,
  } = useMemo(() => {
    const oNode = marigoldGltf.scene.getObjectByName('Marigold_Orange') as THREE.Mesh | undefined;
    const yNode = marigoldGltf.scene.getObjectByName('Marigold_Yellow') as THREE.Mesh | undefined;

    const prepMarigoldGeo = (mesh?: THREE.Mesh) => {
      if (!mesh || !mesh.isMesh) return new THREE.SphereGeometry(0.035, 12, 10);
      const g = mesh.geometry.clone();
      g.computeBoundingBox();
      if (g.boundingBox) {
        const cx = (g.boundingBox.min.x + g.boundingBox.max.x) * 0.5;
        const cy = (g.boundingBox.min.y + g.boundingBox.max.y) * 0.5;
        const cz = (g.boundingBox.min.z + g.boundingBox.max.z) * 0.5;
        g.translate(-cx, -cy, -cz);
      }
      return g;
    };

    const oGeo = prepMarigoldGeo(oNode);
    const yGeo = prepMarigoldGeo(yNode);
    const oMat =
      oNode && oNode.material
        ? Array.isArray(oNode.material)
          ? oNode.material[0]
          : oNode.material
        : new THREE.MeshStandardMaterial({ color: '#FF7A00', roughness: 0.7 });
    const yMat =
      yNode && yNode.material
        ? Array.isArray(yNode.material)
          ? yNode.material[0]
          : yNode.material
        : new THREE.MeshStandardMaterial({ color: '#FFB800', roughness: 0.7 });

    // Build CatmullRomCurve3 garlands:
    // Garland 1: Toran swag across valance (triple-scalloped festive swag)
    const toranCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-2.75, 3.78, -0.02),
      new THREE.Vector3(-1.85, 3.32, 0.04),
      new THREE.Vector3(-0.92, 3.72, -0.02),
      new THREE.Vector3(0.0, 3.24, 0.05),
      new THREE.Vector3(0.92, 3.72, -0.02),
      new THREE.Vector3(1.85, 3.32, 0.04),
      new THREE.Vector3(2.75, 3.78, -0.02),
    ]);

    // Garland 2: Left vertical ladi pair hanging at left side of stage
    const leftOuterCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-2.58, 3.82, 0.02),
      new THREE.Vector3(-2.62, 2.65, 0.05),
      new THREE.Vector3(-2.56, 1.5, 0.03),
      new THREE.Vector3(-2.6, 0.38, 0.02),
    ]);
    const leftInnerCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-2.32, 3.72, 0.02),
      new THREE.Vector3(-2.36, 2.55, 0.05),
      new THREE.Vector3(-2.3, 1.45, 0.03),
      new THREE.Vector3(-2.34, 0.55, 0.02),
    ]);

    // Garland 3: Right vertical ladi pair hanging at right side of stage
    const rightInnerCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(2.32, 3.72, 0.02),
      new THREE.Vector3(2.36, 2.55, 0.05),
      new THREE.Vector3(2.3, 1.45, 0.03),
      new THREE.Vector3(2.34, 0.55, 0.02),
    ]);
    const rightOuterCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(2.58, 3.82, 0.02),
      new THREE.Vector3(2.62, 2.65, 0.05),
      new THREE.Vector3(2.56, 1.5, 0.03),
      new THREE.Vector3(2.6, 0.38, 0.02),
    ]);

    const oList: THREE.Matrix4[] = [];
    const yList: THREE.Matrix4[] = [];
    const tempObj = new THREE.Object3D();
    const pt = new THREE.Vector3();
    let globalIdx = 0;

    const sampleCurve = (curve: THREE.CatmullRomCurve3, count: number) => {
      for (let i = 0; i < count; i++) {
        const u = count > 1 ? i / (count - 1) : 0;
        curve.getPoint(u, pt);
        tempObj.position.copy(pt);
        tempObj.rotation.set(
          (globalIdx * 0.7) % Math.PI,
          (globalIdx * 1.3) % (Math.PI * 2),
          (globalIdx * 0.5) % Math.PI
        );
        tempObj.scale.setScalar(2.5); // Uniform scale ×2.5 per spec
        tempObj.updateMatrix();
        if (globalIdx % 2 === 0) {
          oList.push(tempObj.matrix.clone());
        } else {
          yList.push(tempObj.matrix.clone());
        }
        globalIdx++;
      }
    };

    // 1 toran swag (headsPerGarland) + 2 left ladis (headsPerGarland total) + 2 right ladis (headsPerGarland total)
    sampleCurve(toranCurve, headsPerGarland);
    const halfLadi = Math.floor(headsPerGarland / 2);
    sampleCurve(leftOuterCurve, halfLadi);
    sampleCurve(leftInnerCurve, headsPerGarland - halfLadi);
    sampleCurve(rightInnerCurve, halfLadi);
    sampleCurve(rightOuterCurve, headsPerGarland - halfLadi);

    // Plus 20 loose marigold heads grounded on the floor around the floor diyas (scale ×2.5 -> radius ~0.09m, grounded at y = 0.088)
    for (let i = 0; i < 20; i++) {
      const t = i / 19;
      const angle = THREE.MathUtils.lerp(-1.25, 1.25, t);
      const r = 1.25 + (i % 3) * 0.22;
      const x = Math.sin(angle) * r;
      const z = Math.cos(angle) * r - 0.15;
      tempObj.position.set(x, 0.088, z);
      tempObj.rotation.set(0.15 * ((i % 3) - 1), i * 1.1, 0.1 * (i % 2));
      tempObj.scale.setScalar(2.5);
      tempObj.updateMatrix();
      if (globalIdx % 2 === 0) {
        oList.push(tempObj.matrix.clone());
      } else {
        yList.push(tempObj.matrix.clone());
      }
      globalIdx++;
    }

    return {
      orangeGeo: oGeo,
      orangeMat: oMat,
      yellowGeo: yGeo,
      yellowMat: yMat,
      orangeTransforms: oList,
      yellowTransforms: yList,
    };
  }, [marigoldGltf.scene, headsPerGarland]);

  const orangeRef = useRef<THREE.InstancedMesh>(null);
  const yellowRef = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    if (orangeRef.current) {
      orangeTransforms.forEach((m, i) => orangeRef.current!.setMatrixAt(i, m));
      orangeRef.current.instanceMatrix.needsUpdate = true;
      orangeRef.current.frustumCulled = false;
    }
    if (yellowRef.current) {
      yellowTransforms.forEach((m, i) => yellowRef.current!.setMatrixAt(i, m));
      yellowRef.current.instanceMatrix.needsUpdate = true;
      yellowRef.current.frustumCulled = false;
    }
  }, [orangeTransforms, yellowTransforms]);

  // 3. Rose Petals initial state (400 desktop / 120 mobile, uniform scale ×3)
  const petalData = useMemo(() => {
    const data = [];
    for (let i = 0; i < petalCount; i++) {
      data.push({
        x: (Math.random() - 0.5) * 7.2,
        y: Math.random() * 5.8 + 0.15,
        z: -2.5 + Math.random() * 4.8,
        rotX: Math.random() * Math.PI * 2,
        rotY: Math.random() * Math.PI * 2,
        rotZ: Math.random() * Math.PI * 2,
        speedY: 0.35 + Math.random() * 0.45,
        rotSpeedX: (Math.random() - 0.5) * 2.0,
        rotSpeedY: (Math.random() - 0.5) * 2.5,
        rotSpeedZ: (Math.random() - 0.5) * 1.5,
        flutterPhase: Math.random() * Math.PI * 2,
        scale: 3.0, // Uniform scale ×3 per spec
        colorVariant: i % 3, // 0 = Petal_Rani, 1 = Petal_Blush, 2 = Petal_Ivory
      });
    }
    return data;
  }, [petalCount]);

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

  useFrame((_, delta) => {
    const st = useStore.getState();
    if (st.world !== 'diwali' && st.previousWorld !== 'diwali') return;

    if (frame.transition.phase !== 'idle' && isMobile) {
      return;
    }

    const t = frame.time;
    const p2 = frame.dampedProgress['D2'] ?? 0;
    const speedMult = 1.0 + p2 * 0.5;

    const counts = [0, 0, 0];

    for (let i = 0; i < petalData.length; i++) {
      const p = petalData[i];

      p.y -= p.speedY * speedMult * delta;
      if (p.y < 0.02) {
        p.y = 5.8 + Math.random() * 0.5;
        p.x = (Math.random() - 0.5) * 7.2;
        p.z = -2.5 + Math.random() * 4.8;
      }

      const flutter = Math.sin(t * 2.5 + p.flutterPhase) * 0.08;
      const x = p.x + flutter;
      const z = p.z + Math.cos(t * 1.8 + p.flutterPhase) * 0.05;

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

    if (dustRef.current) {
      dustRef.current.position.y = -((t * 0.08) % 1.5);
      dustRef.current.rotation.y = t * 0.02;
    }
  });

  const variantCounts = [
    Math.ceil(petalCount / 3),
    Math.ceil(petalCount / 3),
    Math.ceil(petalCount / 3),
  ];

  return (
    <group name="PetalAndMarigoldField">
      {/* 3 InstancedMeshes for Rose Petals (Petal_Rani, Petal_Blush, Petal_Ivory) */}
      {petalVariants.map((v, idx) => (
        <instancedMesh
          key={`petal-${idx}`}
          ref={instancedRefs[idx]}
          args={[v.geometry, v.material, variantCounts[idx]]}
          frustumCulled={false}
        />
      ))}

      {/* 2 InstancedMeshes for Marigold Garlands (Toran + 2 Side Ladis) & Loose Floor Heads */}
      <instancedMesh
        ref={orangeRef}
        args={[orangeGeo, orangeMat, orangeTransforms.length]}
        frustumCulled={false}
      />
      <instancedMesh
        ref={yellowRef}
        args={[yellowGeo, yellowMat, yellowTransforms.length]}
        frustumCulled={false}
      />

      {/* Gold Dust Particles */}
      <points ref={dustRef} geometry={dustGeo} material={dustMat} />
    </group>
  );
}
