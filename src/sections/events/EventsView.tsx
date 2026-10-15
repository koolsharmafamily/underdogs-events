"use client";

import React from "react";
import Link from "next/link";
import { site } from "@/content/site";
import { useDaysToGo } from "@/utils/useDaysToGo";

export function EventsView() {
  const { one, two } = site.home.worlds;
  const redRoomDays = useDaysToGo(one.isoDate);
  const diwaliDays = useDaysToGo(two.isoDate);

  return (
    <div className="w-full min-h-[100dvh] bg-[#07090D] text-[#FCF9FC] flex flex-col pt-16 md:pt-24 pb-28 md:pb-16 px-4 sm:px-6 select-none">
      {/* Header */}
      <header className="max-w-[1100px] w-full mx-auto flex flex-col items-center text-center gap-2 mb-8 md:mb-12">
        <h1 className="font-cinzel text-3xl sm:text-4xl md:text-5xl font-bold uppercase tracking-[0.22em] text-white">
          {site.events.title}
        </h1>
        <div className="flex items-center gap-2 font-mono text-[11px] sm:text-[12px] uppercase tracking-[0.24em] text-white/60">
          <span>{site.events.lines[0]}</span>
          <span className="text-[#EA28C1]">·</span>
          <span>{site.events.lines[1]}</span>
        </div>
        <p className="font-cinzel text-[11px] uppercase tracking-[0.3em] text-[#EA28C1] font-semibold mt-1">
          {site.events.tagline}
        </p>
      </header>

      {/* Two Immersive Event Cards: Stacked with snap on mobile, 2-Col on desktop */}
      <main
        id="main-content"
        className="max-w-[1100px] w-full mx-auto flex flex-col md:grid md:grid-cols-2 gap-6 md:gap-8 snap-y snap-mandatory md:snap-none"
      >
        {/* CARD 1: THE RED ROOM */}
        <Link
          href="/the-red-room"
          className="group relative snap-start w-full min-h-[68svh] md:min-h-[580px] rounded-[20px] overflow-hidden border border-[#FF1A35]/35 bg-[#140205] shadow-[0_16px_48px_rgba(255,26,53,0.15)] flex flex-col justify-between p-6 sm:p-8 active:scale-[0.98] transition-all duration-300 hover:border-[#FF1A35]/70"
        >
          {/* Dimmed Ken Burns Drift Background */}
          <div
            className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-25 group-hover:opacity-35 transition-opacity duration-700 ease-out"
            style={{
              backgroundImage: "url('/media/red-room-poster.webp')",
              animation: "kenBurns 12s ease-in-out infinite alternate",
            }}
          />

          {/* Scrim Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0203] via-[#150206]/80 to-transparent pointer-events-none" />

          {/* Top: Glowing Neon Badge Still + Occasion Chip */}
          <div className="relative z-10 flex items-start justify-between">
            <img
              src="/media/badge-neon-still.webp"
              alt="The Red Room Neon Badge"
              width={72}
              height={72}
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-[0_0_24px_rgba(255,26,53,0.7)] group-hover:scale-105 transition-transform duration-300"
            />
            <div className="flex flex-col items-end gap-2">
              <span className="px-3 py-1 rounded-full bg-[#FF1A35]/15 border border-[#FF1A35]/40 font-cinzel text-[11px] uppercase tracking-[0.24em] text-[#FF1A35] font-semibold">
                {one.occasion}
              </span>
              {redRoomDays && (
                <span className="px-3 py-0.5 rounded-full bg-white/10 border border-white/20 font-mono text-[10px] uppercase tracking-wider text-white font-bold">
                  {redRoomDays}
                </span>
              )}
            </div>
          </div>

          {/* Bottom: Title & Event Facts */}
          <div className="relative z-10 flex flex-col gap-3 pt-6">
            <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#FF1A35]/90 font-medium">
              {one.kicker}
            </span>

            {/* Title with slow light sweep */}
            <div className="animate-title-sweep inline-block">
              <h2 className="font-nosifer text-3xl sm:text-4xl text-[#FF1A35] tracking-wide leading-tight drop-shadow-[0_4px_24px_rgba(255,26,53,0.8)]">
                {site.home.worlds.one.name}
              </h2>
            </div>

            {/* Chips row */}
            <div className="flex flex-wrap items-center gap-2 pt-1 font-manrope text-[13px] text-white/90">
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
                {one.date}
              </span>
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
                {one.place}
              </span>
            </div>

            <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between font-cinzel text-xs uppercase tracking-[0.26em] text-[#FF1A35] group-hover:text-white transition-colors">
              <span>{site.events.cta}</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>
        </Link>

        {/* CARD 2: DHAMAAKA */}
        <Link
          href="/diwali"
          className="group relative snap-start w-full min-h-[68svh] md:min-h-[580px] rounded-[20px] overflow-hidden border border-[#E5B25D]/35 bg-[#170511] shadow-[0_16px_48px_rgba(229,178,93,0.15)] flex flex-col justify-between p-6 sm:p-8 active:scale-[0.98] transition-all duration-300 hover:border-[#E5B25D]/75"
        >
          {/* Ballroom Plate Dimmed Background */}
          <div
            className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-30 group-hover:opacity-40 transition-opacity duration-700 ease-out"
            style={{
              backgroundImage: "url('/media/dhamaaka-ballroom-plate.webp')",
              animation: "kenBurns 12s ease-in-out infinite alternate-reverse",
            }}
          />

          {/* Gold Hairline Arch Outline SVG */}
          <div className="absolute inset-4 rounded-[16px] border border-[#E5B25D]/25 pointer-events-none" />

          {/* Scrim Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0307] via-[#1B0515]/80 to-transparent pointer-events-none" />

          {/* Top: Jewelled Badge Still + Occasion Chip */}
          <div className="relative z-10 flex items-start justify-between">
            <img
              src="/media/badge-jewelled-still.webp"
              alt="DHAMAAKA Jewelled Badge"
              width={72}
              height={72}
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-[0_0_24px_rgba(229,178,93,0.7)] group-hover:scale-105 transition-transform duration-300"
            />
            <div className="flex flex-col items-end gap-2">
              <span className="px-3 py-1 rounded-full bg-[#E5B25D]/15 border border-[#E5B25D]/40 font-cinzel text-[11px] uppercase tracking-[0.24em] text-[#E5B25D] font-semibold">
                {two.occasion}
              </span>
              {diwaliDays && (
                <span className="px-3 py-0.5 rounded-full bg-white/10 border border-white/20 font-mono text-[10px] uppercase tracking-wider text-white font-bold">
                  {diwaliDays}
                </span>
              )}
            </div>
          </div>

          {/* Bottom: Title & Event Facts */}
          <div className="relative z-10 flex flex-col gap-3 pt-6">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#E5B25D]/90 font-medium">
                {two.kicker}
              </span>
              <span className="text-[#E5B25D]/50">·</span>
              <span lang="hi" className="font-tiro text-xs text-[#E5B25D]/90">
                {site.diwali.accent}
              </span>
            </div>

            {/* Title with slow light sweep */}
            <div className="animate-title-sweep inline-block">
              <h2 className="font-playfair font-black text-3xl sm:text-4xl text-[#FFF6EE] tracking-wide leading-tight drop-shadow-[0_4px_24px_rgba(224,33,122,0.6)]">
                {site.home.worlds.two.name}
              </h2>
            </div>
            <p className="font-cinzel text-[12px] sm:text-[13px] uppercase tracking-[0.26em] text-[#E5B25D]">
              {site.home.worlds.two.subtitle}
            </p>

            {/* Chips row */}
            <div className="flex flex-wrap items-center gap-2 pt-1 font-manrope text-[13px] text-white/90">
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
                {two.date}
              </span>
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
                {two.place}
              </span>
            </div>

            <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between font-cinzel text-xs uppercase tracking-[0.26em] text-[#E5B25D] group-hover:text-white transition-colors">
              <span>{site.events.cta}</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>
        </Link>
      </main>
    </div>
  );
}
