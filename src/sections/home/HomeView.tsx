"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { site } from "@/content/site";
import { frame } from "@/state/frame";
import { useStore } from "@/state/store";
import { useSceneProgress } from "@/motion/useSceneProgress";
import { useLineReveal } from "@/motion/useLineReveal";
import { useEnterTransition } from "@/motion/transitions";
import { getLenis } from "@/motion/clock";
import { BadgeDomHost } from "@/ui/BadgeDomHost";
import { Marquee } from "@/ui/Marquee";
import { Divider } from "@/ui/Divider";
import { AnnouncingSoon } from "@/ui/AnnouncingSoon";
import { TransitionLink } from "@/ui/TransitionLink";
import { Footer } from "@/ui/Footer";
import { DomTwins } from "@/webgl/tracking/DomTwins";

export function HomeView() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  useLineReveal(titleRef, { triggerOnMount: true, delay: .18 });
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
  const h3Ref = useRef<HTMLElement>(null);
  const h4Ref = useRef<HTMLElement>(null);
  const h5Ref = useRef<HTMLElement>(null);

  useSceneProgress("H1", h1Ref);
  useSceneProgress("H2", h2Ref);
  useSceneProgress("H3", h3Ref);
  useSceneProgress("H4", h4Ref);
  useSceneProgress("H5", h5Ref);

  const [heroTextVisible, setHeroTextVisible] = useState(true);
  const [activeStatement, setActiveStatement] = useState(0);
  const [showAboutBody, setShowAboutBody] = useState(false);
  const [seasonStep, setSeasonStep] = useState(3);
  const [seasonFade, setSeasonFade] = useState(1);

  useEffect(() => {
    if (!motionEnabled) {
      setHeroTextVisible(true);
      setActiveStatement(0);
      setShowAboutBody(true);
      setSeasonStep(3);
      setSeasonFade(1);
      return;
    }

    const prev = {
      heroText: true,
      stmt: 0,
      about: false,
      season: 3,
      fade: 1,
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

      const p2 = frame.progress.H2 ?? 0;
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

      const p4 = frame.progress.H4 ?? 0;
      const nextSeason = p4 < 0.28 ? 1 : p4 < 0.56 ? 2 : 3;
      if (nextSeason !== prev.season) {
        prev.season = nextSeason;
        setSeasonStep(nextSeason);
      }

      const nextFade = p4 > 0.65 ? Math.max(0, 1 - (p4 - 0.65) / 0.25) : 1;
      if (
        Math.abs(nextFade - prev.fade) > 0.05 ||
        nextFade === 0 ||
        nextFade === 1
      ) {
        prev.fade = nextFade;
        setSeasonFade(nextFade);
      }
    };

    gsap.ticker.add(onTick);
    return () => {
      gsap.ticker.remove(onTick);
    };
  }, [motionEnabled]);

  return (
    <main id="main-content" className="relative z-10">
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

      {/* H2 · Who we are (150vh desktop, pinned) */}
      <section
        ref={h2Ref}
        data-scene="H2"
        aria-labelledby="home-about-label"
        className="scene-section scene-h2"
      >
        <div className="scene-sticky flex flex-col justify-between pt-20 pb-10 md:py-24">
          <div className="site-container flex items-center justify-between">
            <h2
              id="home-about-label"
              className="font-mono text-[12px] uppercase tracking-[0.08em] text-[var(--steel)]"
            >
              {site.home.about.label}
            </h2>
          </div>

          <div className="site-container site-grid mt-auto md:my-auto items-center pb-4 md:pb-0">
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

          <div className="site-container" aria-hidden="true" />
        </div>
      </section>

      {/* H3 · Nights we've thrown (90vh, not pinned) */}
      <section
        ref={h3Ref}
        data-scene="H3"
        aria-labelledby="home-nights-label"
        className="relative scene-h3 flex flex-col justify-center py-20"
      >
        <div className="site-container mb-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-6">
            <h2
              id="home-nights-label"
              className="font-mono text-[12px] uppercase tracking-[0.08em] text-[var(--steel)]"
            >
              {site.home.nights.label}
            </h2>
            <p className="font-mono text-[12px] uppercase tracking-[0.08em] text-[var(--paper)]">
              Latest: {site.home.nights.latest.name} —{" "}
              {site.home.nights.latest.detail}
            </p>
          </div>

          {/* Desktop 0.55 scale host badge at top-right */}
          <div className="hidden md:block">
            <BadgeDomHost
              skin="home"
              sizeClass="w-[96px] h-[96px]"
              label="Underdogs Host Badge"
            />
          </div>
        </div>

        <Marquee items={site.home.nights.list} />
      </section>

      {/* H4 · This season (160vh, pinned) */}
      <section
        ref={h4Ref}
        data-scene="H4"
        aria-labelledby="home-season-label"
        className="scene-section scene-h4"
      >
        <div className="scene-sticky flex flex-col justify-between pt-20 pb-10 md:py-24">
          <div className="site-container">
            <h2
              id="home-season-label"
              className="font-mono text-[12px] uppercase tracking-[0.08em] text-[var(--steel)]"
            >
              {site.home.season.label}
            </h2>
          </div>

          <div
            className="site-container mt-auto md:my-auto pt-16 md:pt-20 flex flex-col items-center text-center gap-6 pb-4 md:pb-0 transition-opacity duration-300"
            style={{ opacity: motionEnabled ? seasonFade : 1 }}
          >
            <div className="flex flex-col items-center gap-2">
              {site.home.season.lines.map((line, idx) => {
                const visible = idx < seasonStep;
                return (
                  <p
                    key={line}
                    className={`font-unbounded text-[clamp(26px,4.2vw,68px)] leading-[0.96] tracking-[-0.03em] font-black uppercase text-[var(--paper)] balance-heading transition-all duration-700 ${
                      visible
                        ? "opacity-100 translate-y-0"
                        : "opacity-70 translate-y-6"
                    }`}
                  >
                    {line}
                  </p>
                );
              })}
            </div>

            <div className="w-full max-w-[560px] flex flex-col items-center gap-4 pt-4">
              <Divider variant="x" active={seasonStep >= 3} />
              <p className="font-cinzel text-[13px] uppercase tracking-[0.28em] text-[var(--paper)]">
                {site.home.season.tagline}
              </p>
              <Divider variant="x" active={seasonStep >= 3} />
            </div>
          </div>

          <div className="site-container" aria-hidden="true" />
        </div>
      </section>

      {/* H5 · Two worlds: the doors (140vh desktop pinned; mobile unpinned) */}
      <section
        ref={h5Ref}
        data-scene="H5"
        aria-labelledby="home-worlds-label"
        className="scene-section scene-h5"
      >
        {/* DOM Twins for screen-projected keyboard & hover interaction (Part 7 H5) */}
        <DomTwins />

        <div className="scene-sticky-desktop flex flex-col justify-between pt-24 pb-12 lg:py-16">
          <div className="site-container flex items-center justify-between">
            <h2
              id="home-worlds-label"
              className="font-mono text-[12px] uppercase tracking-[0.08em] text-[var(--steel)]"
            >
              {site.home.worlds.label}
            </h2>
          </div>

          {/* Spacer allowing full view of 3D doors rendered in WebGL */}
          <div
            className="w-full flex-1 pointer-events-none min-h-[38vh] lg:min-h-[44vh]"
            aria-hidden="true"
          />

          <div className="site-container site-grid relative z-30 items-end gap-y-8 pt-4 pb-8 lg:pb-12">
            {/* Door 1: The Red Room */}
            <div
              className={`col-span-4 md:col-span-4 lg:col-span-6 flex flex-col justify-end transition-opacity duration-500 ${
                hoverDoor === "diwali" ? "opacity-40" : "opacity-100"
              }`}
            >
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
                className="group flex flex-col gap-3 p-5 sm:p-6 bg-[#06080C]/90 border-t border-[var(--paper)]/25 hover:border-[#FF2A1F]/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FF2A1F] transition-all duration-300"
              >
                {/* Label Block (Part 7 H5) */}
                <div className="flex flex-col gap-2 text-left">
                  <span className="font-cinzel text-[11px] uppercase tracking-[0.28em] text-[#FF2A1F]">
                    {site.home.worlds.one.kicker}
                  </span>
                  <span className="font-unbounded text-heading sm:text-display-m font-extrabold uppercase text-[#FCF9FC] tracking-[-0.02em] leading-[1.05]">
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
            </div>

            {/* Door 2: Diwali */}
            <div
              className={`col-span-4 md:col-span-4 lg:col-span-6 flex flex-col justify-end transition-opacity duration-500 ${
                hoverDoor === "redroom" ? "opacity-40" : "opacity-100"
              }`}
            >
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
                className="group flex flex-col gap-3 p-5 sm:p-6 bg-[#06080C]/90 border-t border-[var(--paper)]/25 hover:border-[#F2D38B]/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F2D38B] transition-all duration-300"
              >
                {/* Label Block (Part 7 H5) */}
                <div className="flex flex-col gap-2 text-left">
                  <span className="font-cinzel text-[11px] uppercase tracking-[0.28em] text-[#F2D38B]">
                    {site.home.worlds.two.kicker}
                  </span>
                  <span className="font-bodoni italic text-heading sm:text-display-m font-medium text-[#FFF6EE] leading-[1.05]">
                    {site.home.worlds.two.name}
                  </span>
                  <span
                    className="font-manrope text-body text-[#FFF6EE]/85"
                    style={
                      { "--world-accent": "#F2D38B" } as React.CSSProperties
                    }
                  >
                    {site.home.worlds.two.occasion} ·{" "}
                    {site.home.worlds.two.date} ·{" "}
                    <AnnouncingSoon value={site.home.worlds.two.place} />
                  </span>
                  <span className="mt-3 inline-flex items-center gap-3 font-cinzel text-[12px] uppercase tracking-[0.28em] text-[#FFF6EE] group-hover:text-[#F2D38B] transition-colors">
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
            </div>
          </div>

          <div className="site-container" aria-hidden="true" />
        </div>
      </section>

      {/* H6 · Footer */}
      <Footer />
    </main>
  );
}
