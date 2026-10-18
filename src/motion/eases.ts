import gsap from 'gsap'
import { CustomEase } from 'gsap/CustomEase'
import { motionTokens } from '@/theme/tokens'

/**
 * Unified Motion Vocabulary (Part 3 / WORLD_CLASS_UX_BRIEF Part 5)
 * - micro: 120–160 ms (hover/press/toggles)
 * - ui: 220–320 ms (menus, sheets, cards, captions)
 * - scene: 600–900 ms (reveals, re-skin, world transitions)
 * - Two primary eases: out = cubic-bezier(0.16, 1, 0.3, 1) and inOut = cubic-bezier(0.83, 0, 0.17, 1)
 * - Springs only for physical objects (badge, coin, door, sheet drag)
 */
export const DURATIONS = {
  micro: motionTokens.dur.micro, // 0.14s (140ms)
  ui: motionTokens.dur.ui, // 0.28s (280ms)
  scene: motionTokens.dur.scene, // 0.75s (750ms)
  text: motionTokens.dur.text, // 0.68s (680ms)
  world: motionTokens.dur.world, // 1.10s (< 1.2s route transition cap)
} as const

export const EASES = {
  out: motionTokens.ease.out,
  inOut: motionTokens.ease.inOut,
  gsapOut: 'ease.out',
  gsapInOut: 'ease.inOut',
} as const

export const SPRINGS = motionTokens.spring

let registered = false

export function registerMotionEases() {
  if (registered || typeof window === 'undefined') return
  gsap.registerPlugin(CustomEase)
  CustomEase.create('ease.out', '0.16, 1, 0.3, 1')
  CustomEase.create('ease.inOut', '0.83, 0, 0.17, 1')
  // Keep ease.in alias mapped cleanly for existing timelines
  CustomEase.create('ease.in', '0.5, 0, 0.75, 0')
  registered = true
}

/**
 * Frame-rate independent exponential damping (Part 6.2)
 */
export function damp(current: number, target: number, lambda: number, dt: number): number {
  return current + (target - current) * (1 - Math.exp(-lambda * dt))
}

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val))
}
