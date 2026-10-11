import gsap from 'gsap'
import { frame, type TransitionType } from '@/state/frame'
import { useStore } from '@/state/store'
import { getLenis } from './clock'
import { registerMotionEases } from './eases'

let veilEl: HTMLElement | null = null

export function registerTransitionVeil(el: HTMLElement | null) {
  veilEl = el
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
  }

  if (!veilEl) {
    performScroll()
    return
  }

  const outDur = motionEnabled ? 0.4 : 0.15
  const inDur = motionEnabled ? 0.5 : 0.15

  gsap.killTweensOf(veilEl)
  gsap.set(veilEl, { pointerEvents: 'auto' })

  const tl = gsap.timeline({
    onComplete: () => {
      if (veilEl) gsap.set(veilEl, { pointerEvents: 'none' })
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

export function runRouteTransition(
  type: TransitionType,
  onCover: () => void
) {
  registerMotionEases()
  const store = useStore.getState()
  const { motionEnabled } = store

  store.setTransition(type, true)
  frame.transition.type = type
  frame.transition.t = 0

  if (!veilEl) {
    onCover()
    store.setTransition('none', false)
    return
  }

  const outDur = motionEnabled ? 0.42 : 0.15
  const inDur = motionEnabled ? 0.48 : 0.15

  gsap.killTweensOf(veilEl)
  gsap.killTweensOf(frame.transition)
  gsap.set(veilEl, { pointerEvents: 'auto' })

  const tl = gsap.timeline({
    onComplete: () => {
      frame.transition.t = 0
      frame.transition.type = 'none'
      store.setTransition('none', false)
      if (veilEl) gsap.set(veilEl, { pointerEvents: 'none' })
    },
  })

  tl.to(
    frame.transition,
    {
      t: 0.5,
      duration: outDur,
      ease: 'ease.inOut',
    },
    0
  )
    .to(
      veilEl,
      {
        opacity: 1,
        duration: outDur,
        ease: 'ease.inOut',
        onComplete: () => {
          onCover()
        },
      },
      0
    )
    .to(
      frame.transition,
      {
        t: 1,
        duration: inDur,
        ease: 'ease.out',
      },
      outDur + 0.06
    )
    .to(
      veilEl,
      {
        opacity: 0,
        duration: inDur,
        ease: 'ease.out',
      },
      outDur + 0.06
    )
}
