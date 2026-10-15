import { useGLTF, useTexture } from "@react-three/drei";
import type { WorldId } from "@/theme/tokens";

const preloadedWorlds = new Set<WorldId>();

/**
 * Preloads a world's 3D GLBs and textures on door/link hover or focus (Part 7 H5, Part 12.4, Part 13.6)
 */
export function preloadWorldAssets(world: WorldId) {
  if (typeof window === "undefined" || preloadedWorlds.has(world)) return;
  preloadedWorlds.add(world);

  if (world === "redroom") {
    void import("./redroom/RedRoomSet");
    useGLTF.preload("/models/badge-neon.glb");
    useGLTF.preload("/models/curtain-open.glb");
    useGLTF.preload("/models/redroom-mirror.glb");
    useGLTF.preload("/models/redroom-chandelier.glb");
    useGLTF.preload("/models/redroom-candelabra.glb");
    useGLTF.preload("/models/redroom-candle.glb");
    useGLTF.preload("/models/redroom-invitation.glb");
    useTexture.preload("/media/red-room-poster.webp");
  } else if (world === "diwali") {
    void import("./diwali/DiwaliSet");
    useGLTF.preload("/models/badge-jewelled.glb");
    useTexture.preload("/media/diwali-teaser.webp");
  } else if (world === "home") {
    void import("./home/HomeStage");
    useGLTF.preload("/models/badge-enamel.glb");
    useGLTF.preload("/models/door-redroom.glb");
    useGLTF.preload("/models/door-diwali.glb");
  }
}

export function preloadAllBadges() {
  if (typeof window === "undefined") return;
  useGLTF.preload("/models/badge-enamel.glb");
  useGLTF.preload("/models/badge-neon.glb");
  useGLTF.preload("/models/badge-jewelled.glb");
}

export function preloadRouteWorld(href: string) {
  if (href.startsWith("/the-red-room")) {
    preloadWorldAssets("redroom");
    useGLTF.preload("/models/badge-neon.glb");
  } else if (href.startsWith("/diwali")) {
    preloadWorldAssets("diwali");
    useGLTF.preload("/models/badge-jewelled.glb");
  } else {
    preloadWorldAssets("home");
    useGLTF.preload("/models/badge-enamel.glb");
  }
}

