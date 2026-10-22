import { useEffect } from "react";
import type { WorldId } from "@/theme/tokens";
import type { TransitionType } from "@/state/frame";
export interface TransitionStageRefs {
  stageEl: HTMLElement | null;
  veilEl: HTMLElement | null;
  coinEl?: HTMLElement | null;
  coinImgEl?: HTMLImageElement | null;
  washEl: HTMLElement | null;
  curtainWrapEl: HTMLElement | null;
  leftCurtainEl: HTMLElement | null;
  rightCurtainEl: HTMLElement | null;
}

export interface RouteTransitionOptions {
  fromPath?: string;
  toPath?: string;
  origin?: "door" | "gate" | "nav";
  isPopState?: boolean;
}


const SCROLL_STORAGE_PREFIX = "underdogs-scroll:";
export function pathToWorld(pathname: string): WorldId {
  if (pathname.startsWith("/the-red-room")) return "redroom";
  if (pathname.startsWith("/diwali")) return "diwali";
  return "home";
}

export function worldToSkin(world: WorldId): "enamel" | "halloween" | "jewelled" {
  if (world === "redroom") return "halloween";
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


let runtime: typeof import("./transitionRuntime") | undefined;
let promise: Promise<typeof import("./transitionRuntime")> | undefined;
export function loadTransitionRuntime() { return promise ??= import("./transitionRuntime").then(m => (runtime=m)); }
export function registerTransitionStage(refs: TransitionStageRefs | null) { runtime?.registerTransitionStage(refs); }
export function registerTransitionVeil(el: HTMLElement | null) { runtime?.registerTransitionVeil(el); }
export function notifyRouteEntered(pathname?: string) { runtime?.notifyRouteEntered(pathname); }
export function notifyWorldRendered(world: WorldId) { runtime?.notifyWorldRendered(world); }
export function useEnterTransition(world: WorldId) {
  useEffect(() => {
    notifyRouteEntered(typeof window !== "undefined" ? window.location.pathname : undefined);
  }, [world]);
}
export function runRouteTransition(type: TransitionType, onCover: () => void, options: RouteTransitionOptions = {}) {
  if (runtime) runtime.runRouteTransition(type,onCover,options); else onCover();
}
export function runFadeCutJump(target: number | string | HTMLElement) {
  if (runtime) runtime.runFadeCutJump(target);
  else if (typeof target === "number") window.scrollTo({top:target});
  else (typeof target === "string" ? document.querySelector(target) : target)?.scrollIntoView();
}
