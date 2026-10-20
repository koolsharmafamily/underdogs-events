import gsap from "gsap";import {ScrollTrigger} from "gsap/ScrollTrigger";import {SplitText} from "gsap/SplitText";import {useStore} from "@/state/store";import {DURATIONS,EASES,registerMotionEases} from "./eases";gsap.registerPlugin(ScrollTrigger,SplitText);
export function lineReveal(el:HTMLElement,motionEnabled:boolean,delay:number,triggerOnMount:boolean) {    if (!el) return
    registerMotionEases()

    if (!motionEnabled) {
      gsap.set(el, { opacity: 1, clearProps: 'all' })
      return
    }

    let unsubscribe: (() => void) | undefined
    let fallbackTimer: ReturnType<typeof setTimeout> | undefined
    let split: SplitText | null = null
    let ctx: gsap.Context | null = null

    ctx = gsap.context(() => {
      split = SplitText.create(el, {
        type: 'lines',
        linesClass: 'split-line',
      })

      gsap.set(split.lines, { y: 18, opacity: 0 })

      if (triggerOnMount) {
        let played = false
        const animation = gsap.to(split.lines, {
          y: 0,
          opacity: 1,
          duration: DURATIONS.text,
          stagger: 0.045,
          delay,
          ease: EASES.gsapOut,
          paused: true,
        })
        const playOnce = () => {
          if (played) return
          played = true
          animation.play()
          unsubscribe?.()
          if (fallbackTimer) clearTimeout(fallbackTimer)
        }
        const reveal = () => {
          const state = useStore.getState()
          if (state.phase === 'complete' && !state.isTransitioning) {
            playOnce()
          }
        }
        unsubscribe = useStore.subscribe(reveal)
        reveal()
        // Guarantee hero headline strikes within 1 second even if WebGL is still warming up
        fallbackTimer = setTimeout(playOnce, 250)
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
      if (fallbackTimer) clearTimeout(fallbackTimer)
      ctx?.revert()
      split?.revert()
    }
}
export function wordReveal(el:HTMLElement,motionEnabled:boolean,active:boolean) {    if (!el) return
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
}
