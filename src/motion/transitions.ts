import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { frame, type TransitionType } from "@/state/frame";
import { useStore } from "@/state/store";
import type { WorldId } from "@/theme/tokens";
import { preloadWorldAssets } from "@/webgl/preload";
import { getLenis } from "./clock";
import { registerMotionEases } from "./eases";

export interface TransitionStageRefs {
  stageEl: HTMLElement | null;
  veilEl: HTMLElement | null;
  coinEl?: HTMLElement | null;
  washEl: HTMLElement | null;
  curtainWrapEl: HTMLElement | null;
  leftCurtainEl: HTMLElement | null;
  rightCurtainEl: HTMLElement | null;
}

let stageRefs: TransitionStageRefs | null = null;
let activeTimeline: gsap.core.Timeline | null = null;
let pendingEnterCallback: (() => void) | null = null;
let pendingEnterFallbackTimer: number | null = null;
let pendingTargetWorld: WorldId | null = null;
let isRouteEntered = false;
let isWorldRendered = false;

const SCROLL_STORAGE_PREFIX = "underdogs-scroll:";

export function registerTransitionStage(refs: TransitionStageRefs | null) {
  stageRefs = refs;
}

export function registerTransitionVeil(el: HTMLElement | null) {
  if (!stageRefs && el) {
    stageRefs = {
      stageEl: el,
      veilEl: el,
      coinEl: null,
      washEl: null,
      curtainWrapEl: null,
      leftCurtainEl: null,
      rightCurtainEl: null,
    };
  }
}

export function pathToWorld(pathname: string): WorldId {
  if (pathname.startsWith("/the-red-room")) return "redroom";
  if (pathname.startsWith("/diwali")) return "diwali";
  return "home";
}

export function worldToSkin(world: WorldId): "enamel" | "neon" | "jewelled" {
  if (world === "redroom") return "neon";
  if (world === "diwali") return "jewelled";
  return "enamel";
}

export function determineTransitionType(
  fromPath: string,
  toPath: string,
): TransitionType {
  if (fromPath === "/" && toPath === "/the-red-room") return "T1";
  if (fromPath === "/" && toPath === "/diwali") return "T2";
  if (
    (fromPath === "/the-red-room" && toPath === "/diwali") ||
    (fromPath === "/diwali" && toPath === "/the-red-room")
  ) {
    return "T3";
  }
  if (toPath === "/") return "T4";
  return "T5";
}

export function saveRouteScroll(pathname: string, scrollY?: number) {
  if (typeof window === "undefined") return;
  try {
    const val = scrollY ?? window.scrollY ?? 0;
    window.sessionStorage.setItem(
      `${SCROLL_STORAGE_PREFIX}${pathname}`,
      String(Math.round(val)),
    );
  } catch {
    // Ignore storage errors
  }
}

export function getSavedRouteScroll(pathname: string): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.sessionStorage.getItem(
      `${SCROLL_STORAGE_PREFIX}${pathname}`,
    );
    if (!raw) return 0;
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
  } catch {
    return 0;
  }
}

function resetStageComplete() {
  const store = useStore.getState();
  const lenis = getLenis();
  if (lenis) lenis.start();

  frame.transition.t = 0;
  frame.transition.elapsed = 0;
  frame.transition.duration = 0;
  frame.transition.coverTime = 0;
  frame.transition.type = "none";
  frame.transition.phase = "idle";
  frame.transition.doorProgress = 0;
  frame.transition.dollyProgress = 0;
  frame.transition.curtainClose = 0;
  frame.transition.exposureWash = 0;
  frame.transition.chromAb = 0;
  frame.transition.badgeFlip = 0;

  store.setTargetSkinOverride(null);
  store.setTransition("none", false);

  if (stageRefs?.stageEl) {
    stageRefs.stageEl.style.pointerEvents = "none";
    gsap.set(stageRefs.stageEl, { pointerEvents: "none" });
  }
  if (stageRefs?.veilEl) gsap.set(stageRefs.veilEl, { opacity: 0 });
  if (stageRefs?.washEl) gsap.set(stageRefs.washEl, { opacity: 0 });
  if (stageRefs?.curtainWrapEl)
    gsap.set(stageRefs.curtainWrapEl, { visibility: "hidden" });

  if (stageRefs?.coinEl) gsap.set(stageRefs.coinEl, { opacity: 1, scale: 1 });

  const mainEl =
    typeof document !== "undefined"
      ? document.getElementById("main-content")
      : null;
  if (mainEl) {
    gsap.set(mainEl, { clearProps: "opacity" });
  }
}

function tryProceedEnter(force = false) {
  if (!pendingEnterCallback) return;
  if (!force && (!isRouteEntered || !isWorldRendered)) return;

  if (pendingEnterFallbackTimer !== null && typeof window !== "undefined") {
    window.clearTimeout(pendingEnterFallbackTimer);
    pendingEnterFallbackTimer = null;
  }

  const fn = pendingEnterCallback;
  pendingEnterCallback = null;
  pendingTargetWorld = null;

  // Wait one animation frame after layout + WebGL settle so frame 1 of the coin dissolve is 100% hitch-free
  requestAnimationFrame(() => {
    try {
      ScrollTrigger.refresh();
    } catch {
      // Safe layout refresh catch
    }
    requestAnimationFrame(() => {
      try {
        fn();
      } catch (e) {
        console.error("Enter animation error:", e);
        resetStageComplete();
      }
    });
  });
}

/**
 * Called by destination page's `useEnterTransition` once its DOM is mounted
 */
export function notifyRouteEntered() {
  isRouteEntered = true;
  tryProceedEnter(false);
}

/**
 * Called by `Precompile` once the destination 3D world has compiled shaders and rendered 2 warm WebGL frames
 */
export function notifyWorldRendered(world: WorldId) {
  if (pendingTargetWorld === world) {
    isWorldRendered = true;
    tryProceedEnter(false);
  }
}

/**
 * Hook placed in each page view (`HomeView`, `RedRoomView`, `DiwaliView`) per Part 13.6
 */
export function useEnterTransition(world: WorldId) {
  useEffect(() => {
    notifyRouteEntered();
  }, [world]);
}

export function runFadeCutJump(target: number | string | HTMLElement) {
  registerMotionEases();
  const { motionEnabled } = useStore.getState();
  const lenis = getLenis();

  const performScroll = () => {
    if (lenis) {
      lenis.scrollTo(target, { immediate: true });
    } else if (typeof target === "number") {
      window.scrollTo({ top: target, behavior: "instant" as ScrollBehavior });
    } else if (typeof target === "string") {
      const node = document.querySelector(target);
      node?.scrollIntoView({ behavior: "instant" as ScrollBehavior });
    } else {
      target.scrollIntoView({ behavior: "instant" as ScrollBehavior });
    }
    ScrollTrigger.refresh();
    frame.snapCamera = true;
  };

  const veilEl = stageRefs?.veilEl;
  const coinEl = stageRefs?.coinEl;
  if (!veilEl) {
    performScroll();
    return;
  }

  const outDur = motionEnabled ? 0.28 : 0.14;
  const inDur = motionEnabled ? 0.45 : 0.16;

  gsap.killTweensOf(veilEl);
  if (coinEl) gsap.killTweensOf(coinEl);
  if (stageRefs?.stageEl)
    gsap.set(stageRefs.stageEl, { pointerEvents: "auto" });
  if (coinEl) gsap.set(coinEl, { opacity: 0, scale: 0.92 });

  const tl = gsap.timeline({
    onComplete: () => {
      if (stageRefs?.stageEl)
        gsap.set(stageRefs.stageEl, { pointerEvents: "none" });
      if (coinEl) gsap.set(coinEl, { opacity: 1, scale: 1 });
    },
  });

  tl.to(
    veilEl,
    {
      opacity: 1,
      duration: outDur,
      ease: "ease.inOut",
      onComplete: performScroll,
    },
    0,
  );
  if (coinEl) {
    tl.to(
      coinEl,
      {
        opacity: 1,
        scale: 1,
        duration: outDur,
        ease: "ease.out",
        force3D: true,
      },
      0.03,
    ).to(
      coinEl,
      {
        opacity: 0,
        scale: 0.92,
        duration: inDur * 0.85,
        ease: "ease.inOut",
        force3D: true,
      },
      outDur + 0.04,
    );
  }
  tl.to(
    veilEl,
    {
      opacity: 0,
      duration: inDur,
      ease: "ease.out",
    },
    outDur + 0.14,
  );
}

export interface RouteTransitionOptions {
  fromPath?: string;
  toPath?: string;
  origin?: "door" | "gate" | "nav";
  isPopState?: boolean;
}

export function runRouteTransition(
  type: TransitionType,
  onCover: () => void,
  options: RouteTransitionOptions = {},
) {
  registerMotionEases();
  const store = useStore.getState();
  const { motionEnabled } = store;

  const fromPath =
    options.fromPath ??
    (typeof window !== "undefined" ? window.location.pathname : "/");
  const toPath =
    options.toPath ??
    (type === "T1"
      ? "/the-red-room"
      : type === "T2"
        ? "/diwali"
        : type === "T4"
          ? "/"
          : "/");

  const fromWorld = pathToWorld(fromPath);
  const toWorld = pathToWorld(toPath);
  const destSkin = worldToSkin(toWorld);

  // Ensure target world's 3D assets begin preloading immediately
  preloadWorldAssets(toWorld);

  // Save current route's scroll position before leaving (Part 10 T5)
  if (!options.isPopState) {
    saveRouteScroll(fromPath);
  }

  // Record navigation origin and Home return target (Part 10 T4)
  store.setLastNavigationOrigin(
    options.isPopState
      ? "T5"
      : type === "T1" ||
          type === "T2" ||
          type === "T3" ||
          type === "T4" ||
          type === "T5"
        ? type
        : "direct",
  );

  if (fromWorld === "home") {
    store.setLastHomeOrigin(options.origin === "door" ? "door" : "nav");
  }

  if (toWorld === "home" && type === "T4") {
    const shouldLandAtH5 =
      options.origin === "gate" ||
      (options.origin !== "nav" && store.lastHomeOrigin === "door");
    store.setT4ScrollTarget(shouldLandAtH5 ? "H5" : "top");
  }

  // Clean up any in-flight timeline
  if (activeTimeline) {
    activeTimeline.kill();
    activeTimeline = null;
  }
  if (pendingEnterFallbackTimer !== null && typeof window !== "undefined") {
    window.clearTimeout(pendingEnterFallbackTimer);
    pendingEnterFallbackTimer = null;
  }
  pendingEnterCallback = null;
  pendingTargetWorld = null;
  isRouteEntered = false;
  isWorldRendered = false;

  // Stop Lenis during exit to prevent visible scroll jump
  const lenis = getLenis();
  if (lenis) {
    lenis.stop();
  }

  // Initialize frame.transition state
  store.setTransition(type, true);
  frame.transition.type = type;
  frame.transition.fromWorld = fromWorld;
  frame.transition.toWorld = toWorld;
  frame.transition.phase = "exit";
  frame.transition.t = 0;
  frame.transition.elapsed = 0;
  frame.transition.doorProgress = 0;
  frame.transition.dollyProgress = 0;
  frame.transition.curtainClose = 0;
  frame.transition.exposureWash = 0;
  frame.transition.chromAb = 0;
  frame.transition.badgeFlip = 0;

  if (!stageRefs?.veilEl) {
    store.setTargetSkinOverride(destSkin);
    onCover();
    resetStageComplete();
    return;
  }

  const {
    stageEl,
    veilEl,
    coinEl,
    washEl,
    curtainWrapEl,
    leftCurtainEl,
    rightCurtainEl,
  } = stageRefs;
  if (stageEl) {
    stageEl.style.pointerEvents = "auto";
    gsap.set(stageEl, { pointerEvents: "auto" });
  }
  gsap.set(veilEl, { opacity: options.isPopState ? 1 : 0 });
  if (coinEl) {
    gsap.set(coinEl, { opacity: 0, scale: 0.92 });
  }

  const mainEl =
    typeof document !== "undefined"
      ? document.getElementById("main-content")
      : null;

  // Helper to await BOTH destination DOM mount AND 3D WebGL frame readiness at cover point
  const triggerCoverAndWaitForMount = (enterFn: () => void) => {
    frame.transition.phase = "covered";

    // Scroll to top or restored position with { immediate: true } while covered
    const targetScroll =
      toWorld === "home"
        ? store.t4ScrollTarget === "H5"
          ? getSavedRouteScroll("/")
          : 0
        : 0;
    if (lenis) {
      lenis.scrollTo(targetScroll, { immediate: true });
    } else if (typeof window !== "undefined") {
      window.scrollTo({
        top: targetScroll,
        behavior: "instant" as ScrollBehavior,
      });
    }

    frame.snapCamera = true;

    const currentStore = useStore.getState();
    pendingTargetWorld = toWorld;
    isRouteEntered = Boolean(options.isPopState);
    isWorldRendered = Boolean(
      currentStore.tier === "T0" ||
      (options.isPopState && currentStore.renderedWorlds[toWorld]),
    );

    pendingEnterCallback = () => {
      if (lenis) lenis.start();
      enterFn();
    };

    if (typeof window !== "undefined") {
      pendingEnterFallbackTimer = window.setTimeout(() => {
        tryProceedEnter(true);
      }, 1200);
    }

    onCover();
    tryProceedEnter(false);
  };

  const isTargetRedRoom = toWorld === "redroom";
  const isTargetDiwali = toWorld === "diwali";
  const isCurtainTransition =
    motionEnabled &&
    !options.isPopState &&
    (isTargetRedRoom || type === "T1");

  const outDur = !motionEnabled
    ? 0.15
    : isCurtainTransition
      ? 0.85
      : type === "T4"
        ? 0.4
        : options.isPopState
          ? 0.15
          : 0.55;
  const inDur = !motionEnabled
    ? 0.15
    : isCurtainTransition
      ? 0.8
      : type === "T4"
        ? 0.4
        : options.isPopState
          ? 0.15
          : 0.55;

  frame.transition.duration = outDur + inDur;
  frame.transition.coverTime = outDur;

  if (leftCurtainEl && rightCurtainEl) {
    gsap.set(leftCurtainEl, { xPercent: -101 });
    gsap.set(rightCurtainEl, { xPercent: 101 });
  }

  if (curtainWrapEl)
    gsap.set(curtainWrapEl, { visibility: isCurtainTransition ? "visible" : "hidden" });

  const exitTl = gsap.timeline({
    onUpdate: function () {
      frame.transition.elapsed = this.time();
      frame.transition.t = this.time() / (outDur + inDur);
    },
    onComplete: () => {
      if (isTargetDiwali && washEl) {
        gsap.set(washEl, { opacity: 1 });
        gsap.set(veilEl, { opacity: 0 });
      } else {
        gsap.set(veilEl, { opacity: 1 });
        if (washEl) gsap.set(washEl, { opacity: 0 });
      }
      store.setTargetSkinOverride(destSkin);
      triggerCoverAndWaitForMount(() => {
        frame.transition.phase = "enter";
        frame.transition.dollyProgress = 0;
        const destination = document.getElementById("main-content");
        if (destination) gsap.set(destination, { opacity: 1 });
        const enterTl = gsap.timeline({
          onComplete: resetStageComplete,
          onUpdate: function () {
            frame.transition.elapsed = outDur + this.time();
            frame.transition.t = (outDur + this.time()) / (outDur + inDur);
          },
        });
        if (
          motionEnabled &&
          isTargetRedRoom &&
          !options.isPopState &&
          curtainWrapEl &&
          leftCurtainEl &&
          rightCurtainEl
        ) {
          gsap.set(curtainWrapEl, { visibility: "visible" });
          gsap.set([leftCurtainEl, rightCurtainEl], { xPercent: 0 });
          gsap.set(veilEl, { opacity: 0 });
          enterTl.to(
            leftCurtainEl,
            { xPercent: -101, duration: inDur, ease: "ease.inOut" },
            0,
          );
          enterTl.to(
            rightCurtainEl,
            { xPercent: 101, duration: inDur, ease: "ease.inOut" },
            0,
          );
        } else {
          if (curtainWrapEl) gsap.set(curtainWrapEl, { visibility: "hidden" });
          if (isTargetDiwali && washEl) {
            enterTl.to(
              washEl,
              { opacity: 0, duration: inDur * 0.9, ease: "power2.out" },
              0,
            );
          }
          enterTl.to(
            veilEl,
            { opacity: 0, duration: inDur, ease: "ease.out" },
            0,
          );
        }
        activeTimeline = enterTl;
      });
    },
  });
  if (motionEnabled && (type === "T1" || type === "T2")) {
    exitTl.to(
      frame.transition,
      { doorProgress: 1, duration: outDur * 0.45, ease: "ease.inOut" },
      0,
    );
    exitTl.to(
      frame.transition,
      { dollyProgress: 1, duration: outDur * 0.75, ease: "ease.inOut" },
      outDur * 0.25,
    );
    if (type === "T2" && washEl) {
      exitTl.to(
        washEl,
        { opacity: 1, duration: outDur * 0.45, ease: "power2.in" },
        outDur * 0.35,
      );
    }
  } else if (motionEnabled && type === "T4") {
    exitTl.to(
      frame.transition,
      { dollyProgress: 1, duration: outDur, ease: "ease.inOut" },
      0,
    );
  } else if (motionEnabled && type === "T3") {
    exitTl.to(
      frame.transition,
      { badgeFlip: 1, duration: outDur, ease: "ease.inOut" },
      0,
    );
    if (isTargetDiwali && veilEl) {
      exitTl
        .to(veilEl, { opacity: 0.85, duration: 0.04 }, 0.08)
        .to(veilEl, { opacity: 0.25, duration: 0.04 }, 0.12)
        .to(veilEl, { opacity: 0.9, duration: 0.04 }, 0.16);
    }
  }
  const coverStart = isCurtainTransition
    ? Math.max(0, outDur - 0.55)
    : 0;
  if (mainEl)
    exitTl.to(
      mainEl,
      { opacity: 0, duration: Math.min(0.39, outDur), ease: "ease.in" },
      isCurtainTransition ? outDur - 0.39 : 0,
    );
  if (isCurtainTransition && leftCurtainEl && rightCurtainEl) {
    exitTl.to(
      leftCurtainEl,
      { xPercent: 0, duration: 0.5, ease: "ease.inOut" },
      coverStart,
    );
    exitTl.to(
      rightCurtainEl,
      { xPercent: 0, duration: 0.5, ease: "ease.inOut" },
      coverStart,
    );
  }
  exitTl.to(
    veilEl,
    { opacity: 1, duration: Math.max(0.1, outDur - coverStart), ease: "ease.inOut" },
    coverStart,
  );
  activeTimeline = exitTl;
}
