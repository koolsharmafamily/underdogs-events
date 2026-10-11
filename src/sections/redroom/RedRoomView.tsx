'use client'

import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { site } from '@/content/site'
import { frame } from '@/state/frame'
import { useStore } from '@/state/store'
import { useSceneProgress } from '@/motion/useSceneProgress'
import { runFadeCutJump } from '@/motion/transitions'
import { BadgeDomHost } from '@/ui/BadgeDomHost'
import { Divider } from '@/ui/Divider'
import { InvitationCard } from '@/ui/InvitationCard'
import { TransitionLink } from '@/ui/TransitionLink'
import { Footer } from '@/ui/Footer'

const DRIPS = [
  { x: '11%', height: 28, delay: 0.1 },
  { x: '24%', height: 46, delay: 0.35 },
  { x: '41%', height: 22, delay: 0.2 },
  { x: '57%', height: 52, delay: 0.5 },
  { x: '73%', height: 34, delay: 0.25 },
  { x: '88%', height: 42, delay: 0.45 },
] as const

export function RedRoomView() {
  const motionEnabled = useStore((s) => s.motionEnabled)
  const [entryDone, setEntryDone] = useState(false)
  const [activeStoryIdx, setActiveStoryIdx] = useState(0)
  const [dressStep, setDressStep] = useState(4)
  const [cardStage, setCardStage] = useState<'sealed' | 'opening' | 'open'>('open')

  const r1Ref = useRef<HTMLElement>(null)
  const r2Ref = useRef<HTMLElement>(null)
  const r3Ref = useRef<HTMLElement>(null)
  const r4Ref = useRef<HTMLElement>(null)
  const r5Ref = useRef<HTMLElement>(null)
  const r6Ref = useRef<HTMLElement>(null)

  useSceneProgress('R1', r1Ref)
  useSceneProgress('R2', r2Ref)
  useSceneProgress('R3', r3Ref)
  useSceneProgress('R4', r4Ref)
  useSceneProgress('R5', r5Ref)
  useSceneProgress('R6', r6Ref)

  // R0 Direct visit entry curtain reveal
  useEffect(() => {
    if (!motionEnabled) {
      setEntryDone(true)
      return
    }
    const timer = window.setTimeout(() => {
      setEntryDone(true)
    }, 850)
    return () => window.clearTimeout(timer)
  }, [motionEnabled])

  useEffect(() => {
    if (!motionEnabled) {
      setActiveStoryIdx(0)
      setDressStep(4)
      setCardStage('open')
      return
    }

    const onTick = () => {
      const p2 = frame.progress.R2 ?? 0
      if (p2 < 0.34) {
        setActiveStoryIdx(0)
      } else if (p2 < 0.67) {
        setActiveStoryIdx(1)
      } else {
        setActiveStoryIdx(2)
      }

      const p3 = frame.progress.R3 ?? 0
      if (p3 < 0.22) {
        setDressStep(1)
      } else if (p3 < 0.48) {
        setDressStep(2)
      } else if (p3 < 0.72) {
        setDressStep(3)
      } else {
        setDressStep(4)
      }

      const p4 = frame.progress.R4 ?? 0
      if (p4 < 0.25) {
        setCardStage('sealed')
      } else if (p4 < 0.55) {
        setCardStage('opening')
      } else {
        setCardStage('open')
      }
    }

    gsap.ticker.add(onTick)
    return () => {
      gsap.ticker.remove(onTick)
    }
  }, [motionEnabled])

  return (
    <main id="main-content" className="relative z-10 text-[var(--rr-bone)]">
      {/* R0 · Entry overlay ("UNDERDOGS PRESENT" over curtains) */}
      {!entryDone && (
        <div
          aria-hidden="true"
          onClick={() => setEntryDone(true)}
          className="fixed inset-0 z-40 flex items-center justify-center bg-[#060101] transition-opacity duration-700"
        >
          <p className="font-cinzel text-[13px] uppercase tracking-[0.28em] text-[#EFD9CD]">
            {site.redRoom.presenter}
          </p>
        </div>
      )}

      {/* R1 · Title and the smoke dragon (160vh, pinned) */}
      <section
        ref={r1Ref}
        data-scene="R1"
        aria-label={site.redRoom.title}
        className="scene-section scene-r1"
      >
        <div className="scene-sticky flex flex-col items-center justify-center py-24 text-center">
          <div className="site-container flex flex-col items-center gap-6">
            <p className="font-cinzel text-[11px] uppercase tracking-[0.28em] text-[var(--rr-ash)]">
              {site.redRoom.presenter}
            </p>

            <BadgeDomHost
              skin="redroom"
              sizeClass="w-[180px] h-[180px] sm:w-[230px] sm:h-[230px]"
              label="Underdogs Neon Badge — click or press Enter to blink"
            />

            <p className="font-cinzel text-[12px] uppercase tracking-[0.28em] text-[var(--rr-neon)]">
              {site.redRoom.kicker}
            </p>

            {/* Title with SVG blood drips layer underneath (Part 8 R1) */}
            <div className="relative inline-block">
              <h1 className="font-cinzel-decorative text-display-xl font-black uppercase text-[var(--rr-bone)] balance-heading">
                {site.redRoom.title}
              </h1>

              {/* SVG blood drips growing from bottom edges */}
              <div
                aria-hidden="true"
                className="pointer-events-none relative mx-auto h-14 w-full"
              >
                {DRIPS.map((drip, i) => (
                  <svg
                    key={i}
                    width="8"
                    height={drip.height}
                    viewBox={`0 0 8 ${drip.height}`}
                    style={{
                      left: drip.x,
                      animationDelay: `${drip.delay}s`,
                    }}
                    className={`absolute top-0 text-[var(--rr-blood)] origin-top ${
                      motionEnabled ? 'rr-blood-drip' : ''
                    }`}
                  >
                    <path
                      d={`M3 0 H5 V${drip.height - 5} C5 ${drip.height - 1} 7 ${
                        drip.height
                      } 4 ${drip.height} C1 ${drip.height} 3 ${
                        drip.height - 1
                      } 3 ${drip.height - 5} Z`}
                      fill="currentColor"
                    />
                  </svg>
                ))}
              </div>
            </div>

            <p className="font-manrope text-lead text-[var(--rr-ash)]">
              {site.redRoom.sub}
            </p>

            <button
              type="button"
              onClick={() => runFadeCutJump('#redroom-invitation')}
              className="nav-roll-link mt-1 inline-flex min-h-[44px] items-center gap-2 border-b border-[var(--rr-bone)]/30 px-2 font-cinzel text-[12px] uppercase tracking-[0.28em] text-[var(--rr-bone)] hover:border-[var(--rr-neon)] hover:text-[var(--rr-neon)] transition-colors"
            >
              <span className="nav-roll-inner">
                <span className="nav-roll-line">{site.redRoom.jump}</span>
                <span className="nav-roll-line" aria-hidden="true">
                  {site.redRoom.jump}
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

      {/* R2 · The story (200vh, pinned) */}
      <section
        ref={r2Ref}
        data-scene="R2"
        aria-label="The Red Room story"
        className="scene-section scene-r2"
      >
        <div className="scene-sticky flex flex-col items-center justify-center py-24 text-center">
          <div className="site-container flex flex-col items-center gap-8 max-w-[960px]">
            <Divider variant="diamond" active />

            {!motionEnabled ? (
              <div className="flex flex-col gap-8 py-6">
                {site.redRoom.story.map((line) => (
                  <p
                    key={line}
                    className="font-cormorant italic text-heading sm:text-display-l font-medium text-[var(--rr-bone)] balance-heading"
                  >
                    {line}
                  </p>
                ))}
              </div>
            ) : (
              <div className="relative min-h-[240px] sm:min-h-[300px] w-full flex items-center justify-center">
                {site.redRoom.story.map((line, idx) => {
                  const isCurrent = idx === activeStoryIdx
                  const words = line.split(' ')
                  return (
                    <p
                      key={line}
                      aria-hidden={!isCurrent}
                      className={`font-cormorant italic text-heading sm:text-display-l font-medium text-[var(--rr-bone)] balance-heading transition-all duration-700 ${
                        isCurrent
                          ? 'relative opacity-100'
                          : 'pointer-events-none absolute inset-x-0 opacity-0'
                      }`}
                    >
                      {words.map((word, wIdx) => (
                        <span
                          key={`${idx}-${wIdx}`}
                          style={{
                            transitionDelay: isCurrent ? `${wIdx * 40}ms` : '0ms',
                          }}
                          className={`inline-block mr-[0.26em] transition-all duration-500 ${
                            isCurrent
                              ? 'opacity-100 blur-0 translate-y-0'
                              : 'opacity-0 blur-[8px] translate-y-1'
                          }`}
                        >
                          {word}
                        </span>
                      ))}
                    </p>
                  )
                })}
              </div>
            )}

            <Divider variant="diamond" active />
          </div>
        </div>
      </section>

      {/* R3 · Dress code (160vh, pinned) */}
      <section
        ref={r3Ref}
        data-scene="R3"
        aria-label="Dress code"
        className="scene-section scene-r3"
      >
        <div className="scene-sticky flex items-center py-24">
          <div className="site-container flex flex-col items-center md:items-start text-center md:text-left gap-8">
            <div className="flex flex-col gap-3">
              {site.redRoom.dress.lines.map((line, idx) => {
                const lit = idx < dressStep
                return (
                  <p
                    key={line}
                    className={`font-cinzel text-display-l font-semibold uppercase tracking-tight text-[var(--rr-bone)] transition-all duration-700 ${
                      lit ? 'opacity-100 translate-y-0' : 'opacity-20 translate-y-4'
                    }`}
                  >
                    {line}
                  </p>
                )
              })}
            </div>

            <div className="w-full max-w-[680px]">
              <Divider variant="diamond" active={dressStep >= 4} />
            </div>

            <p
              className={`font-cinzel text-heading font-bold uppercase tracking-[0.04em] text-[var(--rr-neon)] balance-heading transition-opacity duration-500 ${
                dressStep >= 4 ? 'opacity-100 rr-neon-pulse' : 'opacity-25'
              }`}
            >
              {site.redRoom.dress.warning}
            </p>
          </div>
        </div>
      </section>

      {/* R4 · The invitation (220vh, pinned) */}
      <section
        id="redroom-invitation"
        ref={r4Ref}
        data-scene="R4"
        aria-label="The Red Room Invitation Details"
        className="scene-section scene-r4"
      >
        <div className="scene-sticky flex flex-col items-center justify-center py-20">
          <div className="site-container flex flex-col items-center gap-6">
            <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--rr-ash)]">
              <span>
                {cardStage === 'sealed'
                  ? 'Seal intact — scroll to break the wax seal'
                  : cardStage === 'opening'
                    ? 'Envelope opening'
                    : 'Official Invitation'}
              </span>
            </div>

            <div
              className={`w-full transition-transform duration-700 ${
                cardStage === 'sealed'
                  ? 'scale-95'
                  : cardStage === 'opening'
                    ? 'scale-[0.98]'
                    : 'scale-100'
              }`}
            >
              <InvitationCard
                variant="redroom"
                heading={site.redRoom.invitation.heading}
                rows={site.redRoom.invitation.rows}
              />
            </div>
          </div>
        </div>
      </section>

      {/* R5 · In association with (100vh, not pinned) */}
      <section
        ref={r5Ref}
        data-scene="R5"
        aria-labelledby="redroom-partners-label"
        className="relative min-h-[100svh] flex items-center py-24"
      >
        <div className="site-container site-grid items-center gap-y-12">
          {/* Framed official poster on the left wall */}
          <div className="col-span-4 md:col-span-4 lg:col-span-5 flex justify-center">
            <figure className="relative border-2 border-[var(--rr-gilt)] bg-[#060101] p-3 max-w-[380px] w-full">
              <div className="border border-[var(--rr-gilt)]/40 p-1">
                <Image
                  src={site.redRoom.poster.src}
                  alt={site.redRoom.poster.alt}
                  width={760}
                  height={950}
                  className="h-auto w-full object-cover"
                />
              </div>
            </figure>
          </div>

          {/* Partner rows on the right */}
          <div className="col-span-4 md:col-span-4 lg:col-span-6 lg:col-start-7 flex flex-col items-center text-center gap-6">
            <h2
              id="redroom-partners-label"
              className="font-cinzel text-[12px] uppercase tracking-[0.28em] text-[var(--rr-ash)]"
            >
              {site.redRoom.partners.label}
            </h2>

            <div className="w-full flex flex-col gap-5">
              {site.redRoom.partners.list.map((partner, idx) => (
                <React.Fragment key={partner.name}>
                  <div className="flex flex-col items-center gap-1.5 py-2 candle-flicker-text">
                    <span className="font-cinzel text-[11px] uppercase tracking-[0.28em] text-[var(--rr-ash)]">
                      {partner.role}
                    </span>
                    <span className="font-cormorant text-heading font-medium text-[var(--rr-bone)]">
                      {partner.name}
                    </span>
                  </div>
                  {idx < site.redRoom.partners.list.length - 1 && (
                    <Divider variant="diamond" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* R6 · Outro (120vh, pinned) */}
      <section
        ref={r6Ref}
        data-scene="R6"
        aria-label="The Red Room Outro"
        className="scene-section scene-r6"
      >
        <div className="scene-sticky flex flex-col items-center justify-center py-24 text-center">
          <div className="site-container flex flex-col items-center gap-8 max-w-[780px]">
            <BadgeDomHost
              skin="redroom"
              sizeClass="w-[140px] h-[140px]"
              label="Underdogs Neon Badge"
            />

            <div className="flex flex-col items-center gap-3">
              {site.redRoom.outro.lines.map((line) => (
                <p
                  key={line}
                  className="font-cormorant italic text-display-l font-medium text-[var(--rr-bone)] balance-heading"
                >
                  {line}
                </p>
              ))}
            </div>

            <div className="w-full max-w-[520px] flex flex-col items-center gap-4">
              <Divider variant="diamond" active />
              <p className="font-cinzel text-[13px] uppercase tracking-[0.28em] text-[var(--rr-bone)]">
                {site.redRoom.outro.tagline}
              </p>
              <Divider variant="diamond" active />
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
              <TransitionLink
                href={site.redRoom.outro.next.href}
                transitionType="T3"
                className="group inline-flex min-h-[48px] items-center gap-3 border border-[var(--rr-bone)]/40 bg-[var(--rr-oxblood)] px-6 py-3 font-cinzel text-[12px] uppercase tracking-[0.28em] text-[var(--rr-bone)] hover:border-[var(--rr-neon)] hover:text-[var(--rr-neon)] transition-colors"
              >
                <span>{site.redRoom.outro.next.label}</span>
                <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true">
                  <path
                    d="M1 5H12.5M12.5 5L8.5 1M12.5 5L8.5 9"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
              </TransitionLink>

              <TransitionLink
                href={site.redRoom.outro.back.href}
                transitionType="T4"
                className="inline-flex min-h-[48px] items-center gap-3 px-4 py-3 font-cinzel text-[12px] uppercase tracking-[0.28em] text-[var(--rr-ash)] hover:text-[var(--rr-bone)] transition-colors"
              >
                <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true">
                  <path
                    d="M13 5H1.5M1.5 5L5.5 1M1.5 5L5.5 9"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
                <span>{site.redRoom.outro.back.label}</span>
              </TransitionLink>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
