'use client';

import { useEffect } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { useStore } from '@/state/store';

/**
 * Precompiles all shaders, materials, and dissolve combinations asynchronously on load (BRIEF.md Part 5.1).
 * Traverses all objects, temporarily forces visibility and disables frustum culling across all 3 world lighting
 * configurations (Home, Red Room, Diwali) so renderer.compileAsync warms up every single WebGLProgram ahead of time,
 * ensuring zero shader compilation hitches occur during transitions.
 */
export function Precompile() {
  const { gl, scene, camera } = useThree();

  useEffect(() => {
    let cancelled = false;

    if (gl && scene && camera && typeof gl.compileAsync === 'function') {
      const warmAllPrograms = async () => {
        const homeStage = scene.getObjectByName('HomeStageGroup');
        const redRoomSet = scene.getObjectByName('RedRoomSetGroup');
        const diwaliSet = scene.getObjectByName('DiwaliSetGroup');
        const enamelSkin = scene.getObjectByName('EnamelSkin');
        const neonSkin = scene.getObjectByName('NeonSkin');
        const jewelledSkin = scene.getObjectByName('JewelledSkin');

        // Helper: force visibility and disable frustum culling for a subtree
        const enableSubtree = (root: THREE.Object3D) => {
          const altered: { obj: THREE.Object3D; wasVisible: boolean; wasCulled: boolean }[] = [];
          root.traverse((obj) => {
            const wasVisible = obj.visible;
            const wasCulled = (obj as THREE.Mesh).frustumCulled ?? true;
            if (!wasVisible || wasCulled) {
              altered.push({ obj, wasVisible, wasCulled });
              obj.visible = true;
              (obj as THREE.Mesh).frustumCulled = false;
            }
          });
          return altered;
        };

        const restoreSubtree = (altered: { obj: THREE.Object3D; wasVisible: boolean; wasCulled: boolean }[]) => {
          altered.forEach(({ obj, wasVisible, wasCulled }) => {
            obj.visible = wasVisible;
            (obj as THREE.Mesh).frustumCulled = wasCulled;
          });
        };

        // Ensure badge skins are all active and uncullable during precompilation
        const badgeAltered: { obj: THREE.Object3D; wasVisible: boolean; wasCulled: boolean }[] = [];
        [enamelSkin, neonSkin, jewelledSkin].forEach((skin) => {
          if (skin) {
            badgeAltered.push(...enableSubtree(skin));
          }
        });

        // 1. Warm Home lighting setup
        if (homeStage) {
          const homeAltered = enableSubtree(homeStage);
          if (redRoomSet) redRoomSet.visible = false;
          if (diwaliSet) diwaliSet.visible = false;
          await gl.compileAsync(scene, camera);
          restoreSubtree(homeAltered);
        }

        // 2. Warm Red Room lighting setup
        if (redRoomSet) {
          if (homeStage) homeStage.visible = false;
          const redAltered = enableSubtree(redRoomSet);
          if (diwaliSet) diwaliSet.visible = false;
          await gl.compileAsync(scene, camera);
          restoreSubtree(redAltered);
        }

        // 3. Warm Diwali lighting setup
        if (diwaliSet) {
          if (homeStage) homeStage.visible = false;
          if (redRoomSet) redRoomSet.visible = false;
          const diwaliAltered = enableSubtree(diwaliSet);
          await gl.compileAsync(scene, camera);
          restoreSubtree(diwaliAltered);
        }

        // Restore badge skins
        restoreSubtree(badgeAltered);

        // Restore active world visibility
        const currentWorld = useStore.getState().world;
        if (homeStage) homeStage.visible = currentWorld === 'home';
        if (redRoomSet) redRoomSet.visible = currentWorld === 'redroom';
        if (diwaliSet) diwaliSet.visible = currentWorld === 'diwali';

        const activeSkin =
          currentWorld === 'redroom' ? 'neon' : currentWorld === 'diwali' ? 'jewelled' : 'enamel';
        if (enamelSkin) enamelSkin.visible = activeSkin === 'enamel';
        if (neonSkin) neonSkin.visible = activeSkin === 'neon';
        if (jewelledSkin) jewelledSkin.visible = activeSkin === 'jewelled';

        if (!cancelled) {
          useStore.getState().setPrecompiled(true);
        }
      };

      warmAllPrograms().catch((err) => {
        console.warn('Precompile error:', err);
        if (!cancelled) {
          useStore.getState().setPrecompiled(true);
        }
      });
    } else {
      useStore.getState().setPrecompiled(true);
    }

    return () => {
      cancelled = true;
    };
  }, [gl, scene, camera]);

  return null;
}
