import { useGLTF, useTexture } from '@react-three/drei'
import type { WorldId } from '@/theme/tokens'

const preloadedWorlds = new Set<WorldId>()

/**
 * Preloads a world's 3D GLBs and textures on door/link hover or focus (Part 7 H5, Part 12.4, Part 13.6)
 */
export function preloadWorldAssets(world: WorldId) {
  if (typeof window === 'undefined' || preloadedWorlds.has(world)) return
  preloadedWorlds.add(world)

  if (world === 'redroom') {
    useGLTF.preload('/models/curtain-open.glb')
    useGLTF.preload('/models/redroom-mirror.glb')
    useGLTF.preload('/models/redroom-chandelier.glb')
    useGLTF.preload('/models/redroom-candelabra.glb')
    useGLTF.preload('/models/redroom-candle.glb')
    useGLTF.preload('/models/redroom-invitation.glb')
    useTexture.preload('/media/red-room-poster.webp')
  } else if (world === 'diwali') {
    useGLTF.preload('/models/curtain-open-diwali.glb')
    useGLTF.preload('/models/diwali-diya-brass.glb')
    useGLTF.preload('/models/diwali-diya-terracotta.glb')
    useGLTF.preload('/models/diwali-rose-petal.glb')
    useGLTF.preload('/models/diwali-marigold.glb')
    useGLTF.preload('/models/diwali-card.glb')
    useTexture.preload('/media/diwali-teaser.webp')
  } else if (world === 'home') {
    useGLTF.preload('/models/door-redroom.glb')
    useGLTF.preload('/models/door-diwali.glb')
  }
}

export function preloadRouteWorld(href: string) {
  if (href.startsWith('/the-red-room')) {
    preloadWorldAssets('redroom')
  } else if (href.startsWith('/diwali')) {
    preloadWorldAssets('diwali')
  } else {
    preloadWorldAssets('home')
  }
}
