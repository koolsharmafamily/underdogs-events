'use client';

import { useEffect } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { useStore } from '@/state/store';
import { createSkinMaterials } from './badge/skins';

/**
 * Precompiles all shaders, materials, and dissolve combinations asynchronously on load (BRIEF.md Part 5.1).
 * Ensures zero shader compilation hitches occur during scroll interaction or world dissolve transitions.
 */
export function Precompile() {
  const { gl, scene, camera } = useThree();

  useEffect(() => {
    let cancelled = false;

    if (gl && scene && camera && typeof gl.compileAsync === 'function') {
      // Build dummy test mesh with dissolve uniforms for precompilation
      const dummyGroup = new THREE.Group();
      const geom = new THREE.BoxGeometry(0.1, 0.1, 0.1);

      const dummyUniforms = {
        uDissolve: { value: 0.5 },
        uRole: { value: 0.0 },
        uEdgeColor: { value: new THREE.Color('#FF4A1F') },
        uEdgeIntensity: { value: 5.0 },
        uEdgeWidth: { value: 0.06 },
      };

      // Instantiate materials for all skins with dissolve
      const enamelMats = createSkinMaterials('enamel', dummyUniforms);
      const neonMats = createSkinMaterials('neon', dummyUniforms);
      const jewelledMats = createSkinMaterials('jewelled', dummyUniforms);

      const allMats = [
        ...Object.values(enamelMats),
        ...Object.values(neonMats),
        ...Object.values(jewelledMats),
      ];

      allMats.forEach((mat) => {
        if (mat instanceof THREE.Material) {
          dummyGroup.add(new THREE.Mesh(geom, mat));
        }
      });

      scene.add(dummyGroup);

      gl.compileAsync(scene, camera)
        .then(() => {
          if (!cancelled) {
            scene.remove(dummyGroup);
            geom.dispose();
            useStore.getState().setPrecompiled(true);
          }
        })
        .catch(() => {
          scene.remove(dummyGroup);
          geom.dispose();
          useStore.getState().setPrecompiled(true);
        });
    }

    return () => {
      cancelled = true;
    };
  }, [gl, scene, camera]);

  return null;
}
