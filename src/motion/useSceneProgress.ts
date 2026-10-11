'use client'

import { useLayoutEffect, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { frame } from '@/state/frame'

gsap.registerPlugin(ScrollTrigger)

export function useSceneProgress(id: string, ref: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    frame.progress[id] = 0
    frame.dampedProgress[id] = 0

    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        frame.progress[id] = self.progress
      },
    })

    return () => {
      st.kill()
    }
  }, [id, ref])
}
