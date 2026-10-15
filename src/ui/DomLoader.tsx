"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useStore } from "@/state/store";
import { registerMotionEases } from "@/motion/eases";
import { badgeScreenBounds } from "@/webgl/badge/screenBounds";
import { preloadAllBadges } from "@/webgl/preload";
import { site } from "@/content/site";


export function DomLoader() {
  const phase = useStore((s) => s.phase),
    motion = useStore((s) => s.motionEnabled);
  const root = useRef<HTMLDivElement>(null),
    coin = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true),
    [slow, setSlow] = useState(false);
  const initialized = useRef(false),
    repeatVisit = useRef(false);
  useEffect(() => {
    registerMotionEases();
    let repeat = false,
      done = false,
      tl: gsap.core.Timeline | null = null;
    if (!initialized.current) {
      try {
        repeatVisit.current =
          sessionStorage.getItem("underdogs-loader-seen") === "1";
      } catch {}
      initialized.current = true;
    }
    repeat = repeatVisit.current;
    if (repeat) setVisible(false);
    const finish = () => {
      if (done) return;
      done = true;
      try {
        sessionStorage.setItem("underdogs-loader-seen", "1");
      } catch {}
      const store = useStore.getState();
      store.setLoaderPopped(true);
      if (typeof window !== "undefined") {
        if ("requestIdleCallback" in window) {
          (window as any).requestIdleCallback(() => preloadAllBadges());
        } else {
          setTimeout(preloadAllBadges, 200);
        }
      }
      const complete = () => {
        setVisible(false);
        store.setPhase("complete");
      };
      if (repeat || !root.current) {
        complete();
        return;
      }
      tl = gsap.timeline({ onComplete: complete });
      if (coin.current)
        tl.to(
          coin.current.querySelector("img, svg"),
          { opacity: 0, duration: 0.15 },
          0,
        );
      if (
        motion &&
        coin.current &&
        store.world === "home" &&
        badgeScreenBounds.ready
      ) {
        tl.to(
          coin.current,
          {
            x: badgeScreenBounds.x - innerWidth / 2,
            y: badgeScreenBounds.y - innerHeight / 2,
            width: (badgeScreenBounds.size * 512) / 340,
            height: (badgeScreenBounds.size * 512) / 340,
            duration: 0.45,
            ease: "ease.inOut",
          },
          0,
        );
      }
      tl.to(
        root.current,
        { opacity: 0, duration: motion ? 0.3 : 0.15, ease: "ease.out" },
        motion ? 0.3 : 0,
      );
    };
    // Pages without a 3D world (Events, 404) have nothing to wait for.
    const check = () => {
      const s = useStore.getState();
      if (s.renderedWorlds[s.world] || s.tier === "T0" || !s.sceneRoute) finish();
    };
    const timer = window.setTimeout(() => setSlow(true), 8000);
    const skip = () => {
      const s = useStore.getState();
      if (s.renderedWorlds[s.world] || s.tier === "T0") finish();
    };
    gsap.ticker.add(check);
    window.addEventListener("pointerdown", skip);
    window.addEventListener("keydown", skip);
    return () => {
      gsap.ticker.remove(check);
      clearTimeout(timer);
      tl?.kill();
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("keydown", skip);
    };
  }, [motion]);
  return (
    <>
      <div role="status" aria-live="polite" className="sr-only">
        {phase === "complete" ? "Ready" : "Loading"}
      </div>
      {visible && phase !== "complete" ? (
        <div
          ref={root}
          className="fixed inset-0 z-[100] flex items-center justify-center select-none"
          style={{ background: "radial-gradient(ellipse,#170915,#07070B 70%)" }}
        >
          <div
            ref={coin}
            className="relative w-[210px] h-[210px] sm:w-[280px] sm:h-[280px]"
          >
            <img
              src="/media/badge-enamel-still-512.webp"
              alt="Underdogs Enamel Badge"
              width={512}
              height={512}
              fetchPriority="high"
              className="w-full h-full object-contain"
            />
          </div>
          {slow ? (
            <button
              className="absolute bottom-8 underline text-sm"
              onClick={() => {
                // Into the page now, with the stills; 3D keeps loading and
                // replaces them when ready (never locks the visit into T0).
                setVisible(false);
                useStore.getState().setPhase("complete");
              }}
            >
              {site.ui.enterAnyway} →
            </button>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
