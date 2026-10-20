"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useStore } from "@/state/store";
import type { WorldId } from "@/theme/tokens";
import { notifyWorldRendered } from "@/motion/transitions";
import { useQuality } from "./QualityProvider";
import { compileFor } from "./pipeline";


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

/** Check if a world's stage group and skin are mounted and non-empty. */
function worldLoaded(scene: THREE.Scene, world: WorldId) {
  const stage = scene.getObjectByName(STAGE_GROUP_NAMES[world]);
  const skin = scene.getObjectByName(SKIN_GROUP_NAMES[world]);
  return Boolean(stage?.children.length && skin?.children.length);
}

/** Warm only resident worlds, prioritizing the active one. Never gates the DOM. */
export function Precompile() {
  const { gl, scene, camera } = useThree();
  const { settings } = useQuality();
  const compiled = useRef(new Map<WorldId, string>());
  const compiling = useRef(false);
  const alive = useRef(true);
  const warm = useRef<WorldId | null>(null);
  const warmFrames = useRef(0);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  useEffect(() => { compiled.current.clear(); }, [settings.hasComposer, gl]);
  const yieldTask = () => new Promise<void>(resolve => setTimeout(resolve, 0));
  useFrame(() => {
    const store = useStore.getState();
    if (warm.current) {
      if (++warmFrames.current >= 2) {
        const w = warm.current; warm.current = null;
        store.markWorldRendered(w); notifyWorldRendered(w);
        performance.mark("world-rendered-" + w);
      }
    }
    if (compiling.current) return;
    const worlds = [store.world, ...WORLDS.filter(w => w !== store.world)];
    const world = worlds.find(w => {
      if (!store.residentWorlds[w] || !worldLoaded(scene, w)) return false;
      const stage = scene.getObjectByName(STAGE_GROUP_NAMES[w])!;
      const signature = stage.children.map(c => c.uuid).join(":") + settings.hasComposer;
      return compiled.current.get(w) !== signature;
    });
    if (!world) return;
    const stage = scene.getObjectByName(STAGE_GROUP_NAMES[world])!;
    const skin = scene.getObjectByName(SKIN_GROUP_NAMES[world])!;
    const signature = stage.children.map(c => c.uuid).join(":") + settings.hasComposer;
    const meshes: THREE.Object3D[] = [];
    for (const root of [stage, skin]) root.traverse(obj => { if ((obj as THREE.Mesh).isMesh) meshes.push(obj); });
    compiling.current = true;
    void (async () => {
      const textures = new Set<THREE.Texture>();
      for (const mesh of meshes) {
        await yieldTask(); if (!alive.current) return;
        // Keep the other worlds' lights out of the compile. Restore synchronously,
        // before yielding, so no hidden-world geometry leaks into visible frames.
        const hidden = WORLDS.filter(w => w !== world).map(w => scene.getObjectByName(STAGE_GROUP_NAMES[w])).filter((g): g is THREE.Object3D => !!g);
        const visibility = hidden.map(g => g.visible); const activeVisible = stage.visible;
        hidden.forEach(g => { g.visible = false; }); stage.visible = true;
        let job: Promise<unknown>;
        try { job = compileFor(gl, mesh, camera, scene, settings.hasComposer ? [{direct:false},{direct:true}] : [{direct:true}]); }
        finally { stage.visible = activeVisible; hidden.forEach((g,i) => { g.visible = visibility[i]; }); }
        await job;
        const material = (mesh as THREE.Mesh).material;
        for (const mat of Array.isArray(material) ? material : [material]) {
          for (const value of Object.values(mat)) if (value instanceof THREE.Texture) textures.add(value);
        }
      }
      for (const texture of textures) { await yieldTask(); if (!alive.current) return; gl.initTexture(texture); }
      if (!alive.current) return;
      compiled.current.set(world, signature);
      warm.current = world; warmFrames.current = 0;
    })().catch(() => window.dispatchEvent(new Event("underdogs:asset-error"))).finally(() => { compiling.current = false; });
  });
  return null;
}
