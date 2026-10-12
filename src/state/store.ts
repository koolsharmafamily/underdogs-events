import { create } from 'zustand'
import type { WorldId } from '@/theme/tokens'
import type { TransitionType } from './frame'

export type QualityTier = 'T3' | 'T2' | 'T1' | 'T0'
export type LoaderPhase = 'loading' | 'ready' | 'complete'
export type SkinOverride = 'enamel' | 'neon' | 'jewelled' | null
export type NavigationOrigin = 'direct' | 'T1' | 'T2' | 'T3' | 'T4' | 'T5'

export interface AppStore {
  world: WorldId
  previousWorld: WorldId | null
  phase: LoaderPhase
  tier: QualityTier
  motionEnabled: boolean
  prefersReducedMotion: boolean
  hoverDoor: 'redroom' | 'diwali' | null
  transitionType: TransitionType
  isTransitioning: boolean
  targetSkinOverride: SkinOverride
  lastNavigationOrigin: NavigationOrigin
  lastHomeOrigin: 'door' | 'nav'
  t4ScrollTarget: 'H5' | 'top'
  menuOpen: boolean
  hintsSeen: Record<string, boolean>
  blinkTrigger: number
  loadingProgress: number
  isPrecompiled: boolean
  loaderPopped: boolean

  setWorld: (world: WorldId) => void
  setPhase: (phase: LoaderPhase) => void
  setTier: (tier: QualityTier) => void
  setLoadingProgress: (progress: number) => void
  setPrecompiled: (precompiled: boolean) => void
  setLoaderPopped: (popped: boolean) => void
  setMotionEnabled: (enabled: boolean, persist?: boolean) => void
  toggleMotion: () => void
  setPrefersReducedMotion: (reduced: boolean) => void
  setHoverDoor: (door: 'redroom' | 'diwali' | null) => void
  setTransition: (type: TransitionType, active: boolean) => void
  setTargetSkinOverride: (skin: SkinOverride) => void
  setLastNavigationOrigin: (origin: NavigationOrigin) => void
  setLastHomeOrigin: (origin: 'door' | 'nav') => void
  setT4ScrollTarget: (target: 'H5' | 'top') => void
  setMenuOpen: (open: boolean) => void
  markHintSeen: (id: string) => void
  triggerBlink: () => void
}

const MOTION_STORAGE_KEY = 'underdogs-motion-enabled'

function syncDocumentDataset(world: WorldId, motionEnabled: boolean) {
  if (typeof document === 'undefined') return
  document.documentElement.dataset.world = world
  document.documentElement.dataset.motion = motionEnabled ? 'on' : 'off'
}

function getInitialWorld(): WorldId {
  if (typeof window === 'undefined') return 'home'
  const path = window.location.pathname
  if (path.startsWith('/the-red-room')) return 'redroom'
  if (path.startsWith('/diwali')) return 'diwali'
  return 'home'
}

export const useStore = create<AppStore>((set, get) => ({
  world: getInitialWorld(),
  previousWorld: null,
  phase: 'loading',
  tier: 'T3',
  motionEnabled: true,
  prefersReducedMotion: false,
  hoverDoor: null,
  transitionType: 'none',
  isTransitioning: false,
  targetSkinOverride: null,
  lastNavigationOrigin: 'direct',
  lastHomeOrigin: 'nav',
  t4ScrollTarget: 'top',
  menuOpen: false,
  hintsSeen: {},
  blinkTrigger: 0,
  loadingProgress: 0,
  isPrecompiled: false,
  loaderPopped: false,

  setWorld: (world) => {
    const cur = get().world
    const isTr = get().isTransitioning
    set({
      world,
      previousWorld: cur !== world && isTr ? cur : get().previousWorld,
    })
    syncDocumentDataset(world, get().motionEnabled)
  },

  setPhase: (phase) => set({ phase }),

  setTier: (tier) => set({ tier }),

  setLoadingProgress: (loadingProgress) => set({ loadingProgress }),

  setPrecompiled: (isPrecompiled) => set({ isPrecompiled }),

  setLoaderPopped: (loaderPopped) => set({ loaderPopped }),

  setMotionEnabled: (enabled, persist = true) => {
    set({ motionEnabled: enabled })
    syncDocumentDataset(get().world, enabled)
    if (persist && typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(MOTION_STORAGE_KEY, enabled ? '1' : '0')
      } catch {
        // Ignore storage errors per Part 12.2
      }
    }
  },

  toggleMotion: () => {
    const next = !get().motionEnabled
    get().setMotionEnabled(next, true)
  },

  setPrefersReducedMotion: (reduced) => {
    set({ prefersReducedMotion: reduced })
    if (typeof window !== 'undefined') {
      try {
        const stored = window.localStorage.getItem(MOTION_STORAGE_KEY)
        if (stored === '1' || stored === '0') {
          const enabled = stored === '1' && !reduced
          set({ motionEnabled: enabled })
          syncDocumentDataset(get().world, enabled)
          return
        }
      } catch {
        // Ignore storage errors
      }
    }
    const enabled = !reduced
    set({ motionEnabled: enabled })
    syncDocumentDataset(get().world, enabled)
  },

  setHoverDoor: (hoverDoor) => set({ hoverDoor }),

  setTransition: (transitionType, isTransitioning) =>
    set((state) => ({
      transitionType,
      isTransitioning,
      previousWorld: isTransitioning ? state.previousWorld : null,
    })),

  setTargetSkinOverride: (targetSkinOverride) => set({ targetSkinOverride }),

  setLastNavigationOrigin: (lastNavigationOrigin) => set({ lastNavigationOrigin }),

  setLastHomeOrigin: (lastHomeOrigin) => set({ lastHomeOrigin }),

  setT4ScrollTarget: (t4ScrollTarget) => set({ t4ScrollTarget }),

  setMenuOpen: (menuOpen) => set({ menuOpen }),

  markHintSeen: (id) =>
    set((state) => ({
      hintsSeen: { ...state.hintsSeen, [id]: true },
    })),

  triggerBlink: () => set((state) => ({ blinkTrigger: state.blinkTrigger + 1 })),
}))
