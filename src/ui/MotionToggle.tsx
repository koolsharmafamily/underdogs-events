'use client'

import React from 'react'
import { site } from '@/content/site'
import { useStore } from '@/state/store'

interface MotionToggleProps {
  className?: string
  /** Text colour classes; defaults to the world's text colour. */
  colorClass?: string
  /** Icon only (the phone top bar has no room for the words); the label stays for screen readers. */
  compact?: boolean
}

/** Turns motion on or off for the visit and remembers it (store + localStorage). */
export function MotionToggle({ className = '', colorClass = 'text-[var(--world-text)] hover:text-[var(--world-accent)]', compact = false }: MotionToggleProps) {
  const motionEnabled = useStore((s) => s.motionEnabled)
  const toggleMotion = useStore((s) => s.toggleMotion)

  const label = motionEnabled ? site.footer.motion.on : site.footer.motion.off

  if (compact) {
    return (
      <button
        type="button"
        onClick={toggleMotion}
        aria-pressed={motionEnabled}
        aria-label={label}
        title={label}
        className={`inline-flex min-h-[44px] min-w-[44px] items-center justify-center transition-colors duration-200 ${colorClass} ${className}`}
      >
        <svg width="20" height="14" viewBox="0 0 20 14" fill="none" aria-hidden="true">
          {motionEnabled ? (
            <path d="M1 7c2.5-5 5-5 7.5 0s5 5 7.5 0M3 12c2-3 4-3 6 0M11 2c2 3 4 3 6 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          ) : (
            <path d="M1 7h18" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          )}
        </svg>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={toggleMotion}
      aria-pressed={motionEnabled}
      className={`nav-roll-link inline-flex min-h-[44px] min-w-[44px] items-center justify-center px-2 font-mono text-[11px] uppercase tracking-[0.08em] transition-colors duration-200 ${colorClass} ${className}`}
    >
      <span className="nav-roll-inner">
        <span className="nav-roll-line">{label}</span>
        <span className="nav-roll-line" aria-hidden="true">
          {label}
        </span>
      </span>
    </button>
  )
}
