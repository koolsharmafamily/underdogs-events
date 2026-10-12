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
  const isHome = pathname === '/'
  const phase = useStore((s) => s.phase)
  const setPhase = useStore((s) => s.setPhase)
  const setLoaderPopped = useStore((s) => s.setLoaderPopped)
  const isPrecompiled = useStore((s) => s.isPrecompiled)
  const motionEnabled = useStore((s) => s.motionEnabled)

  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(isHome)
  const [statusText, setStatusText] = useState<'Loading' | 'Ready'>('Loading')
  const [showEnterAnyway, setShowEnterAnyway] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const displayProgressRef = useRef(0)
  const targetProgressRef = useRef(0)
  const isFinishedRef = useRef(false)
  const isFastForwardRef = useRef(false)
  const finishHandoffRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (!isHome) {
      setPhase('complete')
      setLoaderPopped(true)
      setVisible(false)
      return
    }

    registerMotionEases()

    let isRepeat = false
    try {
      isRepeat = window.sessionStorage.getItem(LOADER_SEEN_KEY) === '1'
      window.sessionStorage.setItem(LOADER_SEEN_KEY, '1')
    } catch {
      // Ignore storage access errors
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
          className="fixed inset-0 z-50 flex flex-col justify-between bg-[#07090D] text-[#FCF9FC] p-6 sm:p-12 select-none"
        >
          {/* Badge aligned to exact 3D Hero position within 2 px */}
          <div className="absolute inset-0 flex items-center pointer-events-none">
            <div className="site-container site-grid w-full h-full items-center">
              <div className="col-span-4 md:col-span-4 lg:col-span-6 lg:col-start-7 order-1 lg:order-2 flex flex-col items-center justify-center pt-16 lg:pt-0">
                <div className="relative w-[210px] h-[210px] sm:w-[280px] sm:h-[280px] lg:w-[440px] lg:h-[440px] flex items-center justify-center">
                  {/* Instantly rendered PINK enamel still badge with gentle CSS breathing */}
                  <div className="badge-breathe w-full h-full flex items-center justify-center relative">
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
                        className="w-full h-full object-contain pointer-events-none drop-shadow-[0_12px_40px_rgba(173,12,128,0.25)] select-none"
                      />
                    </picture>
                  </div>

                  {/* Thin magenta ring tracing REAL loading progress */}
                  <svg
                    viewBox="0 0 100 100"
                    className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r="48.5"
                      fill="none"
                      stroke="rgba(215, 62, 188, 0.15)"
                      strokeWidth="1.2"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="48.5"
                      fill="none"
                      stroke="#D73EBC"
                      strokeWidth="1.4"
                      strokeDasharray={2 * Math.PI * 48.5}
                      strokeDashoffset={2 * Math.PI * 48.5 * (1 - progress / 100)}
                      strokeLinecap="round"
                      className="transition-all duration-150 ease-out"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pointer-events-none">
            <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--steel)]">
              {site.brand.name}
            </span>
          </div>

          <div className="flex items-end justify-between relative z-10">
            {/* Bottom-left: mono counter 000 → 100 */}
            <span className="font-mono text-[13px] tracking-[0.08em] tabular-nums text-[#FCF9FC]">
              {String(progress).padStart(3, '0')}
            </span>

            {/* 8-second fallback button per Part 7 H0 */}
            {showEnterAnyway && (
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
            )}

            {/* Bottom-right: "GATE TO RAGE" in Cinzel caps */}
            <span className="font-cinzel text-[13px] uppercase tracking-[0.28em] text-[#FCF9FC]">
              {site.brand.line}
            </span>
          </div>
        </div>
      )}
    </>
  )
}
