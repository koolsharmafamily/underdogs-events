"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useStore } from "@/state/store";
import type { WorldId } from "@/theme/tokens";
import { notifyWorldRendered } from "@/motion/transitions";
import { useQuality } from "./QualityProvider";
import { compileFor, rendersDirect } from "./pipeline";
import { ALL_APP_TEXTURES } from "./preload";

const WORLDS: WorldId[] = ["home", "redroom", "diwali"];

const STAGE_GROUP_NAMES: Record<WorldId, string> = {
  home: "HomeStageGroup",
  redroom: "RedRoomSetGroup",
  diwali: "DiwaliSetGroup",
};

const SKIN_GROUP_NAMES: Record<WorldId, string> = {
  home: "EnamelSkin",
  redroom: "HalloweenSkin",
  diwali: "JewelledSkin",
};

type Altered = { obj: THREE.Object3D; wasVisible: boolean; wasCulled: boolean };

function enableSubtree(root: THREE.Object3D, altered: Altered[]) {
  root.traverse((obj) => {
    const wasVisible = obj.visible;
    const wasCulled = (obj as THREE.Mesh).frustumCulled ?? true;
    if (!wasVisible || wasCulled) {
      altered.push({ obj, wasVisible, wasCulled });
      obj.visible = true;
      (obj as THREE.Mesh).frustumCulled = false;
    }
  });
}

function restoreSubtree(altered: Altered[]) {
  for (let i = altered.length - 1; i >= 0; i--) {
    const { obj, wasVisible, wasCulled } = altered[i];
    obj.visible = wasVisible;
    (obj as THREE.Mesh).frustumCulled = wasCulled;
  }
}

/** Check if a world's stage group and skin are mounted and non-empty. */
function worldLoaded(scene: THREE.Scene, world: WorldId) {
  const stage = scene.getObjectByName(STAGE_GROUP_NAMES[world]);
  const skin = scene.getObjectByName(SKIN_GROUP_NAMES[world]);
  return Boolean(stage?.children.length && skin?.children.length);
}

/** Check if all worlds are mounted and ready to be compiled. */
function allWorldsLoaded(scene: THREE.Scene) {
  return WORLDS.every((w) => worldLoaded(scene, w));
}

/**
 * Initializes all textures found in the scene graph with gl.initTexture().
 * Runs behind the loader so zero GPU upload stalls happen during visits.
 */
function uploadAllSceneTextures(gl: THREE.WebGLRenderer, scene: THREE.Scene) {
  const seen = new Set<THREE.Texture>();
  scene.traverse((node) => {
    const mesh = node as THREE.Mesh;
    if (!mesh.material) return;
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const mat of materials) {
      if (!mat) continue;
      for (const val of Object.values(mat)) {
        if (val instanceof THREE.Texture && !seen.has(val)) {
          seen.add(val);
          try {
            gl.initTexture(val);
          } catch {}
        }
      }
      const uniforms = (mat as THREE.ShaderMaterial).uniforms;
      if (uniforms) {
        for (const uniform of Object.values(uniforms)) {
          const uVal = uniform?.value;
          if (uVal instanceof THREE.Texture && !seen.has(uVal)) {
            seen.add(uVal);
            try {
              gl.initTexture(uVal);
            } catch {}
          }
        }
      }
    }
  });
}

/**
 * Compiles one world exactly as it will be drawn: lit by its own lights only,
 * for BOTH direct and composer output paths, together with all badge skins.
 */
function compileWorld(
  gl: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
  world: WorldId,
  hasComposer: boolean,
) {
  const removed: { obj: THREE.Object3D; parent: THREE.Object3D; index: number }[] = [];
  for (const other of WORLDS) {
    if (other === world) continue;
    const group = scene.getObjectByName(STAGE_GROUP_NAMES[other]);
    const parent = group?.parent;
    if (!group || !parent) continue;
    const index = parent.children.indexOf(group);
    parent.children.splice(index, 1);
    removed.push({ obj: group, parent, index });
  }

  const altered: Altered[] = [];
  for (const name of [
    STAGE_GROUP_NAMES[world],
    SKIN_GROUP_NAMES.home,
    SKIN_GROUP_NAMES.redroom,
    SKIN_GROUP_NAMES.diwali,
    "DefocusedForeground",
  ]) {
    const group = scene.getObjectByName(name);
    if (group) enableSubtree(group, altered);
  }

  // Compile for both composer and direct paths so transitions across worlds never compile
  const paths = hasComposer
    ? [{ direct: false }, { direct: true }]
    : [{ direct: true }];

  const jobs = [compileFor(gl, scene, camera, scene, paths)];

  restoreSubtree(altered);
  for (let i = removed.length - 1; i >= 0; i--) {
    const { obj, parent, index } = removed[i];
    parent.children.splice(index, 0, obj);
  }

  return Promise.all(jobs);
}

/**
 * Precompiles every material, skin, and world behind the initial loader.
 * No shader compile or texture upload happens after the loader ends.
 */
export function Precompile() {
  const { gl, scene, camera } = useThree();
  const { settings } = useQuality();
  const isPrecompiled = useStore((s) => s.isPrecompiled);
  const compiled = useRef(new Set<WorldId>());
  const compiling = useRef(false);
  const warmFrames = useRef(0);

  // Recompile if composer tier setting is changed at runtime
  useEffect(() => {
    compiled.current.clear();
  }, [settings.hasComposer, gl]);

  useFrame(() => {
    const store = useStore.getState();

    // Already precompiled: nothing more to compile
    if (store.isPrecompiled && compiled.current.size === WORLDS.length) {
      return;
    }

    // Wait until all sets and skins are mounted in the scene graph
    if (!allWorldsLoaded(scene)) {
      // If home is loaded, at least compile current world while waiting
      const active = store.world;
      if (worldLoaded(scene, active) && !compiled.current.has(active) && !compiling.current) {
        compiling.current = true;
        compileWorld(gl, scene, camera, active, settings.hasComposer)
          .then(() => {
            compiled.current.add(active);
            uploadAllSceneTextures(gl, scene);
          })
          .finally(() => {
            compiling.current = false;
          });
      }
      return;
    }

    if (compiling.current) return;

    // Compile remaining worlds behind the loader
    const nextToCompile = WORLDS.find((w) => !compiled.current.has(w));
    if (nextToCompile) {
      compiling.current = true;
      compileWorld(gl, scene, camera, nextToCompile, settings.hasComposer)
        .then(() => {
          compiled.current.add(nextToCompile);
          uploadAllSceneTextures(gl, scene);
        })
        .catch(() => window.dispatchEvent(new Event("underdogs:asset-error")))
        .finally(() => {
          compiling.current = false;
        });
      return;
    }

    // All worlds compiled! Now upload all scene textures to GPU
    uploadAllSceneTextures(gl, scene);

    warmFrames.current += 1;
    if (warmFrames.current >= 2) {
      // Two clean post-compile frames have reached the canvas
      for (const w of WORLDS) {
        store.markWorldRendered(w);
        notifyWorldRendered(w);
      }
      if (!store.isPrecompiled) {
        store.setPrecompiled(true);
      }
    }
  });

  return null;
}
