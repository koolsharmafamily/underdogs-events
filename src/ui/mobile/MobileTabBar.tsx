"use client";

import React, { useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { saveRouteScroll } from "@/motion/transitions";
import { site } from "@/content/site";

export function MobileTabBar() {
  const pathname = usePathname();
  const router = useRouter();

  const isHome = pathname === "/";
  const isRedRoom = pathname.startsWith("/the-red-room");
  const isDiwali = pathname.startsWith("/diwali");
  const isEventsList = pathname.startsWith("/events");
  const isEventsTab = isEventsList || isRedRoom || isDiwali;

  const [winking, setWinking] = useState(false);

  // Native haptic feedback
  const triggerHaptic = useCallback(() => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate(8);
      } catch {}
    }
  }, []);

  // Home icon tap handler with playful 120ms wink animation
  const handleHomeTap = (e: React.MouseEvent) => {
    triggerHaptic();
    setWinking(true);
    window.setTimeout(() => setWinking(false), 120);

    saveRouteScroll(pathname);

    if (isHome) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Events icon tap handler
  const handleEventsTap = (e: React.MouseEvent) => {
    triggerHaptic();
    saveRouteScroll(pathname);

    if (isEventsList) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (isRedRoom || isDiwali) {
      // If inside an event detail screen, tapping Events returns to /events
      router.push("/events");
    }
  };

  // Contextual theme accents
  const getTheme = () => {
    if (isHome) {
      return {
        accent: "#EA28C1",
        activeText: "text-[#EA28C1]",
        glow: "drop-shadow-[0_0_8px_rgba(234,40,193,0.55)]",
        barBorder: "border-white/[0.08]",
        barBg: "bg-[#090A0E]/88",
      };
    }
    if (isRedRoom) {
      return {
        accent: "#FF1A35",
        activeText: "text-[#FF1A35]",
        glow: "drop-shadow-[0_0_8px_rgba(255,26,53,0.55)]",
        barBorder: "border-[#FF1A35]/20",
        barBg: "bg-[#0A0406]/90",
      };
    }
    if (isDiwali) {
      return {
        accent: "#E5B25D",
        activeText: "text-[#E5B25D]",
        glow: "drop-shadow-[0_0_8px_rgba(229,178,93,0.55)]",
        barBorder: "border-[#E5B25D]/20",
        barBg: "bg-[#0C0608]/90",
      };
    }
    return {
      accent: "#FFF1C9",
      activeText: "text-[#FFF1C9]",
      glow: "drop-shadow-[0_0_8px_rgba(255,241,201,0.45)]",
      barBorder: "border-white/[0.08]",
      barBg: "bg-[#090A0E]/88",
    };
  };

  const { accent, activeText, glow, barBorder, barBg } = getTheme();

  return (
    <nav
      aria-label="Primary navigation"
      className={`fixed inset-x-0 bottom-0 z-50 md:hidden select-none ${barBg} ${barBorder} border-t backdrop-blur-2xl shadow-[0_-4px_24px_rgba(0,0,0,0.55)] transition-colors duration-300`}
      style={{
        paddingBottom: "max(env(safe-area-inset-bottom, 0px), 8px)",
      }}
    >
      {/* Top ambient hairline highlight */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent"
        aria-hidden="true"
      />

      {/* Main Tab Bar Row */}
      <div className="relative mx-auto flex h-[50px] w-full max-w-md items-stretch justify-around px-2">
        {/* Sliding illuminated top indicator bar */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 h-[2.5px] w-12 -translate-x-1/2 rounded-b-full transition-all duration-[280ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            left: isEventsTab ? "75%" : "25%",
            backgroundColor: accent,
            boxShadow: `0 2px 10px ${accent}`,
          }}
        />

        {/* Tab 1: Home */}
        <Link
          href="/"
          onClick={handleHomeTap}
          aria-current={isHome ? "page" : undefined}
          className={`group relative flex-1 flex flex-col items-center justify-center gap-1 transition-transform duration-100 active:scale-[0.92] ${
            isHome ? activeText : "text-white/40 hover:text-white/70"
          }`}
        >
          {/* Subtle soft ambient glow behind active icon */}
          {isHome && (
            <div
              className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-10 rounded-full blur-md opacity-25"
              style={{ backgroundColor: accent }}
              aria-hidden="true"
            />
          )}

          {/* Underdogs Face Line Icon (1.6px stroke) */}
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`relative transition-all duration-200 ${isHome ? glow : ""}`}
          >
            {/* Outer Head Circle */}
            <circle
              cx="12"
              cy="12"
              r="10"
              fill={isHome ? "currentColor" : "none"}
              fillOpacity={isHome ? 0.08 : 0}
            />

            {/* Left Eye ✕ (squashes playfully on wink) */}
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

            {/* Right Eye ✕ */}
            <g>
              <line x1="14.5" y1="7.5" x2="17.5" y2="10.5" />
              <line x1="17.5" y1="7.5" x2="14.5" y2="10.5" />
            </g>

            {/* Tongue out path */}
            <path
              d="M10 14h4c0 1.6-0.8 3-2 3s-2-1.4-2-3z"
              fill={isHome ? "currentColor" : "none"}
              fillOpacity={isHome ? 0.9 : 0}
            />
          </svg>

          <span className="relative font-manrope text-[10px] font-semibold tracking-[0.06em] uppercase">
            {site.ui.tabs.home}
          </span>
        </Link>

        {/* Tab 2: Events */}
        <Link
          href="/events"
          onClick={handleEventsTap}
          aria-current={isEventsTab ? "page" : undefined}
          className={`group relative flex-1 flex flex-col items-center justify-center gap-1 transition-transform duration-100 active:scale-[0.92] ${
            isEventsTab ? activeText : "text-white/40 hover:text-white/70"
          }`}
        >
          {/* Subtle soft ambient glow behind active icon */}
          {isEventsTab && (
            <div
              className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-10 rounded-full blur-md opacity-25"
              style={{ backgroundColor: accent }}
              aria-hidden="true"
            />
          )}

          {/* Dual Arches / Doors "Two Worlds" Line Icon */}
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`relative transition-all duration-200 ${isEventsTab ? glow : ""}`}
          >
            {/* Left Door / Arch */}
            <path
              d="M4 20V9a4 4 0 0 1 8 0v11"
              fill={isEventsTab ? "currentColor" : "none"}
              fillOpacity={isEventsTab ? 0.08 : 0}
            />
            {/* Right Door / Arch */}
            <path
              d="M12 20V9a4 4 0 0 1 8 0v11"
              fill={isEventsTab ? "currentColor" : "none"}
              fillOpacity={isEventsTab ? 0.08 : 0}
            />
            {/* Threshold Line */}
            <line x1="2" y1="20" x2="22" y2="20" />
            {/* Center division */}
            <line x1="12" y1="9" x2="12" y2="20" />
          </svg>

          <span className="relative font-manrope text-[10px] font-semibold tracking-[0.06em] uppercase">
            {site.ui.tabs.events}
          </span>
        </Link>
      </div>
    </nav>
  );
}
