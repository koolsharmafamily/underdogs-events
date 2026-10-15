"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import { site } from "@/content/site";
import { useStore } from "@/state/store";
import { UnderdogsBadgeSvg } from "@/ui/UnderdogsBadgeSvg";
import { TransitionLink } from "@/ui/TransitionLink";

export function DhamaakaEventCard() {
  const motionEnabled = useStore((s) => s.motionEnabled);

  // Compute days to go until Nov 7, 2026
  const daysToGo = useMemo(() => {
    const target = new Date("2026-11-07T19:00:00+05:30");
    const now = new Date();
    const diff = Math.max(0, Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    return diff;
  }, []);

  return (
    <div
      role="article"
      aria-label="DHAMAAKA Event Card"
      className="relative w-full max-w-[420px] mx-auto rounded-2xl bg-[#0D0507] border border-[#E5B25D]/40 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.95),0_0_30px_rgba(139,15,34,0.3)] overflow-hidden select-none"
    >
      {/* Studio Beam in the top-right corner */}
      <div
        className="pointer-events-none absolute -top-12 -right-12 w-64 h-64 rounded-full bg-[radial-gradient(circle,rgba(255,241,201,0.2)_0%,rgba(224,33,122,0.12)_45%,transparent_70%)] blur-2xl"
        aria-hidden="true"
      />

      {/* Diagonal Sheen Sweep across title every ~8s */}
      {motionEnabled && (
        <div
          className="pointer-events-none absolute inset-0 -skew-x-12 animate-[diamondSheen_8s_infinite_ease-in-out]"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255,241,201,0.15) 50%, transparent 100%)",
          }}
          aria-hidden="true"
        />
      )}

      {/* Top Row: Chips (Diwali 2026 & Days to Go) */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8B0F22]/40 border border-[#E0217A]/50 text-[#FFE3A3] text-[10px] font-cinzel font-semibold uppercase tracking-[0.2em]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E0217A]" />
          Diwali 2026
        </span>

        <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#1A0B10] border border-[#E5B25D]/40 text-[#E5B25D] text-[10px] font-mono font-medium tracking-[0.1em]">
          {daysToGo} DAYS TO GO
        </span>
      </div>

      {/* Center Hero: Jewelled Badge Still & Title */}
      <div className="flex flex-col items-center text-center my-3">
        <div className="w-20 h-20 mb-2 drop-shadow-[0_8px_18px_rgba(224,33,122,0.5)]">
          <UnderdogsBadgeSvg skin="diwali" size={80} />
        </div>

        <span className="font-cinzel text-[10px] uppercase tracking-[0.32em] text-[#E5B25D]/80">
          {site.diwali.presenter}
        </span>

        <h3 className="font-playfair font-black text-[34px] uppercase tracking-[0.05em] text-[#FFF6EE] drop-shadow-[0_3px_12px_rgba(224,33,122,0.6)] leading-none mt-1">
          {site.diwali.title}
        </h3>

        <span className="font-cinzel text-[11px] uppercase tracking-[0.22em] text-[#FFE3A3] mt-1">
          {site.diwali.subtitle}
        </span>
      </div>

      {/* Bottom Chips: Date & Venue */}
      <div className="flex flex-wrap items-center justify-center gap-2 mt-5 pt-4 border-t border-[#E5B25D]/20">
        <span className="px-3 py-1 rounded-md bg-[#160B0E] border border-[#E5B25D]/30 text-[#FFF6EE] text-[11px] font-manrope font-medium">
          Sat 7 Nov 2026
        </span>
        <span className="px-3 py-1 rounded-md bg-[#160B0E] border border-[#E5B25D]/30 text-[#FFF6EE] text-[11px] font-manrope font-medium">
          Centre Point, Nagpur
        </span>
      </div>

      {/* Enter World Two Action Link */}
      <div className="mt-5">
        <TransitionLink
          href="/diwali"
          transitionType="T2"
          origin="door"
          className="group flex w-full items-center justify-center gap-2 py-3 rounded-lg bg-gradient-to-r from-[#8B0F22] to-[#B81640] hover:from-[#A8132D] hover:to-[#D41C4E] text-[#FFF6EE] font-cinzel text-[12px] font-bold uppercase tracking-[0.24em] shadow-[0_6px_20px_rgba(139,15,34,0.4)] transition-all"
        >
          <span>Explore Premiere</span>
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </TransitionLink>
      </div>
    </div>
  );
}
