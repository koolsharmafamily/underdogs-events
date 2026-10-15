import type { WorldId } from "@/theme/tokens";
import { useStore } from "@/state/store";

const preloadedWorlds = new Set<WorldId>();

const WORLD_MODELS: Record<WorldId, string[]> = {
  redroom: [
    "/models/badge-halloween.glb",
    "/models/curtain-open.glb",
    "/models/redroom-mirror.glb",
    "/models/redroom-chandelier.glb",
    "/models/redroom-candelabra.glb",
    "/models/redroom-candle.glb",
    "/models/redroom-invitation.glb",
  ],
  diwali: ["/models/badge-jewelled.glb"],
  home: [
    "/models/badge-enamel.glb",
    "/models/door-redroom.glb",
    "/models/door-diwali.glb",
  ],
};
const WORLD_TEXTURES: Record<WorldId, string[]> = {
  redroom: ["/media/red-room-poster.webp"],
  diwali: [],
  home: [],
};

// drei (and with it three.js) loads on first use, never in the first bundle:
// these run from links and the loader, which every page ships.
function preload(models: string[], textures: string[] = []) {
  void import("@react-three/drei").then(({ useGLTF, useTexture }) => {
    for (const url of models) useGLTF.preload(url);
    for (const url of textures) useTexture.preload(url);
  });
}

/**
 * Preloads a world's 3D GLBs and textures on door/link hover, focus or touch
 * (Part 7 H5, Part 12.4, Part 13.6), and mounts the world hidden so it compiles
 * before anyone arrives.
 */
export function preloadWorldAssets(world: WorldId) {
  if (typeof window === "undefined") return;
  useStore.getState().warmWorld(world);
  if (preloadedWorlds.has(world)) return;
  preloadedWorlds.add(world);

  if (world === "redroom") void import("./redroom/RedRoomSet");
  else if (world === "diwali") void import("./diwali/DiwaliSet");
  else void import("./home/HomeStage");
  preload(WORLD_MODELS[world], WORLD_TEXTURES[world]);
}

export function preloadAllBadges() {
  if (typeof window === "undefined") return;
  preload([
    "/models/badge-enamel.glb",
    "/models/badge-halloween.glb",
    "/models/badge-jewelled.glb",
  ]);
}

export function preloadRouteWorld(href: string) {
  if (href.startsWith("/the-red-room")) preloadWorldAssets("redroom");
  else if (href.startsWith("/diwali")) preloadWorldAssets("diwali");
  else preloadWorldAssets("home");
}
