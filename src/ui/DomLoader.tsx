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
 * - Screen is --void. Badge draws itself in SVG at its final on-screen size.
 * - Two ✕ eyes draw in (300 ms), then tongue (200 ms).
 * - Outer ring traces clockwise with loading progress.
 * - Bottom-left: mono counter 000 → 100. Bottom-right: "GATE TO RAGE" in Cinzel caps.
 * - Any input fast-forwards the loader to its end in 400 ms.
 * - Accessibility: role="status" live region ("Loading", then "Ready").
 */
export function DomLoader() {
  const phase = useStore((s) => s.phase)
  const setPhase = useStore((s) => s.setPhase)
  const motionEnabled = useStore((s) => s.motionEnabled)

  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(true)
  const [statusText, setStatusText] = useState<'Loading' | 'Ready'>('Loading')
  const containerRef = useRef<HTMLDivElement>(null)
  const progressObj = useRef({ val: 0 })
  const tlRef = useRef<gsap.core.Timeline | null>(null)

  useEffect(() => {
    registerMotionEases()

    let isRepeat = false
    try {
      isRepeat = window.sessionStorage.getItem(LOADER_SEEN_KEY) === '1'
      window.sessionStorage.setItem(LOADER_SEEN_KEY, '1')
    } catch {
      // Ignore storage access errors
    }

    const totalDuration = !motionEnabled ? 0.3 : isRepeat ? 0.6 : 0.95

    const finishLoader = () => {
      setStatusText('Ready')
      setPhase('ready')
      if (!containerRef.current) {
        setVisible(false)
        setPhase('complete')
        return
      }
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

    const tl = gsap.timeline({
      onComplete: finishLoader,
    })
    tlRef.current = tl

    tl.to(progressObj.current, {
      val: 100,
      duration: totalDuration,
      ease: 'ease.inOut',
      onUpdate: () => {
        setProgress(Math.round(progressObj.current.val))
      },
    })

    const skip = () => {
      if (tlRef.current && tlRef.current.isActive()) {
        tlRef.current.timeScale(2.5)
      }
    }

    window.addEventListener('pointerdown', skip, { once: true })
    window.addEventListener('keydown', skip, { once: true })
    window.addEventListener('wheel', skip, { once: true, passive: true })

    return () => {
      tl.kill()
      window.removeEventListener('pointerdown', skip)
      window.removeEventListener('keydown', skip)
      window.removeEventListener('wheel', skip)
    }
  }, [motionEnabled, setPhase])

  return (
    <>
      {/* Live region stays mounted so screen readers announce "Loading" then "Ready" */}
      <div role="status" aria-live="polite" className="sr-only">
        {statusText}
      </div>

      {visible && phase !== 'complete' && (
        <div
          ref={containerRef}
          aria-hidden="true"
          className="fixed inset-0 z-50 flex flex-col justify-between bg-[#07090D] text-[#FCF9FC] p-6 sm:p-12"
        >
          <div className="flex-1 flex items-center justify-center">
            <div className="w-[220px] h-[220px] sm:w-[320px] sm:h-[320px] flex items-center justify-center">
              <UnderdogsBadgeSvg
                skin="home"
                size="100%"
                ringProgress={progress / 100}
              />
            </div>
          </div>

          <div className="flex items-end justify-between">
            <span className="font-mono text-[12px] tracking-[0.08em] tabular-nums text-[#FCF9FC]">
              {String(progress).padStart(3, '0')}
            </span>
            <span className="font-cinzel text-[12px] uppercase tracking-[0.28em] text-[#FCF9FC]">
              {site.brand.line}
            </span>
          </div>
        </div>
      )}
    </>
  )
}
