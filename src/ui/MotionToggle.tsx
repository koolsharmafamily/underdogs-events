'use client'

import React from 'react'
import { site } from '@/content/site'
import { useStore } from '@/state/store'

interface MotionToggleProps {
  className?: string
}

export function MotionToggle({ className = '' }: MotionToggleProps) {
  const motionEnabled = useStore((s) => s.motionEnabled)
  const toggleMotion = useStore((s) => s.toggleMotion)

  const label = motionEnabled ? site.footer.motion.on : site.footer.motion.off

  return (
    <button
      type="button"
      onClick={toggleMotion}
      aria-pressed={motionEnabled}
      className={`nav-roll-link inline-flex min-h-[44px] min-w-[44px] items-center justify-center px-2 font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--world-text)] transition-colors duration-200 hover:text-[var(--world-accent)] ${className}`}
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
