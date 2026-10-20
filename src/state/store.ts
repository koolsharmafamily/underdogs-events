import { create } from "zustand";
import type { WorldId } from "@/theme/tokens";
import type { TransitionType } from "./frame";

export type QualityTier = "T3" | "T2" | "T1" | "T0";
export type LoaderPhase = "loading" | "ready" | "complete";
export type SkinOverride = "enamel" | "halloween" | "jewelled" | null;
export type NavigationOrigin = "direct" | "T1" | "T2" | "T3" | "T4" | "T5";

export interface AppStore {
  world: WorldId;
  previousWorld: WorldId | null;
  phase: LoaderPhase;
  tier: QualityTier;
  motionEnabled: boolean;
  prefersReducedMotion: boolean;
  hoverDoor: "redroom" | "diwali" | null;
  transitionType: TransitionType;
  isTransitioning: boolean;
  targetSkinOverride: SkinOverride;
  lastNavigationOrigin: NavigationOrigin;
  lastHomeOrigin: "door" | "nav";
  t4ScrollTarget: "H5" | "top";
  menuOpen: boolean;
  hintsSeen: Record<string, boolean>;
  blinkTrigger: number;
  loadingProgress: number;
  isPrecompiled: boolean;
  loaderPopped: boolean;
  renderedWorlds: Record<WorldId, boolean>;
  /** The page is one of the three worlds. Elsewhere (Events, 404) the canvas sleeps. */
  sceneRoute: boolean;
  /** Worlds whose 3D set is mounted (hidden unless current). Once in, a world stays: no re-upload, no recompile. */
  residentWorlds: Record<WorldId, boolean>;

  setWorld: (world: WorldId) => void;
  setPhase: (phase: LoaderPhase) => void;
  setTier: (tier: QualityTier) => void;
  setLoadingProgress: (progress: number) => void;
  setPrecompiled: (precompiled: boolean) => void;
  setLoaderPopped: (popped: boolean) => void;
  markWorldRendered: (world: WorldId) => void;
  setSceneRoute: (sceneRoute: boolean) => void;
  /** Mount a world's set and badge skin in the background so visiting it compiles nothing. */
  warmWorld: (world: WorldId) => void;
  setMotionEnabled: (enabled: boolean, persist?: boolean) => void;
  toggleMotion: () => void;
  setPrefersReducedMotion: (reduced: boolean) => void;
  setHoverDoor: (door: "redroom" | "diwali" | null) => void;
  setTransition: (type: TransitionType, active: boolean) => void;
  setTargetSkinOverride: (skin: SkinOverride) => void;
  setLastNavigationOrigin: (origin: NavigationOrigin) => void;
  setLastHomeOrigin: (origin: "door" | "nav") => void;
  setT4ScrollTarget: (target: "H5" | "top") => void;
  setMenuOpen: (open: boolean) => void;
  markHintSeen: (id: string) => void;
  triggerBlink: () => void;
}

const MOTION_STORAGE_KEY = "underdogs-motion-enabled";

function syncDocumentDataset(world: WorldId, motionEnabled: boolean) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.world = world;
  document.documentElement.dataset.motion = motionEnabled ? "on" : "off";
}

export function isSceneRoute(pathname: string) {
  return pathname === "/" || pathname === "/the-red-room" || pathname === "/diwali";
}

function getInitialWorld(): WorldId {
  if (typeof window === "undefined") return "home";
  const path = window.location.pathname;
  if (path.startsWith("/the-red-room")) return "redroom";
  if (path.startsWith("/diwali")) return "diwali";
  return "home";
}

export const useStore = create<AppStore>((set, get) => ({
  world: getInitialWorld(),
  previousWorld: null,
  phase: "loading",
  tier: "T3",
  motionEnabled: true,
  prefersReducedMotion: false,
  hoverDoor: null,
  transitionType: "none",
  isTransitioning: false,
  targetSkinOverride: null,
  lastNavigationOrigin: "direct",
  lastHomeOrigin: "nav",
  t4ScrollTarget: "top",
  menuOpen: false,
  hintsSeen: {},
  blinkTrigger: 0,
  loadingProgress: 0,
  isPrecompiled: false,
  loaderPopped: false,
  renderedWorlds: { home: false, redroom: false, diwali: false },
  sceneRoute: typeof window === "undefined" || isSceneRoute(window.location.pathname),
  residentWorlds: {
    home: true,
    redroom: true,
    diwali: true,
  },

  setWorld: (world) => {
    const cur = get().world;
    const isTr = get().isTransitioning;
    set({
      world,
      residentWorlds: get().residentWorlds[world]
        ? get().residentWorlds
        : { ...get().residentWorlds, [world]: true },
      previousWorld: cur !== world && isTr ? cur : get().previousWorld,
    });
    syncDocumentDataset(world, get().motionEnabled);
  },

  setPhase: (phase) => set({ phase }),

  setTier: (tier) => set({ tier }),

  setLoadingProgress: (loadingProgress) => set({ loadingProgress }),

  setPrecompiled: (isPrecompiled) => set({ isPrecompiled }),

  setLoaderPopped: (loaderPopped) => set({ loaderPopped }),

  markWorldRendered: (w) =>
    set((state) =>
      state.renderedWorlds[w]
        ? state
        : { renderedWorlds: { ...state.renderedWorlds, [w]: true } },
    ),

  setSceneRoute: (sceneRoute) => set({ sceneRoute }),

  warmWorld: (w) =>
    set((state) =>
      state.residentWorlds[w]
        ? state
        : { residentWorlds: { ...state.residentWorlds, [w]: true } },
    ),

  setMotionEnabled: (enabled, persist = true) => {
    set({ motionEnabled: enabled });
    syncDocumentDataset(get().world, enabled);
    if (persist && typeof window !== "undefined") {
      try {
        window.localStorage.setItem(MOTION_STORAGE_KEY, enabled ? "1" : "0");
      } catch {
        // Ignore storage errors per Part 12.2
      }
    }
  },

  toggleMotion: () => {
    const next = !get().motionEnabled;
    get().setMotionEnabled(next, true);
  },

  setPrefersReducedMotion: (reduced) => {
    // The visitor's own choice (the Motion toggle) wins over the OS setting.
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(MOTION_STORAGE_KEY);
    } catch {
      // Storage blocked: fall back to the default
    }
    const enabled = stored === "0" ? false : true;
    set({ prefersReducedMotion: reduced, motionEnabled: enabled });
    syncDocumentDataset(get().world, enabled);
  },

  setHoverDoor: (hoverDoor) => set({ hoverDoor }),

  setTransition: (transitionType, isTransitioning) =>
    set((state) => ({
      transitionType,
      isTransitioning,
      previousWorld: isTransitioning ? state.previousWorld : null,
    })),

  setTargetSkinOverride: (targetSkinOverride) => set({ targetSkinOverride }),

  setLastNavigationOrigin: (lastNavigationOrigin) =>
    set({ lastNavigationOrigin }),

  setLastHomeOrigin: (lastHomeOrigin) => set({ lastHomeOrigin }),

  setT4ScrollTarget: (t4ScrollTarget) => set({ t4ScrollTarget }),

  setMenuOpen: (menuOpen) => set({ menuOpen }),

  markHintSeen: (id) =>
    set((state) => ({
      hintsSeen: { ...state.hintsSeen, [id]: true },
    })),

  triggerBlink: () =>
    set((state) => ({ blinkTrigger: state.blinkTrigger + 1 })),
}));
