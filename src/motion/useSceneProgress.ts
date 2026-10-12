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

    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: () => {
        const h = el.offsetHeight
        const winH = window.innerHeight
        return h > winH ? 'bottom bottom' : 'bottom top'
      },
      onUpdate: (self) => {
        frame.progress[id] = self.progress
      },
      onRefresh: (self) => {
        frame.progress[id] = self.progress
      },
    })

    frame.progress[id] = st.progress
    frame.dampedProgress[id] = st.progress

    return () => {
      st.kill()
      delete frame.progress[id]
      delete frame.dampedProgress[id]
    }
  }, [id, ref])
}
