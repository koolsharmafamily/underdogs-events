'use client'

import React, { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { site } from '@/content/site'
import { useStore } from '@/state/store'
import { UnderdogsBadgeSvg } from './UnderdogsBadgeSvg'
import { registerMotionEases } from '@/motion/eases'

const LOADER_SEEN_KEY = 'underdogs-loader-seen'

/**
 * Part 7 H0 · Loader (first visit only; return visits get a 600 ms fade)
 * - Screen is --void (#07090D).
 * - Badge draws itself in SVG at its final on-screen size (matching 3D badge position within 2 px).
 * - Two ✕ eyes draw in (300 ms), then tongue (200 ms).
 * - Outer ring traces clockwise with real loading progress, weighted:
 *   fonts 15%, 3D chunk 35%, badge GLB 30%, shader pre-compile 20%.
 *   The displayed value is damped and never goes backwards.
 * - Bottom-left: mono counter 000 → 100. Bottom-right: "GATE TO RAGE" in Cinzel caps.
 * - Handoff: At 100%, render the WebGL badge exactly behind the SVG; it must match within 2 px.
 * - Crossfade over 240 ms. The 3D badge "pops" (scale spring 0.96 → 1, one overshoot)
 *   and magenta rim light rises over 900 ms. Beams fade in, hero text reveals.
 * - Timing: at least 900 ms in total. After 8 s, show "Enter anyway →".
 * - Skipping: any input fast-forwards the loader to its end in 400 ms.
 * - Accessibility: role="status" live region ("Loading", then "Ready").
 */
export function DomLoader() {
  const phase = useStore((s) => s.phase)
  const setPhase = useStore((s) => s.setPhase)
  const setLoaderPopped = useStore((s) => s.setLoaderPopped)
  const isPrecompiled = useStore((s) => s.isPrecompiled)
  const motionEnabled = useStore((s) => s.motionEnabled)

  const [progress, setProgress] = useState(0)
  const [eyesProgress, setEyesProgress] = useState(0)
  const [tongueProgress, setTongueProgress] = useState(0)
  const [visible, setVisible] = useState(true)
  const [statusText, setStatusText] = useState<'Loading' | 'Ready'>('Loading')
  const [showEnterAnyway, setShowEnterAnyway] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const displayProgressRef = useRef(0)
  const targetProgressRef = useRef(0)
  const isFinishedRef = useRef(false)
  const isFastForwardRef = useRef(false)

  useEffect(() => {
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

    // Eye draw: 300 ms, Tongue draw: 200 ms
    const drawTl = gsap.timeline()
    drawTl.to({}, {
      duration: 0.3,
      onUpdate: function () {
        setEyesProgress(this.progress())
      },
    })
    drawTl.to({}, {
      duration: 0.2,
      onUpdate: function () {
        setTongueProgress(this.progress())
      },
    })

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

      // 240 ms crossfade per Part 7 H0
      gsap.to(containerRef.current, {
        opacity: 0,
        duration: 0.24,
        ease: 'ease.out',
        onComplete: () => {
          setVisible(false)
          setPhase('complete')
        },
      })
    }

    // Single ticker to damp displayed progress and enforce non-decreasing progression
    const updateProgress = () => {
      if (isFinishedRef.current) return

      const elapsedSec = (performance.now() - startTime) / 1000

      // Calculate real weighted raw progress
      let raw = 0
      if (fontsDone) raw += 15
      if (chunkDone) raw += 35
      if (glbDone) raw += 30
      if (isPrecompiled || elapsedSec > 0.7) raw += 20

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

    // Skip trigger: fast-forward to end in 400 ms
    const skip = () => {
      if (isFinishedRef.current) return
      isFastForwardRef.current = true
      targetProgressRef.current = 100
      setEyesProgress(1)
      setTongueProgress(1)
    }

    window.addEventListener('pointerdown', skip, { once: true })
    window.addEventListener('keydown', skip, { once: true })
    window.addEventListener('wheel', skip, { once: true, passive: true })

    return () => {
      gsap.ticker.remove(updateProgress)
      drawTl.kill()
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
                <div className="w-[210px] h-[210px] sm:w-[280px] sm:h-[280px] lg:w-[440px] lg:h-[440px] flex items-center justify-center">
                  <UnderdogsBadgeSvg
                    skin="home"
                    size="100%"
                    ringProgress={progress / 100}
                    eyesProgress={eyesProgress}
                    tongueProgress={tongueProgress}
                  />
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
                  isFastForwardRef.current = true
                  targetProgressRef.current = 100
                }}
                className="font-mono text-[11px] uppercase tracking-[0.1em] text-[var(--paper)] underline underline-offset-4 hover:text-[var(--magenta)] transition-colors"
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
