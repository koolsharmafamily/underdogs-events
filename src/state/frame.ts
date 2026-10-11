export type TransitionType = 'none' | 'T1' | 'T2' | 'T3' | 'T4' | 'T5' | 'jump'

export interface FrameState {
  time: number
  dt: number
  scroll: number
  velocity: number
  vNorm: number
  pointer: {
    ndc: { x: number; y: number }
    world: { x: number; y: number; z: number }
    damped: { x: number; y: number }
    lastMoveTime: number
  }
  progress: Record<string, number>
  dampedProgress: Record<string, number>
  transition: {
    t: number
    type: TransitionType
  }
}

export const frame: FrameState = {
  time: 0,
  dt: 1 / 60,
  scroll: 0,
  velocity: 0,
  vNorm: 0,
  pointer: {
    ndc: { x: 0, y: 0 },
    world: { x: 0, y: 0, z: 0 },
    damped: { x: 0, y: 0 },
    lastMoveTime: 0,
  },
  progress: {},
  dampedProgress: {},
  transition: {
    t: 0,
    type: 'none',
  },
}
