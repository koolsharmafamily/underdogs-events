"use client";

import { useRef, useEffect } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useStore } from "@/state/store";
import type { WorldId } from "@/theme/tokens";
import { rememberWorldResources } from "./worldResources";
import { notifyWorldRendered } from "@/motion/transitions";

const STAGE_GROUP_NAMES: Record<WorldId, string> = {
  home: "HomeStageGroup",
  redroom: "RedRoomSetGroup",
  diwali: "DiwaliSetGroup",
};

const SKIN_GROUP_NAMES: Record<WorldId, string> = {
  home: "EnamelSkin",
  redroom: "NeonSkin",
  diwali: "JewelledSkin",
};

function enableSubtree(root: THREE.Object3D) {
  const altered: {
    obj: THREE.Object3D;
    wasVisible: boolean;
    wasCulled: boolean;
  }[] = [];
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

function restoreSubtree(
  altered: { obj: THREE.Object3D; wasVisible: boolean; wasCulled: boolean }[],
) {
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
  const world = useStore((s) => s.world);
  const compiling = useRef(false);
  const ready = useRef(false);
  const generation = useRef(0);
  useEffect(() => {
    generation.current++;
    compiling.current = false;
    ready.current = false;
    warmFramesRef.current[world] = 0;
  }, [world]);
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

    if (!ready.current) {
      if (compiling.current) return;
      compiling.current = true;
      const currentGeneration = generation.current;
      const alteredStage = enableSubtree(stageGroup);
      const alteredSkin = enableSubtree(skinGroup);
      const compilation = gl.compileAsync(scene, camera);
      restoreSubtree(alteredStage);
      restoreSubtree(alteredSkin);
      rememberWorldResources(activeWorld, stageGroup);
      compilation
        .then(() => {
          if (generation.current === currentGeneration) ready.current = true;
        })
        .catch(() => {
          if (generation.current === currentGeneration)
            window.dispatchEvent(new Event("underdogs:asset-error"));
        });
      return;
    }
    warmFramesRef.current[activeWorld] += 1;
    const step = warmFramesRef.current[activeWorld];
    if (step >= 2) {
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
