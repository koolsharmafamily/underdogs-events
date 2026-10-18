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
import { getLenis } from "@/motion/clock";
import { BadgeDomHost } from "@/ui/BadgeDomHost";
import { Divider } from "@/ui/Divider";
import { InvitationCard } from "@/ui/InvitationCard";
import { ArtistPortrait } from "@/ui/ArtistPortrait";
import { TransitionLink } from "@/ui/TransitionLink";
import { Footer } from "@/ui/Footer";
import { BookingDetails } from "@/ui/BookingDetails";
import { cardOverlayRef } from "@/webgl/tracking/refs";

const DRIPS = [
  { x: "11%", height: 28, delay: 0.1 },
  { x: "24%", height: 46, delay: 0.35 },
  { x: "41%", height: 22, delay: 0.2 },
  { x: "57%", height: 52, delay: 0.5 },
  { x: "73%", height: 34, delay: 0.25 },
  { x: "88%", height: 42, delay: 0.45 },
] as const;

export function RedRoomView() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  useLineReveal(titleRef, { triggerOnMount: true, delay: 0.08 });
  const motionEnabled = useStore((s) => s.motionEnabled);
  const setWorld = useStore((s) => s.setWorld);
  const [activeStoryIdx, setActiveStoryIdx] = useState(0);
  const [dressStep, setDressStep] = useState(4);
  const [cardStage, setCardStage] = useState<"sealed" | "opening" | "open">(
    "open",
  );

  useEnterTransition("redroom");

  useEffect(() => {
    setWorld("redroom");
    document.documentElement.setAttribute("data-world", "redroom");
  }, [setWorld]);

  const r1Ref = useRef<HTMLElement>(null);
  const r2Ref = useRef<HTMLElement>(null);
  const r3Ref = useRef<HTMLElement>(null);
  const r4Ref = useRef<HTMLElement>(null);
  const r5Ref = useRef<HTMLElement>(null);
  const r6Ref = useRef<HTMLElement>(null);

  useSceneProgress("R1", r1Ref);
  useSceneProgress("R2", r2Ref);
  useSceneProgress("R3", r3Ref);
  useSceneProgress("R4", r4Ref);
  useSceneProgress("R5", r5Ref);
  useSceneProgress("R6", r6Ref);

  const handleJumpToDetails = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const el = r4Ref.current;
    if (!el) return;
    // Scroll directly into the open-card hold of R4 (55% through the section) so the invitation is immediately open and scannable
    const targetY = motionEnabled
      ? el.offsetTop + Math.round(el.offsetHeight * 0.52)
      : el.offsetTop;
    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(targetY, { duration: motionEnabled ? 0.85 : 0 });
    } else {
      window.scrollTo({ top: targetY, behavior: motionEnabled ? "smooth" : "instant" });
    }
  };

  useEffect(() => {
    if (!motionEnabled) {
      setActiveStoryIdx(0);
      setDressStep(4);
      setCardStage("open");
      return;
    }

    const prev = {
      story: 0,
      dress: 4,
      card: "open" as "sealed" | "opening" | "open",
    };

    const onTick = () => {
      const p2 = frame.linearProgress.R2 ?? 0;
      const nextStory = p2 < 0.34 ? 0 : p2 < 0.67 ? 1 : 2;
      if (nextStory !== prev.story) {
        prev.story = nextStory;
        setActiveStoryIdx(nextStory);
      }

      const p3 = frame.linearProgress.R3 ?? 0;
      const nextDress = p3 < 0.22 ? 1 : p3 < 0.48 ? 2 : p3 < 0.72 ? 3 : 4;
      if (nextDress !== prev.dress) {
        prev.dress = nextDress;
        setDressStep(nextDress);
      }

      const p4 = frame.linearProgress.R4 ?? 0;
      const nextCard = p4 < 0.25 ? "sealed" : p4 < 0.55 ? "opening" : "open";
      if (nextCard !== prev.card) {
        prev.card = nextCard;
        setCardStage(nextCard);
      }
    };

    gsap.ticker.add(onTick);
    return () => {
      gsap.ticker.remove(onTick);
    };
  }, [motionEnabled]);

  return (
    <main id="main-content" className="relative z-10 text-[var(--rr-bone)]">
      {/* R1 · Title and the smoke dragon (110vh, pinned) */}
      <section
        ref={r1Ref}
        data-scene="R1"
        aria-label={site.redRoom.title}
        className="scene-section scene-r1"
      >
        <div className="scene-sticky flex flex-col justify-between items-center pt-20 sm:pt-24 pb-[calc(76px+env(safe-area-inset-bottom))] md:pb-12 text-center pointer-events-none">
          {/* Upper Stage: Presenter and Interactive 3D Badge Host */}
          <div className="site-container flex flex-col items-center gap-3 pointer-events-auto">
            <p className="font-cinzel text-[11px] uppercase tracking-[0.28em] text-[var(--rr-ash)]">
              {site.redRoom.presenter}
            </p>

            <div className="flex items-center justify-center my-2 sm:my-4">
              <BadgeDomHost
                skin="redroom"
                sizeClass="w-[180px] h-[180px] sm:w-[220px] sm:h-[220px]"
                label="Underdogs Halloween badge — click or press Enter to blink"
              />
            </div>
          </div>

          {/* Lower Stage: Kicker, Title, Blood Drips, Date and Jump Action */}
          <div className="site-container flex flex-col items-center gap-2.5 sm:gap-3.5 pointer-events-auto">
            <p className="font-cinzel text-[11px] sm:text-[12px] uppercase tracking-[0.32em] text-[var(--rr-neon)]">
              {site.redRoom.kicker}
            </p>

            {/* Title with SVG blood drips layer underneath (Part 8 R1) */}
            <div className="relative inline-block">
              <h1
                ref={titleRef}
                className="font-nosifer text-[clamp(2.0rem,5.5vw,4.0rem)] uppercase text-[#E81414] tracking-[0.04em] leading-[1.15] balance-heading drop-shadow-[0_8px_32px_rgba(210,10,21,0.9)]"
              >
                {site.redRoom.title}
              </h1>

              {/* Authored organic blood drips sliding from the title */}
              <div
                aria-hidden="true"
                className="pointer-events-none relative mx-auto h-10 sm:h-12 w-full"
              >
                {DRIPS.map((drip, i) => (
                  <svg
                    key={i}
                    width="12"
                    height={drip.height}
                    viewBox={`0 0 12 ${drip.height}`}
                    style={{
                      left: drip.x,
                      animationDelay: `${drip.delay}s`,
                    }}
                    className={`absolute top-0 text-[#B80A12] origin-top ${
                      motionEnabled ? "rr-blood-drip" : ""
                    }`}
                  >
                    <path
                      d={`M5 0 C5 4, 4.5 ${drip.height - 10}, 3.5 ${drip.height - 7} C2.2 ${drip.height - 4}, 2 ${drip.height - 1}, 6 ${drip.height} C10 ${drip.height - 1}, 9.8 ${drip.height - 4}, 8.5 ${drip.height - 7} C7.5 ${drip.height - 10}, 7 4, 7 0 Z`}
                      fill="currentColor"
                    />
                    <circle
                      cx="5"
                      cy={drip.height - 3}
                      r="1.2"
                      fill="#FF6B72"
                      opacity="0.8"
                    />
                  </svg>
                ))}
              </div>
            </div>

            <p className="font-manrope text-sm sm:text-base text-[var(--rr-bone)]/90 max-w-[560px]">
              {site.redRoom.sub}
            </p>

            {/* Quick Jump to Invitation Details (< 5s scannability) */}
            <a
              href="#redroom-invitation"
              onClick={handleJumpToDetails}
              aria-label="Jump to Red Room invitation details"
              className="group inline-flex min-h-[44px] items-center gap-2 px-5 py-2 rounded-full bg-[#180304]/90 border border-[#FF2A1F]/45 text-[#FF968B] font-cinzel text-[11px] uppercase tracking-[0.24em] hover:bg-[#2A0403] hover:border-[#FF2A1F] hover:text-white transition-all shadow-[0_4px_16px_rgba(0,0,0,0.7)]"
            >
              <span>{site.redRoom.jump}</span>
              <span className="group-hover:translate-y-0.5 transition-transform duration-[140ms]">↓</span>
            </a>
          </div>
        </div>
      </section>

      {/* R2 · The story (140vh, pinned) */}
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
              <div className="flex flex-col gap-5 py-4 max-w-[780px]">
                {site.redRoom.story.map((line) => (
                  <p
                    key={line}
                    className="font-cormorant italic text-[clamp(20px,2.3vw,32px)] leading-[1.25] font-medium text-[var(--rr-bone)] balance-heading"
                  >
                    {line}
                  </p>
                ))}
              </div>
            ) : (
              <div className="relative min-h-[200px] sm:min-h-[240px] w-full max-w-[820px] flex items-center justify-center">
                {site.redRoom.story.map((line, idx) => {
                  const isCurrent = idx === activeStoryIdx;
                  const words = line.split(" ");
                  return (
                    <p
                      key={line}
                      aria-hidden={!isCurrent}
                      className={`font-cormorant italic text-[clamp(24px,3.4vw,52px)] leading-[1.15] font-medium text-[var(--rr-bone)] balance-heading transition-all ${
                        isCurrent
                          ? "duration-[680ms] relative opacity-100"
                          : "duration-[280ms] pointer-events-none absolute inset-x-0 opacity-0"
                      }`}
                    >
                      {words.map((word, wIdx) => (
                        <span
                          key={`${idx}-${wIdx}`}
                          style={{
                            transitionDelay: isCurrent
                              ? `${wIdx * 25}ms`
                              : "0ms",
                          }}
                          className={`inline-block mr-[0.26em] transition-all ${
                            isCurrent
                              ? "duration-[500ms] opacity-100 blur-0 translate-y-0"
                              : "duration-[280ms] opacity-0 blur-[8px] translate-y-1"
                          }`}
                        >
                          {word}
                        </span>
                      ))}
                    </p>
                  );
                })}
              </div>
            )}

            <Divider variant="diamond" active />
          </div>
        </div>
      </section>

      {/* R3 · Dress code (110vh, pinned) */}
      <section
        ref={r3Ref}
        data-scene="R3"
        aria-label="Dress code"
        className="scene-section scene-r3"
      >
        <div className="scene-sticky flex items-center py-24">
          <div className="site-container flex flex-col items-center md:items-start text-center md:text-left gap-7 max-w-[680px] md:ml-[6vw]">
            <div className="flex flex-col gap-3">
              {site.redRoom.dress.lines.map((line, idx) => {
                const lit = idx < dressStep;
                return (
                  <p
                    key={line}
                    className={`font-cinzel text-[clamp(24px,3.6vw,54px)] leading-[1.08] font-semibold uppercase tracking-tight text-[var(--rr-bone)] transition-all duration-[680ms] ${
                      lit
                        ? "opacity-100 translate-y-0"
                        : "opacity-75 translate-y-4"
                    }`}
                  >
                    {line}
                  </p>
                );
              })}
            </div>

            <div className="w-full max-w-[560px]">
              <Divider variant="diamond" active={dressStep >= 4} />
            </div>

            <p
              className={`font-cinzel text-[clamp(18px,2.2vw,30px)] leading-[1.2] font-bold uppercase tracking-[0.04em] text-[var(--rr-neon)] balance-heading transition-opacity duration-500 ${
                dressStep >= 4 ? "opacity-100 rr-neon-pulse" : "opacity-90"
              }`}
            >
              {site.redRoom.dress.warning}
            </p>
          </div>
        </div>
      </section>

      {/* Screen-projected DOM Twin for 3D Invitation Card (Part 8 R4) */}
      <div
        ref={(el) => {
          cardOverlayRef.current = el;
        }}
        aria-label="Official Red Room Invitation Card Details"
        className="fixed top-0 left-0 z-30 pointer-events-none opacity-0 flex flex-col justify-between p-5 sm:p-7 rounded-sm bg-[#F0E6D8] text-[#550A0A] border-2 border-[#8B1414] shadow-2xl transition-opacity duration-[280ms] overflow-y-auto"
      >
        <div className="flex flex-col items-center text-center gap-1">
          <span className="font-nosifer text-[clamp(18px,2.1vw,26px)] uppercase text-[#8B1414] tracking-[0.05em]">
            {site.redRoom.invitation.heading}
          </span>
          <div className="w-full max-w-[180px]">
            <Divider variant="diamond" active />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-2.5 my-2 text-left">
          {site.redRoom.invitation.rows.map((row) => (
            <div
              key={row.label}
              className={
                row.label === "Venue"
                  ? "sm:col-span-2 flex flex-col gap-0.5"
                  : "flex flex-col gap-0.5"
              }
            >
              <span className="font-cinzel text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-[#8B1414] font-semibold">
                {row.label}
              </span>
              <span className="font-manrope text-[13px] sm:text-[14px] font-bold text-[#350505]">
                {row.value}
              </span>
              {"sub" in row && Boolean((row as { sub?: string }).sub) && (
                <span className="font-manrope text-[11px] text-[#550A0A]/85">
                  {(row as { sub?: string }).sub}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Booking Details with Instagram & Click-to-Call Phones */}
        <div className="pt-2.5 border-t border-[#8B1414]/20 my-1 pointer-events-auto">
          <BookingDetails variant="redroom" compact />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[#8B1414]/20 font-cinzel text-[9.5px] uppercase tracking-[0.2em] text-[#4A0808]">
          <span>{site.brand.legalName}</span>
          <span>{site.brand.city}</span>
        </div>
      </div>

      {/* R4 · The invitation (150vh, pinned) */}
      <section
        id="redroom-invitation"
        ref={r4Ref}
        data-scene="R4"
        aria-label="The Red Room Invitation Details"
        className="scene-section scene-r4"
      >
        <div className="scene-sticky flex flex-col items-center justify-center py-20">
          <div className="site-container flex flex-col items-center gap-6">
            {/* Hint while seal is intact */}
            <p
              aria-hidden={cardStage !== "sealed"}
              className={`font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--rr-bone)]/85 transition-opacity duration-[280ms] ${
                motionEnabled && cardStage === "sealed" ? "opacity-100" : "opacity-0"
              }`}
            >
              {site.redRoom.invitation.hint}
            </p>

            {/* Static fallback for reduced motion or T0 */}
            {!motionEnabled && (
              <div className="w-full">
                <InvitationCard
                  variant="redroom"
                  heading={site.redRoom.invitation.heading}
                  rows={site.redRoom.invitation.rows}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* R4.5 · Headline artist (DJ Monish) + Scannable Invitation Summary on Mobile */}
      <section
        data-scene="R-DJ"
        aria-label={site.redRoom.dj.name}
        className="relative z-20 py-20 border-t border-[var(--rr-blood)]/30 bg-gradient-to-b from-[#0A0102]/95 via-[#120203]/95 to-[#0A0102]/95"
      >
        <div className="site-container site-grid items-center gap-y-10">
          <div className="col-span-4 md:col-span-4 lg:col-span-5 flex justify-center">
            <ArtistPortrait name={site.redRoom.dj.name} photo={site.redRoom.dj.photo} />
          </div>

          {/* Artist Bio & Profile */}
          <div className="col-span-4 md:col-span-4 lg:col-span-6 lg:col-start-7 flex flex-col items-start text-left gap-5">
            <span className="font-cinzel text-[11px] sm:text-[12px] uppercase tracking-[0.32em] text-[var(--rr-neon)]">
              {site.redRoom.dj.role}
            </span>
            <h2 className="font-cinzel font-black text-h2 uppercase text-[#E81414] tracking-[0.06em] drop-shadow-[0_6px_20px_rgba(210,10,21,0.75)] leading-tight">
              {site.redRoom.dj.name}
            </h2>
            <p className="font-cinzel text-[12px] sm:text-[13px] uppercase tracking-[0.18em] text-[var(--rr-bone)]/90">
              {site.redRoom.dj.genre}
            </p>
            <p className="font-manrope text-body text-[var(--rr-bone)]/85 measure-copy pretty-copy">
              {site.redRoom.dj.bio}
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2 font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--rr-ash)]">
              <span className="inline-flex items-center gap-2 border border-[#FF2A1F]/30 bg-[#150203] px-3.5 py-1.5 rounded-sm text-[var(--rr-bone)]">
                {site.redRoom.dj.date}
              </span>
              <span className="inline-flex items-center gap-2 border border-[#FF2A1F]/30 bg-[#150203] px-3.5 py-1.5 rounded-sm text-[var(--rr-bone)]">
                {site.redRoom.dj.venue}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* R5 · In association with (80vh, not pinned) */}
      <section
        ref={r5Ref}
        data-scene="R5"
        aria-labelledby="redroom-partners-label"
        className="relative scene-r5 flex items-center py-20"
      >
        <div className="site-container site-grid items-center gap-y-12">
          {/* Framed official poster on the left wall */}
          <div className="col-span-4 md:col-span-4 lg:col-span-5 flex justify-center">
            <figure className="relative border-2 border-[var(--rr-gilt)] bg-[#060101] p-3 max-w-[380px] w-full shadow-[0_24px_60px_rgba(0,0,0,0.85)]">
              <div className="border border-[var(--rr-gilt)]/40 p-1">
                <Image
                  src={site.redRoom.poster.src}
                  alt={site.redRoom.poster.alt}
                  width={760}
                  height={950}
                  sizes="(max-width: 768px) 88vw, 380px"
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

            <div className="w-full flex flex-col gap-3 sm:gap-3.5">
              {site.redRoom.partners.list.map((partner, idx) => (
                <React.Fragment key={partner.name}>
                  <div className="flex flex-col items-center gap-1 py-1 candle-flicker-text">
                    <span className="font-cinzel text-[10.5px] uppercase tracking-[0.28em] text-[var(--rr-ash)]">
                      {partner.role}
                    </span>
                    <span className="font-cormorant text-[clamp(20px,2vw,28px)] font-medium text-[var(--rr-bone)] leading-tight">
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

      {/* R6 · Outro (90vh, pinned) */}
      <section
        ref={r6Ref}
        data-scene="R6"
        aria-label="The Red Room Outro"
        className="scene-section scene-r6"
      >
        <div className="scene-sticky flex flex-col items-center justify-between pt-16 pb-[calc(76px+env(safe-area-inset-bottom))] sm:py-20 text-center">
          <div className="site-container flex flex-col items-center justify-between h-full max-w-[780px]">
            <BadgeDomHost
              skin="redroom"
              sizeClass="w-[140px] h-[140px]"
              label="Underdogs Halloween badge"
            />

            <div className="flex flex-col items-center gap-2.5">
              {site.redRoom.outro.lines.map((line) => (
                <p
                  key={line}
                  className="font-cormorant italic text-[clamp(24px,3.2vw,46px)] leading-[1.15] font-medium text-[var(--rr-bone)] balance-heading"
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
                href={site.redRoom.outro.back.href}
                transitionType="T4"
                origin="gate"
                className="inline-flex min-h-[48px] items-center gap-3 px-4 py-3 font-cinzel text-[12px] uppercase tracking-[0.28em] text-[var(--rr-ash)] hover:text-[var(--rr-bone)] transition-colors"
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
                <span>{site.redRoom.outro.back.label}</span>
              </TransitionLink>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
