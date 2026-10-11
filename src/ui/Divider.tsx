import React from 'react'

export type DividerVariant = 'x' | 'diamond' | 'sparkle'

interface DividerProps {
  variant: DividerVariant
  active?: boolean
  className?: string
}

/**
 * Part 4.4 Ornament dividers:
 * - x: two ✕ shapes from the logo's eyes, used on Home.
 * - diamond: a hairline with a centre ◆, from the Red Room poster, used in Red Room.
 * - sparkle: a hairline with a centre four-point ✦, from the Diwali poster, used in Diwali.
 * - Hairlines: 1 px, at 20% opacity at rest and 60% when active, in the world's text colour.
 */
export function Divider({ variant, active = false, className = '' }: DividerProps) {
  const lineOpacity = active ? 'opacity-60' : 'opacity-20'

  return (
    <div
      role="separator"
      aria-hidden="true"
      className={`flex w-full items-center gap-4 ${className}`}
    >
      <span className={`h-px flex-1 bg-current transition-opacity duration-300 ${lineOpacity}`} />
      {variant === 'x' && (
        <span className="inline-flex items-center gap-2 text-[var(--world-accent)]">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
            <path d="M1.5 1.5L8.5 8.5M8.5 1.5L1.5 8.5" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
            <path d="M1.5 1.5L8.5 8.5M8.5 1.5L1.5 8.5" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </span>
      )}
      {variant === 'diamond' && (
        <span className="inline-flex items-center text-[var(--rr-gilt,#C8A15A)]">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" aria-hidden="true">
            <polygon points="5,0.5 9.5,5 5,9.5 0.5,5" />
          </svg>
        </span>
      )}
      {variant === 'sparkle' && (
        <span className="inline-flex items-center text-[var(--dw-gold-bright,#F2D38B)]">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
            <path d="M6 0L7.35 4.65L12 6L7.35 7.35L6 12L4.65 7.35L0 6L4.65 4.65L6 0Z" />
          </svg>
        </span>
      )}
      <span className={`h-px flex-1 bg-current transition-opacity duration-300 ${lineOpacity}`} />
    </div>
  )
}
