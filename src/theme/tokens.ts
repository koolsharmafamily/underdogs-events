export type WorldId = 'home' | 'redroom' | 'diwali'

/**
 * Unified Design System Tokens (Part 1 & WORLD_CLASS_UX_BRIEF Part 3)
 * - Neutral base (void/ink, paper, steel) + 1 disciplined accent system per world
 * - 12-column desktop grid (max 1280px, 24–32px gutters), 4-column mobile (20px margins)
 * - Spacing scale: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 / 128 / 160
 * - 6-step fluid type scale: display, h1, h2, h3, body, caption
 */
export const tokens = {
  neutral: {
    void: '#07090D',
    ink: '#10171F',
    paper: '#FCF9FC',
    steel: '#8C93A3',
  },
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
    night: '#0A0606',
    crimson: '#8B0F22',
    crimsonDeep: '#42050E',
    rani: '#E0217A',
    rose: '#F25C9A',
    gold: '#E5B25D',
    champagne: '#FFE3A3',
    bulb: '#FFF1C9',
    ivory: '#FFF6EE',
    // Aliases
    blush: '#F25C9A',
    goldBright: '#FFE3A3',
    goldDeep: '#C69442',
    emerald: '#157A4F',
    maroon: '#8B0F22',
    plumInk: '#2E0A14',
  },
} as const

export const gridTokens = {
  desktopColumns: 12,
  tabletColumns: 8,
  mobileColumns: 4,
  maxContentWidth: '1280px',
  gutterDesktop: '28px',
  gutterTablet: '24px',
  gutterMobile: '16px',
  marginMobile: '20px',
  marginDesktop: 'clamp(24px, 4vw, 48px)',
} as const

export const spacingScale = {
  4: '4px',
  8: '8px',
  12: '12px',
  16: '16px',
  24: '24px',
  32: '32px',
  48: '48px',
  64: '64px',
  96: '96px',
  128: '128px',
  160: '160px',
  sectionDesktop: 'clamp(128px, 10vw, 160px)',
  sectionMobile: 'clamp(72px, 10vw, 96px)',
} as const

export const typeScale = {
  display: {
    size: 'clamp(48px, 8.5vw, 148px)',
    lineHeight: 0.92,
    letterSpacing: '-0.03em',
  },
  h1: {
    size: 'clamp(34px, 5.2vw, 84px)',
    lineHeight: 0.98,
    letterSpacing: '-0.025em',
  },
  h2: {
    size: 'clamp(26px, 3.4vw, 52px)',
    lineHeight: 1.06,
    letterSpacing: '-0.015em',
  },
  h3: {
    size: 'clamp(20px, 2.2vw, 32px)',
    lineHeight: 1.18,
    letterSpacing: '-0.01em',
  },
  body: {
    size: 'clamp(15px, 1.05vw, 17px)',
    lineHeight: 1.65,
    measure: '62ch',
  },
  caption: {
    size: 'clamp(11px, 0.8vw, 12px)',
    lineHeight: 1.35,
    letterSpacing: '0.24em',
  },
} as const

export const motionTokens = {
  dur: {
    micro: 0.14, // 120–160 ms (hover/press/toggles)
    ui: 0.28, // 220–320 ms (menus, sheets, cards, captions)
    scene: 0.75, // 600–900 ms (section reveals, badge re-skin, world transitions)
    text: 0.68, // Line reveal duration within scene band
    world: 1.1, // Route transitions under 1.2s
    worldRedRoom: 1.2,
  },
  ease: {
    out: 'cubic-bezier(0.16, 1, 0.3, 1)',
    inOut: 'cubic-bezier(0.83, 0, 0.17, 1)',
    in: 'cubic-bezier(0.5, 0, 0.75, 0)',
  },
  spring: {
    badge: { f: 2.2, zeta: 0.75 },
    coin: { f: 2.0, zeta: 0.72 },
    door: { f: 1.6, zeta: 0.6 },
    wag: { f: 3.0, zeta: 0.35 },
    sheet: { f: 2.8, zeta: 0.82 },
  },
  damp: {
    story: 4,
    pointer: 8,
    velocity: 6,
  },
} as const
