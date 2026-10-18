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
  useLineReveal(titleRef, { triggerOnMount: true, delay: 0.06 });
  const motionEnabled = useStore((s) => s.motionEnabled);
  const hoverDoor = useStore((s) => s.hoverDoor);
  const setHoverDoor = useStore((s) => s.setHoverDoor);
  const setWorld = useStore((s) => s.setWorld);

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
  const [scrollCueVisible, setScrollCueVisible] = useState(true);
  const [activeStatement, setActiveStatement] = useState(0);
  const [showAboutBody, setShowAboutBody] = useState(false);

  useEffect(() => {
    if (!motionEnabled) {
      setHeroTextVisible(true);
      setScrollCueVisible(true);
      setActiveStatement(0);
      setShowAboutBody(true);
      return;
    }

    const prev = {
      heroText: true,
      cue: true,
      stmt: 0,
      about: false,
    };

    const onTick = () => {
      const p1 = frame.progress.H1 ?? 0;
      if (p1 > 0.12 && prev.cue) {
        prev.cue = false;
        setScrollCueVisible(false);
      } else if (p1 < 0.08 && !prev.cue) {
        prev.cue = true;
        setScrollCueVisible(true);
      }

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

      {/* Desktop & Tablet Stages (≥ 768px) */}
      <div className="hidden md:block">
        {/* H1 · Hero, "Gate to Rage" (120vh desktop, pinned) */}
        <section
          ref={h1Ref}
          data-scene="H1"
          aria-label={site.home.hero.title}
          className="scene-section scene-h1"
        >
          <div className="scene-sticky flex items-center">
            <div className="site-container site-grid w-full h-full items-center">
              {/* Right stage: 3D Enamel Badge */}
              <div className="col-span-4 md:col-span-4 lg:col-span-6 lg:col-start-7 order-1 lg:order-2 flex flex-col items-center justify-center pt-16 lg:pt-0">
                <BadgeDomHost
                  skin="home"
                  sizeClass="w-[240px] h-[240px] sm:w-[300px] sm:h-[300px] lg:w-[440px] lg:h-[440px]"
                  label="Underdogs Enamel Badge — click or press Enter to blink"
                />
              </div>

              {/* Left stage: Focal Headline & Lead (columns 1–6) */}
              <div
                className={`col-span-4 md:col-span-4 lg:col-span-6 lg:col-start-1 order-2 lg:order-1 max-w-[580px] flex flex-col justify-end lg:self-center lg:py-24 gap-6 transition-all ${
                  heroTextVisible || !motionEnabled
                    ? "duration-[680ms] opacity-100 translate-y-0"
                    : "duration-[280ms] opacity-0 -translate-y-6 pointer-events-none"
                }`}
              >
                <p className="font-mono text-[12px] sm:text-[13px] uppercase tracking-[0.18em] font-medium text-[var(--paper)]/85 flex items-center gap-3">
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--world-accent)] shadow-[0_0_8px_var(--world-accent)]"
                    aria-hidden="true"
                  />
                  {site.home.hero.label}
                </p>

                <h1
                  ref={titleRef}
                  className="font-unbounded text-[clamp(38px,5.2vw,84px)] leading-[0.94] tracking-[-0.025em] font-extrabold uppercase text-[var(--paper)] balance-heading"
                >
                  <span className="sr-only">{site.brand.name} — </span>
                  {site.home.hero.title}
                </h1>

                <p className="font-manrope text-h3 text-[var(--paper)]/90 measure-copy pretty-copy">
                  {site.home.hero.lead}
                </p>

                {/* Scroll Cue ("Enter ↓") */}
                <div
                  className={`pt-2 flex items-center gap-4 transition-opacity duration-[280ms] ${
                    scrollCueVisible || !motionEnabled ? "opacity-90" : "opacity-0 pointer-events-none"
                  }`}
                >
                  <div className="relative h-12 w-[1px] bg-[var(--paper)]/20 overflow-hidden" aria-hidden="true">
                    <span className="scroll-cue-segment absolute left-0 top-0 h-3 w-full bg-[var(--magenta)]" />
                  </div>
                  <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--steel)]">
                    {site.home.hero.cue} ↓
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* H2 · Who we are + Editorial Archive ("Nights we've thrown") */}
        <section
          ref={h2Ref}
          data-scene="H2"
          aria-labelledby="home-about-label"
          className="scene-section scene-h2 min-h-screen"
        >
          <div className="scene-sticky flex flex-col justify-between pt-24 pb-8">
            <div className="site-container flex items-center justify-between border-b border-[var(--paper)]/12 pb-3">
              <h2
                id="home-about-label"
                className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--magenta)] flex items-center gap-2.5"
              >
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--magenta)]" aria-hidden="true" />
                {site.home.about.label}
              </h2>
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--steel)]">
                01 — 0{site.home.about.statements.length}
              </span>
            </div>

            <div className="site-container site-grid my-auto items-center py-6">
              {/* Left half (columns 1–6) */}
              <div className="col-span-4 md:col-span-4 lg:col-span-6 lg:col-start-1 max-w-[580px] pr-2 lg:pr-6 flex flex-col gap-6">
                {!motionEnabled ? (
                  <div className="flex flex-col gap-4">
                    {site.home.about.statements.map((stmt) => (
                      <p
                        key={stmt}
                        className="font-unbounded text-[clamp(18px,2vw,28px)] leading-[1.18] tracking-[-0.02em] font-extrabold uppercase text-[var(--paper)] balance-heading"
                      >
                        {stmt}
                      </p>
                    ))}
                  </div>
                ) : (
                  <div className="relative min-h-[140px] sm:min-h-[180px] lg:min-h-[210px] flex items-center">
                    {site.home.about.statements.map((stmt, idx) => {
                      const isCurrent = idx === activeStatement;
                      const isPast = idx < activeStatement;
                      return (
                        <p
                          key={stmt}
                          aria-hidden={!isCurrent}
                          className={`font-unbounded text-[clamp(24px,2.9vw,44px)] leading-[1.1] tracking-[-0.02em] font-extrabold uppercase text-[var(--paper)] balance-heading transition-all ${
                            isCurrent
                              ? "duration-[680ms] relative opacity-100 translate-y-0"
                              : isPast
                                ? "duration-[280ms] pointer-events-none absolute inset-x-0 opacity-0 -translate-y-8"
                                : "duration-[280ms] pointer-events-none absolute inset-x-0 opacity-0 translate-y-8"
                          }`}
                        >
                          {stmt}
                        </p>
                      );
                    })}
                  </div>
                )}

                <p
                  className={`font-manrope text-body text-[var(--paper)]/85 measure-copy pretty-copy transition-opacity duration-[500ms] ${
                    showAboutBody || !motionEnabled ? "opacity-100" : "opacity-85"
                  }`}
                >
                  {site.home.about.body}
                </p>
              </div>

              {/* Right half (columns 7–12): Badge host */}
              <div className="hidden md:flex md:col-span-4 lg:col-span-6 lg:col-start-7 items-center justify-center">
                <div
                  className="flex flex-col items-center gap-3 transition-transform duration-[680ms]"
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

            {/* Editorial Archive Header + Marquee ("Nights we've thrown") */}
            <div className="w-full pt-4 border-t border-[var(--paper)]/15 flex flex-col gap-2 overflow-hidden">
              <div className="site-container flex flex-wrap items-center justify-between gap-4 pb-1">
                <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--magenta)]">
                  {site.home.nights.label}
                </span>
                <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-sm bg-[var(--haze)]/90 border border-[var(--paper)]/15">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--magenta)]" aria-hidden="true" />
                  <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--paper)]/90">
                    {site.home.nights.latestLabel}: <strong className="text-[var(--paper)]">{site.home.nights.latest.name}</strong> — {site.home.nights.latest.detail}
                  </span>
                </div>
              </div>
              <Marquee items={site.home.nights.list} />
            </div>
          </div>
        </section>

        {/* H5 · This season & Choose a door (3D Doors + Tinted Flyer Backdrops + Lightbox) */}
        <section
          ref={h5Ref}
          data-scene="H5"
          aria-label={site.home.worlds.label}
          className="scene-section scene-h5"
        >
          {/* DOM Twins for screen-projected keyboard & hover interaction */}
          <DomTwins />

          <div className="scene-sticky-desktop relative z-[21] pointer-events-none flex flex-col justify-between pt-24 pb-8 lg:pt-24 lg:pb-10">
            <h2 className="sr-only">{site.home.worlds.label}</h2>

            {/* Season Intro Header */}
            <div className="site-container flex flex-col items-center text-center gap-2 max-w-[780px] mx-auto pointer-events-auto">
              <span className="font-mono text-[11px] sm:text-[12px] uppercase tracking-[0.24em] text-[var(--steel)]">
                {site.home.season.label} · {site.home.worlds.label}
              </span>
              <h2 className="font-unbounded text-[clamp(22px,2.6vw,38px)] leading-[1.08] font-extrabold uppercase text-[var(--paper)] balance-heading">
                {site.home.season.lines.join(" ")}
              </h2>
              <p className="font-cinzel text-[11px] sm:text-[12px] uppercase tracking-[0.28em] text-[var(--world-accent)]">
                {site.home.season.tagline}
              </p>
            </div>

            {/* Center viewport window for the 3D doors */}
            <div
              className="w-full flex-1 pointer-events-none min-h-[16vh] lg:min-h-[20vh]"
              aria-hidden="true"
            />

            {/* Two Equal Door Portals aligned to 12-column grid */}
            <div className="site-container site-grid relative z-30 items-stretch gap-y-6 pt-2 pb-2 lg:pb-4">
              {/* Door 1: The Red Room */}
              <div
                className={`col-span-4 md:col-span-4 lg:col-span-6 flex flex-col justify-end transition-opacity duration-[280ms] ${
                  hoverDoor === "diwali" ? "opacity-45" : "opacity-100"
                }`}
              >
                <div className="group/door relative flex flex-col h-full justify-between rounded-sm overflow-hidden bg-[#080305]/90 border border-[var(--paper)]/15 hover:border-[#FF2A1F]/65 transition-all duration-[280ms] shadow-[0_20px_50px_rgba(0,0,0,0.75)]">
                  {/* Faint Tinted Official Flyer Backdrop behind Door 1 */}
                  <div
                    className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-[0.16] group-hover/door:opacity-[0.26] transition-opacity duration-[500ms]"
                    style={{
                      maskImage:
                        "radial-gradient(ellipse 85% 75% at 50% 30%, black 45%, transparent 100%)",
                      WebkitMaskImage:
                        "radial-gradient(ellipse 85% 75% at 50% 30%, black 45%, transparent 100%)",
                    }}
                  >
                    <Image
                      src="/media/red-room-poster-1024.webp"
                      alt=""
                      fill
                      sizes="(max-width: 1024px) 90vw, 580px"
                      className="object-cover object-top blur-[1.5px] scale-105 group-hover/door:scale-100 transition-transform duration-[750ms]"
                    />
                    <div className="absolute inset-0 bg-[#3A0504] mix-blend-color opacity-55" />
                  </div>

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
                    className="relative z-10 pointer-events-auto flex flex-col gap-2.5 p-6 sm:p-7 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FF2A1F]"
                  >
                    <div className="flex flex-col gap-2 text-left">
                      <span className="font-cinzel text-[11px] uppercase tracking-[0.28em] text-[#FF2A1F]">
                        {site.home.worlds.one.kicker} · {site.home.worlds.one.occasion}
                      </span>
                      <span className="font-nosifer text-[clamp(22px,2.4vw,34px)] uppercase text-[#E81414] tracking-[0.04em] drop-shadow-[0_4px_16px_rgba(210,10,21,0.75)] leading-[1.15]">
                        {site.home.worlds.one.name}
                      </span>
                      <span className="font-manrope text-body text-[#FCF9FC]/85 pt-1">
                        {site.home.worlds.one.date} · {site.home.worlds.one.place}
                      </span>
                    </div>
                  </TransitionLink>

                  {/* Action Row: CTA + Official Flyer Lightbox Trigger */}
                  <div className="relative z-20 px-6 sm:px-7 pb-4 pt-3 border-t border-white/10 flex items-center justify-between gap-4">
                    <TransitionLink
                      href={site.home.worlds.one.href}
                      transitionType="T1"
                      origin="door"
                      onMouseEnter={() => setHoverDoor("redroom")}
                      onMouseLeave={() => setHoverDoor(null)}
                      className="pointer-events-auto min-h-[44px] inline-flex items-center gap-3 font-cinzel text-[12px] font-semibold uppercase tracking-[0.26em] text-[#FCF9FC] hover:text-[#FF2A1F] transition-colors"
                    >
                      <span>{site.home.worlds.one.cta}</span>
                      <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true">
                        <path d="M1 5H12.5M12.5 5L8.5 1M12.5 5L8.5 9" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    </TransitionLink>

                    <button
                      type="button"
                      onClick={() => setActiveFlyer("redroom")}
                      className="pointer-events-auto min-h-[44px] px-2 inline-flex items-center gap-1.5 font-cinzel text-[11px] uppercase tracking-[0.22em] text-[#FF968B]/85 hover:text-[#FF2A1F] transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#FF2A1F]"
                    >
                      <span>View official flyer</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Door 2: DHAMAAKA (Diwali) */}
              <div
                className={`col-span-4 md:col-span-4 lg:col-span-6 flex flex-col justify-end transition-opacity duration-[280ms] ${
                  hoverDoor === "redroom" ? "opacity-45" : "opacity-100"
                }`}
              >
                <div className="group/door relative flex flex-col h-full justify-between rounded-sm overflow-hidden bg-[#0A0408]/90 border border-[var(--paper)]/15 hover:border-[#E5B25D]/70 transition-all duration-[280ms] shadow-[0_20px_50px_rgba(0,0,0,0.75)]">
                  {/* Faint Tinted Official Flyer Backdrop behind Door 2 */}
                  <div
                    className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-[0.16] group-hover/door:opacity-[0.26] transition-opacity duration-[500ms]"
                    style={{
                      maskImage:
                        "radial-gradient(ellipse 85% 75% at 50% 30%, black 45%, transparent 100%)",
                      WebkitMaskImage:
                        "radial-gradient(ellipse 85% 75% at 50% 30%, black 45%, transparent 100%)",
                    }}
                  >
                    <Image
                      src="/media/dhamaaka-flyer-1024.webp"
                      alt=""
                      fill
                      sizes="(max-width: 1024px) 90vw, 580px"
                      className="object-cover object-top blur-[1.5px] scale-105 group-hover/door:scale-100 transition-transform duration-[750ms]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#E0217A] to-[#E5B25D] mix-blend-color opacity-50" />
                  </div>

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
                    className="relative z-10 pointer-events-auto flex flex-col gap-2.5 p-6 sm:p-7 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#E5B25D]"
                  >
                    <div className="flex flex-col gap-2 text-left">
                      <span className="font-cinzel text-[11px] uppercase tracking-[0.28em] text-[#E5B25D]">
                        {site.home.worlds.two.kicker} · {site.home.worlds.two.occasion}
                      </span>
                      <span className="font-playfair font-black text-[clamp(24px,2.6vw,38px)] uppercase bg-gradient-to-r from-[#FFE3A3] via-[#E0217A] to-[#FF70DE] bg-clip-text text-transparent leading-[1.08] tracking-wide drop-shadow-[0_4px_20px_rgba(224,33,122,0.75)]">
                        {site.home.worlds.two.name}
                      </span>
                      {site.home.worlds.two.subtitle && (
                        <span className="font-cinzel text-[11px] uppercase tracking-[0.22em] text-[#FFE3A3]/90">
                          {site.home.worlds.two.subtitle}
                        </span>
                      )}
                      <span className="font-manrope text-body text-[#FFF6EE]/85 pt-0.5">
                        {site.home.worlds.two.date} · {site.home.worlds.two.place}
                      </span>
                    </div>
                  </TransitionLink>

                  {/* Action Row: CTA + Official Flyer Lightbox Trigger */}
                  <div className="relative z-20 px-6 sm:px-7 pb-4 pt-3 border-t border-white/10 flex items-center justify-between gap-4">
                    <TransitionLink
                      href={site.home.worlds.two.href}
                      transitionType="T2"
                      origin="door"
                      onMouseEnter={() => setHoverDoor("diwali")}
                      onMouseLeave={() => setHoverDoor(null)}
                      className="pointer-events-auto min-h-[44px] inline-flex items-center gap-3 font-cinzel text-[12px] font-semibold uppercase tracking-[0.26em] text-[#FFF6EE] hover:text-[#E5B25D] transition-colors"
                    >
                      <span>{site.home.worlds.two.cta}</span>
                      <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true">
                        <path d="M1 5H12.5M12.5 5L8.5 1M12.5 5L8.5 9" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    </TransitionLink>

                    <button
                      type="button"
                      onClick={() => setActiveFlyer("diwali")}
                      className="pointer-events-auto min-h-[44px] px-2 inline-flex items-center gap-1.5 font-cinzel text-[11px] uppercase tracking-[0.22em] text-[#E5B25D]/85 hover:text-[#FFE3A3] transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#E5B25D]"
                    >
                      <span>View official flyer</span>
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
                  alt: site.redRoom.poster.alt,
                  title: site.home.worlds.one.name,
                  subtitle: `${site.home.worlds.one.occasion} · ${site.home.worlds.one.date}`,
                  world: "redroom",
                }
              : activeFlyer === "diwali"
                ? {
                    src: "/media/dhamaaka-flyer.webp",
                    alt: site.diwali.poster.alt,
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
