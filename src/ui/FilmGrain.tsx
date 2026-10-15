'use client'

import React from 'react'
import { useStore } from '@/state/store'
import { acts } from '@/theme/acts'
import { TIER_CONFIG, rendersDirect } from '@/webgl/tiers'

/**
 * CSS film grain, only where the post chain doesn't draw it: tiers without a
 * composer, DHAMAAKA (drawn direct) and pages without a world.
 */
export function FilmGrain() {
  const world = useStore((s) => s.world)
  const motionEnabled = useStore((s) => s.motionEnabled)
  const tier = useStore((s) => s.tier)
  const sceneRoute = useStore((s) => s.sceneRoute)
  const opacity = acts[world]?.grainOpacity ?? 0.04
  if (sceneRoute && tier !== 'T0' && !rendersDirect(world, TIER_CONFIG[tier].hasComposer)) return null

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-30 overflow-hidden"
      style={{ opacity }}
    >
      <div
        className={`film-grain-layer h-[110%] w-[110%] -left-[5%] -top-[5%] absolute ${
          motionEnabled ? 'animate-film-grain' : ''
        }`}
      />
    </div>
  )
}
