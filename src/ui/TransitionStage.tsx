'use client'

import React, { useEffect, useRef } from 'react'
import { registerTransitionStage } from '@/motion/transitions'

/**
 * Persistent transition overlay stage controlled directly via GSAP refs in transitions.ts (zero React state updates per frame):
 * - veilEl: solid world-darkness / film-cut black veil (#060101 / #0B0B0F / #07090D)
 * - washEl: warm white-gold exposure wash for T2 (0.25–1.00s) and T3 Diwali gold flash
 * - curtainWrapEl, leftCurtainEl, rightCurtainEl: full-height pleated velvet curtains that sweep in from both sides (T1 0.85–1.35s, T3 0.00–0.80s) and part with fold bunching (T1 1.35–2.40s, T3->RedRoom)
 */
export function TransitionStage() {
  const stageRef = useRef<HTMLDivElement>(null)
  const veilRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    registerTransitionStage({
      stageEl: stageRef.current,
      veilEl: veilRef.current,
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
        className="pointer-events-none absolute inset-0 opacity-0 flex items-center justify-center select-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 50%, #170915 0%, #09060B 65%, #050406 100%)',
        }}
      >
        <div className="badge-breathe relative w-[210px] h-[210px] sm:w-[280px] sm:h-[280px] lg:w-[340px] lg:h-[340px] flex items-center justify-center pointer-events-none">
          <picture className="w-full h-full flex items-center justify-center">
            <source srcSet="/media/badge-enamel-still.webp" media="(min-width: 769px)" />
            <source srcSet="/media/badge-enamel-still-512.webp" media="(max-width: 768px)" />
            <img
              src="/media/badge-enamel-still.webp"
              alt="Underdogs Enamel Badge"
              width={1024}
              height={1024}
              fetchPriority="high"
              decoding="async"
              className="w-full h-full object-contain pointer-events-none drop-shadow-[0_16px_50px_rgba(215,62,188,0.28)] select-none"
            />
          </picture>
        </div>
      </div>
    </div>
  )
}
