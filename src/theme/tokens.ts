export type WorldId = 'home' | 'redroom' | 'diwali'

export const tokens = {
  home: {
    void: '#07090D',
    haze: '#121722',
    ink: '#10171F',
    magenta: '#D73EBC',
    magentaHot: '#FF4FD8',
    magentaTint: '#F6BFF8',
    paper: '#FCF9FC',
    steel: '#8C93A3',
    chrome: '#D9DCE3',
  },
  redroom: {
    void: '#060101',
    oxblood: '#2A0403',
    velvet: '#510805',
    velvetLit: '#7C0F0C',
    blood: '#95120E',
    neon: '#FF2A1F',
    candle: '#FFB36B',
    gilt: '#C8A15A',
    bone: '#EFD9CD',
    ash: '#A88C80',
  },
  diwali: {
    night: '#14161F',
    rani: '#C5287B',
    raniDeep: '#7E1347',
    blush: '#F7CFE0',
    ivory: '#FFF6EE',
    gold: '#C6A76A',
    goldDeep: '#AD7F42',
    goldBright: '#F2D38B',
    emerald: '#157A4F',
    maroon: '#5B0E0B',
    plumInk: '#2A0E1B',
  },
} as const

export const motionTokens = {
  dur: {
    micro: 0.26,
    ui: 0.52,
    text: 1.0,
    world: 1.5,
    worldRedRoom: 2.1,
  },
  ease: {
    out: 'cubic-bezier(0.16, 1, 0.3, 1)',
    inOut: 'cubic-bezier(0.83, 0, 0.17, 1)',
    in: 'cubic-bezier(0.5, 0, 0.75, 0)',
  },
  spring: {
    badge: { f: 2.2, zeta: 0.75 },
    door: { f: 1.6, zeta: 0.6 },
    wag: { f: 3.0, zeta: 0.35 },
  },
  damp: {
    story: 4,
    pointer: 8,
    velocity: 6,
  },
} as const
