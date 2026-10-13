'use client'

import React, { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useStore } from '@/state/store'
import { registerMotionEases } from '@/motion/eases'

const LOADER_SEEN_KEY = 'underdogs-loader-seen'

/**
 * Classy minimalistic loader with centered pink enamel badge on a dark radial vignette.
 * Waits for actual WebGL first-frame readiness of the active world before running a
 * GPU-composited two-step dissolve (coin gently recedes into the dark vignette, then vignette lifts).
 */
export function DomLoader() {
  const phase = useStore((s) => s.phase)
  const setPhase = useStore((s) => s.setPhase)
  const setLoaderPopped = useStore((s) => s.setLoaderPopped)
  const motionEnabled = useStore((s) => s.motionEnabled)

  const [visible, setVisible] = useState(true)
  const [statusText, setStatusText] = useState<'Loading' | 'Ready'>('Loading')
  const [showEnterAnyway, setShowEnterAnyway] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const coinRef = useRef<HTMLDivElement>(null)
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

    const minDuration = !motionEnabled ? 0.25 : isRepeat ? 0.4 : 0.55
    const startTime = performance.now()

    let fontsDone = false
    if (typeof document !== 'undefined' && document.fonts) {
      document.fonts.ready
        .then(() => {
          fontsDone = true
        })
        .catch(() => {
          fontsDone = true
        })
    } else {
      fontsDone = true
    }

    // Safety font timeout so headless / offline environments never stall
    const checkFonts = window.setTimeout(() => {
      fontsDone = true
    }, 350)

    // 8-second fallback: "Enter anyway →"
    const fallbackTimer = window.setTimeout(() => {
      if (!isFinishedRef.current) {
        setShowEnterAnyway(true)
      }
    }, 8000)

    const finishHandoff = () => {
      if (isFinishedRef.current) return
      isFinishedRef.current = true

      if (!containerRef.current) {
        setStatusText('Ready')
        setLoaderPopped(true)
        setVisible(false)
        setPhase('complete')
        return
      }

      // Immediately release pointer events so scroll & interaction are never blocked during fade
      containerRef.current.style.pointerEvents = 'none'

      // Wait one animation frame to ensure any pending GPU work is completely flushed before starting tween
      requestAnimationFrame(() => {
        if (!containerRef.current) {
          setStatusText('Ready')
          setLoaderPopped(true)
          setVisible(false)
          setPhase('complete')
          return
        }

        const tl = gsap.timeline({
          onComplete: () => {
            setStatusText('Ready')
            setVisible(false)
            setPhase('complete')
          },
        })

        // Step 1: Centered pink coin smoothly scales down slightly and melts into the dark vignette
        if (coinRef.current) {
          tl.to(
            coinRef.current,
            {
              opacity: 0,
              scale: 0.92,
              duration: motionEnabled ? 0.44 : 0.2,
              ease: 'power2.inOut',
              force3D: true,
            },
            0
          )
        }

        // Step 2: Trigger 3D badge pop & smoothly lift the dark vignette as the coin finishes dissolving
        tl.call(
          () => {
            setLoaderPopped(true)
          },
          [],
          motionEnabled ? 0.16 : 0.05
        )

        tl.to(
          containerRef.current,
          {
            opacity: 0,
            duration: motionEnabled ? 0.52 : 0.22,
            ease: 'power2.out',
          },
          motionEnabled ? 0.16 : 0.05
        )
      })
    }
    finishHandoffRef.current = finishHandoff

    // Lightweight readiness check with ZERO React state updates per frame
    const checkReady = () => {
      if (isFinishedRef.current) return

      const elapsedSec = (performance.now() - startTime) / 1000
      const store = useStore.getState()
      const activeWorldReady = store.renderedWorlds[store.world] || store.tier === 'T0'

      // Ready once active world has rendered 2 post-compile WebGL frames (or 1.35s safety fallback for headless/slow GPUs)
      const webglReady = activeWorldReady || elapsedSec >= 1.35

      if (
        isFastForwardRef.current ||
        (fontsDone && webglReady && elapsedSec >= minDuration)
      ) {
        finishHandoff()
      }
    }

    gsap.ticker.add(checkReady)

    // Skip trigger: fast-forward on user input once minimum 0.3s has passed
    const skip = () => {
      if (isFinishedRef.current) return
      isFastForwardRef.current = true
      finishHandoff()
    }

    window.addEventListener('pointerdown', skip, { once: true })
    window.addEventListener('keydown', skip, { once: true })
    window.addEventListener('wheel', skip, { once: true, passive: true })

    return () => {
      gsap.ticker.remove(checkReady)
      window.clearTimeout(checkFonts)
      window.clearTimeout(fallbackTimer)
      window.removeEventListener('pointerdown', skip)
      window.removeEventListener('keydown', skip)
      window.removeEventListener('wheel', skip)
    }
  }, [motionEnabled, setPhase, setLoaderPopped])

  return (
    <>
      <div role="status" aria-live="polite" className="sr-only">
        {statusText}
      </div>

      {visible && phase !== 'complete' && (
        <div
          ref={containerRef}
          aria-hidden="true"
          className="fixed inset-0 z-[100] flex items-center justify-center select-none will-change-[opacity]"
          style={{
            background:
              'radial-gradient(ellipse at 50% 50%, #170915 0%, #09060B 65%, #050406 100%)',
          }}
        >
          {/* GPU-composited coin wrapper (separate from inner CSS breathing to avoid transform conflict) */}
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

          {showEnterAnyway && (
            <div className="absolute bottom-8 left-0 right-0 flex justify-center z-10">
              <button
                type="button"
                onClick={() => {
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
