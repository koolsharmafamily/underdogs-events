"use client";
import { PointerDetails } from "./PointerDetails";

import React, { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { startClock, getLenis } from "@/motion/clock";
import {
  getSavedRouteScroll,
  notifyRouteEntered,
  runRouteTransition,
  saveRouteScroll,
  pathToWorld,
} from "@/motion/transitions";
import { frame } from "@/state/frame";
import { isSceneRoute, useStore } from "@/state/store";
import { preloadWorldAssets } from "@/webgl/preload";
import { TransitionStage } from "./TransitionStage";
import { SceneNavigation } from "./SceneNavigation";
import { useMrDogStore } from "@/features/mrdog/store";

const MrDogSheet = dynamic(
  () => import("@/features/mrdog/MrDogSheet").then((m) => m.MrDogSheet),
  { ssr: false },
);

const MrDogLauncher = dynamic(
  () => import("@/features/mrdog/MrDogLauncher").then((m) => m.MrDogLauncher),
  { ssr: false },
);

const MrDogPanel = dynamic(
  () => import("@/features/mrdog/MrDogPanel").then((m) => m.MrDogPanel),
  { ssr: false },
);

const Experience = dynamic(
  () => import("@/webgl/Experience").then((mod) => mod.Experience),
  { ssr: false },
);

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const setWorld = useStore((s) => s.setWorld);
  const setPrefersReducedMotion = useStore((s) => s.setPrefersReducedMotion);
  const prevPathnameRef = useRef<string>(pathname);
  const isPopStateRef = useRef<boolean>(false);
  const restoringScrollRef = useRef<boolean>(false);

  // Prefetch primary routes quietly during browser idle
  useEffect(() => {
    if (typeof window === "undefined") return;
    const prefetchRoutes = () => {
      router.prefetch("/the-red-room");
      router.prefetch("/diwali");
      router.prefetch("/events");
      router.prefetch("/mr-dog");
      router.prefetch("/");
    };
    if ("requestIdleCallback" in window) {
      (window as Window).requestIdleCallback(prefetchRoutes, { timeout: 2500 });
    } else {
      setTimeout(prefetchRoutes, 1000);
    }
  }, [router]);

  // Save scroll position continuously for the active route (Part 10 T5)
  useEffect(() => {
    const onScroll = () => {
      if (
        !useStore.getState().isTransitioning &&
        !isPopStateRef.current &&
        !restoringScrollRef.current
      ) {
        saveRouteScroll(window.location.pathname, window.scrollY);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Listen to browser back and forward (Part 10 T5)
  useEffect(() => {
    const onPopState = () => {
      // Guard: do not trigger full T5 transition or scroll restore if popstate was from Mr. Dog sheet
      if (window.history.state?.mrDog || useMrDogStore.getState().isOpen) {
        useMrDogStore.getState().closeMrDog();
        return;
      }

      isPopStateRef.current = true;
      restoringScrollRef.current = true;
      const fromPath = prevPathnameRef.current;
      const toPath = window.location.pathname;
      runRouteTransition("T5", () => {}, {
        fromPath,
        toPath,
        isPopState: true,
      });
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  // Handle route changes, T4 H5 gate landing, and T5 scroll restoration
  useEffect(() => {
    const world = pathToWorld(pathname);
    useStore.getState().setSceneRoute(isSceneRoute(pathname));
    preloadWorldAssets(world);
    setWorld(world);
    notifyRouteEntered();
    prevPathnameRef.current = pathname;

    const wasPopState = isPopStateRef.current;
    isPopStateRef.current = false;
    restoringScrollRef.current = true;

    const store = useStore.getState();
    const shouldLandAtH5 =
      !wasPopState &&
      world === "home" &&
      store.lastNavigationOrigin === "T4" &&
      store.t4ScrollTarget === "H5";

    const savedY = wasPopState ? getSavedRouteScroll(pathname) : 0;

    const applyScrollTarget = () => {
      const lenis = getLenis();
      const isTr = useStore.getState().isTransitioning;

      let targetY = 0;
      if (wasPopState) {
        targetY = savedY;
      } else if (shouldLandAtH5) {
        const h5El = document.querySelector<HTMLElement>('[data-scene="H5"]');
        if (h5El) {
          targetY = h5El.offsetTop;
        }
      }

      if (lenis) {
        lenis.scrollTo(targetY, { immediate: true });
      }
      window.scrollTo({ top: targetY, behavior: "instant" as ScrollBehavior });

      // When a route transition is active, tryProceedEnter handles ScrollTrigger.refresh()
      // once under the opaque veil to avoid mid-transition layout thrashing.
      if (!isTr) {
        ScrollTrigger.refresh();
      }
      frame.snapCamera = true;
    };

    applyScrollTarget();
    const timer = window.setTimeout(() => {
      restoringScrollRef.current = false;
    }, 100);

    return () => window.clearTimeout(timer);
  }, [pathname, setWorld]);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mql.matches);

    const onChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [setPrefersReducedMotion]);

  useEffect(() => {
    const clock = startClock();
    return () => {
      clock.stop();
    };
  }, []);

  return (
    <>
      <Experience />
      {children}
      <TransitionStage />
      <SceneNavigation />
      <PointerDetails />
      <MrDogSheet />
      <MrDogLauncher />
      <MrDogPanel />
    </>
  );
}
