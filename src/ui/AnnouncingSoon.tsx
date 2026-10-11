import React from 'react'
import { ANNOUNCING_SOON } from '@/content/site'

interface AnnouncingSoonProps {
  value: string
  className?: string
}

/**
 * Rules for "Announcing soon" (Part 3):
 * - Render it in italic with a small 6 px pulsing dot in the world's accent colour,
 *   so it reads as "coming", not "missing".
 * - When the client fills in a value later, the dot disappears automatically.
 */
export function AnnouncingSoon({ value, className = '' }: AnnouncingSoonProps) {
  const isAnnouncingSoon = value === ANNOUNCING_SOON
  const endsWithAnnouncingSoon =
    !isAnnouncingSoon && value.endsWith(ANNOUNCING_SOON)

  if (isAnnouncingSoon) {
    return (
      <span className={`inline-flex items-center gap-2 italic ${className}`}>
        <span
          className="announcing-dot inline-block h-[6px] w-[6px] shrink-0"
          aria-hidden="true"
        />
        <span>{ANNOUNCING_SOON}</span>
      </span>
    )
  }

  if (endsWithAnnouncingSoon) {
    const prefix = value.slice(0, value.length - ANNOUNCING_SOON.length)
    return (
      <span className={`inline-flex flex-wrap items-center gap-1.5 ${className}`}>
        <span>{prefix}</span>
        <span className="inline-flex items-center gap-2 italic">
          <span
            className="announcing-dot inline-block h-[6px] w-[6px] shrink-0"
            aria-hidden="true"
          />
          <span>{ANNOUNCING_SOON}</span>
        </span>
      </span>
    )
  }

  return <span className={className}>{value}</span>
}
