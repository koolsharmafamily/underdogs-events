"use client";

import { TransitionLink } from "@/ui/TransitionLink";
import React, { useRef, useState } from "react";
import { site } from "@/content/site";
import { BadgeDomHost } from "@/ui/BadgeDomHost";
import { useDaysToGo } from "@/utils/useDaysToGo";
import { OfficialFlyerLightbox } from "@/ui/OfficialFlyerLightbox";

export function MobileHomeFeed() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeFlyer, setActiveFlyer] = useState<"redroom" | "diwali" | null>(null);
  const swipeContainerRef = useRef<HTMLDivElement>(null);

  // Track smooth liquid scroll progress across statements
  const handleScroll = () => {
    if (!swipeContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = swipeContainerRef.current;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll > 0) {
      setScrollProgress(Math.min(1, Math.max(0, scrollLeft / maxScroll)));
    }
  };

  const redRoomDays = useDaysToGo(site.home.worlds.one.isoDate);
  const diwaliDays = useDaysToGo(site.home.worlds.two.isoDate);

  return (
    <div className="w-full flex flex-col pt-16 pb-[calc(108px+env(safe-area-inset-bottom,0px))] text-[#FCF9FC] select-none">
      {/* 1. Hero: 3D Enamel Badge + Gate to Rage */}
      <section className="min-h-[84svh] flex flex-col items-center justify-between px-6 pt-2 pb-10 text-center">
        {/* Presenter / Kicker Line matching Red Room & Diwali */}
        <div className="my-auto flex flex-col items-center gap-2">
          <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-[#FCF9FC]/70">
            {site.home.hero.label}
          </span>
          <div className="flex items-center justify-center my-2 sm:my-4">
            <BadgeDomHost
              skin="home"
              sizeClass="w-[200px] h-[200px] sm:w-[230px] sm:h-[230px]"
              label="Underdogs Enamel Badge — tap to blink"
            />
          </div>
        </div>

        {/* Copy & Primary Button below badge */}
        <div className="w-full flex flex-col items-center gap-4 max-w-[340px] mx-auto mt-2">
          <h1 className="font-unbounded text-[clamp(28px,7vw,36px)] font-black uppercase tracking-[-0.02em] text-[#FCF9FC] drop-shadow-[0_2px_14px_rgba(234,40,193,0.35)]">
            {site.home.hero.title}
          </h1>

          <p className="font-manrope text-[15px] leading-relaxed text-[#FCF9FC]/85 font-medium">
            {site.home.hero.lead}
          </p>

          <TransitionLink
            href="/events"
            className="mt-2 w-full py-4 px-6 rounded-sm bg-[#120710] border border-[#EA28C1]/70 text-[#FCF9FC] font-cinzel text-[12px] font-bold uppercase tracking-[0.24em] shadow-[0_6px_24px_rgba(234,40,193,0.22)] active:scale-[0.98] transition-all text-center flex items-center justify-center gap-2.5"
          >
            <span>{site.home.hero.seasonCta}</span>
            <span>→</span>
          </TransitionLink>
        </div>
      </section>

      {/* 2. "Who we are" — Smooth Liquid Glass Runway */}
      <section className="py-12 border-t border-white/10 flex flex-col gap-6">
        <div className="px-6 flex flex-col gap-1">
          <h2 className="font-cinzel text-xl font-bold uppercase tracking-wider text-white">
            {site.home.about.label}
          </h2>
        </div>

        {/* Smooth Liquid Glass Scrolling Runway */}
        <div
          ref={swipeContainerRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto no-scrollbar px-6 gap-3.5 scroll-smooth overscroll-x-contain touch-pan-x"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {site.home.about.statements.map((stmt: string, idx: number) => (
            <div
              key={idx}
              className="group relative shrink-0 w-[78vw] max-w-[310px] p-6 rounded-3xl backdrop-blur-xl bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-white/[0.01] border border-white/[0.14] shadow-[0_12px_40px_rgba(0,0,0,0.45),inset_0_1px_1px_rgba(255,255,255,0.2)] overflow-hidden flex flex-col justify-between gap-5 transition-all duration-300 active:scale-[0.99]"
            >
              {/* Liquid glass specular highlights & iridescent neon blur */}
              <div
                className="pointer-events-none absolute -top-10 -right-10 w-28 h-28 rounded-full bg-gradient-to-br from-[#EA28C1]/20 to-transparent blur-2xl"
                aria-hidden="true"
              />
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/35 to-transparent"
                aria-hidden="true"
              />

              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#EA28C1] font-semibold">
                  0{idx + 1}
                </span>
                <span
                  className="w-1.5 h-1.5 rounded-full bg-[#EA28C1]/60 shadow-[0_0_8px_#EA28C1]"
                  aria-hidden="true"
                />
              </div>

              <p className="font-cinzel text-[15px] sm:text-base font-bold leading-relaxed tracking-wide text-[#FCF9FC] drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                {stmt}
              </p>

              <div
                className="w-8 h-[1px] bg-white/20 group-hover:w-12 group-hover:bg-[#EA28C1]/60 transition-all duration-300"
                aria-hidden="true"
              />
            </div>
          ))}
        </div>

        {/* Liquid Glass Scroll Progress Pill */}
        <div className="flex justify-center items-center pt-1" aria-hidden="true">
          <div className="w-16 h-1 rounded-full bg-white/10 overflow-hidden relative backdrop-blur-sm">
            <div
              className="h-full w-6 rounded-full bg-gradient-to-r from-[#EA28C1] to-[#FF77DC] shadow-[0_0_8px_rgba(234,40,193,0.6)] transition-transform duration-75 ease-out will-change-transform"
              style={{
                transform: `translateX(${scrollProgress * 40}px)`,
              }}
            />
          </div>
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
            {site.home.nights.latestLabel}: {site.home.nights.latest.name} — {site.home.nights.latest.detail}
          </span>
        </div>

        {/* Drifting Chips row */}
        <div className="w-full overflow-x-auto no-scrollbar py-2 flex items-center">
          <div className="flex shrink-0 items-center gap-3 animate-marquee-slow px-4">
            {site.home.nights.list.concat(site.home.nights.list).map((item: string, i: number) => (
              <React.Fragment key={i}>
                <span className="px-3.5 py-1.5 rounded-sm bg-white/5 border border-white/10 font-cinzel text-xs uppercase tracking-wider text-white/90 whitespace-nowrap">
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
            {site.home.season.label}
          </span>
          <h2 className="font-cinzel text-lg font-bold uppercase tracking-wider text-white">
            {site.home.season.lines[0]} {site.home.season.lines[1]}
          </h2>
        </div>

        <div className="flex flex-col gap-5">
          {/* World 1: The Red Room */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#2A050A] to-[#120204] border border-[#FF1A35]/30 p-5 flex flex-col gap-4 shadow-xl active:scale-[0.99] transition-transform">
            {/* CSS Flyer Backdrop behind artwork */}
            <div
              className="pointer-events-none absolute -inset-2 -z-0 opacity-14 overflow-hidden"
              style={{
                maskImage:
                  "radial-gradient(ellipse 80% 65% at 50% 30%, black 55%, transparent 95%), linear-gradient(to bottom, black 65%, transparent 100%)",
                WebkitMaskImage:
                  "radial-gradient(ellipse 80% 65% at 50% 30%, black 55%, transparent 95%), linear-gradient(to bottom, black 65%, transparent 100%)",
              }}
            >
              <img
                src="/media/red-room-poster-1024.webp"
                alt=""
                className="w-full h-full object-cover object-top blur-[2px]"
              />
              <div className="absolute inset-0 bg-[#3A0504] mix-blend-color opacity-60" />
            </div>

            {/* Whole tile link */}
            <TransitionLink
              href="/the-red-room"
              className="absolute inset-0 z-10"
              aria-label={`Explore ${site.home.worlds.one.name} — ${site.home.worlds.one.occasion}`}
            />

            {/* Header info */}
            <div className="relative z-10 pointer-events-none flex items-center justify-between">
              <span className="font-cinzel text-[11px] uppercase tracking-[0.24em] text-[#FF1A35]">
                {site.home.worlds.one.occasion}
              </span>
              {redRoomDays && (
                <span className="px-2.5 py-0.5 rounded-full bg-[#FF1A35]/20 border border-[#FF1A35]/40 text-[#FF1A35] font-mono text-[10px] uppercase tracking-wider font-bold">
                  {redRoomDays}
                </span>
              )}
            </div>

            {/* Artwork + Name in front */}
            <div className="relative z-10 pointer-events-none flex items-center gap-4">
              <img
                src="/media/badge-halloween-still.webp"
                alt="The Red Room badge"
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

            {/* Bottom Row: Quiet "View official flyer" + CTA */}
            <div className="relative z-20 pt-2 border-t border-white/10 flex items-center justify-between">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setActiveFlyer("redroom");
                }}
                className="pointer-events-auto font-cinzel text-[11px] uppercase tracking-[0.24em] text-[#FF1A35]/70 hover:text-[#FF1A35] active:text-[#FF1A35] transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#FF1A35]"
              >
                View official flyer
              </button>
              <div className="pointer-events-none flex items-center gap-1.5 text-xs font-cinzel uppercase tracking-widest text-[#FF1A35] group-hover:text-white transition-colors">
                <span>{site.home.worlds.one.cta}</span>
                <span>→</span>
              </div>
            </div>
          </div>

          {/* World 2: DHAMAAKA */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#2B0E1B] to-[#10040B] border border-[#E5B25D]/35 p-5 flex flex-col gap-4 shadow-xl active:scale-[0.99] transition-transform">
            {/* CSS Flyer Backdrop behind artwork */}
            <div
              className="pointer-events-none absolute -inset-2 -z-0 opacity-14 overflow-hidden"
              style={{
                maskImage:
                  "radial-gradient(ellipse 80% 65% at 50% 30%, black 55%, transparent 95%), linear-gradient(to bottom, black 65%, transparent 100%)",
                WebkitMaskImage:
                  "radial-gradient(ellipse 80% 65% at 50% 30%, black 55%, transparent 95%), linear-gradient(to bottom, black 65%, transparent 100%)",
              }}
            >
              <img
                src="/media/dhamaaka-flyer-1024.webp"
                alt=""
                className="w-full h-full object-cover object-top blur-[2px]"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-[#E0217A] to-[#E5B25D] mix-blend-color opacity-50" />
            </div>

            {/* Whole tile link */}
            <TransitionLink
              href="/diwali"
              className="absolute inset-0 z-10"
              aria-label={`Explore ${site.home.worlds.two.name} — ${site.home.worlds.two.subtitle}`}
            />

            {/* Header info */}
            <div className="relative z-10 pointer-events-none flex items-center justify-between">
              <span className="font-cinzel text-[11px] uppercase tracking-[0.24em] text-[#E5B25D]">
                {site.home.worlds.two.occasion}
              </span>
              {diwaliDays && (
                <span className="px-2.5 py-0.5 rounded-full bg-[#E5B25D]/20 border border-[#E5B25D]/40 text-[#E5B25D] font-mono text-[10px] uppercase tracking-wider font-bold">
                  {diwaliDays}
                </span>
              )}
            </div>

            {/* Artwork + Name in front */}
            <div className="relative z-10 pointer-events-none flex items-center gap-4">
              <img
                src="/media/badge-jewelled-still.webp"
                alt="DHAMAAKA Jewelled Badge"
                width={64}
                height={64}
                className="w-16 h-16 object-contain shrink-0 drop-shadow-[0_0_16px_rgba(229,178,93,0.5)]"
              />
              <div className="flex flex-col">
                <span className="font-playfair font-black text-2xl leading-tight bg-gradient-to-r from-[#FFE3A3] via-[#E0217A] to-[#FF70DE] bg-clip-text text-transparent drop-shadow-[0_2px_14px_rgba(224,33,122,0.65)] tracking-wide">
                  {site.home.worlds.two.name}
                </span>
                <span className="font-cinzel text-[10px] uppercase tracking-wider text-[#E5B25D]/90 mt-0.5">
                  {site.home.worlds.two.subtitle}
                </span>
                <span className="font-manrope text-xs text-white/80 mt-1">
                  {site.home.worlds.two.date} · {site.home.worlds.two.place}
                </span>
              </div>
            </div>

            {/* Bottom Row: Quiet "View official flyer" + CTA */}
            <div className="relative z-20 pt-2 border-t border-white/10 flex items-center justify-between">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setActiveFlyer("diwali");
                }}
                className="pointer-events-auto font-cinzel text-[11px] uppercase tracking-[0.24em] text-[#E5B25D]/70 hover:text-[#FFE3A3] active:text-[#FFE3A3] transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#E5B25D]"
              >
                View official flyer
              </button>
              <div className="pointer-events-none flex items-center gap-1.5 text-xs font-cinzel uppercase tracking-widest text-[#E5B25D] group-hover:text-white transition-colors">
                <span>{site.home.worlds.two.cta}</span>
                <span>→</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Official Flyer Lightbox Modal (Full-screen sheet on mobile) */}
      <OfficialFlyerLightbox
        isOpen={activeFlyer !== null}
        onClose={() => setActiveFlyer(null)}
        flyer={
          activeFlyer === "redroom"
            ? {
                src: "/media/red-room-poster.webp",
                alt: "The Red Room — Official Halloween Poster",
                title: site.home.worlds.one.name,
                subtitle: `${site.home.worlds.one.occasion} · ${site.home.worlds.one.date}`,
                world: "redroom",
              }
            : activeFlyer === "diwali"
              ? {
                  src: "/media/dhamaaka-flyer.webp",
                  alt: "DHAMAAKA — Official Premiere Flyer",
                  title: site.home.worlds.two.name,
                  subtitle: `${site.home.worlds.two.occasion} · ${site.home.worlds.two.date}`,
                  world: "diwali",
                }
              : null
        }
      />

      {/* 5. Footer Line & Social */}
      <footer className="pt-8 pb-4 text-center border-t border-white/10 px-6 flex flex-col items-center gap-2">
        <span className="font-cinzel text-xs uppercase tracking-[0.24em] text-white/60 font-semibold">
          {site.brand.name} · {site.brand.city}
        </span>
        {/* Plain text by rule: the site links nowhere outside itself. */}
        <span className="font-mono text-[11px] tracking-[0.08em] text-[var(--world-muted)]">
          {site.footer.instagram}
        </span>
      </footer>
    </div>
  );
}
