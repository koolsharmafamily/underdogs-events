import type { WorldId } from '@/theme/tokens'

export type TransitionType = 'none' | 'T1' | 'T2' | 'T3' | 'T4' | 'T5' | 'jump'

export interface TransitionFrameState {
  t: number
  elapsed: number
  duration: number
  coverTime: number
  type: TransitionType
  fromWorld: WorldId
  toWorld: WorldId
  phase: 'idle' | 'exit' | 'covered' | 'enter'
  doorProgress: number
  dollyProgress: number
  curtainClose: number
  exposureWash: number
  chromAb: number
  badgeFlip: number
}

export interface FrameState {
  time: number
  dt: number
  scroll: number
  velocity: number
  vNorm: number
  snapCamera: boolean
  pointer: {
    ndc: { x: number; y: number }
    world: { x: number; y: number; z: number }
    damped: { x: number; y: number }
    lastMoveTime: number
  }
  progress: Record<string, number>
  /** Linear scene progress (0–1 over the scene's scroll), for line-by-line story steps. */
  linearProgress: Record<string, number>
  dampedProgress: Record<string, number>
  transition: TransitionFrameState
}

export const frame: FrameState = {
  time: 0,
  dt: 1 / 60,
  scroll: 0,
  velocity: 0,
  vNorm: 0,
  snapCamera: false,
  pointer: {
    ndc: { x: 0, y: 0 },
    world: { x: 0, y: 0, z: 0 },
    damped: { x: 0, y: 0 },
    lastMoveTime: 0,
  },
  progress: {},
  linearProgress: {},
  dampedProgress: {},
  transition: {
    t: 0,
    elapsed: 0,
    duration: 0,
    coverTime: 0,
    type: 'none',
    fromWorld: 'home',
    toWorld: 'home',
    phase: 'idle',
    doorProgress: 0,
    dollyProgress: 0,
    curtainClose: 0,
    exposureWash: 0,
    chromAb: 0,
    badgeFlip: 0,
  },
}
