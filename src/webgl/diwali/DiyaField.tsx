"use client";

import React, { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { frame } from "@/state/frame";
import { useStore } from "@/state/store";
import { getAnchorOffsetFromRoot } from "../fx/Flame";

interface DiyaInstanceSpec {
  type: "terracotta" | "brass";
  pos: [number, number, number];
  scale: number;
  rotY: number;
  phase: number;
  hasChain?: boolean;
}

// Authentic luxury Diwali lamp placement:
// 1. Lower tiered lamps framing the stage and marigold floor (y = 0.42..0.85)
// 2. Flanking palace hanging brass deepams suspended along the sides (y = 1.1..2.35)
const DIYA_SPECS: DiyaInstanceSpec[] = [
  // Flanking Left Hanging Brass & Terracotta Deepams
  { type: "brass", pos: [-2.25, 1.25, 0.6], scale: 4.2, rotY: 0.35, phase: 0.0, hasChain: true },
  { type: "terracotta", pos: [-1.65, 0.85, 1.1], scale: 3.8, rotY: 0.25, phase: 0.8 },
  { type: "brass", pos: [-2.55, 1.95, -0.1], scale: 4.4, rotY: 0.45, phase: 1.5, hasChain: true },
  { type: "terracotta", pos: [-1.95, 2.35, -0.5], scale: 4.0, rotY: 0.3, phase: 2.3, hasChain: true },
  { type: "brass", pos: [-2.8, 2.75, -0.8], scale: 4.5, rotY: 0.55, phase: 3.1, hasChain: true },

  // Flanking Right Hanging Brass & Terracotta Deepams
  { type: "brass", pos: [2.25, 1.25, 0.6], scale: 4.2, rotY: -0.35, phase: 0.4, hasChain: true },
  { type: "terracotta", pos: [1.65, 0.85, 1.1], scale: 3.8, rotY: -0.25, phase: 1.2 },
  { type: "brass", pos: [2.55, 1.95, -0.1], scale: 4.4, rotY: -0.45, phase: 1.9, hasChain: true },
  { type: "terracotta", pos: [1.95, 2.35, -0.5], scale: 4.0, rotY: -0.3, phase: 2.7, hasChain: true },
  { type: "brass", pos: [2.8, 2.75, -0.8], scale: 4.5, rotY: -0.55, phase: 3.5, hasChain: true },

  // Lower Crescent Arc Lamps (framing the central space)
  { type: "brass", pos: [-1.35, 0.58, 1.45], scale: 3.6, rotY: 0.15, phase: 0.5 },
  { type: "terracotta", pos: [-0.95, 0.46, 1.65], scale: 3.5, rotY: 0.08, phase: 1.4 },
  { type: "brass", pos: [-0.48, 0.42, 1.78], scale: 3.6, rotY: 0.02, phase: 2.2 },
  { type: "terracotta", pos: [0.0, 0.40, 1.82], scale: 3.7, rotY: 0.0, phase: 3.0 },
  { type: "brass", pos: [0.48, 0.42, 1.78], scale: 3.6, rotY: -0.02, phase: 3.8 },
  { type: "terracotta", pos: [0.95, 0.46, 1.65], scale: 3.5, rotY: -0.08, phase: 4.6 },
  { type: "brass", pos: [1.35, 0.58, 1.45], scale: 3.6, rotY: -0.15, phase: 5.4 },
];

// Realistic Diya Flame Shader with authentic ghee flame physics:
// Incandescent white-hot teardrop, golden-amber core, warm blue wick anchor, soft radial glow
const RealisticFlameShader = {
  vertexShader: /* glsl */ `
    attribute float aPhase;
    attribute float aIntensity;
    uniform vec2 uBaseScale;
    varying vec2 vUv;
    varying float vPhase;
    varying float vIntensity;

    void main() {
      vUv = uv;
      vPhase = aPhase;
      vIntensity = aIntensity;

      vec4 instOrigin = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
      float instScale = length(instanceMatrix[0].xyz);

      vec4 mvPosition = modelViewMatrix * instOrigin;
      // Position quad with flame base right at anchor point
      vec2 quadOffset = vec2(position.x, position.y + 0.32);
      mvPosition.xy += quadOffset * uBaseScale * instScale;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: /* glsl */ `
    uniform float uTime;
    varying vec2 vUv;
    varying float vPhase;
    varying float vIntensity;

    void main() {
      // 1. Soft radial warm light spill (exponential falloff around flame)
      vec2 haloCoord = (vUv - vec2(0.5, 0.34)) * vec2(1.8, 1.4);
      float haloDist = dot(haloCoord, haloCoord);
      float halo = exp(-haloDist * 5.0) * 0.55;

      // 2. Physical teardrop flame shape
      vec2 p = vec2((vUv.x - 0.5) * 2.2, (vUv.y - 0.14) * 1.5);
      float y = clamp(p.y, 0.0, 1.0);
      float w = sqrt(max(0.0, y)) * (1.0 - y) * 1.6;

      // Organic gentle wave flicker
      float wave = sin(uTime * 14.0 + vPhase + y * 5.0) * 0.035 * y
                 + cos(uTime * 9.0 + vPhase * 1.7) * 0.02 * y;
      float dist = abs(p.x - wave);

      float coreMask = 0.0;
      if (y > 0.01 && y < 0.98 && dist < w) {
        float edge = 1.0 - smoothstep(0.0, w, dist);
        float vert = 1.0 - y * 0.85;
        coreMask = edge * vert;
      }

      if (halo < 0.008 && coreMask <= 0.001) discard;

      // Color layers of an authentic ghee flame
      vec3 colBlueWick = vec3(0.2, 0.45, 0.9);   // Subtle blue at wick root
      vec3 colAmber = vec3(1.0, 0.40, 0.04);      // Outer warm flame crest
      vec3 colGold = vec3(1.0, 0.78, 0.16);       // Middle golden ghee flame
      vec3 colHotCore = vec3(1.0, 0.98, 0.94);    // Incandescent white center

      // Blend based on height y and coreMask
      vec3 flameCol = mix(colGold, colHotCore, clamp(coreMask * 2.2, 0.0, 1.0));
      flameCol = mix(colAmber, flameCol, clamp(y * 1.4, 0.0, 1.0));
      // Base blue tint near y <= 0.14
      flameCol = mix(colBlueWick, flameCol, smoothstep(0.02, 0.16, y));

      vec3 finalCol = colAmber * halo * 1.8 + flameCol * coreMask * 3.4;
      float alpha = clamp((halo * 1.1 + coreMask * 2.0) * vIntensity, 0.0, 1.0);

      gl_FragColor = vec4(finalCol * vIntensity, alpha);
    }
  `,
};

function enhanceSubMeshes(root: THREE.Object3D, type: "terracotta" | "brass") {
  const list: { geometry: THREE.BufferGeometry; material: THREE.Material }[] = [];
  root.traverse((node) => {
    if ((node as THREE.Mesh).isMesh) {
      const m = node as THREE.Mesh;
      const orig = Array.isArray(m.material) ? m.material[0] : m.material;
      const mat = (orig as THREE.MeshStandardMaterial).clone();

      if (type === "brass") {
        if (mat.name.toLowerCase().includes("brass") || m.name === "Diya") {
          mat.color.set("#E5AF4D");
          mat.metalness = 0.94;
          mat.roughness = 0.22;
        } else if (mat.name.toLowerCase().includes("oil") || m.name === "Oil") {
          mat.color.set("#2A1403");
          mat.metalness = 0.1;
          mat.roughness = 0.04;
        } else if (mat.name.toLowerCase().includes("wick") || m.name === "Wick") {
          mat.color.set("#150C07");
          mat.roughness = 0.95;
        }
      } else {
        if (mat.name.toLowerCase().includes("terra") || m.name === "Diya") {
          mat.color.set("#9E4424");
          mat.metalness = 0.02;
          mat.roughness = 0.68;
        } else if (mat.name.toLowerCase().includes("oil") || m.name === "Oil") {
          mat.color.set("#251102");
          mat.metalness = 0.1;
          mat.roughness = 0.04;
        } else if (mat.name.toLowerCase().includes("wick") || m.name === "Wick") {
          mat.color.set("#150C07");
          mat.roughness = 0.95;
        }
      }

      list.push({ geometry: m.geometry, material: mat });
    }
  });
  return list;
}

export function DiyaField() {
  const brassGltf = useGLTF("/models/diwali-diya-brass.glb");
  const terraGltf = useGLTF("/models/diwali-diya-terracotta.glb");

  const {
    terraSubMeshes,
    brassSubMeshes,
    terraAnchorOffset,
    brassAnchorOffset,
    terraSpecs,
    brassSpecs,
    allSpecs,
  } = useMemo(() => {
    const tSubs = enhanceSubMeshes(terraGltf.scene, "terracotta");
    const bSubs = enhanceSubMeshes(brassGltf.scene, "brass");
    const tAnchor = getAnchorOffsetFromRoot(terraGltf.scene, "Flame_Anchor");
    const bAnchor = getAnchorOffsetFromRoot(brassGltf.scene, "Flame_Anchor");

    const tSpecs = DIYA_SPECS.filter((d) => d.type === "terracotta");
    const bSpecs = DIYA_SPECS.filter((d) => d.type === "brass");

    return {
      terraSubMeshes: tSubs,
      brassSubMeshes: bSubs,
      terraAnchorOffset: tAnchor,
      brassAnchorOffset: bAnchor,
      terraSpecs: tSpecs,
      brassSpecs: bSpecs,
      allSpecs: [...tSpecs, ...bSpecs],
    };
  }, [terraGltf.scene, brassGltf.scene]);

  const terraMeshRefs = useRef<(THREE.InstancedMesh | null)[]>([]);
  const brassMeshRefs = useRef<(THREE.InstancedMesh | null)[]>([]);
  const flameMeshRef = useRef<THREE.InstancedMesh>(null);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const flameVec = useMemo(() => new THREE.Vector3(), []);

  // Single InstancedMesh for realistic flames
  const { flameGeo, flameMat } = useMemo(() => {
    const total = allSpecs.length;
    const geo = new THREE.PlaneGeometry(1, 1);
    const intensities = new Float32Array(total);
    const phases = new Float32Array(total);
    for (let i = 0; i < total; i++) {
      intensities[i] = 1.45;
      phases[i] = allSpecs[i].phase;
    }
    geo.setAttribute(
      "aIntensity",
      new THREE.InstancedBufferAttribute(intensities, 1),
    );
    geo.setAttribute("aPhase", new THREE.InstancedBufferAttribute(phases, 1));

    const mat = new THREE.ShaderMaterial({
      vertexShader: RealisticFlameShader.vertexShader,
      fragmentShader: RealisticFlameShader.fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uBaseScale: { value: new THREE.Vector2(0.18, 0.32) },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    return { flameGeo: geo, flameMat: mat };
  }, [allSpecs]);

  // Initialize static matrices
  useEffect(() => {
    terraMeshRefs.current.forEach((im) => {
      if (im) im.frustumCulled = false;
    });
    brassMeshRefs.current.forEach((im) => {
      if (im) im.frustumCulled = false;
    });
    if (flameMeshRef.current) flameMeshRef.current.frustumCulled = false;
  }, [terraSpecs, brassSpecs]);

  useFrame(() => {
    const st = useStore.getState();
    if (st.world !== "diwali" && st.previousWorld !== "diwali") return;
    const t = frame.time;

    flameMat.uniforms.uTime.value = t;

    let flameIdx = 0;

    // 1. Update Terracotta Diya InstancedMeshes
    for (let i = 0; i < terraSpecs.length; i++) {
      const spec = terraSpecs[i];
      const gentleSway = Math.sin(t * 1.5 + spec.phase) * 0.015;

      dummy.position.set(spec.pos[0], spec.pos[1] + gentleSway, spec.pos[2]);
      dummy.rotation.set(0, spec.rotY, 0);
      dummy.scale.setScalar(spec.scale * 0.65);
      dummy.updateMatrix();

      for (let m = 0; m < terraMeshRefs.current.length; m++) {
        const im = terraMeshRefs.current[m];
        if (im) im.setMatrixAt(i, dummy.matrix);
      }

      // Flame Anchor
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

    // 2. Update Brass Diya InstancedMeshes
    for (let i = 0; i < brassSpecs.length; i++) {
      const spec = brassSpecs[i];
      const gentleSway = Math.sin(t * 1.5 + spec.phase) * 0.015;

      dummy.position.set(spec.pos[0], spec.pos[1] + gentleSway, spec.pos[2]);
      dummy.rotation.set(0, spec.rotY, 0);
      dummy.scale.setScalar(spec.scale * 0.65);
      dummy.updateMatrix();

      for (let m = 0; m < brassMeshRefs.current.length; m++) {
        const im = brassMeshRefs.current[m];
        if (im) im.setMatrixAt(i, dummy.matrix);
      }

      // Flame Anchor
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

      {/* Instanced Diya Flames with authentic physical teardrop & glow */}
      <instancedMesh
        ref={flameMeshRef}
        args={[flameGeo, flameMat, allSpecs.length]}
        frustumCulled={false}
      />
    </group>
  );
}
