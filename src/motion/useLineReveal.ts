'use client'

import { useEffect, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { useStore } from '@/state/store'
import { DURATIONS, EASES, registerMotionEases } from './eases'

gsap.registerPlugin(ScrollTrigger, SplitText)

/**
 * Text reveal hook (Part 3 Motion):
 * - Lines rise 12–24 px (18px), 40–60 ms stagger (45ms), once per element.
 * - Never blocks reading or replays on reverse scroll.
 */
export function useLineReveal(
  ref: RefObject<HTMLElement | null>,
  options?: { delay?: number; triggerOnMount?: boolean }
) {
  const motionEnabled = useStore((s) => s.motionEnabled)
  const delay = options?.delay ?? 0
  const triggerOnMount = options?.triggerOnMount ?? false

  useEffect(() => {
    const el = ref.current
    if (!el) return
    registerMotionEases()

    if (!motionEnabled) {
      gsap.set(el, { opacity: 1, clearProps: 'all' })
      return
    }

    let unsubscribe: (() => void) | undefined
    let split: SplitText | null = null
    let ctx: gsap.Context | null = null

    ctx = gsap.context(() => {
      split = SplitText.create(el, {
        type: 'lines',
        mask: 'lines',
        linesClass: 'split-line',
      })

      gsap.set(split.lines, { y: 18, opacity: 0 })

      if (triggerOnMount) {
        const animation = gsap.to(split.lines, {
          y: 0,
          opacity: 1,
          duration: DURATIONS.text,
          stagger: 0.045,
          delay,
          ease: EASES.gsapOut,
          paused: true,
        })
        const reveal = () => {
          const state = useStore.getState()
          if (state.phase === 'complete' && !state.isTransitioning) {
            animation.play()
            unsubscribe?.()
          }
        }
        unsubscribe = useStore.subscribe(reveal)
        reveal()
      } else {
        gsap.to(split.lines, {
          y: 0,
          opacity: 1,
          duration: DURATIONS.text,
          stagger: 0.045,
          delay,
          ease: EASES.gsapOut,
          scrollTrigger: {
            trigger: el,
            start: 'top 90%',
            once: true,
            toggleActions: 'play none none none',
          },
        })
      }
    }, el)

    return () => {
      unsubscribe?.()
      ctx?.revert()
      split?.revert()
    }
  }, [ref, motionEnabled, delay, triggerOnMount])
}

export function useWordBlurReveal(
  ref: RefObject<HTMLElement | null>,
  options?: { active?: boolean }
) {
  const motionEnabled = useStore((s) => s.motionEnabled)
  const active = options?.active ?? true

  useEffect(() => {
    const el = ref.current
    if (!el) return
    registerMotionEases()

    if (!motionEnabled) {
      gsap.set(el, { opacity: active ? 1 : 0.25, filter: 'blur(0px)' })
      return
    }

    let split: SplitText | null = null
    const ctx = gsap.context(() => {
      split = SplitText.create(el, {
        type: 'words',
        wordsClass: 'split-word',
      })

      if (active) {
        gsap.fromTo(
          split.words,
          { opacity: 0, filter: 'blur(8px)', y: 12 },
          {
            opacity: 1,
            filter: 'blur(0px)',
            y: 0,
            duration: DURATIONS.scene * 0.7,
            stagger: 0.04,
            ease: EASES.gsapOut,
            overwrite: true,
          }
        )
      } else {
        gsap.to(split.words, {
          opacity: 0,
          filter: 'blur(6px)',
          duration: DURATIONS.ui,
          ease: EASES.gsapInOut,
          overwrite: true,
        })
      }
    }, el)

    return () => {
      ctx.revert()
      split?.revert()
    }
  }, [ref, motionEnabled, active])
}
