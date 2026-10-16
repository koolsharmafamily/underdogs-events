"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { site } from "@/content/site";
import { frame } from "@/state/frame";
import { useStore } from "@/state/store";
import { useSceneProgress } from "@/motion/useSceneProgress";
import { useLineReveal } from "@/motion/useLineReveal";
import { useEnterTransition } from "@/motion/transitions";
import { BadgeDomHost } from "@/ui/BadgeDomHost";
import { Marquee } from "@/ui/Marquee";
import { TransitionLink } from "@/ui/TransitionLink";
import { Footer } from "@/ui/Footer";
import { DomTwins } from "@/webgl/tracking/DomTwins";
import { MobileHomeFeed } from "./MobileHomeFeed";
import { OfficialFlyerLightbox } from "@/ui/OfficialFlyerLightbox";

export function HomeView() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  useLineReveal(titleRef, { triggerOnMount: true, delay: .18 });
  const motionEnabled = useStore((s) => s.motionEnabled);
  const hoverDoor = useStore((s) => s.hoverDoor);
  const setHoverDoor = useStore((s) => s.setHoverDoor);
  const setWorld = useStore((s) => s.setWorld);
  const tier = useStore((s) => s.tier);
  const isFallbackTier = tier === "T0" || tier === "T1";

  useEnterTransition("home");

  useEffect(() => {
    setWorld("home");
    document.documentElement.setAttribute("data-world", "home");
  }, [setWorld]);

  const h1Ref = useRef<HTMLElement>(null);
  const h2Ref = useRef<HTMLElement>(null);
  const h5Ref = useRef<HTMLElement>(null);

  useSceneProgress("H1", h1Ref);
  useSceneProgress("H2", h2Ref);
  useSceneProgress("H5", h5Ref);

  const [activeFlyer, setActiveFlyer] = useState<"redroom" | "diwali" | null>(null);

  const [heroTextVisible, setHeroTextVisible] = useState(true);
  const [activeStatement, setActiveStatement] = useState(0);
  const [showAboutBody, setShowAboutBody] = useState(false);

  useEffect(() => {
    if (!motionEnabled) {
      setHeroTextVisible(true);
      setActiveStatement(0);
      setShowAboutBody(true);
      return;
    }

    const prev = {
      heroText: true,
      stmt: 0,
      about: false,
    };

    const onTick = () => {
      const p1 = frame.progress.H1 ?? 0;
      // Part 7 H1: hero text exits as a one-shot at 90%, returns when user scrolls back above 85% (hysteresis)
      if (p1 > 0.9 && prev.heroText) {
        prev.heroText = false;
        setHeroTextVisible(false);
      } else if (p1 < 0.85 && !prev.heroText) {
        prev.heroText = true;
        setHeroTextVisible(true);
      }

      const p2 = frame.linearProgress.H2 ?? 0;
      const nextStmt = p2 < 0.34 ? 0 : p2 < 0.67 ? 1 : 2;
      const nextAbout = p2 >= 0.67;
      if (nextStmt !== prev.stmt) {
        prev.stmt = nextStmt;
        setActiveStatement(nextStmt);
      }
      if (nextAbout !== prev.about) {
        prev.about = nextAbout;
        setShowAboutBody(nextAbout);
      }
    };

    gsap.ticker.add(onTick);
    return () => {
      gsap.ticker.remove(onTick);
    };
  }, [motionEnabled]);

  return (
    <main id="main-content" className="relative z-10">
      {/* Mobile App Feed (< 768px) */}
      <div className="block md:hidden">
        <MobileHomeFeed />
      </div>

      {/* Desktop & Tablet Stages (≥ 768px) — Untouched */}
      <div className="hidden md:block">
        {/* H1 · Hero, "Gate to Rage" (120vh desktop, ×0.85 mobile, pinned) */}
        <section
          ref={h1Ref}
          data-scene="H1"
          aria-label={site.home.hero.title}
          className="scene-section scene-h1"
        >
        <div className="scene-sticky flex items-center">
          <div className="site-container site-grid w-full h-full items-center">
            {/* Mobile badge in upper 55%, Desktop badge on right centred at 62% width */}
            <div className="col-span-4 md:col-span-4 lg:col-span-6 lg:col-start-7 order-1 lg:order-2 flex flex-col items-center justify-center pt-16 lg:pt-0">
              <BadgeDomHost
                skin="home"
                sizeClass="w-[210px] h-[210px] sm:w-[280px] sm:h-[280px] lg:w-[440px] lg:h-[440px]"
                label="Underdogs Enamel Badge — click or press Enter to blink"
              />
            </div>

            {/* Copy occupies columns 1–6, strictly confined to left half on desktop */}
            <div
              className={`col-span-4 md:col-span-4 lg:col-span-6 lg:col-start-1 order-2 lg:order-1 max-w-[560px] flex flex-col justify-end lg:self-center lg:py-24 gap-5 transition-all ${
                heroTextVisible || !motionEnabled
                  ? "duration-[650ms] opacity-100 translate-y-0"
                  : "duration-[350ms] opacity-0 -translate-y-8 pointer-events-none"
              }`}
            >
              <p className="font-mono text-[13px] sm:text-[14px] uppercase tracking-[0.14em] font-medium text-[var(--paper)]/85 flex items-center gap-2.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--world-accent)] shadow-[0_0_8px_var(--world-accent)]" aria-hidden="true" />
                {site.home.hero.label}
              </p>

              <h1 ref={titleRef} className="font-unbounded text-[clamp(34px,4.6vw,76px)] leading-[0.96] tracking-[-0.025em] font-extrabold uppercase text-[var(--paper)] balance-heading">
                <span className="sr-only">{site.brand.name} — </span>
                {site.home.hero.title}
              </h1>

              <p className="font-manrope text-lead text-[var(--paper)]/90 measure-copy pretty-copy">
                {site.home.hero.lead}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* H2 · Who we are + Nights we've thrown (Merged Section 2 & 3) */}
      <section
        ref={h2Ref}
        data-scene="H2"
        aria-labelledby="home-about-label"
        className="scene-section scene-h2 min-h-screen"
      >
        <div className="scene-sticky flex flex-col justify-between pt-20 pb-6 md:pt-24 md:pb-8">
          <div className="site-container flex items-center justify-between">
            <h2
              id="home-about-label"
              className="font-mono text-[12px] uppercase tracking-[0.08em] text-[var(--steel)]"
            >
              {site.home.about.label}
            </h2>
          </div>

          <div className="site-container site-grid my-auto items-center pb-4 md:pb-0">
            {/* Strictly left half (columns 1–6, max 560px) so text never crosses into the 3D badge on the right */}
            <div className="col-span-4 md:col-span-4 lg:col-span-6 lg:col-start-1 max-w-[560px] pr-2 lg:pr-6 flex flex-col gap-6">
              {!motionEnabled ? (
                <div className="flex flex-col gap-3.5 sm:gap-4">
                  {site.home.about.statements.map((stmt) => (
                    <p
                      key={stmt}
                      className="font-unbounded text-[clamp(17px,1.9vw,26px)] leading-[1.2] tracking-[-0.02em] font-extrabold uppercase text-[var(--paper)] balance-heading"
                    >
                      {stmt}
                    </p>
                  ))}
                </div>
              ) : (
                <div className="relative min-h-[120px] sm:min-h-[180px] lg:min-h-[210px] flex items-end md:items-center">
                  {site.home.about.statements.map((stmt, idx) => {
                    const isCurrent = idx === activeStatement;
                    const isPast = idx < activeStatement;
                    return (
                      <p
                        key={stmt}
                        aria-hidden={!isCurrent}
                        className={`font-unbounded text-[clamp(22px,2.7vw,42px)] leading-[1.12] tracking-[-0.02em] font-extrabold uppercase text-[var(--paper)] balance-heading transition-all ${
                          isCurrent
                            ? "duration-[650ms] relative opacity-100 translate-y-0"
                            : isPast
                              ? "duration-[350ms] pointer-events-none absolute inset-x-0 opacity-0 -translate-y-10"
                              : "duration-[350ms] pointer-events-none absolute inset-x-0 opacity-0 translate-y-10"
                        }`}
                      >
                        {stmt}
                      </p>
                    );
                  })}
                </div>
              )}

              <p
                className={`font-manrope text-sm sm:text-base lg:text-lead text-[var(--paper)]/85 max-w-[52ch] pretty-copy transition-opacity duration-500 ${
                  showAboutBody || !motionEnabled ? "opacity-100" : "opacity-85"
                }`}
              >
                {site.home.about.body}
              </p>
            </div>

            {/* Badge stage representation for H2 strictly in right half (columns 7–12) */}
            <div className="hidden md:flex md:col-span-4 lg:col-span-6 lg:col-start-7 items-center justify-center">
              <div
                className="flex flex-col items-center gap-3 transition-transform duration-700"
                style={{
                  transform:
                    activeStatement === 0
                      ? "perspective(800px) rotateY(72deg)"
                      : activeStatement === 1
                        ? "perspective(800px) rotateY(180deg)"
                        : "perspective(800px) rotateY(0deg)",
                }}
              >
                <BadgeDomHost
                  skin="home"
                  sizeClass="w-[220px] h-[220px] lg:w-[300px] lg:h-[300px]"
                  label="Underdogs Badge choreography preview"
                />
              </div>
            </div>
          </div>

          {/* Bottom part of Section 2: Moving events bar from Section 3 */}
          <div className="w-full pt-4 border-t border-[var(--paper)]/15 overflow-hidden">
            <Marquee items={site.home.nights.list} />
          </div>
        </div>
      </section>

      {/* H5 · The doors (Hero Climax: Doors with Ghosted Flyer Backdrops) */}
      <section
        ref={h5Ref}
        data-scene="H5"
        aria-label={site.home.worlds.label}
        className="scene-section scene-h5"
      >
        {/* DOM Twins for screen-projected keyboard & hover interaction */}
        <DomTwins />

        {/* Sticky viewport container: Season Intro at top, Doors in center, Captions at bottom */}
        <div className="scene-sticky-desktop relative z-[21] pointer-events-none flex flex-col justify-between pt-12 pb-8 lg:pt-12 lg:pb-10">
          <h2 className="sr-only">{site.home.worlds.label}</h2>

          {/* Season intro header moved from H4 */}
          <div className="site-container flex flex-col items-center text-center gap-1.5 max-w-[720px] mx-auto pointer-events-auto">
            <span className="font-mono text-[11px] sm:text-[12px] uppercase tracking-[0.24em] text-[var(--steel)]">
              {site.home.season.label}
            </span>
            <h2 className="font-unbounded text-[clamp(20px,2.4vw,34px)] leading-[1.1] font-extrabold uppercase text-[var(--paper)] balance-heading">
              {site.home.season.lines.join(" ")}
            </h2>
            <p className="font-cinzel text-[11px] sm:text-[12px] uppercase tracking-[0.26em] text-[var(--world-accent)]">
              {site.home.season.tagline}
            </p>
          </div>

          {/* Spacer allowing full view of 3D doors rendered in WebGL */}
          <div
            className="w-full flex-1 pointer-events-none min-h-[14vh] lg:min-h-[18vh]"
            aria-hidden="true"
          />

          <div className="site-container site-grid relative z-30 items-end gap-y-6 pt-2 pb-2 lg:pb-4">
            {/* Door 1: The Red Room */}
            <div
              className={`col-span-4 md:col-span-4 lg:col-span-4 min-[1200px]:col-span-6 flex flex-col justify-end transition-opacity duration-500 ${
                hoverDoor === "diwali" ? "opacity-40" : "opacity-100"
              }`}
            >
              <div className="relative flex flex-col gap-2">
                {/* Fallback flyer backdrop for T0/T1 or WebGL off */}
                {isFallbackTier && (
                  <div
                    className="pointer-events-none absolute -inset-x-2 -top-24 bottom-0 -z-10 overflow-hidden opacity-14"
                    style={{
                      maskImage:
                        "radial-gradient(ellipse 70% 60% at 50% 30%, black 50%, transparent 95%), linear-gradient(to bottom, black 70%, transparent 100%)",
                      WebkitMaskImage:
                        "radial-gradient(ellipse 70% 60% at 50% 30%, black 50%, transparent 95%), linear-gradient(to bottom, black 70%, transparent 100%)",
                    }}
                  >
                    <Image
                      src="/media/red-room-poster-1024.webp"
                      alt=""
                      fill
                      className="object-cover object-top blur-[2px]"
                    />
                    <div className="absolute inset-0 bg-[#3A0504] mix-blend-color opacity-50" />
                  </div>
                )}

                <TransitionLink
                  data-door-caption="red"
                  href={site.home.worlds.one.href}
                  transitionType="T1"
                  origin="door"
                  aria-label={`Enter ${site.home.worlds.one.kicker}: ${site.home.worlds.one.name}, ${site.home.worlds.one.occasion}, Saturday 24 October 2026`}
                  onMouseEnter={() => setHoverDoor("redroom")}
                  onMouseLeave={() => setHoverDoor(null)}
                  onFocus={() => setHoverDoor("redroom")}
                  onBlur={() => setHoverDoor(null)}
                  className="group pointer-events-auto flex flex-col gap-3 p-5 sm:p-6 bg-[#06080C]/90 border-t border-[var(--paper)]/25 hover:border-[#FF2A1F]/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FF2A1F] transition-all duration-300"
                >
                  {/* Label Block (Part 7 H5) */}
                  <div className="flex flex-col gap-2 text-left">
                    <span className="font-cinzel text-[11px] uppercase tracking-[0.28em] text-[#FF2A1F]">
                      {site.home.worlds.one.kicker}
                    </span>
                    <span className="font-cinzel font-black text-heading sm:text-display-m uppercase text-[#D20A15] tracking-[0.04em] drop-shadow-[0_4px_16px_rgba(210,10,21,0.7)] leading-[1.1]">
                      {site.home.worlds.one.name}
                    </span>
                    <span className="font-manrope text-body text-[#FCF9FC]/80">
                      {site.home.worlds.one.occasion} ·{" "}
                      {site.home.worlds.one.date} · {site.home.worlds.one.place}
                    </span>
                    <span className="mt-3 inline-flex items-center gap-3 font-cinzel text-[12px] uppercase tracking-[0.28em] text-[#FCF9FC] group-hover:text-[#FF2A1F] transition-colors">
                      <span>{site.home.worlds.one.cta}</span>
                      <svg
                        width="14"
                        height="10"
                        viewBox="0 0 14 10"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M1 5H12.5M12.5 5L8.5 1M12.5 5L8.5 9"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                      </svg>
                    </span>
                  </div>
                </TransitionLink>

                {/* Official flyer modal trigger button */}
                <div className="pt-1 px-1 text-left">
                  <button
                    type="button"
                    onClick={() => setActiveFlyer("redroom")}
                    className="pointer-events-auto font-cinzel text-[11px] uppercase tracking-[0.24em] text-[#FF2A1F]/70 hover:text-[#FF2A1F] transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#FF2A1F]"
                  >
                    View official flyer
                  </button>
                </div>
              </div>
            </div>

            {/* Door 2: Diwali */}
            <div
              className={`col-span-4 md:col-span-4 lg:col-span-4 min-[1200px]:col-span-6 flex flex-col justify-end transition-opacity duration-500 ${
                hoverDoor === "redroom" ? "opacity-40" : "opacity-100"
              }`}
            >
              <div className="relative flex flex-col gap-2">
                {/* Fallback flyer backdrop for T0/T1 or WebGL off */}
                {isFallbackTier && (
                  <div
                    className="pointer-events-none absolute -inset-x-2 -top-24 bottom-0 -z-10 overflow-hidden opacity-14"
                    style={{
                      maskImage:
                        "radial-gradient(ellipse 70% 60% at 50% 30%, black 50%, transparent 95%), linear-gradient(to bottom, black 70%, transparent 100%)",
                      WebkitMaskImage:
                        "radial-gradient(ellipse 70% 60% at 50% 30%, black 50%, transparent 95%), linear-gradient(to bottom, black 70%, transparent 100%)",
                    }}
                  >
                    <Image
                      src="/media/dhamaaka-flyer-1024.webp"
                      alt=""
                      fill
                      className="object-cover object-top blur-[2px]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#E0217A] to-[#E5B25D] mix-blend-color opacity-50" />
                  </div>
                )}

                <TransitionLink
                  data-door-caption="diwali"
                  href={site.home.worlds.two.href}
                  transitionType="T2"
                  origin="door"
                  aria-label={`Enter ${site.home.worlds.two.kicker}: ${site.home.worlds.two.name}, ${site.home.worlds.two.occasion}, Saturday 7 November 2026`}
                  onMouseEnter={() => setHoverDoor("diwali")}
                  onMouseLeave={() => setHoverDoor(null)}
                  onFocus={() => setHoverDoor("diwali")}
                  onBlur={() => setHoverDoor(null)}
                  className="group pointer-events-auto flex flex-col gap-3 p-5 sm:p-6 bg-[#06080C]/90 border-t border-[var(--paper)]/25 hover:border-[#FF70DE]/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FF70DE] transition-all duration-300"
                >
                  {/* Label Block (Part 7 H5) */}
                  <div className="flex flex-col gap-2 text-left">
                    <span className="font-cinzel text-[11px] uppercase tracking-[0.28em] text-[#FF70DE]">
                      {site.home.worlds.two.kicker}
                    </span>
                    <span className="font-playfair font-black text-heading sm:text-display-m uppercase bg-gradient-to-r from-[#FFE3A3] via-[#E0217A] to-[#FF70DE] bg-clip-text text-transparent leading-[1.05] tracking-wide drop-shadow-[0_4px_20px_rgba(224,33,122,0.75)]">
                      {site.home.worlds.two.name}
                    </span>
                    {site.home.worlds.two.subtitle && (
                      <span className="font-cinzel text-[11px] sm:text-[12px] uppercase tracking-[0.2em] text-[#FFE3A3]/90">
                        {site.home.worlds.two.subtitle}
                      </span>
                    )}
                    <span className="font-manrope text-body text-[#FFF6EE]/85">
                      {site.home.worlds.two.occasion} · {site.home.worlds.two.date} · {site.home.worlds.two.place}
                    </span>
                    <span className="mt-3 inline-flex items-center gap-3 font-cinzel text-[12px] uppercase tracking-[0.28em] text-[#FFF6EE] group-hover:text-[#FF70DE] transition-colors">
                      <span>{site.home.worlds.two.cta}</span>
                      <svg
                        width="14"
                        height="10"
                        viewBox="0 0 14 10"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M1 5H12.5M12.5 5L8.5 1M12.5 5L8.5 9"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                      </svg>
                    </span>
                  </div>
                </TransitionLink>

                {/* Official flyer modal trigger button */}
                <div className="pt-1 px-1 text-left">
                  <button
                    type="button"
                    onClick={() => setActiveFlyer("diwali")}
                    className="pointer-events-auto font-cinzel text-[11px] uppercase tracking-[0.24em] text-[#E5B25D]/70 hover:text-[#FFE3A3] transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#E5B25D]"
                  >
                    View official flyer
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="site-container" aria-hidden="true" />
        </div>
      </section>

      {/* Official Flyer Lightbox Modal */}
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

      {/* H6 · Footer */}
      <Footer />
      </div>
    </main>
  );
}
