'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { frame } from '@/state/frame';
import { useStore } from '@/state/store';

/**
 * Grounds a standing 3D object using its world-space bounding box (Global Rule 2):
 * Computes THREE.Box3().setFromObject(obj) and offsets obj.position.y so its lowest
 * point sits at targetMinY (default y = 0 floor, or plinth/table height).
 */
export function groundObjectToY(obj: THREE.Object3D, targetMinY = 0): number {
  obj.updateMatrixWorld(true);
  // Only what is drawn: hidden helpers or parts below the floor would leave the
  // visible model floating (the Red Room curtain sat 13 cm up).
  const box = new THREE.Box3();
  obj.traverseVisible((node) => {
    if ((node as THREE.Mesh).isMesh) box.expandByObject(node);
  });
  if (!box.isEmpty() && Number.isFinite(box.min.y)) {
    const offset = targetMinY - box.min.y;
    obj.position.y += offset;
    obj.updateMatrixWorld(true);
    return offset;
  }
  return 0;
}

/**
 * Collects empty anchor nodes (e.g. Flame_Anchor_*, Light_Anchor) from a GLB hierarchy
 * in natural sorted order (Flame_Anchor_1 .. Flame_Anchor_8, Flame_Anchor_L, Flame_Anchor_R).
 */
export function findAnchorNodes(
  root: THREE.Object3D,
  prefix = 'Flame_Anchor'
): THREE.Object3D[] {
  const anchors: THREE.Object3D[] = [];
  root.traverse((node) => {
    if (node.name && node.name.startsWith(prefix)) {
      anchors.push(node);
    }
  });
  anchors.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
  return anchors;
}

/**
 * Reads the local-space position of a named anchor relative to the GLB root.
 * Used when building InstancedMesh props so flames sit on the GLB's own anchor empty.
 */
export function getAnchorOffsetFromRoot(
  root: THREE.Object3D,
  anchorName = 'Flame_Anchor'
): THREE.Vector3 {
  root.updateMatrixWorld(true);
  const rootInv = new THREE.Matrix4().copy(root.matrixWorld).invert();
  const target = root.getObjectByName(anchorName);
  const out = new THREE.Vector3();
  if (target) {
    target.getWorldPosition(out);
    out.applyMatrix4(rootInv);
  }
  return out;
}

const InstancedFlameShader = {
  vertexShader: /* glsl */ `
    attribute float aIntensity;
    attribute float aPhase;
    uniform vec2 uBaseScale;
    varying vec2 vUv;
    varying float vIntensity;
    varying float vPhase;

    void main() {
      vUv = uv;
      vIntensity = aIntensity;
      vPhase = aPhase;

      // Extract instance world/group position and uniform scale from instanceMatrix
      vec4 instOrigin = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
      float instScale = length(instanceMatrix[0].xyz);

      vec4 mvPosition = modelViewMatrix * instOrigin;
      // Offset quad upward so the bottom of the flame core sits right on the anchor empty
      vec2 quadOffset = vec2(position.x, position.y + 0.22);
      mvPosition.xy += quadOffset * uBaseScale * instScale;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: /* glsl */ `
    uniform float uTime;
    uniform vec3 uColorCore;
    uniform vec3 uColorTip;
    varying vec2 vUv;
    varying float vIntensity;
    varying float vPhase;

    void main() {
      if (vIntensity <= 0.01) discard;

      // Soft additive halo sprite around the flame (Global Rule 7)
      vec2 haloCoord = (vUv - vec2(0.5, 0.34)) * vec2(2.0, 1.6);
      float haloDistSq = dot(haloCoord, haloCoord);
      float halo = exp(-haloDistSq * 5.5) * 0.42;

      // Teardrop flame core mapped to center region of quad
      vec2 p = vec2((vUv.x - 0.5) * 2.4, (vUv.y - 0.18) * 1.45);
      float y = clamp(p.y, 0.0, 1.0);
      float w = sqrt(y) * (1.0 - y) * 1.65;

      float flicker = sin(uTime * 19.0 + vPhase + y * 5.5) * 0.045 * y
                    + cos(uTime * 11.3 + vPhase * 1.7) * 0.02 * y;
      float dist = abs(p.x - flicker);

      float coreMask = 0.0;
      if (y > 0.01 && y < 0.99 && dist < w) {
        float edge = 1.0 - smoothstep(0.0, w, dist);
        float vert = 1.0 - y * 0.85;
        coreMask = edge * vert;
      }

      if (halo < 0.008 && coreMask <= 0.001) discard;

      vec3 coreCol = mix(uColorTip, uColorCore, clamp(coreMask * 1.6, 0.0, 1.0));
      vec3 finalCol = uColorTip * halo * 1.35 + coreCol * coreMask * 2.4;
      float alpha = clamp((halo + coreMask) * vIntensity, 0.0, 1.0);

      gl_FragColor = vec4(finalCol * vIntensity, alpha);
    }
  `,
};

interface AnchorFlamesProps {
  anchors: THREE.Object3D[];
  worldId: 'home' | 'redroom' | 'diwali';
  scale?: number;
  intensitiesRef?: React.MutableRefObject<number[]>;
  baseIntensity?: number;
  colorCore?: string;
  colorTip?: string;
}

/**
 * Renders camera-facing teardrop flames + additive halo sprites at the exact world
 * position of each GLB Flame_Anchor_* empty every frame in a single InstancedMesh draw call.
 */
export function AnchorFlames({
  anchors,
  worldId,
  scale = 0.22,
  intensitiesRef,
  baseIntensity = 1.0,
  colorCore = '#FFF5D0',
  colorTip = '#FF7A18',
}: AnchorFlamesProps) {
  const count = Math.max(1, anchors.length);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const worldPos = useMemo(() => new THREE.Vector3(), []);

  const { geometry, material, intensityAttr } = useMemo(() => {
    const geo = new THREE.PlaneGeometry(1, 1);
    const intensities = new Float32Array(count);
    const phases = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      intensities[i] = baseIntensity;
      phases[i] = i * 1.618 * Math.PI;
    }
    const iAttr = new THREE.InstancedBufferAttribute(intensities, 1);
    const pAttr = new THREE.InstancedBufferAttribute(phases, 1);
    geo.setAttribute('aIntensity', iAttr);
    geo.setAttribute('aPhase', pAttr);

    const mat = new THREE.ShaderMaterial({
      vertexShader: InstancedFlameShader.vertexShader,
      fragmentShader: InstancedFlameShader.fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uBaseScale: { value: new THREE.Vector2(scale, scale * 1.65) },
        uColorCore: { value: new THREE.Color(colorCore) },
        uColorTip: { value: new THREE.Color(colorTip) },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    return { geometry: geo, material: mat, intensityAttr: iAttr };
  }, [count, baseIntensity, scale, colorCore, colorTip]);

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.frustumCulled = false;
    }
  }, []);

  useFrame(() => {
    const st = useStore.getState();
    if (st.world !== worldId && st.previousWorld !== worldId) return;
    if (!meshRef.current || anchors.length === 0) return;

    material.uniforms.uTime.value = frame.time;

    let intensityDirty = false;
    for (let i = 0; i < anchors.length; i++) {
      const anchor = anchors[i];
      anchor.getWorldPosition(worldPos);
      dummy.position.copy(worldPos);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);

      const targetInt = intensitiesRef?.current?.[i] ?? baseIntensity;
      if (Math.abs(intensityAttr.getX(i) - targetInt) > 0.001) {
        intensityAttr.setX(i, targetInt);
        intensityDirty = true;
      }
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (intensityDirty) {
      intensityAttr.needsUpdate = true;
    }
  });

  if (anchors.length === 0) return null;

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, count]}
      frustumCulled={false}
    />
  );
}

export { InstancedFlameShader };
