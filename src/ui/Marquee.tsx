'use client'

import React, { useEffect, useRef } from 'react'
import { afterPaint } from "@/motion/afterPaint";
import { frame } from '@/state/frame'
import { useStore } from '@/state/store'

interface MarqueeProps {
  items: readonly string[]
}

/**
 * Part 7 H3 Marquees:
 * - Two marquees of nights.list names run in opposite directions, set in Unbounded 800 at display-l.
 * - Names alternate between solid fill and a 1.5 px outline. Separated by magenta ✕ glyphs.
 * - Speed is 40 px/s plus scroll velocity × 0.3, capped. Uses DOM/CSS transforms only.
 * - Hover (desktop): a name fills magenta and the badge blinks.
 * - Reduced motion: a static, wrapped list.
 */
export function Marquee({ items }: MarqueeProps) {
  const motionEnabled = useStore((s) => s.motionEnabled)
  const triggerBlink = useStore((s) => s.triggerBlink)
  const row1Ref = useRef<HTMLDivElement>(null)
  const row2Ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!motionEnabled) return

    let offset1 = 0
    let offset2 = 0

    const update = () => {
      const el1 = row1Ref.current
      const el2 = row2Ref.current
      if (!el1 || !el2) return

      const halfWidth1 = el1.scrollWidth / 2
      const halfWidth2 = el2.scrollWidth / 2
      if (halfWidth1 <= 0 || halfWidth2 <= 0) return

      const dt = frame.dt
      const velBoost = Math.min(Math.abs(frame.velocity) * 0.3, 180)
      const speed = 40 + velBoost

      offset1 -= speed * dt
      if (offset1 <= -halfWidth1) offset1 += halfWidth1

      offset2 += speed * dt
      if (offset2 >= 0) offset2 -= halfWidth2

      el1.style.transform = `translate3d(${offset1}px, 0, 0)`
      el2.style.transform = `translate3d(${offset2}px, 0, 0)`
    }

    return afterPaint(async () => { const {default:gsap}=await import("gsap"); gsap.ticker.add(update); return () => { gsap.ticker.remove(update); }; });
  }, [motionEnabled])

  if (!motionEnabled) {
    return (
      <ul
        aria-label="Past nights"
        className="site-container flex flex-wrap items-center gap-x-6 gap-y-3 py-6"
      >
        {items.map((item, idx) => {
          const isOutline = idx % 2 === 1
          return (
            <li key={item} className="inline-flex items-center gap-4">
              <span
                onMouseEnter={triggerBlink}
                className={`font-unbounded text-[clamp(16px,1.8vw,26px)] font-bold tracking-[0.05em] uppercase transition-colors duration-200 hover:text-[var(--magenta)] ${
                  isOutline ? 'marquee-outline-item' : 'text-[var(--paper)]'
                }`}
              >
                {item}
              </span>
              {idx < items.length - 1 && (
                <span aria-hidden="true" className="text-[var(--magenta)] opacity-75">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2 2L10 10M10 2L2 10"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                  </svg>
                </span>
              )}
            </li>
          )
        })}
      </ul>
    )
  }

  const repeated = [...items, ...items]
  const reversedItems = [...items].reverse()
  const repeatedReverse = [...reversedItems, ...reversedItems]

  return (
    <div className="flex flex-col gap-3.5 sm:gap-4 overflow-hidden py-3">
      {/* Screen-reader accessible single list */}
      <ul className="sr-only">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      {/* Row 1: Leftward */}
      <div className="overflow-hidden" aria-hidden="true">
        <div
          ref={row1Ref}
          className="flex w-max items-center whitespace-nowrap will-change-transform"
        >
          {repeated.map((item, idx) => {
            const isOutline = idx % 2 === 1
            return (
              <span key={`r1-${idx}`} className="inline-flex items-center">
                <span
                  onMouseEnter={triggerBlink}
                  className={`px-3 font-unbounded text-[clamp(16px,1.8vw,26px)] font-bold tracking-[0.05em] uppercase transition-colors duration-200 hover:text-[var(--magenta)] ${
                    isOutline ? 'marquee-outline-item' : 'text-[var(--paper)]'
                  }`}
                >
                  {item}
                </span>
                <span className="mx-2.5 inline-flex items-center text-[var(--magenta)] opacity-75">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2 2L10 10M10 2L2 10"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                  </svg>
                </span>
              </span>
            )
          })}
        </div>
      </div>

      {/* Row 2: Rightward */}
      <div className="overflow-hidden" aria-hidden="true">
        <div
          ref={row2Ref}
          className="flex w-max items-center whitespace-nowrap will-change-transform"
        >
          {repeatedReverse.map((item, idx) => {
            const isOutline = idx % 2 === 0
            return (
              <span key={`r2-${idx}`} className="inline-flex items-center">
                <span
                  onMouseEnter={triggerBlink}
                  className={`px-3 font-unbounded text-[clamp(16px,1.8vw,26px)] font-bold tracking-[0.05em] uppercase transition-colors duration-200 hover:text-[var(--magenta)] ${
                    isOutline ? 'marquee-outline-item' : 'text-[var(--paper)]'
                  }`}
                >
                  {item}
                </span>
                <span className="mx-2.5 inline-flex items-center text-[var(--magenta)] opacity-75">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2 2L10 10M10 2L2 10"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                  </svg>
                </span>
              </span>
            )
          })}
        </div>
      </div>
    </div>
  )
}
