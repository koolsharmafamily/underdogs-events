"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { DiwaliTitleCard } from "./DiwaliTitleCard";
import { site } from "@/content/site";
import { frame } from "@/state/frame";
import { useStore } from "@/state/store";
import { useSceneProgress } from "@/motion/useSceneProgress";
import { useLineReveal } from "@/motion/useLineReveal";
import { useEnterTransition } from "@/motion/transitions";
import { BadgeDomHost } from "@/ui/BadgeDomHost";
import { Divider } from "@/ui/Divider";
import { InvitationCard } from "@/ui/InvitationCard";
import { TransitionLink } from "@/ui/TransitionLink";
import { Footer } from "@/ui/Footer";
import { AnnouncingSoon } from "@/ui/AnnouncingSoon";
import { diwaliCardOverlayRef } from "@/webgl/tracking/DiwaliCardProjector";

const BULB_COUNT = 16;

export function DiwaliView() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  useLineReveal(titleRef, { triggerOnMount: true, delay: .18 });
  const motionEnabled = useStore((s) => s.motionEnabled);
  const setWorld = useStore((s) => s.setWorld);
  const [activeStoryLine, setActiveStoryLine] = useState(0);
  const [skyRevealed, setSkyRevealed] = useState(false);

  useEnterTransition("diwali");

  useEffect(() => {
    setWorld("diwali");
    document.documentElement.setAttribute("data-world", "diwali");
  }, [setWorld]);

  const d1Ref = useRef<HTMLElement>(null);
  const d2Ref = useRef<HTMLElement>(null);
  const d3Ref = useRef<HTMLElement>(null);
  const d4Ref = useRef<HTMLElement>(null);
  const d5Ref = useRef<HTMLElement>(null);

  useSceneProgress("D1", d1Ref);
  useSceneProgress("D2", d2Ref);
  useSceneProgress("D3", d3Ref);
  useSceneProgress("D4", d4Ref);
  useSceneProgress("D5", d5Ref);

  useEffect(() => {
    if (!motionEnabled) {
      setActiveStoryLine(0);
      setSkyRevealed(true);
      return;
    }

    const prev = {
      line: 0,
      sky: false,
    };

    const onTick = () => {
      const p2 = frame.progress.D2 ?? 0;
      const idx = Math.min(4, Math.floor(p2 * 5));
      if (idx !== prev.line) {
        prev.line = idx;
        setActiveStoryLine(idx);
      }
      // From line 3 (idx >= 2) the back drapes lift to reveal the night sky (Part 9 D2)
      const nextSky = idx >= 2;
      if (nextSky !== prev.sky) {
        prev.sky = nextSky;
        setSkyRevealed(nextSky);
      }
    };

    gsap.ticker.add(onTick);
    return () => {
      gsap.ticker.remove(onTick);
    };
  }, [motionEnabled]);

  return (
    <main id="main-content" className="relative z-10 text-[var(--dw-ivory)]">
      <DiwaliTitleCard />
      {/* D1 · The jewelled badge (110vh, pinned) */}
      <section
        ref={d1Ref}
        data-scene="D1"
        aria-label={site.diwali.title}
        className="scene-section scene-d1"
      >
        <div className="scene-sticky flex flex-col items-center justify-between pt-14 pb-10 sm:py-16 text-center">
          <div className="site-container flex flex-col items-center">
            <BadgeDomHost
              skin="diwali"
              sizeClass="w-[180px] h-[180px] sm:w-[220px] sm:h-[220px]"
              label="Underdogs Jewelled Badge — click or press Enter for sparkle blink"
            />
          </div>

          <div className="site-container flex flex-col items-center gap-3 sm:gap-4">
            <p className="font-cinzel text-[12px] uppercase tracking-[0.28em] text-[var(--dw-gold-bright)]">
              {site.diwali.kicker}
            </p>

            {/* Title "Diwali" with gold shimmer sweep + Devanagari accent above-right (Part 9 D1) */}
            <div className="relative inline-flex flex-col items-center">
              <span
                lang="hi"
                className="self-end mb-1 translate-x-2 font-devanagari text-[clamp(22px,2.5vw,38px)] text-[var(--dw-gold-bright)]"
              >
                {site.diwali.accent}
              </span>
              <h1 ref={titleRef}
                className={`font-bodoni italic text-[clamp(48px,7.5vw,128px)] leading-[0.9] font-medium tracking-tight ${
                  motionEnabled
                    ? "diwali-gold-shimmer"
                    : "text-[var(--dw-ivory)]"
                }`}
              >
                {site.diwali.title}
              </h1>
            </div>

            <p className="font-manrope text-sm sm:text-base text-[var(--dw-ivory)]/90">
              {site.diwali.sub}
            </p>
          </div>
        </div>
      </section>

      {/* D2 · "Now meet the other" (180vh, pinned) */}
      <section
        ref={d2Ref}
        data-scene="D2"
        aria-label="Diwali story"
        className="scene-section scene-d2 bg-transparent"
      >
        <div className="scene-sticky flex flex-col items-center justify-center py-20 text-center">
          <div className="site-container flex flex-col items-center gap-6 sm:gap-8 max-w-[820px]">
            <Divider variant="sparkle" active />

            {!motionEnabled ? (
              <div className="flex flex-col gap-3.5 py-2">
                {site.diwali.story.map((line) => (
                  <p
                    key={line}
                    className="font-bodoni italic text-[clamp(18px,2.1vw,28px)] leading-[1.25] font-medium text-[var(--dw-ivory)] balance-heading"
                  >
                    {line}
                  </p>
                ))}
              </div>
            ) : (
              <div className="relative min-h-[180px] sm:min-h-[220px] w-full flex items-center justify-center">
                {site.diwali.story.map((line, idx) => {
                  const isCurrent = idx === activeStoryLine;
                  const isPast = idx < activeStoryLine;
                  return (
                    <p
                      key={line}
                      aria-hidden={!isCurrent}
                      className={`font-bodoni italic text-[clamp(24px,3.4vw,52px)] leading-[1.15] font-medium text-[var(--dw-ivory)] balance-heading transition-all ${
                        isCurrent
                          ? "duration-[650ms] relative opacity-100 translate-y-0"
                          : isPast
                            ? "duration-[350ms] pointer-events-none absolute inset-x-0 opacity-0 -translate-y-10"
                            : "duration-[350ms] pointer-events-none absolute inset-x-0 opacity-0 translate-y-10"
                      }`}
                    >
                      {line}
                    </p>
                  );
                })}
              </div>
            )}

            <div className="flex items-center justify-center font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--dw-gold-bright)]">
              <span>
                {skyRevealed ? "Night sky revealed" : "Velvet chamber"}
              </span>
            </div>

            <Divider variant="sparkle" active />
          </div>
        </div>
      </section>

      {/* Zero-State Screen-Projected DOM Twin for 3D Gold Foil Card */}
      <div
        ref={(el) => {
          diwaliCardOverlayRef.current = el;
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

      {/* D3 · The invitation (130vh, pinned) */}
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

      {/* D4 · Now showing: the official teaser (80vh, not pinned) */}
      <section
        ref={d4Ref}
        data-scene="D4"
        aria-labelledby="diwali-teaser-label"
        className="relative scene-d4 flex flex-col items-center justify-center py-20"
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

      {/* D4.5 · Headline Artist: DJ Yogi */}
      <section
        data-scene="D-DJ"
        aria-label="Headline Artist — DJ Yogi"
        className="relative z-20 py-20 border-t border-[var(--dw-gold)]/25 bg-gradient-to-b from-transparent via-[#250817]/85 to-transparent"
      >
        <div className="site-container site-grid items-center gap-y-10">
          {/* Artist Portrait Placeholder */}
          <div className="col-span-4 md:col-span-4 lg:col-span-5 flex justify-center">
            <div className="relative group w-full max-w-[340px] aspect-[4/5] rounded-sm p-3 bg-gradient-to-b from-[#3d0f28] to-[#1a0511] border border-[var(--dw-gold-bright)]/40 shadow-[0_12px_40px_rgba(242,211,139,0.15)] flex flex-col items-center justify-center overflow-hidden">
              {/* Outer decorative gold corners */}
              <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[var(--dw-gold-bright)]" />
              <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[var(--dw-gold-bright)]" />
              <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[var(--dw-gold-bright)]" />
              <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[var(--dw-gold-bright)]" />

              {/* Placeholder Inner Frame */}
              <div className="w-full h-full border border-dashed border-[var(--dw-gold)]/35 bg-[#14020c]/85 flex flex-col items-center justify-center p-6 text-center gap-4">
                <div className="w-20 h-20 rounded-full border border-[var(--dw-gold-bright)]/50 bg-[#2a081c] flex items-center justify-center shadow-[0_0_24px_rgba(242,211,139,0.25)]">
                  <svg
                    width="36"
                    height="36"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#F2D38B"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M9 18V5l12-2v13" />
                    <circle cx="6" cy="18" r="3" />
                    <circle cx="18" cy="16" r="3" />
                  </svg>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-cinzel text-[14px] uppercase tracking-[0.2em] text-[var(--dw-ivory)] font-semibold">
                    DJ YOGI
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--dw-gold)]">
                    Official Artist Photo Placeholder
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Artist Bio & Profile */}
          <div className="col-span-4 md:col-span-4 lg:col-span-6 lg:col-start-7 flex flex-col items-start text-left gap-5">
            <span className="font-cinzel text-[11px] sm:text-[12px] uppercase tracking-[0.32em] text-[var(--dw-gold-bright)]">
              {site.diwali.dj.role}
            </span>
            <h2 className="font-bodoni italic text-[clamp(2.4rem,4.4vw,3.6rem)] font-medium text-[var(--dw-ivory)] leading-tight">
              {site.diwali.dj.name}
            </h2>
            <p className="font-cinzel text-[12px] sm:text-[13px] uppercase tracking-[0.18em] text-[var(--dw-gold-bright)]/90">
              {site.diwali.dj.genre}
            </p>
            <p className="font-manrope text-[15px] sm:text-[16px] leading-[1.7] text-[var(--dw-ivory)]/85 max-w-[540px]">
              {site.diwali.dj.bio}
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2 font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--dw-gold)]">
              <span className="inline-flex items-center gap-2 border border-[var(--dw-gold)]/40 bg-[#250817] px-3.5 py-1.5 rounded-sm text-[var(--dw-ivory)]">
                {site.diwali.dj.date}
              </span>
              <span className="inline-flex items-center gap-2 border border-[var(--dw-gold)]/40 bg-[#250817] px-3.5 py-1.5 rounded-sm text-[var(--dw-gold-bright)]">
                Diwali Dhamaka · Nagpur
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* D5 · Outro (90vh, pinned) */}
      <section
        ref={d5Ref}
        data-scene="D5"
        aria-label="Diwali Outro"
        className="scene-section scene-d5"
      >
        <div className="scene-sticky flex flex-col items-center justify-between pt-16 pb-12 sm:py-20 text-center">
          <div className="site-container flex flex-col items-center justify-between h-full max-w-[780px]">
            <BadgeDomHost
              skin="diwali"
              sizeClass="w-[140px] h-[140px]"
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
              className="font-devanagari text-[clamp(26px,3.6vw,52px)] leading-[1.15] text-[var(--dw-gold-bright)]"
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
              </TransitionLink>

              <TransitionLink
                href={site.diwali.outro.back.href}
                transitionType="T4"
                origin="gate"
                className="inline-flex min-h-[48px] items-center gap-3 px-4 py-3 font-cinzel text-[12px] uppercase tracking-[0.28em] text-[var(--dw-ivory)]/80 hover:text-[var(--dw-gold-bright)] transition-colors"
              >
                <svg
                  width="14"
                  height="10"
                  viewBox="0 0 14 10"
                  fill="none"
                  aria-hidden="true"
                >
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
  );
}
