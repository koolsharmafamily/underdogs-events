'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { site } from '@/content/site'
import { getSavedRouteScroll } from '@/motion/transitions'
import { useStore } from '@/state/store'
import { Divider } from '@/ui/Divider'

const DIWALI_CARD_SEEN_KEY = 'underdogs-diwali-titlecard-seen'

/**
 * Part 9 D0 · The film title card (≤ 3.4 s, time-based)
 * - Full-screen #0B0B0F with 8% film grain.
 * - Gate weave (±1 px jitter) & projector flicker (0.92–1.0) stepped at 24 fps on backdrop/grain only, NEVER on text.
 * - 0.3 s: "UNDERDOGS PRESENT" (Cinzel 500, 13 px, +0.42em, #EFB88A) + sparkle divider.
 * - 1.0 s: "THIS YEAR," / "DIFFERENT." (Cinzel 400 at display-l, ivory, two-line reveal) + sparkle divider.
 * - 2.4 s: Film burn reveals the velvet scene by 3.2 s.
 * - Skipping: any input skips straight to the burn.
 * - Replays / T3: on a repeat visit within the session or arriving via T3 (Part 10 T3), play the 1.6 s short version.
 */
export function DiwaliTitleCard() {
  const motionEnabled = useStore((s) => s.motionEnabled)
  const lastNavigationOrigin = useStore((s) => s.lastNavigationOrigin)
  const [done, setDone] = useState(false)
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0)
  const [weave, setWeave] = useState({ x: 0, y: 0, opacity: 0.96 })
  const timersRef = useRef<number[]>([])

  const triggerBurn = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id))
    timersRef.current = []
    setStep(3)
    const finishId = window.setTimeout(() => {
      setDone(true)
    }, 350)
    timersRef.current.push(finishId)
  }, [])

  useEffect(() => {
    // Skip title card on reduced motion or when restoring a scrolled position via T5 (browser back/forward)
    if (
      !motionEnabled ||
      (lastNavigationOrigin === 'T5' && getSavedRouteScroll('/diwali') > 100)
    ) {
      setDone(true)
      return
    }

    let isRepeat = false
    try {
      isRepeat = window.sessionStorage.getItem(DIWALI_CARD_SEEN_KEY) === '1'
      window.sessionStorage.setItem(DIWALI_CARD_SEEN_KEY, '1')
    } catch {
      // Ignore storage access errors
    }

    // Default 2.2 s title card (1.2 s on repeat visits or T3 arrival, skippable on input)
    const isShort = isRepeat || lastNavigationOrigin === 'T3'
    const step1Time = isShort ? 150 : 250
    const step2Time = isShort ? 450 : 800
    const step3Time = isShort ? 900 : 1650
    const totalTime = isShort ? 1200 : 2200

    const t1 = window.setTimeout(() => setStep(1), step1Time)
    const t2 = window.setTimeout(() => setStep(2), step2Time)
    const t3 = window.setTimeout(() => setStep(3), step3Time)
    const t4 = window.setTimeout(() => setDone(true), totalTime)

    timersRef.current = [t1, t2, t3, t4]

    // 24 fps stepped gate weave & projector flicker on backdrop/grain only (Part 9 D0)
    const flickerInterval = window.setInterval(() => {
      setWeave({
        x: Math.round((Math.random() - 0.5) * 2),
        y: Math.round((Math.random() - 0.5) * 2),
        opacity: 0.92 + Math.random() * 0.08,
      })
    }, 1000 / 24)

    const onInputSkip = () => {
      triggerBurn()
    }

    window.addEventListener('pointerdown', onInputSkip, { once: true })
    window.addEventListener('keydown', onInputSkip, { once: true })
    window.addEventListener('wheel', onInputSkip, { once: true, passive: true })

    return () => {
      timersRef.current.forEach((id) => window.clearTimeout(id))
      window.clearInterval(flickerInterval)
      window.removeEventListener('pointerdown', onInputSkip)
      window.removeEventListener('keydown', onInputSkip)
      window.removeEventListener('wheel', onInputSkip)
    }
  }, [motionEnabled, lastNavigationOrigin, triggerBurn])

  if (done) return null

  return (
    <div
      aria-hidden="true"
      onClick={triggerBurn}
      className={`fixed inset-0 z-40 flex items-center justify-center overflow-hidden bg-[#0B0B0F] transition-opacity duration-700 ${
        step === 3 ? 'film-burn-mask opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* 24fps stepped backdrop + 8% grain + warm light leak (never applied to text) */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          transform: `translate3d(${weave.x}px, ${weave.y}px, 0)`,
          opacity: weave.opacity,
        }}
      >
        <div
          className="film-grain-layer absolute -left-1/2 -top-1/2 h-[200%] w-[200%]"
          style={{ opacity: 0.08 }}
        />
        <div className="warm-light-leak absolute inset-y-0 left-0 w-1/2" />
      </div>

      {/* Crisp stationary title card text */}
      <div className="site-container relative z-10 flex flex-col items-center text-center gap-6 max-w-[680px]">
        <div
          className={`w-full flex flex-col items-center gap-4 transition-opacity duration-500 ${
            step >= 1 ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <p className="font-cinzel text-[13px] font-medium uppercase tracking-[0.42em] text-[#EFB88A]">
            {site.diwali.titleCard.presenter}
          </p>
          <div className="w-48">
            <Divider variant="sparkle" active={step >= 1} />
          </div>
        </div>

        <div
          className={`w-full flex flex-col items-center gap-4 transition-all duration-700 ${
            step >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="flex flex-col items-center">
            {site.diwali.titleCard.title.map((line) => (
              <p
                key={line}
                className="font-cinzel text-display-l font-normal uppercase text-[#FFF6EE]"
              >
                {line}
              </p>
            ))}
          </div>
          <div className="w-64 pt-2">
            <Divider variant="sparkle" active={step >= 2} />
          </div>
        </div>
      </div>
    </div>
  )
}
