'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useStore } from '@/state/store'

/**
 * Part 11 Custom cursor: for fine pointers only, morphing between states in 250 ms.
 * - Home: 10 px white ✕ (two 1.5 px strokes), mix-blend-mode: difference -> Over links: 36 px ring
 * - Red Room: 6 px --rr-neon dot with a soft glow -> Over links: grows to 28 px with a 1 px ring
 * - Diwali: 12 px gold ✦ -> Over links: rotates 45° and grows
 * Restore the native cursor on touch input and as soon as anyone navigates by keyboard.
 */
export function Cursor() {
  const world = useStore((s) => s.world)
  const hoverDoor = useStore((s) => s.hoverDoor)
  const cursorRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)
  const [hoveringLink, setHoveringLink] = useState(false)

  const effectiveWorld = hoverDoor ?? world

  useEffect(() => {
    if (typeof window === 'undefined') return
    const media = window.matchMedia('(pointer: fine)')
    if (!media.matches) return

    let rafId = 0
    let targetX = -100
    let targetY = -100

    const updatePosition = () => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${targetX}px, ${targetY}px, 0)`
      }
    }

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') {
        setActive(false)
        document.documentElement.classList.remove('has-custom-cursor')
        return
      }
      targetX = e.clientX
      targetY = e.clientY
      if (!active) {
        setActive(true)
        document.documentElement.classList.add('has-custom-cursor')
      }
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(updatePosition)

      const target = e.target as HTMLElement | null
      const interactive = target?.closest('a, button, [role="button"], [data-cursor-interactive]')
      setHoveringLink(Boolean(interactive))
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' || e.key.startsWith('Arrow') || e.key === 'Enter') {
        setActive(false)
        document.documentElement.classList.remove('has-custom-cursor')
      }
    }

    const onTouchStart = () => {
      setActive(false)
      document.documentElement.classList.remove('has-custom-cursor')
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('keydown', onKeyDown, { passive: true })
    window.addEventListener('touchstart', onTouchStart, { passive: true })

    return () => {
      cancelAnimationFrame(rafId)
      document.documentElement.classList.remove('has-custom-cursor')
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('touchstart', onTouchStart)
    }
  }, [active])

  if (!active) return null

  return (
    <div
      ref={cursorRef}
      aria-hidden="true"
      className={`pointer-events-none fixed left-0 top-0 z-50 -translate-x-1/2 -translate-y-1/2 ${
        effectiveWorld === 'home' ? 'mix-blend-difference' : ''
      }`}
    >
      {effectiveWorld === 'home' && (
        <div
          className={`flex items-center justify-center transition-transform duration-250 ${
            hoveringLink ? 'scale-125 rotate-45' : 'scale-100 rotate-0'
          }`}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path
              d="M1 1L9 9M9 1L1 9"
              stroke="#FCF9FC"
              strokeWidth="1.5"
            />
          </svg>
        </div>
      )}

      {effectiveWorld === 'redroom' && (
        <div
          className={`flex items-center justify-center rounded-full transition-all duration-250 ${
            hoveringLink
              ? 'h-2.5 w-2.5 bg-[#FF2A1F] shadow-[0_0_14px_3px_rgba(255,42,31,0.85)]'
              : 'h-1.5 w-1.5 bg-[#FF2A1F] shadow-[0_0_10px_2px_rgba(255,42,31,0.75)]'
          }`}
        />
      )}

      {effectiveWorld === 'diwali' && (
        <div
          className={`flex items-center justify-center text-[#F2D38B] transition-transform duration-250 ${
            hoveringLink ? 'scale-150 rotate-45' : 'scale-100 rotate-0'
          }`}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <path d="M6 0L7.35 4.65L12 6L7.35 7.35L6 12L4.65 7.35L0 6L4.65 4.65L6 0Z" />
          </svg>
        </div>
      )}
    </div>
  )
}
