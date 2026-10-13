'use client'

import React, { useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { startClock, getLenis } from '@/motion/clock'
import {
  getSavedRouteScroll,
  runRouteTransition,
  saveRouteScroll,
  pathToWorld,
} from '@/motion/transitions'
import { frame } from '@/state/frame'
import { useStore } from '@/state/store'
import { preloadWorldAssets } from '@/webgl/preload'
import { TransitionStage } from './TransitionStage'

const Experience = dynamic(
  () => import('@/webgl/Experience').then((mod) => mod.Experience),
  { ssr: false }
)

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const setWorld = useStore((s) => s.setWorld)
  const setPrefersReducedMotion = useStore((s) => s.setPrefersReducedMotion)
  const prevPathnameRef = useRef<string>(pathname)
  const isPopStateRef = useRef<boolean>(false)
  const restoringScrollRef = useRef<boolean>(false)

  // Save scroll position continuously for the active route (Part 10 T5)
  useEffect(() => {
    const onScroll = () => {
      if (
        !useStore.getState().isTransitioning &&
        !isPopStateRef.current &&
        !restoringScrollRef.current
      ) {
        saveRouteScroll(window.location.pathname, window.scrollY)
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Listen to browser back and forward (Part 10 T5)
  useEffect(() => {
    const onPopState = () => {
      isPopStateRef.current = true
      restoringScrollRef.current = true
      const fromPath = prevPathnameRef.current
      const toPath = window.location.pathname
      runRouteTransition('T5', () => {}, {
        fromPath,
        toPath,
        isPopState: true,
      })
    }

    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  // Handle route changes, T4 H5 gate landing, and T5 scroll restoration
  useEffect(() => {
    const world = pathToWorld(pathname)
    preloadWorldAssets(world)
    setWorld(world)
    prevPathnameRef.current = pathname

    const wasPopState = isPopStateRef.current
    isPopStateRef.current = false
    restoringScrollRef.current = true

    const store = useStore.getState()
    const shouldLandAtH5 =
      !wasPopState &&
      world === 'home' &&
      store.lastNavigationOrigin === 'T4' &&
      store.t4ScrollTarget === 'H5'

    const savedY = wasPopState ? getSavedRouteScroll(pathname) : 0

    const applyScrollTarget = () => {
      const lenis = getLenis()

      if (wasPopState) {
        if (lenis) {
          lenis.scrollTo(savedY, { immediate: true })
        }
        window.scrollTo({ top: savedY, behavior: 'instant' as ScrollBehavior })
      } else if (shouldLandAtH5) {
        const h5El = document.querySelector<HTMLElement>('[data-scene="H5"]')
        if (h5El) {
          const targetTop = h5El.offsetTop
          if (lenis) {
            lenis.scrollTo(targetTop, { immediate: true })
          }
          window.scrollTo({ top: targetTop, behavior: 'instant' as ScrollBehavior })
        }
      } else {
        if (lenis) {
          lenis.scrollTo(0, { immediate: true })
        }
        window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
      }

      ScrollTrigger.refresh()
      frame.snapCamera = true
    }

    // Apply immediately and verify on next frame once layout has settled
    applyScrollTarget()
    const rafId = requestAnimationFrame(() => {
      applyScrollTarget()
      window.setTimeout(() => {
        restoringScrollRef.current = false
      }, 100)
    })

    return () => cancelAnimationFrame(rafId)
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
      <TransitionStage />
    </>
  )
}
