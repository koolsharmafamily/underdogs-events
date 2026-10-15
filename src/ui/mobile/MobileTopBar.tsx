"use client";

import { TransitionLink, useTransitionNavigate } from "@/ui/TransitionLink";
import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { site } from "@/content/site";
import { UnderdogsBadgeSvg } from "@/ui/UnderdogsBadgeSvg";
import { MotionToggle } from "@/ui/MotionToggle";

export function MobileTopBar() {
  const pathname = usePathname();
  const navigate = useTransitionNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isRedRoom = pathname.startsWith("/the-red-room");
  const isDiwali = pathname.startsWith("/diwali");
  const isDetail = isRedRoom || isDiwali;

  const titleText = isRedRoom
    ? site.home.worlds.one.name
    : isDiwali
      ? site.home.worlds.two.name
      : site.brand.name;

  const activeColor = isRedRoom
    ? "text-[#FF1A35]"
    : isDiwali
      ? "text-[#E5B25D]"
      : "text-[#FCF9FC]";

  return (
    <header
      aria-label="Mobile App Header"
      className={`fixed top-0 inset-x-0 z-40 md:hidden select-none transition-colors duration-200 ${
        scrolled
          ? "bg-[#07090D]/95 border-b border-white/10"
          : "bg-[#07090D]/80 border-b border-transparent"
      }`}
      style={{
        paddingTop: "env(safe-area-inset-top, 0px)",
      }}
    >
      <div className="relative flex h-14 items-center justify-center px-4">
        {/* Left: Back button on detail screens */}
        {isDetail ? (
          <button
            type="button"
            onClick={() => {
              if (typeof navigator !== "undefined" && navigator.vibrate) {
                try {
                  navigator.vibrate(8);
                } catch {}
              }
              navigate("/events");
            }}
            aria-label="Back to Events list"
            className="absolute left-3 top-1/2 -translate-y-1/2 min-h-[48px] min-w-[48px] flex items-center gap-1 font-manrope text-[13px] font-medium tracking-wide text-white/80 active:text-white active:scale-95 transition-transform"
          >
            <span className="text-lg leading-none" aria-hidden="true">
              ‹
            </span>
            <span>{site.ui.backToEvents}</span>
          </button>
        ) : null}

        {/* Center: Badge + Brand Wordmark OR Event Name */}
        <TransitionLink
          href="/"
          className="inline-flex items-center gap-2.5 active:opacity-80 transition-opacity"
        >
          {!isDetail && (
            <UnderdogsBadgeSvg skin="home" size={24} className="shrink-0" />
          )}
          <span
            className={`font-cinzel text-[13px] font-bold uppercase tracking-[0.28em] ${activeColor}`}
          >
            {titleText}
          </span>
        </TransitionLink>
        {/* Right: Motion on/off, remembered for the visit and the next one */}
        <MotionToggle
          compact
          className="absolute right-1 top-1/2 -translate-y-1/2"
          colorClass="text-white/70 active:text-white"
        />
      </div>
    </header>
  );
}
