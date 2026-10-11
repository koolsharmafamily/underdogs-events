import { create } from 'zustand'
import type { WorldId } from '@/theme/tokens'
import type { TransitionType } from './frame'

export type QualityTier = 'T3' | 'T2' | 'T1' | 'T0'
export type LoaderPhase = 'loading' | 'ready' | 'complete'

export interface AppStore {
  world: WorldId
  phase: LoaderPhase
  tier: QualityTier
  motionEnabled: boolean
  prefersReducedMotion: boolean
  hoverDoor: 'redroom' | 'diwali' | null
  transitionType: TransitionType
  isTransitioning: boolean
  menuOpen: boolean
  hintsSeen: Record<string, boolean>
  blinkTrigger: number

  setWorld: (world: WorldId) => void
  setPhase: (phase: LoaderPhase) => void
  setTier: (tier: QualityTier) => void
  setMotionEnabled: (enabled: boolean, persist?: boolean) => void
  toggleMotion: () => void
  setPrefersReducedMotion: (reduced: boolean) => void
  setHoverDoor: (door: 'redroom' | 'diwali' | null) => void
  setTransition: (type: TransitionType, active: boolean) => void
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

export const useStore = create<AppStore>((set, get) => ({
  world: 'home',
  phase: 'loading',
  tier: 'T3',
  motionEnabled: true,
  prefersReducedMotion: false,
  hoverDoor: null,
  transitionType: 'none',
  isTransitioning: false,
  menuOpen: false,
  hintsSeen: {},
  blinkTrigger: 0,

  setWorld: (world) => {
    set({ world })
    syncDocumentDataset(world, get().motionEnabled)
  },

  setPhase: (phase) => set({ phase }),

  setTier: (tier) => set({ tier }),

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
    set({ transitionType, isTransitioning }),

  setMenuOpen: (menuOpen) => set({ menuOpen }),

  markHintSeen: (id) =>
    set((state) => ({
      hintsSeen: { ...state.hintsSeen, [id]: true },
    })),

  triggerBlink: () => set((state) => ({ blinkTrigger: state.blinkTrigger + 1 })),
}))
