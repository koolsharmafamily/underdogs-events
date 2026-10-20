"use client";

import { assetUrl } from "@/utils/assetUrl";
import { TransitionLink, useTransitionNavigate } from "@/ui/TransitionLink";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { site } from "@/content/site";
import type Lenis from "lenis";
const getLenis = () => (window as unknown as { __lenis?: Lenis }).__lenis;
import { useStore } from "@/state/store";
import { UnderdogsBadgeSvg } from "@/ui/UnderdogsBadgeSvg";
import { useMrDogStore } from "@/features/mrdog/store";

export function MobileTopBar() {
  const pathname = usePathname();
  const navigate = useTransitionNavigate();
  const motionEnabled = useStore((s) => s.motionEnabled);
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
  const isMrDog = pathname === "/mr-dog";
  const isDetail = isRedRoom || isDiwali;

  const titleText = isRedRoom
    ? site.home.worlds.one.name
    : isDiwali
      ? site.home.worlds.two.name
      : isMrDog
        ? "MR. DOG"
        : site.brand.name;

  const activeColor = isRedRoom
    ? "text-[#FF1A35]"
    : isDiwali
      ? "text-[#E5B25D]"
      : isMrDog
        ? "text-[#EA28C1]"
        : "text-[#FCF9FC]";

  const handleJumpDetails = () => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate(8);
      } catch {}
    }
    const targetId = isRedRoom ? "#redroom-invitation" : "#diwali-invitation";
    const el = document.querySelector<HTMLElement>(targetId);
    if (!el) return;
    const targetY =
      isRedRoom && motionEnabled
        ? el.offsetTop + Math.round(el.offsetHeight * 0.52)
        : el.offsetTop;
    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(targetY, { duration: motionEnabled ? 0.8 : 0 });
    } else {
      window.scrollTo({ top: targetY, behavior: motionEnabled ? "smooth" : "instant" });
    }
  };

  return (
    <header
      aria-label="Mobile App Header"
      className={`fixed top-0 inset-x-0 z-40 md:hidden select-none transition-colors duration-[200ms] backdrop-blur-xl ${
        scrolled
          ? "bg-[#07090D]/92 border-b border-white/10"
          : "bg-[#07090D]/75 border-b border-transparent"
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
            className="absolute left-3 top-1/2 -translate-y-1/2 min-h-[48px] min-w-[48px] flex items-center gap-1 font-manrope text-[13px] font-medium tracking-wide text-white/85 active:text-white active:scale-95 transition-transform"
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
          className="inline-flex min-h-[44px] items-center gap-2.5 active:opacity-80 transition-opacity"
        >
          {!isDetail && (
            isMrDog ? (
              <div className="relative w-6 h-6 rounded-full overflow-hidden shrink-0 border border-white/10 shadow-[0_0_8px_rgba(234,40,193,0.5)]">
                <Image
                  src={assetUrl("/media/mr-dog/party-coin-disc.webp")}
                  alt="Mr. Dog"
                  width={24}
                  height={24}
                  unoptimized
                  className="object-cover"
                />
              </div>
            ) : (
              <UnderdogsBadgeSvg skin="home" size={24} className="shrink-0" />
            )
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
                <svg className="absolute top-0 left-[72%] text-[#B80A12] rr-blood-drip" width="4" height="7" viewBox="0 0 4 7" style={{ animationDelay: "0.35s" }}>
                  <path d="M2 0 C2 1.5, 1.5 5, 0.8 5.5 C0.3 6, 0.3 6.5, 2 7 C3.7 6.5, 3.7 6, 3.2 5.5 C2.5 5, 2 1.5, 2 0 Z" fill="currentColor" />
                </svg>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span
                className={`font-cinzel text-[13px] font-bold uppercase tracking-[0.28em] ${activeColor}`}
              >
                {titleText}
              </span>
              {isMrDog && (
                <span
                  className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.9)] animate-pulse"
                  title="Online"
                />
              )}
            </div>
          )}
        </TransitionLink>

        {/* Right: Quick contextual "Details" button on event pages OR "Clear Chat" on /mr-dog */}
        {isDetail ? (
          <button
            type="button"
            onClick={handleJumpDetails}
            aria-label="Jump to event details"
            className={`absolute right-3 top-1/2 -translate-y-1/2 min-h-[44px] px-2.5 flex items-center gap-1 font-cinzel text-[10px] font-semibold uppercase tracking-[0.2em] ${
              isRedRoom ? "text-[#FF968B]" : "text-[#FFE3A3]"
            } active:scale-95 transition-transform`}
          >
            <span>{isRedRoom ? site.redRoom.jump : site.diwali.jump}</span>
            <span aria-hidden="true">↓</span>
          </button>
        ) : isMrDog ? (
          <button
            type="button"
            onClick={() => {
              if (typeof navigator !== "undefined" && navigator.vibrate) {
                try {
                  navigator.vibrate(8);
                } catch {}
              }
              useMrDogStore.getState().clearChat();
            }}
            aria-label="Clear chat"
            title="Reset conversation"
            className="absolute right-3 top-1/2 -translate-y-1/2 min-h-[44px] min-w-[44px] flex items-center justify-center text-white/50 hover:text-white active:scale-90 transition-transform cursor-pointer"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        ) : null}
      </div>
    </header>
  );
}
