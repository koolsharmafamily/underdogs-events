'use client'

import React, { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { site } from '@/content/site'
import { frame } from '@/state/frame'
import { useStore } from '@/state/store'
import { useSceneProgress } from '@/motion/useSceneProgress'
import { getLenis } from '@/motion/clock'
import { BadgeDomHost } from '@/ui/BadgeDomHost'
import { ScrollCue } from '@/ui/ScrollCue'
import { Marquee } from '@/ui/Marquee'
import { Divider } from '@/ui/Divider'
import { AnnouncingSoon } from '@/ui/AnnouncingSoon'
import { TransitionLink } from '@/ui/TransitionLink'
import { Footer } from '@/ui/Footer'

export function HomeView() {
  const motionEnabled = useStore((s) => s.motionEnabled)
  const hoverDoor = useStore((s) => s.hoverDoor)
  const setHoverDoor = useStore((s) => s.setHoverDoor)

  const h1Ref = useRef<HTMLElement>(null)
  const h2Ref = useRef<HTMLElement>(null)
  const h3Ref = useRef<HTMLElement>(null)
  const h4Ref = useRef<HTMLElement>(null)
  const h5Ref = useRef<HTMLElement>(null)

  useSceneProgress('H1', h1Ref)
  useSceneProgress('H2', h2Ref)
  useSceneProgress('H3', h3Ref)
  useSceneProgress('H4', h4Ref)
  useSceneProgress('H5', h5Ref)

  const [cueVisible, setCueVisible] = useState(true)
  const [activeStatement, setActiveStatement] = useState(0)
  const [showAboutBody, setShowAboutBody] = useState(false)
  const [seasonStep, setSeasonStep] = useState(3)

  useEffect(() => {
    if (!motionEnabled) {
      setCueVisible(true)
      setActiveStatement(0)
      setShowAboutBody(true)
      setSeasonStep(3)
      return
    }

    const onTick = () => {
      const p1 = frame.progress.H1 ?? 0
      if (p1 > 0.1) {
        setCueVisible(false)
      } else if (p1 < 0.08) {
        setCueVisible(true)
      }

      const p2 = frame.progress.H2 ?? 0
      if (p2 < 0.34) {
        setActiveStatement(0)
        setShowAboutBody(false)
      } else if (p2 < 0.67) {
        setActiveStatement(1)
        setShowAboutBody(false)
      } else {
        setActiveStatement(2)
        setShowAboutBody(true)
      }

      const p4 = frame.progress.H4 ?? 0
      if (p4 < 0.28) {
        setSeasonStep(1)
      } else if (p4 < 0.56) {
        setSeasonStep(2)
      } else {
        setSeasonStep(3)
      }
    }

    gsap.ticker.add(onTick)
    return () => {
      gsap.ticker.remove(onTick)
    }
  }, [motionEnabled])

  const scrollToWhoWeAre = () => {
    if (!h2Ref.current) return
    const lenis = getLenis()
    if (lenis) {
      lenis.scrollTo(h2Ref.current)
    } else {
      h2Ref.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

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

            {/* Copy occupies columns 1–6, bottom-aligned at 72% viewport height on desktop */}
            <div className="col-span-4 md:col-span-4 lg:col-span-6 lg:col-start-1 order-2 lg:order-1 flex flex-col justify-end lg:self-end lg:pt-24 lg:pb-[10svh] gap-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--steel)]">
                {site.home.hero.label}
              </p>

              <h1 className="font-unbounded text-[clamp(48px,8.2vw,148px)] leading-[0.9] tracking-[-0.03em] font-black uppercase text-[var(--paper)] balance-heading">
                <span className="sr-only">{site.brand.name} — </span>
                {site.home.hero.title}
              </h1>

              <p className="font-manrope text-lead text-[var(--paper)]/90 measure-copy pretty-copy">
                {site.home.hero.lead}
              </p>

              <div className="pt-2">
                <ScrollCue visible={cueVisible} onActivate={scrollToWhoWeAre} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* H2 · Who we are (220vh desktop, pinned) */}
      <section
        ref={h2Ref}
        data-scene="H2"
        aria-labelledby="home-about-label"
        className="scene-section scene-h2"
      >
        <div className="scene-sticky flex flex-col justify-between py-24">
          <div className="site-container flex items-center justify-between">
            <h2
              id="home-about-label"
              className="font-mono text-[12px] uppercase tracking-[0.08em] text-[var(--steel)]"
            >
              {site.home.about.label}
            </h2>
            <span
              aria-hidden="true"
              className="font-mono text-[11px] tabular-nums tracking-[0.08em] text-[var(--steel)]"
            >
              0{activeStatement + 1} / 03
            </span>
          </div>

          <div className="site-container site-grid my-auto items-center">
            <div className="col-span-4 md:col-span-5 lg:col-span-8">
              {!motionEnabled ? (
                <div className="flex flex-col gap-6">
                  {site.home.about.statements.map((stmt) => (
                    <p
                      key={stmt}
                      className="font-unbounded text-heading sm:text-display-l font-extrabold uppercase text-[var(--paper)] balance-heading"
                    >
                      {stmt}
                    </p>
                  ))}
                </div>
              ) : (
                <div className="relative min-h-[200px] sm:min-h-[260px] flex items-center">
                  {site.home.about.statements.map((stmt, idx) => {
                    const isCurrent = idx === activeStatement
                    const isPast = idx < activeStatement
                    return (
                      <p
                        key={stmt}
                        aria-hidden={!isCurrent}
                        className={`font-unbounded text-heading sm:text-display-l font-extrabold uppercase text-[var(--paper)] balance-heading transition-all duration-700 ${
                          isCurrent
                            ? 'relative opacity-100 translate-y-0'
                            : isPast
                              ? 'pointer-events-none absolute inset-x-0 opacity-0 -translate-y-12'
                              : 'pointer-events-none absolute inset-x-0 opacity-0 translate-y-12'
                        }`}
                      >
                        {stmt}
                      </p>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Badge stage representation for H2 (edge-on / engraved back / front) */}
            <div className="hidden md:flex md:col-span-3 lg:col-span-4 items-center justify-center">
              <div
                className="flex flex-col items-center gap-3 transition-transform duration-700"
                style={{
                  transform:
                    activeStatement === 0
                      ? 'perspective(800px) rotateY(72deg)'
                      : activeStatement === 1
                        ? 'perspective(800px) rotateY(180deg)'
                        : 'perspective(800px) rotateY(0deg)',
                }}
              >
                <BadgeDomHost
                  skin="home"
                  sizeClass="w-[200px] h-[200px] lg:w-[260px] lg:h-[260px]"
                  label="Underdogs Badge choreography preview"
                />
                {activeStatement === 1 && (
                  <span
                    aria-hidden="true"
                    className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--chrome)]"
                    style={{ transform: 'rotateY(180deg)' }}
                  >
                    GATE TO RAGE · NAGPUR
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="site-container">
            <p
              className={`font-manrope text-lead text-[var(--paper)]/90 measure-copy pretty-copy transition-opacity duration-500 ${
                showAboutBody || !motionEnabled ? 'opacity-100' : 'opacity-40'
              }`}
            >
              {site.home.about.body}
            </p>
          </div>
        </div>
      </section>

      {/* H3 · Nights we've thrown (110vh, not pinned) */}
      <section
        ref={h3Ref}
        data-scene="H3"
        aria-labelledby="home-nights-label"
        className="relative min-h-[110svh] flex flex-col justify-center py-24"
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
              Latest: {site.home.nights.latest.name} — {site.home.nights.latest.detail}
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
        <div className="scene-sticky flex flex-col justify-between py-24">
          <div className="site-container">
            <h2
              id="home-season-label"
              className="font-mono text-[12px] uppercase tracking-[0.08em] text-[var(--steel)]"
            >
              {site.home.season.label}
            </h2>
          </div>

          <div className="site-container my-auto flex flex-col items-center text-center gap-6">
            <div className="flex flex-col items-center gap-2">
              {site.home.season.lines.map((line, idx) => {
                const visible = idx < seasonStep
                return (
                  <p
                    key={line}
                    className={`font-unbounded text-[clamp(30px,5.2vw,88px)] leading-[0.94] tracking-[-0.03em] font-black uppercase text-[var(--paper)] balance-heading transition-all duration-700 ${
                      visible
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-15 translate-y-6'
                    }`}
                  >
                    {line}
                  </p>
                )
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
        <div className="scene-sticky-desktop flex flex-col justify-between py-20 lg:py-24">
          <div className="site-container flex items-center justify-between">
            <h2
              id="home-worlds-label"
              className="font-mono text-[12px] uppercase tracking-[0.08em] text-[var(--steel)]"
            >
              {site.home.worlds.label}
            </h2>

            <div className="hidden lg:block">
              <BadgeDomHost
                skin={hoverDoor ?? 'home'}
                sizeClass="w-[110px] h-[110px]"
                label="Underdogs Gate Host Badge"
              />
            </div>
          </div>

          <div className="site-container site-grid my-auto items-stretch gap-y-12 pt-8">
            {/* Door 1: The Red Room */}
            <div
              className={`col-span-4 md:col-span-4 lg:col-span-6 flex flex-col justify-between transition-opacity duration-500 ${
                hoverDoor === 'diwali' ? 'opacity-60' : 'opacity-100'
              }`}
            >
              <TransitionLink
                href={site.home.worlds.one.href}
                transitionType="T1"
                aria-label={`Enter ${site.home.worlds.one.kicker}: ${site.home.worlds.one.name}, ${site.home.worlds.one.occasion}, Saturday 24 October 2026`}
                onMouseEnter={() => setHoverDoor('redroom')}
                onMouseLeave={() => setHoverDoor(null)}
                onFocus={() => setHoverDoor('redroom')}
                onBlur={() => setHoverDoor(null)}
                className="group flex flex-col gap-6 border border-[#FCF9FC]/20 bg-[#060101] p-6 sm:p-10 hover:border-[#FF2A1F] transition-colors duration-500"
              >
                {/* Arched Doorway Stage Representation */}
                <div className="relative mx-auto flex h-[220px] sm:h-[260px] w-full max-w-[220px] items-end justify-center border-x border-t border-[#C8A15A]/45 bg-[#2A0403]/50 pt-6 overflow-hidden">
                  <div
                    aria-hidden="true"
                    className="h-full w-full border border-[#7C0F0C] bg-[#510805] transition-transform duration-700 origin-left group-hover:[transform:perspective(700px)_rotateY(-10deg)] group-focus-visible:[transform:perspective(700px)_rotateY(-10deg)] flex items-center justify-center"
                  >
                    <span className="h-5 w-5 border border-[#C8A15A] inline-block" />
                  </div>
                  {/* Floor light leak */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-1.5 bg-[#FF2A1F] opacity-75 group-hover:opacity-100 transition-opacity"
                  />
                </div>

                {/* Label Block (Part 7 H5) */}
                <div className="flex flex-col gap-2 text-left">
                  <span className="font-cinzel text-[11px] uppercase tracking-[0.28em] text-[#FF2A1F]">
                    {site.home.worlds.one.kicker}
                  </span>
                  <span className="font-unbounded text-heading font-extrabold uppercase text-[#FCF9FC]">
                    {site.home.worlds.one.name}
                  </span>
                  <span className="font-manrope text-body text-[#FCF9FC]/80">
                    {site.home.worlds.one.occasion} · {site.home.worlds.one.date} ·{' '}
                    {site.home.worlds.one.place}
                  </span>
                  <span className="mt-3 inline-flex items-center gap-3 font-cinzel text-[12px] uppercase tracking-[0.28em] text-[#FCF9FC] group-hover:text-[#FF2A1F] transition-colors">
                    <span>{site.home.worlds.one.cta}</span>
                    <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true">
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
              className={`col-span-4 md:col-span-4 lg:col-span-6 flex flex-col justify-between transition-opacity duration-500 ${
                hoverDoor === 'redroom' ? 'opacity-60' : 'opacity-100'
              }`}
            >
              <TransitionLink
                href={site.home.worlds.two.href}
                transitionType="T2"
                aria-label={`Enter ${site.home.worlds.two.kicker}: ${site.home.worlds.two.name}, ${site.home.worlds.two.occasion}, Saturday 7 November 2026`}
                onMouseEnter={() => setHoverDoor('diwali')}
                onMouseLeave={() => setHoverDoor(null)}
                onFocus={() => setHoverDoor('diwali')}
                onBlur={() => setHoverDoor(null)}
                className="group flex flex-col gap-6 border border-[#FCF9FC]/20 bg-[#14161F] p-6 sm:p-10 hover:border-[#F2D38B] transition-colors duration-500"
              >
                {/* Haveli Double Doorway Stage Representation */}
                <div className="relative mx-auto flex h-[220px] sm:h-[260px] w-full max-w-[220px] items-end justify-center border-x border-t border-[#C6A76A]/55 bg-[#7E1347]/40 pt-6 overflow-hidden">
                  <div
                    aria-hidden="true"
                    className="grid h-full w-full grid-cols-2 border border-[#C6A76A]/60 bg-[#7E1347]"
                  >
                    <div className="border-r border-[#C6A76A]/45 transition-transform duration-700 origin-left group-hover:[transform:perspective(700px)_rotateY(-10deg)] group-focus-visible:[transform:perspective(700px)_rotateY(-10deg)] flex items-center justify-end pr-2">
                      <span className="h-3 w-3 border border-[#F2D38B]" />
                    </div>
                    <div className="transition-transform duration-700 origin-right group-hover:[transform:perspective(700px)_rotateY(10deg)] group-focus-visible:[transform:perspective(700px)_rotateY(10deg)] flex items-center justify-start pl-2">
                      <span className="h-3 w-3 border border-[#F2D38B]" />
                    </div>
                  </div>
                  {/* Floor light leak */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-1.5 bg-[#F2D38B] opacity-75 group-hover:opacity-100 transition-opacity"
                  />
                </div>

                {/* Label Block (Part 7 H5) */}
                <div className="flex flex-col gap-2 text-left">
                  <span className="font-cinzel text-[11px] uppercase tracking-[0.28em] text-[#F2D38B]">
                    {site.home.worlds.two.kicker}
                  </span>
                  <span className="font-bodoni italic text-heading font-medium text-[#FFF6EE]">
                    {site.home.worlds.two.name}
                  </span>
                  <span
                    className="font-manrope text-body text-[#FFF6EE]/85"
                    style={{ '--world-accent': '#F2D38B' } as React.CSSProperties}
                  >
                    {site.home.worlds.two.occasion} · {site.home.worlds.two.date} ·{' '}
                    <AnnouncingSoon value={site.home.worlds.two.place} />
                  </span>
                  <span className="mt-3 inline-flex items-center gap-3 font-cinzel text-[12px] uppercase tracking-[0.28em] text-[#FFF6EE] group-hover:text-[#F2D38B] transition-colors">
                    <span>{site.home.worlds.two.cta}</span>
                    <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true">
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
  )
}
