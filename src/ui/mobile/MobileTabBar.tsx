"use client";

import { TransitionLink } from "@/ui/TransitionLink";
import React, { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { saveRouteScroll } from "@/motion/transitions";
import { site } from "@/content/site";
import { useMrDogStore, worldToOutfit } from "@/features/mrdog/store";
import { useStore as useAppStore } from "@/state/store";

export function MobileTabBar() {
  const pathname = usePathname();
  const world = useAppStore((s) => s.world);
  const motion = useAppStore((s) => s.motionEnabled);

  const isHome = pathname === "/";
  const isRedRoom = pathname.startsWith("/the-red-room");
  const isDiwali = pathname.startsWith("/diwali");
  const isEventsList = pathname.startsWith("/events");
  const isEventsTab = isEventsList || isRedRoom || isDiwali;
  const outfit = isRedRoom ? "redroom" : isDiwali ? "diwali" : worldToOutfit(world);

  const isSheetOpen = useMrDogStore((s) => s.isOpen);
  const toggleMrDog = useMrDogStore((s) => s.toggleMrDog);
  const closeMrDog = useMrDogStore((s) => s.closeMrDog);

  const [winking, setWinking] = useState(false);
  const [dogBlinking, setDogBlinking] = useState(false);
  const [dogWinking, setDogWinking] = useState(false);
  const [dogTilt, setDogTilt] = useState(false);

  // Native haptic feedback
  const triggerHaptic = useCallback(() => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate(8);
      } catch {}
    }
  }, []);

  // Idle life for Mr. Dog button (blink, wink, tilt)
  useEffect(() => {
    if (!motion || isSheetOpen) return;

    // Periodic blink every 4-7s
    const blinkInterval = setInterval(() => {
      setDogBlinking(true);
      setTimeout(() => setDogBlinking(false), 120);
    }, Math.random() * 3000 + 4000);

    // Periodic wink every 20s
    const winkInterval = setInterval(() => {
      setDogWinking(true);
      setTimeout(() => setDogWinking(false), 240);
    }, 20000);

    // Occasional subtle ear tilt
    const tiltInterval = setInterval(() => {
      setDogTilt(true);
      setTimeout(() => setDogTilt(false), 600);
    }, 14000);

    return () => {
      clearInterval(blinkInterval);
      clearInterval(winkInterval);
      clearInterval(tiltInterval);
    };
  }, [motion, isSheetOpen]);

  // Home icon tap handler
  const handleHomeTap = () => {
    triggerHaptic();
    if (isSheetOpen) {
      closeMrDog();
    }
    setWinking(true);
    window.setTimeout(() => setWinking(false), 120);
    saveRouteScroll(pathname);
    if (isHome) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Events icon tap handler
  const handleEventsTap = () => {
    triggerHaptic();
    if (isSheetOpen) {
      closeMrDog();
    }
    saveRouteScroll(pathname);
    if (isEventsList) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Mr. Dog center button tap handler
  const handleDogTap = () => {
    triggerHaptic();
    toggleMrDog();
  };

  // Contextual theme accents
  const getTheme = () => {
    if (isHome) {
      return {
        accent: "#EA28C1",
        activeText: "text-[#EA28C1]",
        glow: "drop-shadow-[0_0_8px_rgba(234,40,193,0.55)]",
        barBorder: "border-white/[0.08]",
        barBg: "bg-[#090A0E]/[0.96]",
      };
    }
    if (isRedRoom) {
      return {
        accent: "#FF1A35",
        activeText: "text-[#FF1A35]",
        glow: "drop-shadow-[0_0_8px_rgba(255,26,53,0.55)]",
        barBorder: "border-[#FF1A35]/20",
        barBg: "bg-[#0A0406]/[0.96]",
      };
    }
    if (isDiwali) {
      return {
        accent: "#E5B25D",
        activeText: "text-[#E5B25D]",
        glow: "drop-shadow-[0_0_8px_rgba(229,178,93,0.55)]",
        barBorder: "border-[#E5B25D]/20",
        barBg: "bg-[#0C0608]/[0.96]",
      };
    }
    return {
      accent: "#FFF1C9",
      activeText: "text-[#FFF1C9]",
      glow: "drop-shadow-[0_0_8px_rgba(255,241,201,0.45)]",
      barBorder: "border-white/[0.08]",
      barBg: "bg-[#090A0E]/[0.96]",
    };
  };

  const { accent, activeText, glow, barBorder, barBg } = getTheme();

  // Determine avatar icon state
  let avatarType = "avatar";
  if (isSheetOpen) {
    avatarType = "avatar-x";
  } else if (dogWinking) {
    avatarType = "avatar-wink";
  } else if (dogBlinking) {
    avatarType = "avatar-blink";
  }
  const dogAvatarSrc = `/media/mr-dog/${outfit}/${avatarType}.webp`;

  return (
    <nav
      aria-label="Primary navigation"
      className={`fixed inset-x-0 bottom-0 z-50 md:hidden select-none ${barBg} ${barBorder} border-t shadow-[0_-4px_24px_rgba(0,0,0,0.55)] transition-colors duration-300`}
      style={{
        paddingBottom: "max(env(safe-area-inset-bottom, 0px), 8px)",
      }}
    >
      {/* Top notch concave hairline SVG */}
      <svg
        className="pointer-events-none absolute inset-x-0 -top-[1px] w-full h-[8px] overflow-visible"
        aria-hidden="true"
      >
        <line
          x1="0"
          y1="1"
          x2="100%"
          y2="1"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="1"
        />
      </svg>

      {/* Main Tab Bar Row with 3 Columns */}
      <div className="relative mx-auto flex h-[50px] w-full max-w-md items-stretch justify-between px-2">
        {/* Sliding illuminated top indicator bar (Homes: 16.67%, Events: 83.33%, Faded out when sheet is open) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 h-[2.5px] w-12 -translate-x-1/2 rounded-b-full transition-all duration-[280ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            left: isEventsTab ? "83.33%" : "16.67%",
            opacity: isSheetOpen ? 0 : 1,
            backgroundColor: accent,
            boxShadow: `0 2px 10px ${accent}`,
          }}
        />

        {/* Column 1: Home */}
        <TransitionLink
          href="/"
          onClick={handleHomeTap}
          aria-current={isHome && !isSheetOpen ? "page" : undefined}
          className={`group relative flex-1 flex flex-col items-center justify-center gap-1 transition-transform duration-100 active:scale-[0.92] ${
            isHome && !isSheetOpen ? activeText : "text-white/40 hover:text-white/70"
          }`}
        >
          {isHome && !isSheetOpen && (
            <div
              className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-10 rounded-full blur-md opacity-25"
              style={{ backgroundColor: accent }}
              aria-hidden="true"
            />
          )}

          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`relative transition-all duration-200 ${isHome && !isSheetOpen ? glow : ""}`}
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              fill={isHome && !isSheetOpen ? "currentColor" : "none"}
              fillOpacity={isHome && !isSheetOpen ? 0.08 : 0}
            />
            <g
              style={{
                transformOrigin: "8px 9px",
                transform: winking ? "scaleY(0.15) scaleX(1.3)" : "none",
                transition: "transform 100ms ease",
              }}
            >
              <line x1="6.5" y1="7.5" x2="9.5" y2="10.5" />
              <line x1="9.5" y1="7.5" x2="6.5" y2="10.5" />
            </g>
            <g>
              <line x1="14.5" y1="7.5" x2="17.5" y2="10.5" />
              <line x1="17.5" y1="7.5" x2="14.5" y2="10.5" />
            </g>
            <path
              d="M10 14h4c0 1.6-0.8 3-2 3s-2-1.4-2-3z"
              fill={isHome && !isSheetOpen ? "currentColor" : "none"}
              fillOpacity={isHome && !isSheetOpen ? 0.9 : 0}
            />
          </svg>

          <span className="relative font-manrope text-[10px] font-semibold tracking-[0.06em] uppercase">
            {site.ui.tabs.home}
          </span>
        </TransitionLink>

        {/* Column 2: Center Mr. Dog Raised Button */}
        <div className="relative flex-1 flex flex-col items-center justify-end pb-1">
          <button
            type="button"
            onClick={handleDogTap}
            aria-label={isSheetOpen ? "Close Mr. Dog" : "Ask Mr. Dog AI Concierge"}
            aria-expanded={isSheetOpen}
            className={`absolute -top-5 left-1/2 -translate-x-1/2 w-[58px] h-[58px] rounded-full flex items-center justify-center bg-[#10171F] transition-all duration-200 active:scale-95 shadow-[0_4px_16px_rgba(0,0,0,0.7)] ${
              dogTilt ? "rotate-6" : ""
            }`}
            style={{
              boxShadow: `0 0 16px ${accent}40, 0 4px 12px rgba(0,0,0,0.8)`,
              border: `1.5px solid ${accent}`,
            }}
          >
            {/* Ambient soft glow */}
            <div
              className="pointer-events-none absolute inset-0 rounded-full blur-[6px] opacity-40"
              style={{ backgroundColor: accent }}
              aria-hidden="true"
            />

            {/* Avatar with ears breaking out of the top */}
            <div className="relative w-[52px] h-[52px] overflow-visible flex items-center justify-center">
              <Image
                src={dogAvatarSrc}
                alt={isSheetOpen ? "Mr. Dog (Close)" : "Mr. Dog"}
                width={52}
                height={52}
                priority
                unoptimized
                className="object-contain -translate-y-0.5 drop-shadow-md select-none pointer-events-none"
              />
            </div>
          </button>

          <span
            className={`font-manrope text-[10px] font-bold tracking-[0.06em] uppercase transition-colors ${
              isSheetOpen ? activeText : "text-white/60"
            }`}
          >
            MR. DOG
          </span>
        </div>

        {/* Column 3: Events */}
        <TransitionLink
          href="/events"
          onClick={handleEventsTap}
          aria-current={isEventsTab && !isSheetOpen ? "page" : undefined}
          className={`group relative flex-1 flex flex-col items-center justify-center gap-1 transition-transform duration-100 active:scale-[0.92] ${
            isEventsTab && !isSheetOpen ? activeText : "text-white/40 hover:text-white/70"
          }`}
        >
          {isEventsTab && !isSheetOpen && (
            <div
              className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-10 rounded-full blur-md opacity-25"
              style={{ backgroundColor: accent }}
              aria-hidden="true"
            />
          )}

          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`relative transition-all duration-200 ${isEventsTab && !isSheetOpen ? glow : ""}`}
          >
            <path
              d="M4 20V9a4 4 0 0 1 8 0v11"
              fill={isEventsTab && !isSheetOpen ? "currentColor" : "none"}
              fillOpacity={isEventsTab && !isSheetOpen ? 0.08 : 0}
            />
            <path
              d="M12 20V9a4 4 0 0 1 8 0v11"
              fill={isEventsTab && !isSheetOpen ? "currentColor" : "none"}
              fillOpacity={isEventsTab && !isSheetOpen ? 0.08 : 0}
            />
            <line x1="2" y1="20" x2="22" y2="20" />
            <line x1="12" y1="9" x2="12" y2="20" />
          </svg>

          <span className="relative font-manrope text-[10px] font-semibold tracking-[0.06em] uppercase">
            {site.ui.tabs.events}
          </span>
        </TransitionLink>
      </div>
    </nav>
  );
}
