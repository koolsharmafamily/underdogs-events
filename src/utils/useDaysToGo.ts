'use client'

import { useEffect, useState } from 'react'
import { site } from '@/content/site'
import { getDaysToGo } from './date'

/**
 * "9 days to go", computed in the browser only. The pages are static, so a
 * count rendered on the server would be wrong (and fail hydration) the day
 * after a deploy. Returns null on the server, on the first client render and
 * after the date has passed.
 */
export function useDaysToGo(isoDate: string): string | null {
  const [label, setLabel] = useState<string | null>(null)
  useEffect(() => {
    const days = getDaysToGo(isoDate)
    const copy = site.events.daysToGo
    setLabel(days === null ? null : days === 0 ? copy.today : `${days} ${days === 1 ? copy.one : copy.many}`)
  }, [isoDate])
  return label
}
