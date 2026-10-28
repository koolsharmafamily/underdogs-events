"use client";

import { assetUrl } from "@/utils/assetUrl";
import React from "react";
import Image from "next/image";
import { TransitionLink } from "@/ui/TransitionLink";
import { site } from "@/content/site";
import { useDaysToGo } from "@/utils/useDaysToGo";
import { useEnterTransition } from "@/motion/transitions";
import { Footer } from "@/ui/Footer";

export function EventsView() {
  useEnterTransition("home");
  const { one, two } = site.home.worlds;
  const diwaliDays = useDaysToGo(two.isoDate);

  return (
    <div className="w-full min-h-[100dvh] bg-[var(--void)] text-[var(--paper)] flex flex-col justify-between pt-20 md:pt-28 select-none">
      <div className="site-container flex flex-col gap-10 md:gap-14 pb-16">
        {/* Editorial Header aligned to 12-column grid */}
        <header className="flex flex-col items-center text-center gap-3 max-w-[760px] mx-auto">
          <div className="flex items-center gap-2.5 font-mono text-[11px] sm:text-[12px] uppercase tracking-[0.24em] text-[var(--steel)]">
            <span>{site.events.lines[0]}</span>
            <span className="text-[var(--magenta)]" aria-hidden="true">·</span>
            <span>{site.events.lines[1]}</span>
          </div>
          <h1 className="font-cinzel text-h1 font-bold uppercase tracking-[0.18em] text-[var(--paper)] balance-heading">
            {site.events.title}
          </h1>
          <p className="font-cinzel text-[11px] sm:text-[12px] uppercase tracking-[0.3em] text-[var(--magenta)] font-semibold">
            {site.events.tagline}
          </p>
        </header>

        {/* Two World Tiles on Grid: DHAMAAKA FIRST (Upcoming), The Red Room SECOND (Past) */}
        <main
          id="main-content"
          className="site-grid items-stretch gap-y-6 md:gap-y-8"
        >
          {/* TILE 1: DHAMAAKA (UPCOMING) */}
          <TransitionLink
            href="/diwali"
            className="group relative col-span-4 md:col-span-4 lg:col-span-6 w-full min-h-[64svh] md:min-h-[580px] rounded-[20px] overflow-hidden border border-[#E5B25D]/40 bg-[#15040E] shadow-[0_20px_56px_rgba(0,0,0,0.75)] flex flex-col justify-between p-6 sm:p-8 lg:p-10 active:scale-[0.985] transition-all duration-[280ms] hover:border-[#E5B25D]/80"
          >
            {/* Background Image */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <Image
                src={assetUrl("/media/dhamaaka-ballroom-plate.webp")}
                alt=""
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover object-center opacity-30 group-hover:opacity-40 group-hover:scale-[1.03] transition-all duration-[750ms]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#090206] via-[#190512]/80 to-[#090206]/40" />
            </div>

            {/* Inner architectural frame hairline */}
            <div className="pointer-events-none absolute inset-3.5 rounded-[14px] border border-[#E5B25D]/25" aria-hidden="true" />

            {/* Top Row: 3D Coin Still + Occasion & Countdown */}
            <div className="relative z-10 flex items-start justify-between gap-4">
              <Image
                src={assetUrl("/media/badge-jewelled-still.webp")}
                alt="DHAMAAKA Jewelled Badge"
                width={80}
                height={80}
                className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-[0_0_24px_rgba(229,178,93,0.65)] group-hover:scale-105 transition-transform duration-[280ms]"
              />
              <div className="flex flex-col items-end gap-2">
                <span className="px-3 py-1 rounded-sm bg-[#E5B25D]/20 border border-[#E5B25D]/50 font-cinzel text-[11px] uppercase tracking-[0.24em] text-[#FFE3A3] font-bold">
                  Upcoming · {two.occasion}
                </span>
                {diwaliDays && (
                  <span className="px-3 py-0.5 rounded-sm bg-white/10 border border-white/20 font-mono text-[10px] uppercase tracking-wider text-white font-bold">
                    {diwaliDays}
                  </span>
                )}
              </div>
            </div>

            {/* Bottom Block: Kicker, World Title, Date, Timing, Rates, VIP notice, CTA */}
            <div className="relative z-10 flex flex-col gap-3 pt-8">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#FFE3A3] font-medium">
                  {site.diwali.presenter} · {two.kicker}
                </span>
                <span className="text-[#E5B25D]/50" aria-hidden="true">·</span>
                <span lang="hi" className="font-devanagari text-xs text-[#E5B25D]/90">
                  {site.diwali.accent}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <h2 className="font-playfair font-black text-3xl sm:text-4xl text-[#FFF6EE] tracking-wide leading-tight drop-shadow-[0_4px_24px_rgba(224,33,122,0.6)]">
                  {two.name}
                </h2>
                <p className="font-cinzel text-[11px] sm:text-[12px] uppercase tracking-[0.24em] text-[#E5B25D]">
                  {two.subtitle}
                </p>
              </div>

              {/* Prominent Date, Time, and Venue */}
              <div className="flex flex-col gap-1 pt-1">
                <p className="font-manrope text-[14px] sm:text-[15px] text-[var(--dw-ivory)]/95 font-semibold">
                  {two.date} <span className="text-[#E5B25D] mx-1.5" aria-hidden="true">·</span> {two.time}
                </p>
                <p className="font-manrope text-[13px] text-[#FFF6EE]/80">
                  {two.place} <span className="text-[#E0217A] mx-1.5 font-bold">·</span> <span className="text-[#E0217A] font-medium">{two.gatesClose}</span>
                </p>
              </div>

              {/* Phase 1 Rates Highlight & VIP Sold Out Notice */}
              <div className="mt-1 p-2.5 rounded-lg bg-[#220B16]/90 border border-[#E5B25D]/30 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-manrope text-[#FFE3A3] font-bold">
                  Phase 1 Rates: Couple ₹5,000 (₹2,500 cover) · Stag ₹4,000 (₹2,000 cover)
                </span>
                <span className="font-cinzel text-[10.5px] uppercase tracking-wider text-[#E0217A] font-bold">
                  {site.diwali.vipEnclosures.notice}
                </span>
              </div>

              <div className="mt-2 pt-3 border-t border-white/15 min-h-[44px] flex items-center justify-between font-cinzel text-xs uppercase tracking-[0.26em] text-[#FFE3A3] group-hover:text-white transition-colors">
                <span>{two.cta}</span>
                <span className="group-hover:translate-x-1 transition-transform duration-[140ms]">→</span>
              </div>
            </div>
          </TransitionLink>

          {/* TILE 2: THE RED ROOM (PAST EVENT) */}
          <TransitionLink
            href="/the-red-room"
            className="group relative col-span-4 md:col-span-4 lg:col-span-6 w-full min-h-[64svh] md:min-h-[580px] rounded-[20px] overflow-hidden border border-[#FF1A35]/35 bg-[#120204] shadow-[0_20px_56px_rgba(0,0,0,0.75)] flex flex-col justify-between p-6 sm:p-8 lg:p-10 active:scale-[0.985] transition-all duration-[280ms] hover:border-[#FF1A35]/75"
          >
            {/* Background Image */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <Image
                src={assetUrl("/media/red-room-poster.webp")}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover object-center opacity-20 group-hover:opacity-30 group-hover:scale-[1.03] transition-all duration-[750ms]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080102] via-[#140205]/85 to-[#080102]/50" />
            </div>

            {/* Inner architectural frame hairline */}
            <div className="pointer-events-none absolute inset-3.5 rounded-[14px] border border-[#FF1A35]/20" aria-hidden="true" />

            {/* Top Row: 3D Coin Still + Occasion & Happened Status */}
            <div className="relative z-10 flex items-start justify-between gap-4">
              <Image
                src={assetUrl("/media/badge-halloween-still.webp")}
                alt="The Red Room badge"
                width={80}
                height={80}
                className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-[0_0_24px_rgba(255,26,53,0.65)] group-hover:scale-105 transition-transform duration-[280ms]"
              />
              <div className="flex flex-col items-end gap-2">
                <span className="px-3 py-1 rounded-sm bg-white/10 border border-white/20 font-cinzel text-[11px] uppercase tracking-[0.24em] text-[#FF968B] font-semibold">
                  {one.occasion}
                </span>
                <span className="px-3 py-0.5 rounded-sm bg-[#FF1A35]/20 border border-[#FF1A35]/40 font-mono text-[10px] uppercase tracking-wider text-[#FF968B] font-bold">
                  {one.pastLabel}
                </span>
              </div>
            </div>

            {/* Bottom Block: Kicker, World Title, Date/Place Caption, Acknowledgement, CTA */}
            <div className="relative z-10 flex flex-col gap-3 pt-8">
              <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#FF968B] font-medium">
                {one.kicker} · Past Night
              </span>

              <div className="relative inline-block self-start">
                <h2 className="font-nosifer text-2xl sm:text-4xl uppercase text-[#FF1A35] tracking-[0.03em] leading-tight drop-shadow-[0_4px_24px_rgba(255,26,53,0.9)]">
                  {one.name}
                </h2>
                <div aria-hidden="true" className="pointer-events-none relative h-2.5 w-full">
                  <svg className="absolute top-0 left-[22%] text-[#B80A12] rr-blood-drip" width="6" height="12" viewBox="0 0 6 12">
                    <path d="M2.5 0 C2.5 2, 2 8, 1 9 C0.5 10, 0.5 11, 3 12 C5.5 11, 5.5 10, 5 9 C4 8, 3.5 2, 3.5 0 Z" fill="currentColor" />
                  </svg>
                  <svg className="absolute top-0 left-[68%] text-[#B80A12] rr-blood-drip" width="6" height="14" viewBox="0 0 6 14" style={{ animationDelay: "0.4s" }}>
                    <path d="M2.5 0 C2.5 2, 2 9, 1 10 C0.5 11, 0.5 12, 3 14 C5.5 12, 5.5 11, 5 10 C4 9, 3.5 2, 3.5 0 Z" fill="currentColor" />
                  </svg>
                </div>
              </div>

              {/* Date & Place Caption */}
              <p className="font-manrope text-[14px] sm:text-[15px] text-[var(--rr-bone)]/90 font-medium pt-1">
                {one.date} <span className="text-[#FF1A35] mx-1.5" aria-hidden="true">·</span> {one.place}
              </p>

              <p className="font-manrope text-[12.5px] text-[var(--rr-bone)]/75 italic">
                {site.redRoom.thankYou}
              </p>

              <div className="mt-2 pt-3 border-t border-white/15 min-h-[44px] flex items-center justify-between font-cinzel text-xs uppercase tracking-[0.26em] text-[#FF968B] group-hover:text-white transition-colors">
                <span>View World Record</span>
                <span className="group-hover:translate-x-1 transition-transform duration-[140ms]">→</span>
              </div>
            </div>
          </TransitionLink>
        </main>
      </div>

      <Footer />
    </div>
  );
}
