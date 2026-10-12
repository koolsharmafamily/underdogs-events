import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { frame, type TransitionType } from '@/state/frame'
import { useStore } from '@/state/store'
import type { WorldId } from '@/theme/tokens'
import { getLenis } from './clock'
import { registerMotionEases } from './eases'

export interface TransitionStageRefs {
  stageEl: HTMLElement | null
  veilEl: HTMLElement | null
  washEl: HTMLElement | null
  curtainWrapEl: HTMLElement | null
  leftCurtainEl: HTMLElement | null
  rightCurtainEl: HTMLElement | null
}

let stageRefs: TransitionStageRefs | null = null
let activeTimeline: gsap.core.Timeline | null = null
let pendingEnterCallback: (() => void) | null = null
let pendingEnterFallbackTimer: number | null = null

const SCROLL_STORAGE_PREFIX = 'underdogs-scroll:'


export function registerTransitionStage(refs: TransitionStageRefs | null) {
  stageRefs = refs
}

export function registerTransitionVeil(el: HTMLElement | null) {
  if (!stageRefs && el) {
    stageRefs = {
      stageEl: el,
      veilEl: el,
      washEl: null,
      curtainWrapEl: null,
      leftCurtainEl: null,
      rightCurtainEl: null,
    }
  }
}

export function pathToWorld(pathname: string): WorldId {
  if (pathname.startsWith('/the-red-room')) return 'redroom'
  if (pathname.startsWith('/diwali')) return 'diwali'
  return 'home'
}

export function worldToSkin(world: WorldId): 'enamel' | 'neon' | 'jewelled' {
  if (world === 'redroom') return 'neon'
  if (world === 'diwali') return 'jewelled'
  return 'enamel'
}

export function determineTransitionType(fromPath: string, toPath: string): TransitionType {
  if (fromPath === '/' && toPath === '/the-red-room') return 'T1'
  if (fromPath === '/' && toPath === '/diwali') return 'T2'
  if (
    (fromPath === '/the-red-room' && toPath === '/diwali') ||
    (fromPath === '/diwali' && toPath === '/the-red-room')
  ) {
    return 'T3'
  }
  if (toPath === '/') return 'T4'
  return 'T5'
}

export function saveRouteScroll(pathname: string, scrollY?: number) {
  if (typeof window === 'undefined') return
  try {
    const val = scrollY ?? window.scrollY ?? 0
    window.sessionStorage.setItem(`${SCROLL_STORAGE_PREFIX}${pathname}`, String(Math.round(val)))
  } catch {
    // Ignore storage errors
  }
}

export function getSavedRouteScroll(pathname: string): number {
  if (typeof window === 'undefined') return 0
  try {
    const raw = window.sessionStorage.getItem(`${SCROLL_STORAGE_PREFIX}${pathname}`)
    if (!raw) return 0
    const parsed = Number(raw)
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0
  } catch {
    return 0
  }
}

function resetStageComplete() {
  const store = useStore.getState()
  const lenis = getLenis()
  if (lenis) lenis.start()

  frame.transition.t = 0
  frame.transition.elapsed = 0
  frame.transition.duration = 0
  frame.transition.coverTime = 0
  frame.transition.type = 'none'
  frame.transition.phase = 'idle'
  frame.transition.doorProgress = 0
  frame.transition.dollyProgress = 0
  frame.transition.curtainClose = 0
  frame.transition.exposureWash = 0
  frame.transition.chromAb = 0
  frame.transition.badgeFlip = 0

  store.setTargetSkinOverride(null)
  store.setTransition('none', false)

  if (stageRefs?.stageEl) {
    stageRefs.stageEl.style.pointerEvents = 'none'
    gsap.set(stageRefs.stageEl, { pointerEvents: 'none' })
  }
  if (stageRefs?.veilEl) gsap.set(stageRefs.veilEl, { opacity: 0 })

  const mainEl = typeof document !== 'undefined' ? document.getElementById('main-content') : null
  if (mainEl) {
    gsap.set(mainEl, { clearProps: 'opacity' })
  }
}

/**
 * Called by destination page's `useEnterTransition` once its first frame is ready (Part 13.6)
 */
export function notifyRouteEntered() {
  if (pendingEnterFallbackTimer !== null && typeof window !== 'undefined') {
    window.clearTimeout(pendingEnterFallbackTimer)
    pendingEnterFallbackTimer = null
  }
  if (pendingEnterCallback) {
    const fn = pendingEnterCallback
    pendingEnterCallback = null
    // Run on next animation frame so layout & ScrollTrigger have settled
    requestAnimationFrame(() => {
      try {
        ScrollTrigger.refresh()
      } catch (e) {
        // Safe layout refresh catch
      }
      try {
        fn()
      } catch (e) {
        console.error('Enter animation error:', e)
        resetStageComplete()
      }
    })
  }
}

/**
 * Hook placed in each page view (`HomeView`, `RedRoomView`, `DiwaliView`) per Part 13.6
 */
export function useEnterTransition(world: WorldId) {
  useEffect(() => {
    notifyRouteEntered()
  }, [world])
}

export function runFadeCutJump(target: number | string | HTMLElement) {
  registerMotionEases()
  const { motionEnabled } = useStore.getState()
  const lenis = getLenis()

  const performScroll = () => {
    if (lenis) {
      lenis.scrollTo(target, { immediate: true })
    } else if (typeof target === 'number') {
      window.scrollTo({ top: target, behavior: 'instant' as ScrollBehavior })
    } else if (typeof target === 'string') {
      const node = document.querySelector(target)
      node?.scrollIntoView({ behavior: 'instant' as ScrollBehavior })
    } else {
      target.scrollIntoView({ behavior: 'instant' as ScrollBehavior })
    }
    ScrollTrigger.refresh()
    frame.snapCamera = true
  }

  const veilEl = stageRefs?.veilEl
  if (!veilEl) {
    performScroll()
    return
  }

  const outDur = motionEnabled ? 0.35 : 0.15
  const inDur = motionEnabled ? 0.45 : 0.15

  gsap.killTweensOf(veilEl)
  if (stageRefs?.stageEl) gsap.set(stageRefs.stageEl, { pointerEvents: 'auto' })

  const tl = gsap.timeline({
    onComplete: () => {
      if (stageRefs?.stageEl) gsap.set(stageRefs.stageEl, { pointerEvents: 'none' })
    },
  })

  tl.to(veilEl, {
    opacity: 1,
    duration: outDur,
    ease: 'ease.inOut',
    onComplete: performScroll,
  }).to(veilEl, {
    opacity: 0,
    duration: inDur,
    ease: 'ease.out',
  })
}

export interface RouteTransitionOptions {
  fromPath?: string
  toPath?: string
  origin?: 'door' | 'gate' | 'nav'
  isPopState?: boolean
}

export function runRouteTransition(
  type: TransitionType,
  onCover: () => void,
  options: RouteTransitionOptions = {}
) {
  registerMotionEases()
  const store = useStore.getState()
  const { motionEnabled } = store

  const fromPath =
    options.fromPath ?? (typeof window !== 'undefined' ? window.location.pathname : '/')
  const toPath =
    options.toPath ??
    (type === 'T1'
      ? '/the-red-room'
      : type === 'T2'
        ? '/diwali'
        : type === 'T4'
          ? '/'
          : '/')

  const fromWorld = pathToWorld(fromPath)
  const toWorld = pathToWorld(toPath)
  const destSkin = worldToSkin(toWorld)

  // Save current route's scroll position before leaving (Part 10 T5)
  if (!options.isPopState) {
    saveRouteScroll(fromPath)
  }

  // Record navigation origin and Home return target (Part 10 T4)
  store.setLastNavigationOrigin(
    options.isPopState
      ? 'T5'
      : (type === 'T1' || type === 'T2' || type === 'T3' || type === 'T4' || type === 'T5'
          ? type
          : 'direct')
  )

  if (fromWorld === 'home') {
    store.setLastHomeOrigin(options.origin === 'door' ? 'door' : 'nav')
  }

  if (toWorld === 'home' && type === 'T4') {
    const shouldLandAtH5 =
      options.origin === 'gate' ||
      (options.origin !== 'nav' && store.lastHomeOrigin === 'door')
    store.setT4ScrollTarget(shouldLandAtH5 ? 'H5' : 'top')
  }

  // Clean up any in-flight timeline
  if (activeTimeline) {
    activeTimeline.kill()
    activeTimeline = null
  }
  if (pendingEnterFallbackTimer !== null && typeof window !== 'undefined') {
    window.clearTimeout(pendingEnterFallbackTimer)
    pendingEnterFallbackTimer = null
  }
  pendingEnterCallback = null

  // Stop Lenis during exit to prevent visible scroll jump
  const lenis = getLenis()
  if (lenis) {
    lenis.stop()
  }

  // Initialize frame.transition state
  store.setTransition(type, true)
  frame.transition.type = type
  frame.transition.fromWorld = fromWorld
  frame.transition.toWorld = toWorld
  frame.transition.phase = 'exit'
  frame.transition.t = 0
  frame.transition.elapsed = 0
  frame.transition.doorProgress = 0
  frame.transition.dollyProgress = 0
  frame.transition.curtainClose = 0
  frame.transition.exposureWash = 0
  frame.transition.chromAb = 0
  frame.transition.badgeFlip = 0

  if (!stageRefs?.veilEl) {
    store.setTargetSkinOverride(destSkin)
    onCover()
    resetStageComplete()
    return
  }

  const { stageEl, veilEl } = stageRefs
  if (stageEl) gsap.set(stageEl, { pointerEvents: 'auto' })
  gsap.set(veilEl, { opacity: 0 })

  const mainEl = typeof document !== 'undefined' ? document.getElementById('main-content') : null

  // Helper to await destination mount at cover point
  const triggerCoverAndWaitForMount = (enterFn: () => void) => {
    frame.transition.phase = 'covered'

    // Scroll to top or restored position with { immediate: true } while covered
    const targetScroll =
      toWorld === 'home'
        ? (store.t4ScrollTarget === 'H5' ? getSavedRouteScroll('/') : 0)
        : 0
    if (lenis) {
      lenis.scrollTo(targetScroll, { immediate: true })
    } else if (typeof window !== 'undefined') {
      window.scrollTo({ top: targetScroll, behavior: 'instant' as ScrollBehavior })
    }

    frame.snapCamera = true

    pendingEnterCallback = () => {
      if (lenis) lenis.start()
      enterFn()
    }
    if (typeof window !== 'undefined') {
      pendingEnterFallbackTimer = window.setTimeout(() => {
        if (pendingEnterCallback) {
          const fn = pendingEnterCallback
          pendingEnterCallback = null
          try {
            fn()
          } catch (e) {
            console.error('Fallback enter animation error:', e)
            resetStageComplete()
          }
        }
      }, 1600)
    }
    onCover()
  }

  // Classy minimalistic transition with centered pink badge on luxury dark background
  const outDur = motionEnabled ? 0.32 : 0.16
  const inDur = motionEnabled ? 0.40 : 0.16

  frame.transition.duration = outDur + inDur
  frame.transition.coverTime = outDur

  const exitTl = gsap.timeline({
    onUpdate: function () {
      const time = this.time()
      frame.transition.elapsed = time
      frame.transition.t = time / (outDur + inDur)
    },
    onComplete: () => {
      store.setTargetSkinOverride(destSkin)
      triggerCoverAndWaitForMount(() => {
        frame.transition.phase = 'enter'
        const enterTl = gsap.timeline({
          onUpdate: function () {
            const enterTime = this.time()
            frame.transition.elapsed = outDur + enterTime
            frame.transition.t = Math.min(1, (outDur + enterTime) / (outDur + inDur))
          },
          onComplete: resetStageComplete,
        })
        enterTl.to(
          veilEl,
          {
            opacity: 0,
            duration: inDur,
            ease: 'power2.out',
          },
          0
        )
        activeTimeline = enterTl
      })
    },
  })

  // Fade out main content
  if (mainEl) {
    exitTl.to(
      mainEl,
      {
        opacity: 0,
        duration: outDur * 0.75,
        ease: 'power1.out',
      },
      0
    )
  }

  // Smoothly fade in the centered pink badge veil
  exitTl.to(
    veilEl,
    {
      opacity: 1,
      duration: outDur,
      ease: 'power2.inOut',
    },
    0
  )

  activeTimeline = exitTl
}
