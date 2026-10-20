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
  const isMrDog = pathname === "/mr-dog";
  const isRedRoom = pathname.startsWith("/the-red-room");
  const isDiwali = pathname.startsWith("/diwali");
  const isEventsList = pathname.startsWith("/events");
  const isEventsTab = isEventsList || isRedRoom || isDiwali;
  const outfit = isRedRoom ? "redroom" : isDiwali ? "diwali" : worldToOutfit(world);

  const [winking, setWinking] = useState(false);
  const [dogBlinking, setDogBlinking] = useState(false);
  const [dogWinking, setDogWinking] = useState(false);
  const [dogTilt, setDogTilt] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  // Track virtual keyboard on mobile to cleanly hide bottom bar
  useEffect(() => {
    if (typeof window === "undefined" || !window.visualViewport) return;
    const vv = window.visualViewport;
    const checkKeyboard = () => {
      const isKb = window.innerHeight - vv.height > 120;
      setIsKeyboardOpen(isKb);
    };
    vv.addEventListener("resize", checkKeyboard);
    return () => vv.removeEventListener("resize", checkKeyboard);
  }, []);

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
    if (!motion) return;

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
  }, [motion]);

  // Home icon tap handler
  const handleHomeTap = () => {
    triggerHaptic();
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
    saveRouteScroll(pathname);
    if (isEventsList) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Mr. Dog center button tap handler
  const handleDogTap = () => {
    triggerHaptic();
    saveRouteScroll(pathname);
    if (isMrDog) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Contextual theme accents
  const getTheme = () => {
    if (isMrDog) {
      return {
        accent: "#EA28C1",
        activeText: "text-[#EA28C1]",
        glow: "drop-shadow-[0_0_8px_rgba(234,40,193,0.55)]",
        barBorder: "border-[#EA28C1]/20",
        barBg: "bg-[#090A0E]/[0.96]",
      };
    }
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
  if (dogWinking) {
    avatarType = "avatar-wink";
  } else if (dogBlinking) {
    avatarType = "avatar-blink";
  }
  const dogAvatarSrc = "/media/mr-dog/party-coin.webp";

  return (
    <nav
      aria-label="Primary navigation"
      className={`fixed inset-x-0 bottom-0 z-50 md:hidden select-none ${barBg} ${barBorder} border-t shadow-[0_-4px_24px_rgba(0,0,0,0.55)] transition-all duration-300 ${
        isKeyboardOpen ? "translate-y-full opacity-0 pointer-events-none" : "translate-y-0 opacity-100"
      }`}
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
        {/* Sliding illuminated top indicator bar (Home: 16.67%, Mr. Dog: 50%, Events: 83.33%) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 h-[2.5px] w-12 -translate-x-1/2 rounded-b-full transition-all duration-[280ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            left: isEventsTab ? "83.33%" : isMrDog ? "50%" : "16.67%",
            opacity: 1,
            backgroundColor: accent,
            boxShadow: `0 2px 10px ${accent}`,
          }}
        />

        {/* Column 1: Home */}
        <TransitionLink
          href="/"
          onClick={handleHomeTap}
          aria-current={isHome ? "page" : undefined}
          className={`group relative flex-1 flex flex-col items-center justify-center gap-1 transition-transform duration-100 active:scale-[0.92] ${
            isHome ? activeText : "text-white/40 hover:text-white/70"
          }`}
        >
          {isHome && (
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
            className={`relative transition-all duration-200 ${isHome ? glow : ""}`}
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              fill={isHome ? "currentColor" : "none"}
              fillOpacity={isHome ? 0.08 : 0}
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
              fill={isHome ? "currentColor" : "none"}
              fillOpacity={isHome ? 0.9 : 0}
            />
          </svg>

          <span className="relative font-manrope text-[10px] font-semibold tracking-[0.06em] uppercase">
            {site.ui.tabs.home}
          </span>
        </TransitionLink>

        {/* Column 2: Center Mr. Dog Party Coin Raised Button */}
        <div className="relative flex-1 flex flex-col items-center justify-end pb-1">
          <TransitionLink
            href="/mr-dog"
            onClick={handleDogTap}
            aria-label="Mr. Dog AI Concierge"
            aria-current={isMrDog ? "page" : undefined}
            className={`group absolute -top-[33px] left-1/2 -translate-x-1/2 w-[52px] h-[66px] flex items-end justify-center transition-all duration-200 active:scale-95 ${
              dogTilt ? "rotate-6" : ""
            }`}
          >
            {/* Ambient soft glow behind party coin */}
            <div
              className={`pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[48px] h-[48px] rounded-full blur-[8px] transition-opacity duration-300 ${
                isMrDog ? "opacity-85 scale-110" : "opacity-35 group-hover:opacity-65"
              }`}
              style={{ backgroundColor: accent }}
              aria-hidden="true"
            />

            {/* Backing dark disc for contrast behind coin */}
            <div
              className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[46px] h-[46px] rounded-full bg-[#07090D] shadow-[0_4px_14px_rgba(0,0,0,0.85)]"
              aria-hidden="true"
            />

            {/* The Authentic Mr. Dog Party Coin */}
            <div className="relative w-[52px] h-[66px] overflow-visible flex items-end justify-center">
              <Image
                src="/media/mr-dog/party-coin.webp"
                alt="Mr. Dog Party Coin"
                width={52}
                height={66}
                priority
                unoptimized
                className="object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] select-none pointer-events-none transition-transform duration-200"
              />
            </div>
          </TransitionLink>

          <TransitionLink
            href="/mr-dog"
            onClick={handleDogTap}
            className={`font-manrope text-[10px] font-bold tracking-[0.06em] uppercase transition-colors ${
              isMrDog ? activeText : "text-white/60 hover:text-white/80"
            }`}
          >
            MR. DOG
          </TransitionLink>
        </div>

        {/* Column 3: Events */}
        <TransitionLink
          href="/events"
          onClick={handleEventsTap}
          aria-current={isEventsTab ? "page" : undefined}
          className={`group relative flex-1 flex flex-col items-center justify-center gap-1 transition-transform duration-100 active:scale-[0.92] ${
            isEventsTab ? activeText : "text-white/40 hover:text-white/70"
          }`}
        >
          {isEventsTab && (
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
            className={`relative transition-all duration-200 ${isEventsTab ? glow : ""}`}
          >
            <path
              d="M4 20V9a4 4 0 0 1 8 0v11"
              fill={isEventsTab ? "currentColor" : "none"}
              fillOpacity={isEventsTab ? 0.08 : 0}
            />
            <path
              d="M12 20V9a4 4 0 0 1 8 0v11"
              fill={isEventsTab ? "currentColor" : "none"}
              fillOpacity={isEventsTab ? 0.08 : 0}
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
