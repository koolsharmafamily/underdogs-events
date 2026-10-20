"use client";
import { useEffect, useRef } from "react";
import { registerTransitionStage } from "@/motion/transitions";
import gsap from "gsap";
import { frame } from "@/state/frame";
import { badgeApertureMask } from "@/webgl/badge/screenBounds";

export function TransitionStage() {
  const stage = useRef<HTMLDivElement>(null),
    veil = useRef<HTMLDivElement>(null),
    wash = useRef<HTMLDivElement>(null);
  const curtains = useRef<HTMLDivElement>(null),
    left = useRef<HTMLDivElement>(null),
    right = useRef<HTMLDivElement>(null);
  const coin = useRef<HTMLDivElement>(null);
  const coinImg = useRef<HTMLImageElement>(null);

  useEffect(() => {
    registerTransitionStage({
      stageEl: stage.current,
      veilEl: veil.current,
      coinEl: coin.current,
      coinImgEl: coinImg.current,
      washEl: wash.current,
      curtainWrapEl: curtains.current,
      leftCurtainEl: left.current,
      rightCurtainEl: right.current,
    });

    let lastMask = "";
    // The badge travels through every cover: cut a soft aperture wherever a
    // skin is drawn (the outgoing one keeps rendering until the incoming one is
    // ready). With no badge on screen there is no hole.
    const trackBadge = () => {
      if (!stage.current) return;
      const isTransitioning = frame.transition.phase !== "idle";
      const mask = isTransitioning ? badgeApertureMask() : "none";
      if (mask !== lastMask) {
        lastMask = mask;
        stage.current.style.maskImage = mask;
        stage.current.style.webkitMaskImage = mask;
      }
    };
    gsap.ticker.add(trackBadge);
    return () => {
      gsap.ticker.remove(trackBadge);
      registerTransitionStage(null);
    };
  }, []);

  return (
    <>
      <div
        ref={stage}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[100] overflow-hidden"
      >
        <div
          ref={veil}
          data-transition-veil
          className="absolute inset-0 opacity-0"
          style={{ background: "#07070B" }}
        />
        <div
          ref={wash}
          className="absolute inset-0 opacity-0"
          style={{
            background:
              "radial-gradient(circle at center, #FFFFFF 0%, #FFF1C9 35%, #FFE3A3 65%, #C69442 100%)",
          }}
        />
        <div ref={curtains} className="absolute inset-0 invisible">
          <div ref={left} className="transition-curtain left-0" />
          <div ref={right} className="transition-curtain right-0" />
        </div>
      </div>

      {/* Instant 2D render of designated coin while curtains prepare to eliminate transition lag */}
      <div
        ref={coin}
        data-transition-coin
        className="pointer-events-none fixed inset-0 z-[101] flex items-center justify-center opacity-0 overflow-hidden"
      >
        <img
          ref={coinImg}
          src="/media/badge-halloween-still.webp"
          alt=""
          className="w-44 h-44 sm:w-56 sm:h-56 object-contain drop-shadow-[0_12px_44px_rgba(0,0,0,0.95)] pointer-events-none"
        />
      </div>
    </>
  );
}
