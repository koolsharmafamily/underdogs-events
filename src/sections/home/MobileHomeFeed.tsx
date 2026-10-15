"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { site } from "@/content/site";
import { BadgeDomHost } from "@/ui/BadgeDomHost";
import { getDaysToGo } from "@/utils/date";

export function MobileHomeFeed() {
  const [activeDot, setActiveDot] = useState(0);
  const swipeContainerRef = useRef<HTMLDivElement>(null);

  // Track swipe card position for dot indicators
  const handleScroll = () => {
    if (!swipeContainerRef.current) return;
    const scrollLeft = swipeContainerRef.current.scrollLeft;
    const cardWidth = swipeContainerRef.current.offsetWidth * 0.86;
    const index = Math.round(scrollLeft / cardWidth);
    setActiveDot(Math.min(2, Math.max(0, index)));
  };

  const redRoomDays = getDaysToGo("2026-10-24");
  const diwaliDays = getDaysToGo("2026-11-07");

  return (
    <div className="w-full flex flex-col pt-16 pb-28 text-[#FCF9FC] select-none">
      {/* 1. Hero: 3D Enamel Badge + Gate to Rage */}
      <section className="min-h-[82svh] flex flex-col items-center justify-between px-6 pt-4 pb-10 text-center">
        {/* Badge centered in upper half */}
        <div className="my-auto flex flex-col items-center">
          <BadgeDomHost
            skin="home"
            sizeClass="w-[210px] h-[210px]"
            label="Underdogs Enamel Badge — tap to blink"
          />
        </div>

        {/* Copy & Primary Button below badge */}
        <div className="w-full flex flex-col items-center gap-4 max-w-[340px] mx-auto">
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#FCF9FC]/70">
            {site.home.hero.label}
          </span>

          <h1 className="font-cinzel text-3xl font-extrabold uppercase tracking-[0.16em] text-[#EA28C1] drop-shadow-[0_2px_16px_rgba(234,40,193,0.35)]">
            {site.home.hero.title}
          </h1>

          <p className="font-manrope text-[15px] leading-relaxed text-[#FCF9FC]/85 font-medium">
            {site.home.hero.lead}
          </p>

          <Link
            href="/events"
            className="mt-2 w-full py-3.5 px-6 rounded-full bg-[#EA28C1] text-[#07090D] font-cinzel text-[13px] font-bold uppercase tracking-[0.22em] shadow-[0_8px_24px_rgba(234,40,193,0.35)] active:scale-95 transition-transform text-center"
          >
            Explore this season →
          </Link>
        </div>
      </section>

      {/* 2. "Who we are" — Swipeable Cards */}
      <section className="py-12 border-t border-white/10 flex flex-col gap-6">
        <div className="px-6 flex flex-col gap-1">
          <span className="font-cinzel text-[11px] uppercase tracking-[0.3em] text-[#EA28C1]">
            About Us
          </span>
          <h2 className="font-cinzel text-xl font-bold uppercase tracking-wider text-white">
            {site.home.about.label}
          </h2>
        </div>

        {/* Swipeable Statement Cards */}
        <div
          ref={swipeContainerRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-mandatory px-6 gap-4 no-scrollbar"
        >
          {site.home.about.statements.map((stmt: string, idx: number) => (
            <div
              key={idx}
              className="snap-center shrink-0 w-[84vw] max-w-[320px] p-6 rounded-2xl bg-[#0F131C] border border-white/10 flex flex-col gap-3 shadow-lg"
            >
              <span className="font-mono text-xs uppercase tracking-widest text-[#EA28C1]/80 font-bold">
                0{idx + 1}
              </span>
              <p className="font-cinzel text-base font-bold leading-snug tracking-wide text-white">
                {stmt}
              </p>
            </div>
          ))}
        </div>

        {/* 3-Dot Indicator */}
        <div className="flex justify-center items-center gap-2 pt-1" aria-hidden="true">
          {[0, 1, 2].map((dot) => (
            <span
              key={dot}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                activeDot === dot ? "w-6 bg-[#EA28C1]" : "w-1.5 bg-white/20"
              }`}
            />
          ))}
        </div>

        {/* Body Paragraph */}
        <div className="px-6 pt-2">
          <p className="font-manrope text-sm leading-relaxed text-[#FCF9FC]/75 font-normal">
            {site.home.about.body}
          </p>
        </div>
      </section>

      {/* 3. "Nights we've thrown" — Auto-drifting Chip Row */}
      <section className="py-10 border-t border-white/10 flex flex-col gap-4 overflow-hidden">
        <div className="px-6 flex flex-col gap-1">
          <span className="font-cinzel text-[11px] uppercase tracking-[0.28em] text-[#EA28C1]">
            {site.home.nights.label}
          </span>
          <span className="font-manrope text-xs text-white/70 font-medium">
            Latest: {site.home.nights.latest.name} — {site.home.nights.latest.detail}
          </span>
        </div>

        {/* Drifting Chips row */}
        <div className="w-full overflow-x-auto no-scrollbar py-2 flex items-center">
          <div className="flex shrink-0 items-center gap-3 animate-marquee-slow px-4">
            {site.home.nights.list.concat(site.home.nights.list).map((item: string, i: number) => (
              <React.Fragment key={i}>
                <span className="px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 font-cinzel text-xs uppercase tracking-wider text-white/90 whitespace-nowrap">
                  {item}
                </span>
                <span className="text-[#EA28C1]/60 font-bold text-xs" aria-hidden="true">
                  ✕
                </span>
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* 4. "This season" — Compact Event Cards */}
      <section className="py-12 border-t border-white/10 px-6 flex flex-col gap-6">
        <div className="flex flex-col gap-2 text-center">
          <span className="font-cinzel text-[11px] uppercase tracking-[0.3em] text-[#EA28C1]">
            This Season
          </span>
          <h2 className="font-cinzel text-lg font-bold uppercase tracking-wider text-white">
            Two Worlds · Two Celebrations
          </h2>
        </div>

        <div className="flex flex-col gap-5">
          {/* Compact Card 1: The Red Room */}
          <Link
            href="/the-red-room"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#2A050A] to-[#120204] border border-[#FF1A35]/30 p-5 flex flex-col gap-4 shadow-xl active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center justify-between">
              <span className="font-cinzel text-[11px] uppercase tracking-[0.24em] text-[#FF1A35]">
                {site.home.worlds.one.occasion}
              </span>
              {redRoomDays !== null && (
                <span className="px-2.5 py-0.5 rounded-full bg-[#FF1A35]/20 border border-[#FF1A35]/40 text-[#FF1A35] font-mono text-[10px] uppercase tracking-wider font-bold">
                  {redRoomDays} days to go
                </span>
              )}
            </div>

            <div className="flex items-center gap-4">
              <img
                src="/media/badge-neon-still.webp"
                alt="The Red Room Neon Badge"
                width={64}
                height={64}
                className="w-16 h-16 object-contain shrink-0 drop-shadow-[0_0_16px_rgba(255,26,53,0.5)]"
              />
              <div className="flex flex-col">
                <span className="font-nosifer text-xl text-[#FF1A35] leading-tight">
                  {site.home.worlds.one.name}
                </span>
                <span className="font-manrope text-xs text-white/80 mt-1">
                  {site.home.worlds.one.date} · {site.home.worlds.one.place}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-cinzel uppercase tracking-widest text-[#FF1A35] group-hover:text-white transition-colors">
              <span>Enter The Red Room</span>
              <span>→</span>
            </div>
          </Link>

          {/* Compact Card 2: DHAMAAKA */}
          <Link
            href="/diwali"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#2B0E1B] to-[#10040B] border border-[#E5B25D]/35 p-5 flex flex-col gap-4 shadow-xl active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center justify-between">
              <span className="font-cinzel text-[11px] uppercase tracking-[0.24em] text-[#E5B25D]">
                {site.home.worlds.two.occasion}
              </span>
              {diwaliDays !== null && (
                <span className="px-2.5 py-0.5 rounded-full bg-[#E5B25D]/20 border border-[#E5B25D]/40 text-[#E5B25D] font-mono text-[10px] uppercase tracking-wider font-bold">
                  {diwaliDays} days to go
                </span>
              )}
            </div>

            <div className="flex items-center gap-4">
              <img
                src="/media/badge-jewelled-still.webp"
                alt="DHAMAAKA Jewelled Badge"
                width={64}
                height={64}
                className="w-16 h-16 object-contain shrink-0 drop-shadow-[0_0_16px_rgba(229,178,93,0.5)]"
              />
              <div className="flex flex-col">
                <span className="font-playfair font-black text-xl text-[#FFF6EE] leading-tight">
                  {site.home.worlds.two.name}
                </span>
                <span className="font-cinzel text-[10px] uppercase tracking-wider text-[#E5B25D]/90">
                  {site.home.worlds.two.subtitle}
                </span>
                <span className="font-manrope text-xs text-white/80 mt-1">
                  {site.home.worlds.two.date} · {site.home.worlds.two.place}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-cinzel uppercase tracking-widest text-[#E5B25D] group-hover:text-white transition-colors">
              <span>Enter DHAMAAKA</span>
              <span>→</span>
            </div>
          </Link>
        </div>
      </section>

      {/* 5. Footer Line & Social */}
      <footer className="pt-8 pb-4 text-center border-t border-white/10 px-6 flex flex-col items-center gap-2">
        <span className="font-cinzel text-xs uppercase tracking-[0.24em] text-white/60 font-semibold">
          {site.brand.name} · {site.brand.city}
        </span>
        <a
          href="https://instagram.com/underdogsnagpur"
          target="_blank"
          rel="noopener noreferrer"
          className="font-manrope text-xs text-[#EA28C1] tracking-wider hover:underline"
        >
          @underdogsnagpur
        </a>
      </footer>
    </div>
  );
}
