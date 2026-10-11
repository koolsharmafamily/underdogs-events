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
  const washRef = useRef<HTMLDivElement>(null)
  const curtainWrapRef = useRef<HTMLDivElement>(null)
  const leftCurtainRef = useRef<HTMLDivElement>(null)
  const rightCurtainRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    registerTransitionStage({
      stageEl: stageRef.current,
      veilEl: veilRef.current,
      washEl: washRef.current,
      curtainWrapEl: curtainWrapRef.current,
      leftCurtainEl: leftCurtainRef.current,
      rightCurtainEl: rightCurtainRef.current,
    })

    return () => {
      registerTransitionStage(null)
    }
  }, [])

  return (
    <div
      ref={stageRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-40 overflow-hidden"
    >
      {/* Solid dark / film-cut veil */}
      <div
        ref={veilRef}
        className="absolute inset-0 bg-[#060101] opacity-0"
      />

      {/* Warm white-gold exposure wash (T2 & T3 Diwali flash) */}
      <div
        ref={washRef}
        className="absolute inset-0 opacity-0"
        style={{
          background:
            'radial-gradient(circle at 58% 50%, #FFFDF5 0%, #FFE494 48%, #D4AF6A 100%)',
        }}
      />

      {/* Pleated Velvet Curtains (T1 & T3) */}
      <div
        ref={curtainWrapRef}
        data-theme="redroom"
        className="absolute inset-0 opacity-0"
      >
        {/* Left Velvet Curtain Panel (52% width for seamless overlap at centre) */}
        <div
          ref={leftCurtainRef}
          className="transition-curtain-left absolute inset-y-0 left-0 w-[52%] origin-left"
          style={{
            transform: 'translate3d(-102%, 0, 0)',
            background:
              'repeating-linear-gradient(90deg, #100102 0%, #2E0306 4.5%, #4A060A 9%, #160103 13.5%, #090001 18%)',
            borderRight: '2px solid rgba(200, 161, 90, 0.55)',
          }}
        />

        {/* Right Velvet Curtain Panel */}
        <div
          ref={rightCurtainRef}
          className="transition-curtain-right absolute inset-y-0 right-0 w-[52%] origin-right"
          style={{
            transform: 'translate3d(102%, 0, 0)',
            background:
              'repeating-linear-gradient(90deg, #090001 0%, #160103 4.5%, #4A060A 9%, #2E0306 13.5%, #100102 18%)',
            borderLeft: '2px solid rgba(200, 161, 90, 0.55)',
          }}
        />
      </div>
    </div>
  )
}
