'use client';

import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useStore } from '@/state/store';
import type { WorldId } from '@/theme/tokens';
import { notifyWorldRendered } from '@/motion/transitions';

const STAGE_GROUP_NAMES: Record<WorldId, string> = {
  home: 'HomeStageGroup',
  redroom: 'RedRoomSetGroup',
  diwali: 'DiwaliSetGroup',
};

const SKIN_GROUP_NAMES: Record<WorldId, string> = {
  home: 'EnamelSkin',
  redroom: 'NeonSkin',
  diwali: 'JewelledSkin',
};

function enableSubtree(root: THREE.Object3D) {
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
}

function restoreSubtree(altered: { obj: THREE.Object3D; wasVisible: boolean; wasCulled: boolean }[]) {
  for (let i = 0; i < altered.length; i++) {
    const { obj, wasVisible, wasCulled } = altered[i];
    obj.visible = wasVisible;
    (obj as THREE.Mesh).frustumCulled = wasCulled;
  }
}

/**
 * Warms shaders for the active world while the pink badge screen is opaque,
 * then waits for 2 full post-compile WebGL frames before signaling that the world is ready to reveal.
 */
export function Precompile() {
  const { gl, scene, camera } = useThree();
  const warmFramesRef = useRef<Record<WorldId, number>>({
    home: 0,
    redroom: 0,
    diwali: 0,
  });

  useFrame(() => {
    const store = useStore.getState();
    const activeWorld = store.world;

    if (store.renderedWorlds[activeWorld]) {
      return;
    }

    const stageGroup = scene.getObjectByName(STAGE_GROUP_NAMES[activeWorld]);
    const skinGroup = scene.getObjectByName(SKIN_GROUP_NAMES[activeWorld]);

    // Wait until both the active world's Suspense and the active badge skin's Suspense have resolved
    if (
      !stageGroup ||
      stageGroup.children.length === 0 ||
      !skinGroup ||
      skinGroup.children.length === 0
    ) {
      return;
    }

    warmFramesRef.current[activeWorld] += 1;
    const step = warmFramesRef.current[activeWorld];

    if (step === 1) {
      // Frame 1: Compile all materials in the active world + badge skin while pink badge veil is opaque
      try {
        const alteredStage = enableSubtree(stageGroup);
        const alteredSkin = enableSubtree(skinGroup);
        gl.compile(scene, camera);
        restoreSubtree(alteredStage);
        restoreSubtree(alteredSkin);
      } catch {
        // Ignore shader compile errors
      }
    } else if (step >= 3) {
      // Frame 3: Two clean post-compile frames have been drawn to the canvas — ready for silky 60fps coin fade-out
      store.markWorldRendered(activeWorld);
      if (!store.isPrecompiled) {
        store.setPrecompiled(true);
      }
      notifyWorldRendered(activeWorld);
    }
  });

  return null;
}
