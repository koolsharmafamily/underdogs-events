'use client'

import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { site } from '@/content/site'
import { frame } from '@/state/frame'
import { useStore } from '@/state/store'
import { useSceneProgress } from '@/motion/useSceneProgress'
import { runFadeCutJump, useEnterTransition } from '@/motion/transitions'
import { BadgeDomHost } from '@/ui/BadgeDomHost'
import { Divider } from '@/ui/Divider'
import { InvitationCard } from '@/ui/InvitationCard'
import { TransitionLink } from '@/ui/TransitionLink'
import { Footer } from '@/ui/Footer'
import { AnnouncingSoon } from '@/ui/AnnouncingSoon'
import { DiwaliTitleCard } from './DiwaliTitleCard'
import { diwaliCardOverlayRef } from '@/webgl/tracking/DiwaliCardProjector'

const BULB_COUNT = 16

export function DiwaliView() {
  const motionEnabled = useStore((s) => s.motionEnabled)
  const setWorld = useStore((s) => s.setWorld)
  const [activeStoryLine, setActiveStoryLine] = useState(0)
  const [skyRevealed, setSkyRevealed] = useState(false)

  useEnterTransition('diwali')

  useEffect(() => {
    setWorld('diwali')
    document.documentElement.setAttribute('data-world', 'diwali')
  }, [setWorld])

  const d1Ref = useRef<HTMLElement>(null)
  const d2Ref = useRef<HTMLElement>(null)
  const d3Ref = useRef<HTMLElement>(null)
  const d4Ref = useRef<HTMLElement>(null)
  const d5Ref = useRef<HTMLElement>(null)

  useSceneProgress('D1', d1Ref)
  useSceneProgress('D2', d2Ref)
  useSceneProgress('D3', d3Ref)
  useSceneProgress('D4', d4Ref)
  useSceneProgress('D5', d5Ref)

  useEffect(() => {
    if (!motionEnabled) {
      setActiveStoryLine(0)
      setSkyRevealed(true)
      return
    }

    const onTick = () => {
      const p2 = frame.progress.D2 ?? 0
      const idx = Math.min(4, Math.floor(p2 * 5))
      setActiveStoryLine(idx)
      // From line 3 (idx >= 2) the back drapes lift to reveal the night sky (Part 9 D2)
      setSkyRevealed(idx >= 2)
    }

    gsap.ticker.add(onTick)
    return () => {
      gsap.ticker.remove(onTick)
    }
  }, [motionEnabled])

  return (
    <main id="main-content" className="relative z-10 text-[var(--dw-ivory)]">
      {/* D0 · Film title card */}
      <DiwaliTitleCard />

      {/* D1 · The jewelled badge (160vh, pinned) */}
      <section
        ref={d1Ref}
        data-scene="D1"
        aria-label={site.diwali.title}
        className="scene-section scene-d1"
      >
        <div className="scene-sticky flex flex-col items-center justify-center py-24 text-center">
          <div className="site-container flex flex-col items-center gap-6">
            <BadgeDomHost
              skin="diwali"
              sizeClass="w-[180px] h-[180px] sm:w-[240px] sm:h-[240px]"
              label="Underdogs Jewelled Badge — click or press Enter for sparkle blink"
            />

            <p className="font-cinzel text-[12px] uppercase tracking-[0.28em] text-[var(--dw-gold-bright)]">
              {site.diwali.kicker}
            </p>

            {/* Title "Diwali" with gold shimmer sweep + Devanagari accent above-right (Part 9 D1) */}
            <div className="relative inline-flex flex-col items-center">
              <span
                lang="hi"
                className="self-end mb-1 sm:mb-2 translate-x-2 font-devanagari text-heading text-[var(--dw-gold-bright)]"
              >
                {site.diwali.accent}
              </span>
              <h1
                className={`font-bodoni italic text-display-xl font-medium tracking-tight ${
                  motionEnabled ? 'diwali-gold-shimmer' : 'text-[var(--dw-ivory)]'
                }`}
              >
                {site.diwali.title}
              </h1>
            </div>

            <p className="font-manrope text-lead text-[var(--dw-ivory)]/90">
              {site.diwali.sub}
            </p>

            <button
              type="button"
              onClick={() => runFadeCutJump('#diwali-invitation')}
              className="nav-roll-link mt-1 inline-flex min-h-[44px] items-center gap-2 border-b border-[var(--dw-gold-bright)]/40 px-2 font-cinzel text-[12px] uppercase tracking-[0.28em] text-[var(--dw-gold-bright)] hover:border-[var(--dw-ivory)] hover:text-[var(--dw-ivory)] transition-colors"
            >
              <span className="nav-roll-inner">
                <span className="nav-roll-line">{site.diwali.jump}</span>
                <span className="nav-roll-line" aria-hidden="true">
                  {site.diwali.jump}
                </span>
              </span>
              <svg width="10" height="12" viewBox="0 0 10 12" fill="none" aria-hidden="true">
                <path
                  d="M5 1V10.5M5 10.5L1.5 7M5 10.5L8.5 7"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* D2 · "Now meet the other" (260vh, pinned) */}
      <section
        ref={d2Ref}
        data-scene="D2"
        aria-label="Diwali story"
        className="scene-section scene-d2 bg-transparent"
      >
        <div className="scene-sticky flex flex-col items-center justify-center py-24 text-center">
          <div className="site-container flex flex-col items-center gap-8 max-w-[900px]">
            <Divider variant="sparkle" active />

            {!motionEnabled ? (
              <div className="flex flex-col gap-6 py-6">
                {site.diwali.story.map((line) => (
                  <p
                    key={line}
                    className="font-bodoni italic text-display-l font-medium text-[var(--dw-ivory)] balance-heading"
                  >
                    {line}
                  </p>
                ))}
              </div>
            ) : (
              <div className="relative min-h-[200px] sm:min-h-[240px] w-full flex items-center justify-center">
                {site.diwali.story.map((line, idx) => {
                  const isCurrent = idx === activeStoryLine
                  const isPast = idx < activeStoryLine
                  return (
                    <p
                      key={line}
                      aria-hidden={!isCurrent}
                      className={`font-bodoni italic text-display-l font-medium text-[var(--dw-ivory)] balance-heading transition-all duration-700 ${
                        isCurrent
                          ? 'relative opacity-100 translate-y-0'
                          : isPast
                            ? 'pointer-events-none absolute inset-x-0 opacity-0 -translate-y-10'
                            : 'pointer-events-none absolute inset-x-0 opacity-0 translate-y-10'
                      }`}
                    >
                      {line}
                    </p>
                  )
                })}
              </div>
            )}

            <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--dw-gold-bright)]">
              <span>0{activeStoryLine + 1} / 05</span>
              <span aria-hidden="true">·</span>
              <span>{skyRevealed ? 'Night sky revealed' : 'Velvet chamber'}</span>
            </div>

            <Divider variant="sparkle" active />
          </div>
        </div>
      </section>

      {/* Zero-State Screen-Projected DOM Twin for 3D Gold Foil Card */}
      <div
        ref={(el) => {
          diwaliCardOverlayRef.current = el
        }}
        aria-label="Official Diwali Invitation Card Details"
        className="fixed top-0 left-0 z-30 pointer-events-none opacity-0 flex flex-col justify-between p-6 sm:p-8 rounded-xl bg-[#FBF6EE] text-[#4A102E] border-2 border-[#D4AF6A] shadow-2xl transition-opacity duration-300"
      >
        <div className="flex flex-col items-center text-center gap-1.5">
          <span className="font-bodoni italic text-[clamp(22px,2.6vw,34px)] font-medium text-[#7E1347] tracking-tight">
            {site.diwali.invitation.heading}
          </span>
          <div className="w-full max-w-[200px]">
            <Divider variant="sparkle" active />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:gap-y-4 my-auto text-left">
          {site.diwali.invitation.rows.map((row) => (
            <div key={row.label} className="flex flex-col gap-0.5">
              <span className="font-cinzel text-[11px] sm:text-[12px] uppercase tracking-[0.2em] text-[#7E1347]">
                {row.label}
              </span>
              <span className="font-manrope text-[13px] sm:text-[15px] font-bold text-[#2A081C]">
                <AnnouncingSoon value={row.value} />
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[#D4AF6A]/30 font-cinzel text-[10px] uppercase tracking-[0.2em] text-[#7E1347]">
          <span>UNDERDOGS</span>
          <span>NAGPUR</span>
        </div>
      </div>

      {/* D3 · The invitation (180vh, pinned) */}
      <section
        id="diwali-invitation"
        ref={d3Ref}
        data-scene="D3"
        aria-label="Diwali Invitation Details"
        className="scene-section scene-d3"
      >
        <div className="scene-sticky flex flex-col items-center justify-center py-20">
          <div className="site-container flex flex-col items-center">
            {/* Fallback for reduced motion or T0 */}
            {!motionEnabled && (
              <InvitationCard
                variant="diwali"
                heading={site.diwali.invitation.heading}
                rows={site.diwali.invitation.rows}
              />
            )}
          </div>
        </div>
      </section>

      {/* D4 · Now showing: the official teaser (100vh, not pinned) */}
      <section
        ref={d4Ref}
        data-scene="D4"
        aria-labelledby="diwali-teaser-label"
        className="relative min-h-[100svh] flex flex-col items-center justify-center py-24"
      >
        <div className="site-container flex flex-col items-center gap-8">
          <h2
            id="diwali-teaser-label"
            className="font-mono text-[12px] uppercase tracking-[0.08em] text-[var(--dw-gold-bright)]"
          >
            NOW SHOWING
          </h2>

          {/* Cinema lightbox with gold frame and marquee bulbs (shown on mobile per Part 9 D4) */}
          <figure className="md:hidden relative border-2 border-[var(--dw-gold)] bg-[#14161F] p-5 sm:p-7 max-w-[460px] w-full">
            {/* Marquee bulbs along top and bottom */}
            <div
              aria-hidden="true"
              className="mb-3 flex items-center justify-between px-1"
            >
              {Array.from({ length: BULB_COUNT }).map((_, idx) => (
                <span
                  key={`top-${idx}`}
                  style={{ animationDelay: `${idx * 18}ms` }}
                  className="marquee-bulb h-1.5 w-1.5 bg-[var(--dw-gold-bright)]"
                />
              ))}
            </div>

            <div className="border border-[var(--dw-gold)]/50 p-1">
              <Image
                src={site.diwali.teaser.src}
                alt={site.diwali.teaser.alt}
                width={800}
                height={1000}
                className="h-auto w-full object-cover"
              />
            </div>

            <div
              aria-hidden="true"
              className="mt-3 flex items-center justify-between px-1"
            >
              {Array.from({ length: BULB_COUNT }).map((_, idx) => (
                <span
                  key={`bot-${idx}`}
                  style={{ animationDelay: `${idx * 18}ms` }}
                  className="marquee-bulb h-1.5 w-1.5 bg-[var(--dw-gold-bright)]"
                />
              ))}
            </div>
          </figure>
        </div>
      </section>

      {/* D5 · Outro (120vh, pinned) */}
      <section
        ref={d5Ref}
        data-scene="D5"
        aria-label="Diwali Outro"
        className="scene-section scene-d5"
      >
        <div className="scene-sticky flex flex-col items-center justify-center py-24 text-center">
          <div className="site-container flex flex-col items-center gap-8 max-w-[780px]">
            <BadgeDomHost
              skin="diwali"
              sizeClass="w-[150px] h-[150px]"
              label="Underdogs Jewelled Badge"
            />

            <div className="w-full max-w-[520px] flex flex-col items-center gap-4">
              <Divider variant="sparkle" active />
              <p className="font-cinzel text-[13px] uppercase tracking-[0.28em] text-[var(--dw-ivory)]">
                {site.diwali.outro.tagline}
              </p>
              <Divider variant="sparkle" active />
            </div>

            <p
              lang="hi"
              className="font-devanagari text-display-l text-[var(--dw-gold-bright)]"
            >
              {site.diwali.outro.wish}
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
              <TransitionLink
                href={site.diwali.outro.other.href}
                transitionType="T3"
                className="group inline-flex min-h-[48px] items-center gap-3 border border-[var(--dw-gold)] bg-[var(--dw-rani-deep)] px-6 py-3 font-cinzel text-[12px] uppercase tracking-[0.28em] text-[var(--dw-ivory)] hover:border-[var(--dw-gold-bright)] hover:text-[var(--dw-gold-bright)] transition-colors"
              >
                <span>{site.diwali.outro.other.label}</span>
                <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true">
                  <path
                    d="M1 5H12.5M12.5 5L8.5 1M12.5 5L8.5 9"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
              </TransitionLink>

              <TransitionLink
                href={site.diwali.outro.back.href}
                transitionType="T4"
                origin="gate"
                className="inline-flex min-h-[48px] items-center gap-3 px-4 py-3 font-cinzel text-[12px] uppercase tracking-[0.28em] text-[var(--dw-ivory)]/80 hover:text-[var(--dw-gold-bright)] transition-colors"
              >
                <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true">
                  <path
                    d="M13 5H1.5M1.5 5L5.5 1M1.5 5L5.5 9"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
                <span>{site.diwali.outro.back.label}</span>
              </TransitionLink>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
