"use client";

import { TransitionLink, useTransitionNavigate } from "@/ui/TransitionLink";
import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { site } from "@/content/site";
import { UnderdogsBadgeSvg } from "@/ui/UnderdogsBadgeSvg";

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
          {isRedRoom ? (
            <div className="relative inline-block">
              <span className="font-nosifer text-[13px] text-[#FF1A35] uppercase tracking-[0.04em] drop-shadow-[0_2px_10px_rgba(255,26,53,0.85)]">
                {titleText}
              </span>
              <div aria-hidden="true" className="pointer-events-none relative h-1.5 w-full">
                <svg className="absolute top-0 left-[24%] text-[#B80A12] rr-blood-drip" width="4" height="6" viewBox="0 0 4 6">
                  <path d="M2 0 C2 1, 1.5 4, 0.8 4.5 C0.3 5, 0.3 5.5, 2 6 C3.7 5.5, 3.7 5, 3.2 4.5 C2.5 4, 2 1, 2 0 Z" fill="currentColor" />
                </svg>
                <svg className="absolute top-0 left-[72%] text-[#B80A12] rr-blood-drip" width="4" height="7" viewBox="0 0 4 7" style={{ animationDelay: '0.35s' }}>
                  <path d="M2 0 C2 1.5, 1.5 5, 0.8 5.5 C0.3 6, 0.3 6.5, 2 7 C3.7 6.5, 3.7 6, 3.2 5.5 C2.5 5, 2 1.5, 2 0 Z" fill="currentColor" />
                </svg>
              </div>
            </div>
          ) : (
            <span
              className={`font-cinzel text-[13px] font-bold uppercase tracking-[0.28em] ${activeColor}`}
            >
              {titleText}
            </span>
          )}
        </TransitionLink>
      </div>
    </header>
  );
}
