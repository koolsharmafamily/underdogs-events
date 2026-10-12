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

const CRIMSON_CURTAIN_L =
  'repeating-linear-gradient(90deg, #100102 0%, #2E0306 4.5%, #4A060A 9%, #160103 13.5%, #090001 18%)'
const CRIMSON_CURTAIN_R =
  'repeating-linear-gradient(90deg, #090001 0%, #160103 4.5%, #4A060A 9%, #2E0306 13.5%, #100102 18%)'

const RANI_CURTAIN_L =
  'repeating-linear-gradient(90deg, #1A0310 0%, #4E0A2B 4.5%, #7E1347 9%, #2D0619 13.5%, #12020B 18%)'
const RANI_CURTAIN_R =
  'repeating-linear-gradient(90deg, #12020B 0%, #2D0619 4.5%, #7E1347 9%, #4E0A2B 13.5%, #1A0310 18%)'

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

function setCurtainPalette(palette: 'redroom' | 'diwali') {
  if (!stageRefs?.leftCurtainEl || !stageRefs?.rightCurtainEl) return
  if (palette === 'diwali') {
    stageRefs.leftCurtainEl.style.background = RANI_CURTAIN_L
    stageRefs.rightCurtainEl.style.background = RANI_CURTAIN_R
    stageRefs.leftCurtainEl.style.borderRight = '3px solid rgba(242, 211, 139, 0.75)'
    stageRefs.rightCurtainEl.style.borderLeft = '3px solid rgba(242, 211, 139, 0.75)'
  } else {
    stageRefs.leftCurtainEl.style.background = CRIMSON_CURTAIN_L
    stageRefs.rightCurtainEl.style.background = CRIMSON_CURTAIN_R
    stageRefs.leftCurtainEl.style.borderRight = '2px solid rgba(200, 161, 90, 0.55)'
    stageRefs.rightCurtainEl.style.borderLeft = '2px solid rgba(200, 161, 90, 0.55)'
  }
}

function syncCurtainDom(closeNorm: number) {
  if (!stageRefs?.leftCurtainEl || !stageRefs?.rightCurtainEl || !stageRefs?.curtainWrapEl) return
  if (closeNorm <= 0.001) {
    stageRefs.curtainWrapEl.style.opacity = '0'
    stageRefs.leftCurtainEl.style.transform = 'translate3d(-102%, 0, 0) scaleX(0.45)'
    stageRefs.rightCurtainEl.style.transform = 'translate3d(102%, 0, 0) scaleX(0.45)'
    return
  }
  stageRefs.curtainWrapEl.style.opacity = '1'
  const xPct = (1 - closeNorm) * 102
  const foldScale = 0.45 + 0.55 * closeNorm
  stageRefs.leftCurtainEl.style.transform = `translate3d(${-xPct}%, 0, 0) scaleX(${foldScale})`
  stageRefs.rightCurtainEl.style.transform = `translate3d(${xPct}%, 0, 0) scaleX(${foldScale})`
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
  if (stageRefs?.washEl) gsap.set(stageRefs.washEl, { opacity: 0 })
  syncCurtainDom(0)

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

  // Stop Lenis during exit to prevent visible scroll jump (Part B Item 7)
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

  const { stageEl, veilEl, washEl } = stageRefs
  if (stageEl) gsap.set(stageEl, { pointerEvents: 'auto' })
  gsap.set(veilEl, { opacity: 0 })
  if (washEl) gsap.set(washEl, { opacity: 0 })
  syncCurtainDom(0)

  const mainEl = typeof document !== 'undefined' ? document.getElementById('main-content') : null

  // Helper to await destination mount at cover point (max wait 1.2 s per Part 13.6)
  const triggerCoverAndWaitForMount = (enterFn: () => void) => {
    frame.transition.phase = 'covered'

    // Scroll to top or restored position with { immediate: true } while covered per Part B Item 7
    const targetScroll =
      toWorld === 'home'
        ? (store.t4ScrollTarget === 'H5' ? getSavedRouteScroll('/') : 0)
        : 0
    if (lenis) {
      lenis.scrollTo(targetScroll, { immediate: true })
    } else if (typeof window !== 'undefined') {
      window.scrollTo({ top: targetScroll, behavior: 'instant' as ScrollBehavior })
    }

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
      }, 1200)
    }
    console.log('[Transition Debug] triggerCoverAndWaitForMount called, setting pendingEnterCallback and invoking onCover()...');
    onCover()
  }

  // ---------------------------------------------------------------------------
  // REDUCED MOTION / MOTION TOGGLE OFF (Part 10: 300 ms crossfade, instant skin)
  // ---------------------------------------------------------------------------
  if (!motionEnabled) {
    frame.transition.duration = 0.3
    frame.transition.coverTime = 0.15
    gsap.set(veilEl, {
      backgroundColor:
        toWorld === 'redroom' ? '#060101' : toWorld === 'diwali' ? '#0B0B0F' : '#07090D',
    })

    const exitTl = gsap.timeline({
      onComplete: () => {
        store.setTargetSkinOverride(destSkin)
        triggerCoverAndWaitForMount(() => {
          frame.transition.phase = 'enter'
          const enterTl = gsap.timeline({ onComplete: resetStageComplete })
          enterTl.to(veilEl, { opacity: 0, duration: 0.15, ease: 'none' }, 0)
          activeTimeline = enterTl
        })
      },
    })
    exitTl.to(veilEl, { opacity: 1, duration: 0.15, ease: 'none' }, 0)
    activeTimeline = exitTl
    return
  }

  // ---------------------------------------------------------------------------
  // T1 · Home → The Red Room (1.60 s total, cover at 0.90 s)
  // ---------------------------------------------------------------------------
  if (type === 'T1') {
    frame.transition.duration = 1.6
    frame.transition.coverTime = 0.9
    setCurtainPalette('redroom')
    gsap.set(veilEl, { backgroundColor: '#060101', opacity: 0 })

    const exitTl = gsap.timeline({
      onUpdate: function () {
        const time = this.time()
        frame.transition.elapsed = time
        frame.transition.t = time / 1.6
        syncCurtainDom(frame.transition.curtainClose)
      },
      onComplete: () => {
        syncCurtainDom(1)
        gsap.set(veilEl, { opacity: 1 })
        triggerCoverAndWaitForMount(() => {
          frame.transition.phase = 'enter'
          // Behind closed curtains, drop solid veil and part the curtains (0.90 -> 1.60 s = 0.70 s)
          gsap.set(veilEl, { opacity: 0 })
          const enterTl = gsap.timeline({
            onUpdate: function () {
              const enterTime = this.time()
              frame.transition.elapsed = 0.9 + enterTime
              frame.transition.t = Math.min(1, (0.9 + enterTime) / 1.6)
              syncCurtainDom(frame.transition.curtainClose)
            },
            onComplete: resetStageComplete,
          })
          enterTl.to(
            frame.transition,
            {
              curtainClose: 0,
              dollyProgress: 0,
              doorProgress: 0,
              duration: 0.7,
              ease: 'ease.inOut',
            },
            0
          )
          activeTimeline = enterTl
        })
      },
    })

    // 0.00–0.45 s: Red door swings open 0 -> 75° (ease.inOut), red light floods out
    exitTl.to(
      frame.transition,
      {
        doorProgress: 1,
        duration: 0.45,
        ease: 'ease.inOut',
      },
      0
    )

    // 0.15 s: Badge begins its dissolve from Enamel to Neon (ember edge)
    exitTl.call(
      () => {
        store.setTargetSkinOverride('neon')
      },
      [],
      0.15
    )

    // 0.15–0.70 s: Camera pushes through doorway (dolly, FOV +6°, chromAb)
    exitTl.to(
      frame.transition,
      {
        dollyProgress: 1,
        duration: 0.55,
        ease: 'ease.inOut',
      },
      0.15
    )
    exitTl.to(
      frame.transition,
      {
        chromAb: 0.0015,
        duration: 0.28,
        ease: 'ease.in',
      },
      0.15
    )
    exitTl.to(
      frame.transition,
      {
        chromAb: 0,
        duration: 0.27,
        ease: 'ease.out',
      },
      0.43
    )

    // 0.55–0.75 s: Home DOM fades out
    if (mainEl) {
      exitTl.to(
        mainEl,
        {
          opacity: 0,
          duration: 0.2,
          ease: 'ease.inOut',
        },
        0.55
      )
    }

    // 0.55–0.90 s: Red velvet curtains sweep in from both sides and close
    exitTl.to(
      frame.transition,
      {
        curtainClose: 1,
        duration: 0.35,
        ease: 'ease.inOut',
      },
      0.55
    )

    activeTimeline = exitTl
    return
  }

  // ---------------------------------------------------------------------------
  // T2 · Home → Diwali (0.85 s total, cover at 0.65 s, then D0 title card)
  // ---------------------------------------------------------------------------
  if (type === 'T2') {
    frame.transition.duration = 0.85
    frame.transition.coverTime = 0.65
    gsap.set(veilEl, { backgroundColor: '#0B0B0F', opacity: 0 })

    const exitTl = gsap.timeline({
      onUpdate: function () {
        const time = this.time()
        frame.transition.elapsed = time
        frame.transition.t = time / 0.85
      },
      onComplete: () => {
        gsap.set(veilEl, { opacity: 1 })
        if (washEl) gsap.set(washEl, { opacity: 0 })
        triggerCoverAndWaitForMount(() => {
          frame.transition.phase = 'enter'
          // Hand off directly to D0 title card (#0B0B0F)
          const enterTl = gsap.timeline({ onComplete: resetStageComplete })
          enterTl.to(
            veilEl,
            {
              opacity: 0,
              duration: 0.2,
              ease: 'ease.out',
            },
            0
          )
          enterTl.to(
            frame.transition,
            {
              dollyProgress: 0,
              doorProgress: 0,
              exposureWash: 0,
              duration: 0.2,
              ease: 'ease.out',
            },
            0
          )
          activeTimeline = enterTl
        })
      },
    })

    // 0.00–0.35 s: Both Diwali door leaves open 0 -> 70° (ease.inOut), warm gold light floods out
    exitTl.to(
      frame.transition,
      {
        doorProgress: 1,
        duration: 0.35,
        ease: 'ease.inOut',
      },
      0
    )

    // 0.15 s: Badge begins dissolve from Enamel to Jewelled (gold-spark edge)
    exitTl.call(
      () => {
        store.setTargetSkinOverride('jewelled')
      },
      [],
      0.15
    )

    // 0.15–0.58 s: Camera pushes in; exposure ramps
    exitTl.to(
      frame.transition,
      {
        dollyProgress: 1,
        exposureWash: 1,
        duration: 0.43,
        ease: 'ease.inOut',
      },
      0.15
    )
    if (washEl) {
      exitTl.to(
        washEl,
        {
          opacity: 0.96,
          duration: 0.43,
          ease: 'ease.in',
        },
        0.15
      )
    }
    if (mainEl) {
      exitTl.to(
        mainEl,
        {
          opacity: 0,
          duration: 0.25,
          ease: 'ease.in',
        },
        0.3
      )
    }

    // 0.50–0.65 s: Wash cuts to #0B0B0F black, like a film cut
    exitTl.to(
      veilEl,
      {
        opacity: 1,
        duration: 0.15,
        ease: 'ease.inOut',
      },
      0.5
    )
    if (washEl) {
      exitTl.to(
        washEl,
        {
          opacity: 0,
          duration: 0.12,
          ease: 'ease.out',
        },
        0.53
      )
    }

    activeTimeline = exitTl
    return
  }

  // ---------------------------------------------------------------------------
  // T3 · World ↔ World (1.10 s total, cover at 0.55 s)
  // ---------------------------------------------------------------------------
  if (type === 'T3') {
    frame.transition.duration = 1.1
    frame.transition.coverTime = 0.55
    const isLeavingDiwali = fromWorld === 'diwali'
    setCurtainPalette(isLeavingDiwali ? 'diwali' : 'redroom')
    gsap.set(veilEl, {
      backgroundColor: toWorld === 'diwali' ? '#0B0B0F' : '#060101',
      opacity: 0,
    })

    const exitTl = gsap.timeline({
      onUpdate: function () {
        const time = this.time()
        frame.transition.elapsed = time
        frame.transition.t = time / 1.1
        syncCurtainDom(frame.transition.curtainClose)
      },
      onComplete: () => {
        syncCurtainDom(1)
        gsap.set(veilEl, { opacity: 1 })
        triggerCoverAndWaitForMount(() => {
          frame.transition.phase = 'enter'
          // Continue badge 180° flip from -PI to 0 so front face settles toward camera
          frame.transition.badgeFlip = -Math.PI

          if (toWorld === 'redroom') {
            // Target is Red Room: part the curtains over 0.55 s
            setCurtainPalette('redroom')
            gsap.set(veilEl, { opacity: 0 })
            const enterTl = gsap.timeline({
              onUpdate: function () {
                const enterTime = this.time()
                frame.transition.elapsed = 0.55 + enterTime
                frame.transition.t = Math.min(1, (0.55 + enterTime) / 1.1)
                syncCurtainDom(frame.transition.curtainClose)
              },
              onComplete: resetStageComplete,
            })
            enterTl.to(
              frame.transition,
              {
                curtainClose: 0,
                duration: 0.55,
                ease: 'ease.inOut',
              },
              0
            )
            enterTl.to(
              frame.transition,
              {
                badgeFlip: 0,
                duration: 0.55,
                ease: 'ease.out',
              },
              0
            )
            activeTimeline = enterTl
          } else {
            // Target is Diwali: open into the short title card
            syncCurtainDom(0)
            const enterTl = gsap.timeline({
              onUpdate: function () {
                const enterTime = this.time()
                frame.transition.elapsed = 0.55 + enterTime
                frame.transition.t = Math.min(1, (0.55 + enterTime) / 1.1)
              },
              onComplete: resetStageComplete,
            })
            enterTl.to(
              veilEl,
              {
                opacity: 0,
                duration: 0.25,
                ease: 'ease.out',
              },
              0
            )
            enterTl.to(
              frame.transition,
              {
                curtainClose: 0,
                badgeFlip: 0,
                duration: 0.55,
                ease: 'ease.out',
              },
              0
            )
            activeTimeline = enterTl
          }
        })
      },
    })

    // 0.00–0.55 s: Current world closes through curtains/drapes
    exitTl.to(
      frame.transition,
      {
        curtainClose: 1,
        badgeFlip: Math.PI,
        duration: 0.55,
        ease: 'ease.inOut',
      },
      0
    )

    // If leaving Diwali, add the brief gold flash as drapes close (Part 10 T3)
    if (isLeavingDiwali && washEl) {
      exitTl.to(
        washEl,
        {
          opacity: 0.65,
          duration: 0.22,
          ease: 'ease.out',
        },
        0.05
      )
      exitTl.to(
        washEl,
        {
          opacity: 0,
          duration: 0.25,
          ease: 'ease.inOut',
        },
        0.27
      )
    }

    // At edge-on (0.25 s, ~90°), trigger badge skin dissolve
    exitTl.call(
      () => {
        store.setTargetSkinOverride(destSkin)
      },
      [],
      0.25
    )

    if (mainEl) {
      exitTl.to(
        mainEl,
        {
          opacity: 0,
          duration: 0.3,
          ease: 'ease.inOut',
        },
        0.15
      )
    }

    activeTimeline = exitTl
    return
  }

  // ---------------------------------------------------------------------------
  // T4 · World → Home ("Back to the gate", or nav badge; 0.80 s total, cover at 0.40 s)
  // ---------------------------------------------------------------------------
  if (type === 'T4') {
    frame.transition.duration = 0.8
    frame.transition.coverTime = 0.4
    const darkestColor = fromWorld === 'redroom' ? '#060101' : '#0B0B0F'
    gsap.set(veilEl, { backgroundColor: darkestColor, opacity: 0 })

    // Re-skin to Enamel with magenta edge
    store.setTargetSkinOverride('enamel')

    const exitTl = gsap.timeline({
      onUpdate: function () {
        const time = this.time()
        frame.transition.elapsed = time
        frame.transition.t = time / 0.8
      },
      onComplete: () => {
        gsap.set(veilEl, { opacity: 1 })
        triggerCoverAndWaitForMount(() => {
          frame.transition.phase = 'enter'
          const enterTl = gsap.timeline({
            onUpdate: function () {
              const enterTime = this.time()
              frame.transition.elapsed = 0.4 + enterTime
              frame.transition.t = Math.min(1, (0.4 + enterTime) / 0.8)
            },
            onComplete: resetStageComplete,
          })
          enterTl.to(
            veilEl,
            {
              opacity: 0,
              duration: 0.4,
              ease: 'ease.out',
            },
            0
          )
          enterTl.to(
            frame.transition,
            {
              dollyProgress: 0,
              duration: 0.4,
              ease: 'ease.out',
            },
            0
          )
          activeTimeline = enterTl
        })
      },
    })

    // 0.00–0.40 s: World fades to darkest colour while camera pulls back fast
    exitTl.to(
      frame.transition,
      {
        dollyProgress: 1,
        duration: 0.4,
        ease: 'ease.inOut',
      },
      0
    )
    exitTl.to(
      veilEl,
      {
        opacity: 1,
        duration: 0.4,
        ease: 'ease.inOut',
      },
      0
    )
    if (mainEl) {
      exitTl.to(
        mainEl,
        {
          opacity: 0,
          duration: 0.3,
          ease: 'ease.in',
        },
        0
      )
    }

    activeTimeline = exitTl
    return
  }

  // ---------------------------------------------------------------------------
  // T5 · Browser Back and Forward (Part 10 T5: T3/T4 equivalent or 400 ms fade)
  // ---------------------------------------------------------------------------
  frame.transition.duration = 0.4
  frame.transition.coverTime = 0.2
  store.setTargetSkinOverride(destSkin)
  gsap.set(veilEl, {
    backgroundColor:
      toWorld === 'redroom' ? '#060101' : toWorld === 'diwali' ? '#0B0B0F' : '#07090D',
    opacity: 0.95,
  })

  const t5Tl = gsap.timeline({
    onUpdate: function () {
      const time = this.time()
      frame.transition.elapsed = time
      frame.transition.t = time / 0.4
    },
    onComplete: resetStageComplete,
  })
  t5Tl.to(
    veilEl,
    {
      opacity: 0,
      duration: 0.4,
      ease: 'ease.out',
    },
    0
  )
  activeTimeline = t5Tl
}
