'use client'

import React from 'react'
import { site } from '@/content/site'

interface ScrollCueProps {
  visible?: boolean
  onActivate?: () => void
}

/**
 * Part 7 H1 Scroll cue "Enter ↓":
 * A 64 px hairline with a 12 px bright segment travelling down, looping every 1.6 s.
 * It's the only looping UI element, and it fades after 10% of the scene.
 */
export function ScrollCue({ visible = true, onActivate }: ScrollCueProps) {
  return (
    <button
      type="button"
      onClick={onActivate}
      className={`group inline-flex items-center gap-4 text-left transition-opacity duration-500 ${
        visible ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--steel)] group-hover:text-[var(--paper)] transition-colors">
        {site.home.hero.cue}
      </span>
      <svg
        width="10"
        height="12"
        viewBox="0 0 10 12"
        fill="none"
        aria-hidden="true"
        className="text-[var(--steel)] group-hover:text-[var(--magenta)] transition-colors"
      >
        <path
          d="M5 1V10.5M5 10.5L1.5 7M5 10.5L8.5 7"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
      <span
        aria-hidden="true"
        className="relative inline-block h-[64px] w-px overflow-hidden bg-[var(--paper)]/20"
      >
        <span className="scroll-cue-segment absolute left-0 top-0 h-[12px] w-px bg-[var(--magenta)]" />
      </span>
    </button>
  )
}
