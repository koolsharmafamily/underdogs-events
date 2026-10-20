import { assetUrl } from "@/utils/assetUrl";
import { TransitionLink } from "@/ui/TransitionLink";
import React from "react";
import Image from "next/image";
import { site } from "@/content/site";
import { BadgeDomHost } from "@/ui/BadgeDomHost";
import {
  DaysToGoBadge,
  FlyerTriggerButton,
  MobileAboutRunway,
} from "./HomeClientIslands";

export function MobileHomeFeed() {
  return (
    <div className="w-full flex flex-col pt-16 pb-[calc(108px+env(safe-area-inset-bottom,0px))] text-[#FCF9FC] select-none">
      {/* 1. Hero: 3D Enamel Badge centered between Underdogs Entertainment and Gate to Rage */}
      <section className="min-h-[82svh] flex flex-col items-center justify-center px-5 pt-2 pb-8 text-center">
        {/* Presenter / Kicker Line */}
        <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-[#FCF9FC]/75 mb-2">
          {site.home.hero.label}
        </span>

        {/* 3D Enamel Badge DOM placeholder — permanently centered between kicker and title */}
        <div className="flex items-center justify-center my-2">
          <BadgeDomHost
            skin="home"
            sizeClass="w-[196px] h-[196px] sm:w-[216px] sm:h-[216px]"
            label="Underdogs Enamel Badge — tap to blink"
          />
        </div>

        {/* Copy & Primary Button below badge */}
        <div className="w-full flex flex-col items-center gap-3.5 max-w-[345px] mx-auto mt-2">
          <h1 className="font-unbounded text-[clamp(28px,7.2vw,36px)] font-black uppercase tracking-[-0.02em] text-[#FCF9FC] drop-shadow-[0_2px_14px_rgba(234,40,193,0.35)] balance-heading">
            {site.home.hero.title}
          </h1>

          <p className="font-manrope text-[15px] leading-[1.6] text-[#FCF9FC]/85 font-medium pretty-copy">
            {site.home.hero.lead}
          </p>

          <TransitionLink
            href="/events"
            className="mt-1 w-full min-h-[48px] py-3.5 px-6 rounded-sm bg-[#120710] border border-[#EA28C1]/70 text-[#FCF9FC] font-cinzel text-[12px] font-bold uppercase tracking-[0.24em] shadow-[0_6px_24px_rgba(234,40,193,0.22)] active:scale-[0.98] transition-all text-center flex items-center justify-center gap-2.5"
          >
            <span>{site.home.hero.seasonCta}</span>
            <span>→</span>
          </TransitionLink>
        </div>
      </section>

      {/* 2. "Who we are" — iPhone Liquid Glass Paging Runway */}
      <React.Suspense fallback={null}>
        <MobileAboutRunway />
      </React.Suspense>

      {/* 3. "Nights we've thrown" — Editorial Archive + Liquid Glass Pills */}
      <section className="py-12 border-t border-white/10 flex flex-col gap-4 overflow-hidden">
        <div className="px-5 flex flex-col gap-1.5">
          <span className="font-cinzel text-[11px] uppercase tracking-[0.28em] text-[#EA28C1] font-semibold">
            {site.home.nights.label}
          </span>
          <div className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-sm bg-white/[0.04] border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-[#EA28C1]" aria-hidden="true" />
            <span className="font-mono text-[11px] text-white/85 font-medium">
              {site.home.nights.latestLabel}: <strong className="text-white">{site.home.nights.latest.name}</strong> — {site.home.nights.latest.detail}
            </span>
          </div>
        </div>

        {/* Drifting Liquid Glass Lozenges row */}
        <div className="w-full overflow-x-auto no-scrollbar py-2 flex items-center">
          <div className="flex shrink-0 items-center gap-3 animate-marquee-slow px-5">
            {site.home.nights.list.concat(site.home.nights.list).map((item: string, i: number) => (
              <React.Fragment key={i}>
                <span
                  className="px-4 py-2 rounded-full font-cinzel text-[11px] uppercase tracking-[0.18em] text-white/95 whitespace-nowrap transition-transform duration-150 active:scale-95"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(255, 255, 255, 0.10) 0%, rgba(255, 255, 255, 0.03) 100%)",
                    backdropFilter: "blur(18px) saturate(180%)",
                    WebkitBackdropFilter: "blur(18px) saturate(180%)",
                    border: "1px solid rgba(255, 255, 255, 0.16)",
                    boxShadow:
                      "inset 0 1px 0.5px rgba(255, 255, 255, 0.35), 0 6px 18px rgba(0, 0, 0, 0.4)",
                  }}
                >
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

      {/* 4. "This season" — Full-Bleed Thumb-Friendly World Cards */}
      <section className="py-12 border-t border-white/10 px-5 flex flex-col gap-6">
        <div className="flex flex-col gap-1.5 text-center">
          <span className="font-cinzel text-[11px] uppercase tracking-[0.3em] text-[#EA28C1]">
            {site.home.season.label}
          </span>
          <h2 className="font-cinzel text-lg font-bold uppercase tracking-wider text-white balance-heading">
            {site.home.season.lines[0]} {site.home.season.lines[1]}
          </h2>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/60">
            {site.home.season.tagline}
          </span>
        </div>

        <div className="flex flex-col gap-5">
          {/* World 1: The Red Room */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#2A050A] to-[#120204] border border-[#FF1A35]/35 p-5 flex flex-col gap-4 shadow-xl active:scale-[0.99] transition-transform">
            {/* Optimized Flyer Backdrop behind artwork */}
            <div
              className="pointer-events-none absolute -inset-2 -z-0 opacity-16 overflow-hidden"
              style={{
                maskImage:
                  "radial-gradient(ellipse 80% 65% at 50% 30%, black 55%, transparent 95%), linear-gradient(to bottom, black 65%, transparent 100%)",
                WebkitMaskImage:
                  "radial-gradient(ellipse 80% 65% at 50% 30%, black 55%, transparent 95%), linear-gradient(to bottom, black 65%, transparent 100%)",
              }}
            >
              <Image
                src={assetUrl("/media/red-room-poster-1024.webp")}
                alt=""
                fill
                sizes="(max-width: 768px) 92vw, 420px"
                className="object-cover object-top blur-[2px]"
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
              <span className="font-cinzel text-[11px] uppercase tracking-[0.24em] text-[#FF1A35] font-semibold">
                {site.home.worlds.one.kicker} · {site.home.worlds.one.occasion}
              </span>
              <DaysToGoBadge
                isoDate={site.home.worlds.one.isoDate}
                className="px-2.5 py-0.5 rounded-full bg-[#FF1A35]/20 border border-[#FF1A35]/40 text-[#FF1A35] font-mono text-[10px] uppercase tracking-wider font-bold"
              />
            </div>

            {/* Artwork + Name in front */}
            <div className="relative z-10 pointer-events-none flex items-center gap-4">
              <Image
                src={assetUrl("/media/badge-halloween-still.webp")}
                alt="The Red Room badge"
                width={64}
                height={64}
                className="w-16 h-16 object-contain shrink-0 drop-shadow-[0_0_16px_rgba(255,26,53,0.5)]"
              />
              <div className="flex flex-col">
                <div className="relative inline-block">
                  <span className="font-nosifer text-xl text-[#FF1A35] leading-tight drop-shadow-[0_4px_16px_rgba(255,26,53,0.85)] tracking-[0.03em] uppercase">
                    {site.home.worlds.one.name}
                  </span>
                  <div aria-hidden="true" className="pointer-events-none relative h-2.5 w-full">
                    <svg className="absolute top-0 left-[22%] text-[#B80A12] rr-blood-drip" width="6" height="10" viewBox="0 0 6 10">
                      <path d="M2.5 0 C2.5 2, 2 6, 1 7 C0.5 8, 0.5 9, 3 10 C5.5 9, 5.5 8, 5 7 C4 6, 3.5 2, 3.5 0 Z" fill="currentColor" />
                    </svg>
                    <svg className="absolute top-0 left-[68%] text-[#B80A12] rr-blood-drip" width="6" height="12" viewBox="0 0 6 12" style={{ animationDelay: "0.35s" }}>
                      <path d="M2.5 0 C2.5 2, 2 8, 1 9 C0.5 10, 0.5 11, 3 12 C5.5 11, 5.5 10, 5 9 C4 8, 3.5 2, 3.5 0 Z" fill="currentColor" />
                    </svg>
                  </div>
                </div>
                <span className="font-manrope text-xs text-white/85 mt-0.5">
                  {site.home.worlds.one.date} · {site.home.worlds.one.place}
                </span>
              </div>
            </div>

            {/* Bottom Row: 44px+ "View official flyer" + CTA */}
            <div className="relative z-20 pt-2 border-t border-white/10 flex items-center justify-between">
              <FlyerTriggerButton
                world="redroom"
                className="pointer-events-auto min-h-[44px] px-1 inline-flex items-center font-cinzel text-[11px] uppercase tracking-[0.22em] text-[#FF968B]/85 hover:text-[#FF1A35] active:text-[#FF1A35] transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#FF1A35]"
              />
              <div className="pointer-events-none min-h-[44px] inline-flex items-center gap-1.5 text-xs font-cinzel uppercase tracking-widest text-[#FF1A35] group-hover:text-white transition-colors">
                <span>{site.home.worlds.one.cta}</span>
                <span>→</span>
              </div>
            </div>
          </div>

          {/* World 2: DHAMAAKA */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#2B0E1B] to-[#10040B] border border-[#E5B25D]/35 p-5 flex flex-col gap-4 shadow-xl active:scale-[0.99] transition-transform">
            {/* Optimized Flyer Backdrop behind artwork */}
            <div
              className="pointer-events-none absolute -inset-2 -z-0 opacity-16 overflow-hidden"
              style={{
                maskImage:
                  "radial-gradient(ellipse 80% 65% at 50% 30%, black 55%, transparent 95%), linear-gradient(to bottom, black 65%, transparent 100%)",
                WebkitMaskImage:
                  "radial-gradient(ellipse 80% 65% at 50% 30%, black 55%, transparent 95%), linear-gradient(to bottom, black 65%, transparent 100%)",
              }}
            >
              <Image
                src={assetUrl("/media/dhamaaka-flyer-1024.webp")}
                alt=""
                fill
                sizes="(max-width: 768px) 92vw, 420px"
                className="object-cover object-top blur-[2px]"
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
              <span className="font-cinzel text-[11px] uppercase tracking-[0.24em] text-[#E5B25D] font-semibold">
                {site.home.worlds.two.kicker} · {site.home.worlds.two.occasion}
              </span>
              <DaysToGoBadge
                isoDate={site.home.worlds.two.isoDate}
                className="px-2.5 py-0.5 rounded-full bg-[#E5B25D]/20 border border-[#E5B25D]/40 text-[#E5B25D] font-mono text-[10px] uppercase tracking-wider font-bold"
              />
            </div>

            {/* Artwork + Name in front */}
            <div className="relative z-10 pointer-events-none flex items-center gap-4">
              <Image
                src={assetUrl("/media/badge-jewelled-still.webp")}
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
                <span className="font-manrope text-xs text-white/85 mt-1">
                  {site.home.worlds.two.date} · {site.home.worlds.two.place}
                </span>
              </div>
            </div>

            {/* Bottom Row: 44px+ "View official flyer" + CTA */}
            <div className="relative z-20 pt-2 border-t border-white/10 flex items-center justify-between">
              <FlyerTriggerButton
                world="diwali"
                className="pointer-events-auto min-h-[44px] px-1 inline-flex items-center font-cinzel text-[11px] uppercase tracking-[0.22em] text-[#E5B25D]/85 hover:text-[#FFE3A3] active:text-[#FFE3A3] transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#E5B25D]"
              />
              <div className="pointer-events-none min-h-[44px] inline-flex items-center gap-1.5 text-xs font-cinzel uppercase tracking-widest text-[#E5B25D] group-hover:text-white transition-colors">
                <span>{site.home.worlds.two.cta}</span>
                <span>→</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Footer Line & Social */}
      <footer className="pt-8 pb-4 text-center border-t border-white/10 px-5 flex flex-col items-center gap-2">
        <span className="font-cinzel text-xs uppercase tracking-[0.24em] text-white/70 font-semibold">
          {site.brand.name} · {site.brand.city}
        </span>
        <span className="font-mono text-[11px] tracking-[0.08em] text-[var(--world-muted)]">
          {site.footer.instagram}
        </span>
      </footer>
    </div>
  );
}
