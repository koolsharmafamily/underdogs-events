import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { frame } from '@/state/frame'
import { damp, clamp, registerMotionEases } from './eases'

gsap.registerPlugin(ScrollTrigger)

let activeLenis: Lenis | null = null

// Phase 0 no-op for WebGL advance(time) per Part 14 Phase 0 spec
let webglAdvance: (time: number) => void = () => {}

export function setWebglAdvance(fn: (time: number) => void) {
  webglAdvance = fn
}

export function getLenis(): Lenis | null {
  return activeLenis
}

export function startClock() {
  registerMotionEases()

  if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
    window.history.scrollRestoration = 'manual'
  }

  // Ignore height-only mobile URL bar resizes in ScrollTrigger (Part 12.1)
  ScrollTrigger.config({
    ignoreMobileResize: true,
    autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load',
  })

  const lenis = new Lenis({
    lerp: 0.09,
    smoothWheel: true,
    syncTouch: false,
    autoRaf: false,
  })
  activeLenis = lenis

  if (typeof window !== 'undefined') {
    const w = window as unknown as Record<string, unknown>
    w.__lenis = lenis
    w.__ScrollTrigger = ScrollTrigger
    w.__frame = frame
  }

  lenis.on('scroll', ScrollTrigger.update)

  let isHidden = typeof document !== 'undefined' ? document.hidden : false
  let lastWidth = typeof window !== 'undefined' ? window.innerWidth : 1440
  let lastHeight = typeof window !== 'undefined' ? window.innerHeight : 900
  let lastIsLandscape = lastWidth > lastHeight
  let resizeTimer: number | null = null

  const onVisibilityChange = () => {
    isHidden = document.hidden
  }

  const onResize = () => {
    if (typeof window === 'undefined') return
    const w = window.innerWidth
    const h = window.innerHeight
    const dw = Math.abs(w - lastWidth)
    const dh = Math.abs(h - lastHeight)
    const isTouch = window.matchMedia('(pointer: coarse)').matches
    const isLandscape = w > h
    const orientationChanged = isLandscape !== lastIsLandscape

    // Part 12.1: Ignore height-only resizes under 120 px on touch devices (URL bar)
    if (isTouch && !orientationChanged && dw < 2 && dh < 120) {
      return
    }

    lastWidth = w
    lastHeight = h
    lastIsLandscape = isLandscape

    if (resizeTimer !== null) {
      window.clearTimeout(resizeTimer)
    }

    // Part 12.1: Debounce orientation changes by 250 ms and re-frame behind a quick fade
    const debounceMs = orientationChanged ? 250 : 120
    resizeTimer = window.setTimeout(() => {
      const veil = document.querySelector<HTMLElement>('[data-transition-veil]')
      if (orientationChanged && veil) {
        gsap.to(veil, {
          opacity: 1,
          duration: 0.12,
          ease: 'ease.out',
          onComplete: () => {
            lenis.resize()
            ScrollTrigger.refresh()
            frame.snapCamera = true
            gsap.to(veil, {
              opacity: 0,
              duration: 0.18,
              ease: 'ease.out',
            })
          },
        })
      } else {
        lenis.resize()
        ScrollTrigger.refresh()
      }
    }, debounceMs)
  }

  const onPointerMove = (e: PointerEvent) => {
    const nx = (e.clientX / window.innerWidth) * 2 - 1
    const ny = -(e.clientY / window.innerHeight) * 2 + 1
    frame.pointer.ndc.x = nx
    frame.pointer.ndc.y = ny
    frame.pointer.lastMoveTime = frame.time
  }

  if (typeof window !== 'undefined') {
    document.addEventListener('visibilitychange', onVisibilityChange)
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('resize', onResize, { passive: true })
  }

  const tick = (time: number, deltaMs: number) => {
    if (isHidden) return

    lenis.raf(time * 1000)
    frame.time = time
    const dt = Math.min(Math.max(deltaMs, 0) / 1000, 1 / 30)
    frame.dt = dt
    frame.scroll = lenis.scroll
    frame.velocity = lenis.velocity

    // Scroll velocity damped with lambda = 6 and normalized to [-1, 1] (Part 6.2)
    const targetVNorm = clamp(lenis.velocity / 40, -1, 1)
    frame.vNorm = damp(frame.vNorm, targetVNorm, 6, dt)

    // Idle decay: after 3s without pointer movement, cursor influence fades to 0 over 1.2s (Part 5.2)
    const idleTime = time - frame.pointer.lastMoveTime
    const decayFactor = idleTime > 3 ? clamp(1 - (idleTime - 3) / 1.2, 0, 1) : 1
    const targetPx = frame.pointer.ndc.x * decayFactor
    const targetPy = frame.pointer.ndc.y * decayFactor

    frame.pointer.damped.x = damp(frame.pointer.damped.x, targetPx, 8, dt)
    frame.pointer.damped.y = damp(frame.pointer.damped.y, targetPy, 8, dt)

    // Update damped progress for all active scenes (lambda = 4 per Part 6.2)
    const snap = frame.snapCamera
    for (const key in frame.progress) {
      const raw = frame.progress[key] ?? 0
      const prev = frame.dampedProgress[key] ?? raw
      frame.dampedProgress[key] = snap ? raw : damp(prev, raw, 4, dt)
    }

    webglAdvance(time)
  }

  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(500, 33)

  return {
    lenis,
    stop: () => {
      gsap.ticker.remove(tick)
      if (typeof window !== 'undefined') {
        if (resizeTimer !== null) {
          window.clearTimeout(resizeTimer)
        }
        document.removeEventListener('visibilitychange', onVisibilityChange)
        window.removeEventListener('pointermove', onPointerMove)
        window.removeEventListener('resize', onResize)
      }
      lenis.destroy()
      if (activeLenis === lenis) {
        activeLenis = null
      }
    },
  }
}
