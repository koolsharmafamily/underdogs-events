'use client'

import React, { useEffect, useRef } from 'react'
import { registerTransitionStage } from '@/motion/transitions'

/**
 * Persistent transition overlay stage controlled directly via GSAP refs in transitions.ts (zero React state updates per frame).
 */
export function TransitionStage() {
  const stageRef = useRef<HTMLDivElement>(null)
  const veilRef = useRef<HTMLDivElement>(null)
  const coinRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    registerTransitionStage({
      stageEl: stageRef.current,
      veilEl: veilRef.current,
      coinEl: coinRef.current,
      washEl: null,
      curtainWrapEl: null,
      leftCurtainEl: null,
      rightCurtainEl: null,
    })

    return () => {
      registerTransitionStage(null)
    }
  }, [])

  return (
    <div
      ref={stageRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[100] overflow-hidden"
    >
      {/* Classy minimalistic veil with centered pink badge */}
      <div
        ref={veilRef}
        className="pointer-events-none absolute inset-0 opacity-0 flex items-center justify-center select-none will-change-[opacity]"
        style={{
          background:
            'radial-gradient(ellipse at 50% 50%, #170915 0%, #09060B 65%, #050406 100%)',
        }}
      >
        <div
          ref={coinRef}
          className="relative w-[210px] h-[210px] sm:w-[280px] sm:h-[280px] lg:w-[340px] lg:h-[340px] flex items-center justify-center pointer-events-none will-change-[transform,opacity]"
        >
          {/* Static radial glow behind coin instead of expensive per-frame CSS drop-shadow filter */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-4 rounded-full"
            style={{
              background:
                'radial-gradient(circle, rgba(215,62,188,0.32) 0%, rgba(215,62,188,0) 70%)',
            }}
          />
          <picture className="badge-breathe relative z-10 w-full h-full flex items-center justify-center">
            <source srcSet="/media/badge-enamel-still.webp" media="(min-width: 769px)" />
            <source srcSet="/media/badge-enamel-still-512.webp" media="(max-width: 768px)" />
            <img
              src="/media/badge-enamel-still.webp"
              alt="Underdogs Enamel Badge"
              width={1024}
              height={1024}
              fetchPriority="high"
              decoding="async"
              className="w-full h-full object-contain pointer-events-none select-none"
            />
          </picture>
        </div>
      </div>
    </div>
  )
}
