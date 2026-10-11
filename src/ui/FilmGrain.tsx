'use client'

import React from 'react'
import { useStore } from '@/state/store'
import { acts } from '@/theme/acts'

export function FilmGrain() {
  const world = useStore((s) => s.world)
  const motionEnabled = useStore((s) => s.motionEnabled)
  const opacity = acts[world]?.grainOpacity ?? 0.04

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-30 overflow-hidden"
      style={{ opacity }}
    >
      <div
        className={`film-grain-layer h-[200%] w-[200%] -left-1/2 -top-1/2 absolute ${
          motionEnabled ? 'animate-film-grain' : ''
        }`}
      />
    </div>
  )
}
