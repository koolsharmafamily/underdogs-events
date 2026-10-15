"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { site } from "@/content/site";
import { getSavedRouteScroll } from "@/motion/transitions";
import { useStore } from "@/state/store";

const CLAPPER_SEEN_KEY = "underdogs-dhamaaka-clapper-seen";

interface ClapperboardOpenerProps {
  onComplete?: () => void;
}

export function ClapperboardOpener({ onComplete }: ClapperboardOpenerProps) {
  const transitioning = useStore((s) => s.isTransitioning);
  const phase = useStore((s) => s.phase);
  const motionEnabled = useStore((s) => s.motionEnabled);
  const lastNavigationOrigin = useStore((s) => s.lastNavigationOrigin);

  const [dismissed, setDismissed] = useState(false);
  // Stages: 0: entering, 1: clapped, 2: presenter visible, 3: spotlights revealing, 4: done
  const [stage, setStage] = useState<0 | 1 | 2 | 3 | 4>(0);
  const timersRef = useRef<number[]>([]);

  const handleFinish = useCallback(() => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
    setStage(4);
    setTimeout(() => {
      setDismissed(true);
      onComplete?.();
    }, 450);
  }, [onComplete]);

  useEffect(() => {
    if (transitioning || phase !== "complete") return;

    if (
      !motionEnabled ||
      lastNavigationOrigin === "T3" ||
      (lastNavigationOrigin === "T5" && getSavedRouteScroll("/diwali") > 100)
    ) {
      setDismissed(true);
      onComplete?.();
      return;
    }

    let isRepeat = false;
    try {
      isRepeat = window.sessionStorage.getItem(CLAPPER_SEEN_KEY) === "1";
      window.sessionStorage.setItem(CLAPPER_SEEN_KEY, "1");
    } catch {
      // storage access error handled
    }

    // Timing budget: full version ≤ 2.8s; repeat version ≤ 1.5s
    const tClap = isRepeat ? 350 : 650;
    const tPresenter = isRepeat ? 650 : 1200;
    const tSpotlights = isRepeat ? 1000 : 1900;
    const tDone = isRepeat ? 1500 : 2700;

    const t1 = window.setTimeout(() => setStage(1), tClap);
    const t2 = window.setTimeout(() => setStage(2), tPresenter);
    const t3 = window.setTimeout(() => setStage(3), tSpotlights);
    const t4 = window.setTimeout(() => handleFinish(), tDone);

    timersRef.current = [t1, t2, t3, t4];

    const onSkip = () => {
      handleFinish();
    };

    window.addEventListener("pointerdown", onSkip, { once: true });
    window.addEventListener("keydown", onSkip, { once: true });
    window.addEventListener("wheel", onSkip, { once: true, passive: true });
    window.addEventListener("touchstart", onSkip, { once: true, passive: true });

    return () => {
      timersRef.current.forEach((t) => clearTimeout(t));
      window.removeEventListener("pointerdown", onSkip);
      window.removeEventListener("keydown", onSkip);
      window.removeEventListener("wheel", onSkip);
      window.removeEventListener("touchstart", onSkip);
    };
  }, [motionEnabled, lastNavigationOrigin, handleFinish, transitioning, phase, onComplete]);

  if (dismissed) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Scene opener: Lights, camera, Dhamaaka"
      onClick={handleFinish}
      className={`fixed inset-0 z-[80] flex items-center justify-center overflow-hidden bg-[#0A0606] transition-opacity duration-600 ${
        stage === 4 ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Background radial atmosphere */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,15,34,0.22)_0%,rgba(10,6,6,0.95)_75%)]"
        aria-hidden="true"
      />

      {/* Clapperboard Container */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-[540px]">
        {/* 2D SVG Clapperboard */}
        <div className="relative w-[280px] sm:w-[340px] drop-shadow-[0_20px_35px_rgba(0,0,0,0.85)]">
          <svg
            viewBox="0 0 340 260"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto overflow-visible"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="goldTrim" x1="0" y1="0" x2="340" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#C69442" />
                <stop offset="50%" stopColor="#FFE3A3" />
                <stop offset="100%" stopColor="#C69442" />
              </linearGradient>
              <linearGradient id="chalkGold" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#E5B25D" />
                <stop offset="100%" stopColor="#FFE3A3" />
              </linearGradient>
            </defs>

            {/* Clapperboard Body (Lower Board) */}
            <rect
              x="20"
              y="74"
              width="300"
              height="170"
              rx="4"
              fill="#120B0D"
              stroke="url(#goldTrim)"
              strokeWidth="2"
            />

            {/* Inner Grid / Chalk text lines */}
            <line x1="20" y1="126" x2="320" y2="126" stroke="#E5B25D" strokeOpacity="0.35" strokeWidth="1" />
            <line x1="120" y1="74" x2="120" y2="126" stroke="#E5B25D" strokeOpacity="0.35" strokeWidth="1" />
            <line x1="220" y1="74" x2="220" y2="126" stroke="#E5B25D" strokeOpacity="0.35" strokeWidth="1" />
            <line x1="20" y1="180" x2="320" y2="180" stroke="#E5B25D" strokeOpacity="0.35" strokeWidth="1" />

            {/* Labels in gold Cinzel */}
            <text x="32" y="94" fill="#E5B25D" fillOpacity="0.65" fontFamily="Cinzel, serif" fontSize="9" letterSpacing="0.18em">
              PROD.
            </text>
            <text x="32" y="112" fill="#FFF6EE" fontFamily="Cinzel, serif" fontSize="12" fontWeight="600" letterSpacing="0.1em">
              UNDERDOGS
            </text>

            <text x="132" y="94" fill="#E5B25D" fillOpacity="0.65" fontFamily="Cinzel, serif" fontSize="9" letterSpacing="0.18em">
              SCENE
            </text>
            <text x="145" y="114" fill="#FFE3A3" fontFamily="Cinzel, serif" fontSize="14" fontWeight="bold">
              02
            </text>

            <text x="232" y="94" fill="#E5B25D" fillOpacity="0.65" fontFamily="Cinzel, serif" fontSize="9" letterSpacing="0.18em">
              TAKE
            </text>
            <text x="252" y="114" fill="#FFE3A3" fontFamily="Cinzel, serif" fontSize="14" fontWeight="bold">
              01
            </text>

            {/* Main Title Chalk Line */}
            <text
              x="170"
              y="158"
              textAnchor="middle"
              fill="url(#chalkGold)"
              fontFamily="Cinzel, serif"
              fontSize="16"
              fontWeight="bold"
              letterSpacing="0.32em"
            >
              DHAMAAKA
            </text>
            <text
              x="170"
              y="214"
              textAnchor="middle"
              fill="#E0217A"
              fontFamily="Manrope, sans-serif"
              fontSize="10"
              letterSpacing="0.25em"
              fontWeight="600"
            >
              DIWALI 2026 · CENTRE POINT
            </text>

            {/* Clapperboard Moving Top Arm (Swings from Hinge at x=20, y=70) */}
            <g
              style={{
                transformOrigin: "20px 72px",
                transform: stage >= 1 ? "rotate(0deg)" : "rotate(-24deg)",
                transition: "transform 140ms cubic-bezier(0.8, 0, 0.2, 1)",
              }}
            >
              {/* Arm bar */}
              <rect
                x="20"
                y="36"
                width="300"
                height="34"
                rx="3"
                fill="#160D10"
                stroke="url(#goldTrim)"
                strokeWidth="2"
              />
              {/* Diagonal chevron stripes */}
              <path d="M40 36L64 70H84L60 36H40Z" fill="#FFF6EE" />
              <path d="M96 36L120 70H140L116 36H96Z" fill="#FFF6EE" />
              <path d="M152 36L176 70H196L172 36H152Z" fill="#FFF6EE" />
              <path d="M208 36L232 70H252L228 36H208Z" fill="#FFF6EE" />
              <path d="M264 36L288 70H308L284 36H264Z" fill="#FFF6EE" />
            </g>

            {/* Hinge Pin */}
            <circle cx="24" cy="72" r="5" fill="#FFE3A3" stroke="#C69442" strokeWidth="1.5" />

            {/* Single WCAG-safe Hinge Flash at Clap */}
            {stage === 1 && (
              <g aria-hidden="true" className="animate-[clapperFlash_280ms_ease-out_forwards]">
                <circle cx="24" cy="72" r="14" fill="#FFFFFF" opacity="0.9" filter="drop-shadow(0 0 12px #FFE3A3)" />
                <line x1="10" y1="72" x2="38" y2="72" stroke="#FFF1C9" strokeWidth="2" />
                <line x1="24" y1="58" x2="24" y2="86" stroke="#FFF1C9" strokeWidth="2" />
              </g>
            )}
          </svg>
        </div>

        {/* Presenter Line: NO CTRL PRESENTS */}
        <div
          className={`mt-8 flex flex-col items-center gap-3 transition-all duration-700 ${
            stage >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
          }`}
        >
          <span className="font-cinzel text-[13px] sm:text-[15px] font-semibold uppercase tracking-[0.38em] text-[#E5B25D] drop-shadow-[0_2px_12px_rgba(229,178,93,0.4)]">
            {site.diwali.presenter}
          </span>
          <div className="flex items-center gap-2 text-[#E5B25D]/60 text-[10px]">
            <span className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#E5B25D]" />
            <span className="text-[#E0217A]">✦</span>
            <span className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#E5B25D]" />
          </div>
        </div>

        {/* Studio Lighting Reveal cue */}
        <div
          className={`mt-4 text-[11px] font-manrope uppercase tracking-[0.22em] text-[#FFF6EE]/60 transition-opacity duration-500 ${
            stage >= 3 ? "opacity-100" : "opacity-0"
          }`}
        >
          Premiere Night · Nagpur
        </div>

        {/* Skip hint */}
        <div className="mt-8 text-[10px] font-cinzel uppercase tracking-[0.25em] text-[#FFE3A3]/40">
          Click or press any key to enter
        </div>
      </div>

      {/* Two Studio Fresnel Beam Flares switching on (Left & Right) */}
      <div
        className={`pointer-events-none absolute inset-0 transition-opacity duration-800 ${
          stage >= 3 ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden="true"
      >
        {/* Left lens glow & beam */}
        <div className="absolute top-1/4 -left-12 w-96 h-96 rounded-full bg-[radial-gradient(circle,rgba(255,241,201,0.28)_0%,rgba(229,178,93,0.12)_45%,transparent_75%)] blur-2xl" />
        {/* Right lens glow & beam */}
        <div className="absolute top-1/4 -right-12 w-96 h-96 rounded-full bg-[radial-gradient(circle,rgba(255,241,201,0.28)_0%,rgba(229,178,93,0.12)_45%,transparent_75%)] blur-2xl" />
      </div>
    </div>
  );
}
