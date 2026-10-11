import gsap from 'gsap'
import { CustomEase } from 'gsap/CustomEase'

let registered = false

export function registerMotionEases() {
  if (registered || typeof window === 'undefined') return
  gsap.registerPlugin(CustomEase)
  CustomEase.create('ease.out', '0.16, 1, 0.3, 1')
  CustomEase.create('ease.inOut', '0.83, 0, 0.17, 1')
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
