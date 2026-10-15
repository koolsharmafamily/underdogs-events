"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useStore } from "@/state/store";
import type { WorldId } from "@/theme/tokens";
import { notifyWorldRendered } from "@/motion/transitions";
import { useQuality } from "./QualityProvider";
import { compileFor, rendersDirect } from "./pipeline";

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

/** A world's set and badge skin have mounted and finished loading. */
function worldLoaded(scene: THREE.Scene, world: WorldId) {
  const stage = scene.getObjectByName(STAGE_GROUP_NAMES[world]);
  const skin = scene.getObjectByName(SKIN_GROUP_NAMES[world]);
  return Boolean(stage?.children.length && skin?.children.length);
}

/**
 * Compiles one world exactly as it will be drawn: lit by its own lights only, on
 * its own output path, together with every badge skin mounted so far. The other sets are taken out of the scene for the
 * (synchronous) program setup so their lights neither count nor get compiled for
 * a path they never use, then put back in place.
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
  for (const name of [STAGE_GROUP_NAMES[world], SKIN_GROUP_NAMES[world]]) {
    const group = scene.getObjectByName(name);
    if (group) enableSubtree(group, altered);
  }
  const direct = rendersDirect(world, hasComposer);
  const jobs = [compileFor(gl, scene, camera, scene, [{ direct }])];
  // Every badge skin can be on screen in any world (it dissolves across the
  // route change), so the badge also compiles for the other output path.
  const badge = scene.getObjectByName("Badge");
  if (badge && hasComposer)
    jobs.push(compileFor(gl, badge, camera, scene, [{ direct: !direct }]));
  restoreSubtree(altered);
  for (let i = removed.length - 1; i >= 0; i--) {
    const { obj, parent, index } = removed[i];
    parent.children.splice(index, 0, obj);
  }
  return Promise.all(jobs);
}

/** Visitors who asked to save data only load a world when they point at it. */
function mayWarmInBackground() {
  const connection = (
    navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }
  ).connection;
  return !connection?.saveData && !/2g/.test(connection?.effectiveType ?? "");
}

/**
 * 1. The current world compiles while the loader or a transition cover is up, then
 *    two clean frames are drawn before it is marked rendered (the cover can lift).
 * 2. Once the visit is settled, the other worlds are mounted one by one at idle
 *    (WorldDirector keeps them hidden) and compiled the same way, so no route
 *    change compiles a shader. Pointing at a world link warms it immediately.
 */
export function Precompile() {
  const { gl, scene, camera } = useThree();
  const { settings } = useQuality();
  const world = useStore((s) => s.world);
  const compiled = useRef(new Set<WorldId>());
  const compiling = useRef<WorldId | null>(null);
  const warmFrames = useRef(0);
  const idle = useRef(false);
  const uploads = useRef<THREE.Texture[]>([]);

  useEffect(() => {
    warmFrames.current = 0;
  }, [world]);

  // A tier change (no composer) or a restored context changes every program.
  useEffect(() => {
    compiled.current.clear();
  }, [settings.hasComposer, gl]);

  const compile = (w: WorldId) => {
    compiling.current = w;
    compileWorld(gl, scene, camera, w, settings.hasComposer)
      .then(() => {
        compiled.current.add(w);
        if (w !== useStore.getState().world) queueTextures(w);
      })
      .catch(() => window.dispatchEvent(new Event("underdogs:asset-error")))
      .finally(() => {
        if (compiling.current === w) compiling.current = null;
      });
  };

  const queueTextures = (w: WorldId) => {
    const seen = new Set(uploads.current);
    scene.getObjectByName(STAGE_GROUP_NAMES[w])?.traverse((node) => {
      const material = (node as THREE.Mesh).material;
      if (!material) return;
      for (const m of Array.isArray(material) ? material : [material])
        for (const value of Object.values(m))
          if (value instanceof THREE.Texture && !seen.has(value)) {
            seen.add(value);
            uploads.current.push(value);
          }
    });
  };

  const requestIdle = () => {
    const done = () => (idle.current = true);
    if (typeof window.requestIdleCallback === "function")
      window.requestIdleCallback(done, { timeout: 3000 });
    else setTimeout(done, 1200);
  };

  useFrame(() => {
    const store = useStore.getState();
    const active = store.world;

    if (!store.renderedWorlds[active]) {
      if (!worldLoaded(scene, active)) return;
      if (!compiled.current.has(active)) {
        if (compiling.current === null) compile(active);
        return;
      }
      warmFrames.current += 1;
      if (warmFrames.current >= 2) {
        // Two clean post-compile frames have reached the canvas.
        store.markWorldRendered(active);
        if (!store.isPrecompiled) store.setPrecompiled(true);
        notifyWorldRendered(active);
        requestIdle();
      }
      return;
    }

    if (compiling.current !== null || store.isTransitioning || store.phase !== "complete") return;

    // Upload warmed textures a couple per frame rather than all on first sight.
    for (let i = 0; i < 2 && uploads.current.length; i++) gl.initTexture(uploads.current.pop()!);

    // One resident world at a time: wait for it to load, then compile it.
    for (const w of WORLDS) {
      if (!store.residentWorlds[w] || compiled.current.has(w)) continue;
      if (worldLoaded(scene, w)) compile(w);
      return;
    }

    // Then, at idle, mount the next world nobody has asked for yet.
    if (!idle.current) return;
    idle.current = false;
    const next = WORLDS.find((w) => !store.residentWorlds[w]);
    if (next && mayWarmInBackground()) {
      store.warmWorld(next);
      requestIdle();
    }
  });

  return null;
}
