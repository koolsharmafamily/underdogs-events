"use client";

import React, { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { frame } from "@/state/frame";
import { useStore } from "@/state/store";
import { getAnchorOffsetFromRoot, InstancedFlameShader } from "../fx/Flame";

interface DiyaInstanceSpec {
  type: "terracotta" | "brass";
  pos: [number, number, number];
  scale: number;
  rotY: number;
  floating: boolean;
  speed: number;
  phase: number;
}

// 12 terracotta diyas on the floor (y = 0) in a soft arc in front of the badge (uniform scale ×3)
const FLOOR_TERRACOTTA_DIYAS: DiyaInstanceSpec[] = Array.from(
  { length: 12 },
  (_, i) => {
    const t = i / 11; // 0..1
    const angle = THREE.MathUtils.lerp(-1.18, 1.18, t);
    const radius = 1.45 + (i % 2 === 0 ? 0.14 : -0.06);
    const x = Math.sin(angle) * radius;
    const z = Math.cos(angle) * radius - 0.15;
    return {
      type: "terracotta",
      pos: [Number(x.toFixed(3)), 0, Number(z.toFixed(3))],
      scale: 3.0,
      rotY: -angle * 0.65,
      floating: false,
      speed: 0,
      phase: i * 0.52,
    };
  },
);

// 24 floating diyas (mix of brass and terracotta, desktop; 10 mobile) at z = -3..+2, y = 0.4..3.2, scale ×2.5..4
const FLOATING_DIYAS_24: DiyaInstanceSpec[] = [
  {
    type: "brass",
    pos: [-2.1, 1.15, 0.4],
    scale: 3.2,
    rotY: 0.2,
    floating: true,
    speed: 0.9,
    phase: 0.0,
  },
  {
    type: "terracotta",
    pos: [2.05, 1.25, 0.3],
    scale: 3.1,
    rotY: -0.2,
    floating: true,
    speed: 0.85,
    phase: 0.5,
  },
  {
    type: "brass",
    pos: [-2.6, 2.35, -0.4],
    scale: 3.6,
    rotY: 0.35,
    floating: true,
    speed: 0.78,
    phase: 1.1,
  },
  {
    type: "terracotta",
    pos: [2.55, 2.25, -0.5],
    scale: 3.5,
    rotY: -0.3,
    floating: true,
    speed: 0.88,
    phase: 1.6,
  },
  {
    type: "brass",
    pos: [-1.35, 0.65, 1.45],
    scale: 2.8,
    rotY: 0.15,
    floating: true,
    speed: 1.02,
    phase: 2.1,
  },
  {
    type: "terracotta",
    pos: [1.38, 0.72, 1.4],
    scale: 2.85,
    rotY: -0.18,
    floating: true,
    speed: 0.94,
    phase: 2.6,
  },
  {
    type: "brass",
    pos: [-1.75, 2.85, -1.2],
    scale: 3.4,
    rotY: 0.4,
    floating: true,
    speed: 0.82,
    phase: 3.1,
  },
  {
    type: "terracotta",
    pos: [1.8, 2.75, -1.1],
    scale: 3.35,
    rotY: -0.4,
    floating: true,
    speed: 0.86,
    phase: 3.6,
  },
  {
    type: "brass",
    pos: [-2.85, 1.55, -1.6],
    scale: 3.8,
    rotY: 0.5,
    floating: true,
    speed: 0.92,
    phase: 4.1,
  },
  {
    type: "terracotta",
    pos: [2.8, 1.62, -1.5],
    scale: 3.7,
    rotY: -0.45,
    floating: true,
    speed: 0.89,
    phase: 4.6,
  },
  // Desktop-only additional 14 floating diyas (depths z = -3..+2, heights y = 0.4..3.2, scale 2.5..4)
  {
    type: "brass",
    pos: [-0.95, 2.95, -1.9],
    scale: 3.1,
    rotY: 0.1,
    floating: true,
    speed: 0.8,
    phase: 5.1,
  },
  {
    type: "terracotta",
    pos: [0.98, 3.05, -1.85],
    scale: 3.15,
    rotY: -0.1,
    floating: true,
    speed: 0.84,
    phase: 5.6,
  },
  {
    type: "brass",
    pos: [-2.2, 0.52, -0.8],
    scale: 2.7,
    rotY: 0.3,
    floating: true,
    speed: 0.96,
    phase: 0.3,
  },
  {
    type: "terracotta",
    pos: [2.25, 0.58, -0.75],
    scale: 2.75,
    rotY: -0.28,
    floating: true,
    speed: 0.91,
    phase: 0.8,
  },
  {
    type: "brass",
    pos: [-3.1, 2.05, 0.85],
    scale: 3.9,
    rotY: 0.45,
    floating: true,
    speed: 0.76,
    phase: 1.4,
  },
  {
    type: "terracotta",
    pos: [3.05, 1.98, 0.8],
    scale: 3.85,
    rotY: -0.42,
    floating: true,
    speed: 0.79,
    phase: 1.9,
  },
  {
    type: "brass",
    pos: [-1.55, 1.85, -2.5],
    scale: 3.3,
    rotY: 0.22,
    floating: true,
    speed: 0.87,
    phase: 2.4,
  },
  {
    type: "terracotta",
    pos: [1.58, 1.92, -2.4],
    scale: 3.25,
    rotY: -0.25,
    floating: true,
    speed: 0.83,
    phase: 2.9,
  },
  {
    type: "brass",
    pos: [-2.45, 3.12, -2.2],
    scale: 3.7,
    rotY: 0.38,
    floating: true,
    speed: 0.75,
    phase: 3.4,
  },
  {
    type: "terracotta",
    pos: [2.42, 3.08, -2.1],
    scale: 3.65,
    rotY: -0.36,
    floating: true,
    speed: 0.77,
    phase: 3.9,
  },
  {
    type: "brass",
    pos: [-2.15, 0.88, 1.75],
    scale: 2.6,
    rotY: 0.28,
    floating: true,
    speed: 1.04,
    phase: 4.4,
  },
  {
    type: "terracotta",
    pos: [2.12, 0.92, 1.7],
    scale: 2.65,
    rotY: -0.26,
    floating: true,
    speed: 1.0,
    phase: 4.9,
  },
  {
    type: "brass",
    pos: [-0.65, 2.55, -2.85],
    scale: 3.0,
    rotY: 0.08,
    floating: true,
    speed: 0.81,
    phase: 5.4,
  },
  {
    type: "terracotta",
    pos: [0.68, 2.62, -2.8],
    scale: 2.95,
    rotY: -0.08,
    floating: true,
    speed: 0.85,
    phase: 5.9,
  },
];

interface SubMeshEntry {
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
}

function extractSubMeshes(root: THREE.Object3D): SubMeshEntry[] {
  const list: SubMeshEntry[] = [];
  root.traverse((node) => {
    if ((node as THREE.Mesh).isMesh) {
      const m = node as THREE.Mesh;
      const mat = Array.isArray(m.material) ? m.material[0] : m.material;
      list.push({ geometry: m.geometry, material: mat });
    }
  });
  return list;
}

export function DiyaField() {
  const { size } = useThree();
  const isMobile = size.width < 768;

  const brassGltf = useGLTF("/models/diwali-diya-brass.glb");
  const terraGltf = useGLTF("/models/diwali-diya-terracotta.glb");

  // Extract sub-meshes (Diya, Oil, Wick) and Flame_Anchor offset from each GLB (zero clone())
  const {
    terraSubMeshes,
    brassSubMeshes,
    terraAnchorOffset,
    brassAnchorOffset,
    terraSpecs,
    brassSpecs,
    allSpecs,
  } = useMemo(() => {
    const tSubs = extractSubMeshes(terraGltf.scene);
    const bSubs = extractSubMeshes(brassGltf.scene);
    const tAnchor = getAnchorOffsetFromRoot(terraGltf.scene, "Flame_Anchor");
    const bAnchor = getAnchorOffsetFromRoot(brassGltf.scene, "Flame_Anchor");

    const floatingSlice = FLOATING_DIYAS_24.slice(0, isMobile ? 10 : 24);
    const combined = [...FLOOR_TERRACOTTA_DIYAS, ...floatingSlice];
    const tSpecs = combined.filter((d) => d.type === "terracotta");
    const bSpecs = combined.filter((d) => d.type === "brass");

    return {
      terraSubMeshes: tSubs,
      brassSubMeshes: bSubs,
      terraAnchorOffset: tAnchor,
      brassAnchorOffset: bAnchor,
      terraSpecs: tSpecs,
      brassSpecs: bSpecs,
      allSpecs: [...tSpecs, ...bSpecs],
    };
  }, [terraGltf.scene, brassGltf.scene, isMobile]);

  const terraMeshRefs = useRef<(THREE.InstancedMesh | null)[]>([]);
  const brassMeshRefs = useRef<(THREE.InstancedMesh | null)[]>([]);
  const flameMeshRef = useRef<THREE.InstancedMesh>(null);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const flameVec = useMemo(() => new THREE.Vector3(), []);

  // Single InstancedMesh for all diya flames + additive halos
  const { flameGeo, flameMat } = useMemo(() => {
    const total = allSpecs.length;
    const geo = new THREE.PlaneGeometry(1, 1);
    const intensities = new Float32Array(total);
    const phases = new Float32Array(total);
    for (let i = 0; i < total; i++) {
      intensities[i] = 1.25;
      phases[i] = allSpecs[i].phase;
    }
    geo.setAttribute(
      "aIntensity",
      new THREE.InstancedBufferAttribute(intensities, 1),
    );
    geo.setAttribute("aPhase", new THREE.InstancedBufferAttribute(phases, 1));

    const mat = new THREE.ShaderMaterial({
      vertexShader: InstancedFlameShader.vertexShader,
      fragmentShader: InstancedFlameShader.fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uBaseScale: { value: new THREE.Vector2(0.075, 0.125) },
        uColorCore: { value: new THREE.Color("#FFF5D6") },
        uColorTip: { value: new THREE.Color("#FF8020") },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    return { flameGeo: geo, flameMat: mat };
  }, [allSpecs]);

  // Initialize static/initial matrices
  useEffect(() => {
    terraMeshRefs.current.forEach((im) => {
      if (im) im.frustumCulled = false;
    });
    brassMeshRefs.current.forEach((im) => {
      if (im) im.frustumCulled = false;
    });
    if (flameMeshRef.current) {
      flameMeshRef.current.frustumCulled = false;
    }
  }, [terraSpecs, brassSpecs]);

  useFrame(() => {
    const st = useStore.getState();
    if (st.world !== "diwali" && st.previousWorld !== "diwali") return;
    const t = frame.time;

    flameMat.uniforms.uTime.value = t;

    let flameIdx = 0;

    // 1. Update Terracotta Diya InstancedMeshes (12 floor + floating terracotta) & their Flame_Anchor positions
    for (let i = 0; i < terraSpecs.length; i++) {
      const spec = terraSpecs[i];
      const bob = spec.floating
        ? Math.sin(t * spec.speed + spec.phase) * 0.04
        : 0;
      const y = spec.pos[1] + bob;

      dummy.position.set(spec.pos[0], y, spec.pos[2]);
      dummy.rotation.set(0, spec.rotY, 0);
      dummy.scale.setScalar(spec.scale * 0.65);
      dummy.updateMatrix();

      for (let m = 0; m < terraMeshRefs.current.length; m++) {
        const im = terraMeshRefs.current[m];
        if (im) im.setMatrixAt(i, dummy.matrix);
      }

      // Compute exact world position of Flame_Anchor for this diya instance
      if (flameMeshRef.current) {
        flameVec.copy(terraAnchorOffset).applyMatrix4(dummy.matrix);
        dummy.position.copy(flameVec);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.setScalar(spec.scale * 0.55);
        dummy.updateMatrix();
        flameMeshRef.current.setMatrixAt(flameIdx, dummy.matrix);
      }
      flameIdx++;
    }

    // 2. Update Brass Diya InstancedMeshes (floating brass) & their Flame_Anchor positions
    for (let i = 0; i < brassSpecs.length; i++) {
      const spec = brassSpecs[i];
      const bob = spec.floating
        ? Math.sin(t * spec.speed + spec.phase) * 0.04
        : 0;
      const y = spec.pos[1] + bob;

      dummy.position.set(spec.pos[0], y, spec.pos[2]);
      dummy.rotation.set(0, spec.rotY, 0);
      dummy.scale.setScalar(spec.scale * 0.65);
      dummy.updateMatrix();

      for (let m = 0; m < brassMeshRefs.current.length; m++) {
        const im = brassMeshRefs.current[m];
        if (im) im.setMatrixAt(i, dummy.matrix);
      }

      if (flameMeshRef.current) {
        flameVec.copy(brassAnchorOffset).applyMatrix4(dummy.matrix);
        dummy.position.copy(flameVec);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.setScalar(spec.scale * 0.55);
        dummy.updateMatrix();
        flameMeshRef.current.setMatrixAt(flameIdx, dummy.matrix);
      }
      flameIdx++;
    }

    for (let m = 0; m < terraMeshRefs.current.length; m++) {
      const im = terraMeshRefs.current[m];
      if (im) im.instanceMatrix.needsUpdate = true;
    }
    for (let m = 0; m < brassMeshRefs.current.length; m++) {
      const im = brassMeshRefs.current[m];
      if (im) im.instanceMatrix.needsUpdate = true;
    }
    if (flameMeshRef.current) {
      flameMeshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group name="DiyaField">
      {/* Terracotta Diya Sub-Meshes (Diya, Oil, Wick) */}
      {terraSubMeshes.map((sm, idx) => (
        <instancedMesh
          key={`terra-${idx}`}
          ref={(el) => {
            terraMeshRefs.current[idx] = el;
          }}
          args={[sm.geometry, sm.material, terraSpecs.length]}
          frustumCulled={false}
        />
      ))}

      {/* Brass Diya Sub-Meshes (Diya, Oil, Wick) */}
      {brassSubMeshes.map((sm, idx) => (
        <instancedMesh
          key={`brass-${idx}`}
          ref={(el) => {
            brassMeshRefs.current[idx] = el;
          }}
          args={[sm.geometry, sm.material, brassSpecs.length]}
          frustumCulled={false}
        />
      ))}

      {/* Instanced Diya Flames + Additive Halos on Flame_Anchor */}
      <instancedMesh
        ref={flameMeshRef}
        args={[flameGeo, flameMat, allSpecs.length]}
        frustumCulled={false}
      />
    </group>
  );
}
