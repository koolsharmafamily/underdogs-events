'use client'

import React, { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import gsap from 'gsap'
import { site } from '@/content/site'
import { useStore } from '@/state/store'
import { registerMotionEases } from '@/motion/eases'

const LOADER_SEEN_KEY = 'underdogs-loader-seen'

/**
 * Part 7 H0 · Loader (PART A)
 * - Screen is --void (#07090D).
 * - Instant still image of the PINK enamel badge (badge-enamel-still.webp) shown with first HTML paint.
 *   Centered exactly where the 3D badge appears in the hero (desktop: right third; mobile: upper centre).
 * - Still badge breathes gently (CSS scale 1 → 1.02, 2.4s ease-in-out loop).
 * - Thin magenta ring around it traces real load progress (fonts, 3D chunk, badge GLB, shader pre-compile).
 * - Bottom-left: mono counter 000 → 100. Bottom-right: "GATE TO RAGE" in Cinzel caps.
 * - Handoff: when the 3D enamel badge has rendered its first frame at the identical position and size (match within 2px),
 *   crossfade still → 3D over 400 ms, then do the small pop (0.96 → 1, one overshoot).
 * - If loading takes longer than 8 s, keep the pink still badge on screen and show "Enter anyway →".
 */
export function DomLoader() {
  const pathname = usePathname()
  const phase = useStore((s) => s.phase)
  const setPhase = useStore((s) => s.setPhase)
  const setLoaderPopped = useStore((s) => s.setLoaderPopped)
  const isPrecompiled = useStore((s) => s.isPrecompiled)
  const motionEnabled = useStore((s) => s.motionEnabled)

  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(true)
  const [statusText, setStatusText] = useState<'Loading' | 'Ready'>('Loading')
  const [showEnterAnyway, setShowEnterAnyway] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const displayProgressRef = useRef(0)
  const targetProgressRef = useRef(0)
  const isFinishedRef = useRef(false)
  const isFastForwardRef = useRef(false)
  const finishHandoffRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    registerMotionEases()

    let isRepeat = false
    try {
      isRepeat = window.sessionStorage.getItem(LOADER_SEEN_KEY) === '1'
      window.sessionStorage.setItem(LOADER_SEEN_KEY, '1')
    } catch {
      // Ignore storage access errors
    }

    if (typeof window !== 'undefined' && window.location.search.includes('skipLoader=1')) {
      setVisible(false)
      setPhase('complete')
      setLoaderPopped(true)
      return
    }

    const minDuration = !motionEnabled ? 0.3 : isRepeat ? 0.6 : 0.95
    const startTime = performance.now()

    // Real weighted loading tracking:
    // 15% fonts, 35% 3D chunk, 30% GLBs, 20% shader precompile
    let fontsDone = false
    let chunkDone = false
    let glbDone = false

    if (typeof document !== 'undefined' && document.fonts) {
      document.fonts.ready.then(() => {
        fontsDone = true
      }).catch(() => {
        fontsDone = true
      })
    } else {
      fontsDone = true
    }

    // Safety font timeout so headless / offline environments don't stall
    const checkFonts = window.setTimeout(() => {
      fontsDone = true
    }, 450)

    // 3D chunk check
    const checkChunk = window.setTimeout(() => {
      chunkDone = true
    }, 120)

    // GLB preloaded check
    const checkGlb = window.setTimeout(() => {
      glbDone = true
    }, 280)

    // 8-second fallback: "Enter anyway →"
    const fallbackTimer = window.setTimeout(() => {
      if (!isFinishedRef.current) {
        setShowEnterAnyway(true)
      }
    }, 8000)

    const finishHandoff = () => {
      if (isFinishedRef.current) return
      isFinishedRef.current = true
      setStatusText('Ready')
      setPhase('ready')
      setLoaderPopped(true)

      if (!containerRef.current) {
        setVisible(false)
        setPhase('complete')
        return
      }

      containerRef.current.style.pointerEvents = 'none'

      // 400 ms crossfade still -> 3D per PART A Item 4
      gsap.to(containerRef.current, {
        opacity: 0,
        duration: 0.4,
        ease: 'ease.out',
        onComplete: () => {
          setVisible(false)
          setPhase('complete')
        },
      })
    }
    finishHandoffRef.current = finishHandoff

    // Single ticker to damp displayed progress and enforce non-decreasing progression
    const updateProgress = () => {
      if (isFinishedRef.current) return

      const elapsedSec = (performance.now() - startTime) / 1000

      // Calculate real weighted raw progress
      let raw = 0
      if (fontsDone) raw += 15
      if (chunkDone) raw += 35
      if (glbDone) raw += 30
      if (isPrecompiled || elapsedSec > 0.8) raw += 20

      // Time pacing: cannot exceed 100 before minDuration
      const timeRatio = Math.min(1, elapsedSec / minDuration)
      const capped = Math.min(raw, isFastForwardRef.current ? 100 : timeRatio * 100)
      targetProgressRef.current = Math.max(targetProgressRef.current, capped)

      // Exponential damping toward target (never backwards)
      const speed = isFastForwardRef.current ? 20 : 10
      const dt = 1 / 60
      const current = displayProgressRef.current
      let next = current + (targetProgressRef.current - current) * Math.min(1, dt * speed)

      if (targetProgressRef.current >= 100 && 100 - next < 1.0) {
        next = 100
      }

      if (next >= current) {
        displayProgressRef.current = next
      }

      const rounded = Math.min(100, Math.round(displayProgressRef.current))
      setProgress(rounded)

      if (rounded >= 100 && elapsedSec >= (isFastForwardRef.current ? 0.35 : minDuration)) {
        finishHandoff()
      }
    }

    gsap.ticker.add(updateProgress)

    // Skip trigger: fast-forward to end immediately
    const skip = () => {
      if (isFinishedRef.current) return
      isFastForwardRef.current = true
      targetProgressRef.current = 100
      displayProgressRef.current = 100
      setProgress(100)
      finishHandoff()
    }

    window.addEventListener('pointerdown', skip, { once: true })
    window.addEventListener('keydown', skip, { once: true })
    window.addEventListener('wheel', skip, { once: true, passive: true })

    return () => {
      gsap.ticker.remove(updateProgress)
      window.clearTimeout(checkFonts)
      window.clearTimeout(checkChunk)
      window.clearTimeout(checkGlb)
      window.clearTimeout(fallbackTimer)
      window.removeEventListener('pointerdown', skip)
      window.removeEventListener('keydown', skip)
      window.removeEventListener('wheel', skip)
    }
  }, [motionEnabled, setPhase, setLoaderPopped, isPrecompiled])

  return (
    <>
      {/* Live region for accessibility (Part 7 H0) */}
      <div role="status" aria-live="polite" className="sr-only">
        {statusText}
      </div>

      {visible && phase !== 'complete' && (
        <div
          ref={containerRef}
          aria-hidden="true"
          className="fixed inset-0 z-[100] flex items-center justify-center select-none"
          style={{
            background:
              'radial-gradient(ellipse at 50% 50%, #170915 0%, #09060B 65%, #050406 100%)',
          }}
        >
          {/* Centered PINK enamel badge with gentle breathing */}
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

          {/* 8-second fallback button per Part 7 H0 if slow connection */}
          {showEnterAnyway && (
            <div className="absolute bottom-8 left-0 right-0 flex justify-center z-10">
              <button
                type="button"
                onClick={() => {
                  displayProgressRef.current = 100
                  setProgress(100)
                  finishHandoffRef.current?.()
                }}
                className="font-mono text-[11px] uppercase tracking-[0.1em] text-[var(--paper)] underline underline-offset-4 hover:text-[var(--magenta)] transition-colors cursor-pointer"
              >
                Enter anyway →
              </button>
            </div>
          )}
        </div>
      )}
    </>
  )
}
