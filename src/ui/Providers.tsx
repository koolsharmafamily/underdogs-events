'use client'

import React, { useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'
import { startClock, getLenis } from '@/motion/clock'
import { registerTransitionVeil } from '@/motion/transitions'
import { useStore } from '@/state/store'
import type { WorldId } from '@/theme/tokens'

const Experience = dynamic(
  () => import('@/webgl/Experience').then((mod) => mod.Experience),
  { ssr: false }
)

function pathnameToWorld(pathname: string): WorldId {
  if (pathname.startsWith('/the-red-room')) return 'redroom'
  if (pathname.startsWith('/diwali')) return 'diwali'
  return 'home'
}

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const setWorld = useStore((s) => s.setWorld)
  const setPrefersReducedMotion = useStore((s) => s.setPrefersReducedMotion)
  const veilRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    registerTransitionVeil(veilRef.current)
    return () => registerTransitionVeil(null)
  }, [])

  useEffect(() => {
    const world = pathnameToWorld(pathname)
    setWorld(world)
    const lenis = getLenis()
    if (lenis) {
      lenis.scrollTo(0, { immediate: true })
    } else if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
    }
  }, [pathname, setWorld])

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mql.matches)

    const onChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [setPrefersReducedMotion])

  useEffect(() => {
    const clock = startClock()
    return () => {
      clock.stop()
    }
  }, [])

  return (
    <>
      <Experience />
      {children}
      <div
        ref={veilRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-40 bg-[var(--world-bg)] opacity-0"
      />
    </>
  )
}
