'use client'

import { useEffect, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { useStore } from '@/state/store'
import { registerMotionEases } from './eases'

gsap.registerPlugin(ScrollTrigger, SplitText)

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

    let split: SplitText | null = null
    let ctx: gsap.Context | null = null

    ctx = gsap.context(() => {
      split = SplitText.create(el, {
        type: 'lines',
        mask: 'lines',
        linesClass: 'split-line',
      })

      gsap.set(split.lines, { yPercent: 105 })

      if (triggerOnMount) {
        gsap.to(split.lines, {
          yPercent: 0,
          duration: 0.95,
          stagger: 0.08,
          delay,
          ease: 'ease.out',
        })
      } else {
        gsap.to(split.lines, {
          yPercent: 0,
          duration: 0.95,
          stagger: 0.08,
          delay,
          ease: 'ease.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            toggleActions: 'play none none reverse',
          },
        })
      }
    }, el)

    return () => {
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
          { opacity: 0, filter: 'blur(8px)' },
          {
            opacity: 1,
            filter: 'blur(0px)',
            duration: 0.55,
            stagger: 0.04,
            ease: 'ease.out',
            overwrite: true,
          }
        )
      } else {
        gsap.to(split.words, {
          opacity: 0,
          filter: 'blur(6px)',
          duration: 0.35,
          ease: 'ease.in',
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
