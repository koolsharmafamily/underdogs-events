"use client";
import { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { useStore } from "@/state/store";
import type { WorldId } from "@/theme/tokens";

interface Former {
  intensity: number;
  color: string;
  scale: [number, number];
  position: [number, number, number];
  target: [number, number, number];
}

/**
 * Reflection cards per world (rect lightformers seen from the origin). They light
 * the supplied materials without replacing them. DHAMAAKA's are the jewellery
 * studio cards its set used to mount on its own.
 */
const ENVIRONMENTS: Record<WorldId, { intensity: number; formers: Former[] }> = {
  home: {
    intensity: 0.5,
    formers: [
      { intensity: 3.2, color: "#F4F1FF", scale: [3, 7], position: [-4, 4, 4], target: [0, 1.6, 0] },
      { intensity: 1.6, color: "#DD7BDC", scale: [1, 5], position: [4, 2, -1], target: [0, 1.6, 0] },
      { intensity: 1.4, color: "#FFF0D8", scale: [6, 2], position: [0, 6, 0], target: [0, 1, 0] },
    ],
  },
  redroom: {
    intensity: 0.23,
    formers: [
      { intensity: 3.2, color: "#FFE0B0", scale: [3, 7], position: [-4, 4, 4], target: [0, 1.6, 0] },
      { intensity: 0.8, color: "#B53525", scale: [1, 5], position: [4, 2, -1], target: [0, 1.6, 0] },
      { intensity: 1.4, color: "#FFF0D8", scale: [6, 2], position: [0, 6, 0], target: [0, 1, 0] },
    ],
  },
  diwali: {
    intensity: 0.95,
    formers: [
      { intensity: 4.5, color: "#FFE3A3", scale: [3, 6], position: [-3.5, 5.8, 3.5], target: [0, 2.22, 0.6] },
      { intensity: 3.2, color: "#FFF1C9", scale: [6, 3], position: [0, 6.2, 1.8], target: [0, 2.22, 0.6] },
      { intensity: 3.8, color: "#E0217A", scale: [2, 5], position: [1.5, 3.2, -2.0], target: [0, 2.22, 0.6] },
      { intensity: 2.6, color: "#E5B25D", scale: [3, 3], position: [3.5, 3.0, 2.5], target: [0, 2.22, 0.6] },
    ],
  },
};

const FOG: Record<WorldId, [string, number]> = {
  home: ["#0B0E14", 0.06],
  redroom: ["#090305", 0.065],
  diwali: ["#24101F", 0.065],
};

const WORLDS: WorldId[] = ["home", "redroom", "diwali"];

function bakeEnvironment(
  pmrem: THREE.PMREMGenerator,
  formers: Former[],
): THREE.WebGLRenderTarget {
  const room = new THREE.Scene();
  const plane = new THREE.PlaneGeometry(1, 1);
  const target = new THREE.Vector3();
  for (const f of formers) {
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(f.color).multiplyScalar(f.intensity),
      side: THREE.DoubleSide,
      toneMapped: false,
    });
    const card = new THREE.Mesh(plane, material);
    card.position.set(...f.position);
    card.scale.set(f.scale[0], f.scale[1], 1);
    card.lookAt(target.set(...f.target));
    room.add(card);
  }
  const baked = pmrem.fromScene(room, 0, 0.1, 1000, { size: 128 });
  room.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) ((o as THREE.Mesh).material as THREE.Material).dispose();
  });
  plane.dispose();
  return baked;
}

/**
 * The scene's environment and fog. All three environments are baked once, the
 * same size, and swapped by world, and one fog object stays on the scene with its
 * colour and density changed: the shaders compiled for one world stay valid in
 * every other, and route changes allocate nothing on the GPU.
 */
export function StudioEnvironment() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const world = useStore((s) => s.world);

  const environments = useMemo(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const maps = Object.fromEntries(
      WORLDS.map((w) => [w, bakeEnvironment(pmrem, ENVIRONMENTS[w].formers)]),
    ) as Record<WorldId, THREE.WebGLRenderTarget>;
    pmrem.dispose();
    return maps;
  }, [gl]);
  const fog = useMemo(() => new THREE.FogExp2(FOG.home[0], FOG.home[1]), []);

  useLayoutEffect(() => {
    scene.environment = environments[world].texture;
    scene.environmentIntensity = ENVIRONMENTS[world].intensity;
    scene.fog = fog;
    fog.color.set(FOG[world][0]);
    fog.density = FOG[world][1];
  }, [scene, environments, fog, world]);

  useLayoutEffect(
    () => () => {
      scene.environment = null;
      scene.fog = null;
      for (const target of Object.values(environments)) target.dispose();
    },
    [scene, environments],
  );

  return null;
}
