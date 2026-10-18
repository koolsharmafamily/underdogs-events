"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { site } from "@/content/site";
import { frame } from "@/state/frame";
import { useStore } from "@/state/store";
import { useSceneProgress } from "@/motion/useSceneProgress";
import { useEnterTransition } from "@/motion/transitions";
import { Footer } from "@/ui/Footer";
import { ArtistPortrait } from "@/ui/ArtistPortrait";

// Premiere Night Components
import { ClapperboardOpener } from "./premiere/ClapperboardOpener";
import { DhamaakaStage } from "./premiere/DhamaakaStage";
import { DhamaakaTitle } from "./premiere/DhamaakaTitle";
import { PremiereInviteCard } from "./premiere/PremiereInviteCard";
import { SponsorWall } from "./premiere/SponsorWall";
import { CinemaLightbox } from "./premiere/CinemaLightbox";
import { DhamaakaOutro } from "./premiere/DhamaakaOutro";

export function DiwaliView() {
  const motionEnabled = useStore((s) => s.motionEnabled);
  const setWorld = useStore((s) => s.setWorld);

  const [activeStoryLine, setActiveStoryLine] = useState(0);
  const [d3Active, setD3Active] = useState(false);

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
      setD3Active(true);
      return;
    }

    let prevLine = 0;

    const onTick = () => {
      const p2 = frame.linearProgress.D2 ?? 0;
      const idx = Math.min(4, Math.floor(p2 * 5));
      if (idx !== prevLine) {
        prevLine = idx;
        setActiveStoryLine(idx);
      }

      const p3 = frame.progress.D3 ?? 0;
      setD3Active(p3 > 0.05);
    };

    gsap.ticker.add(onTick);
    return () => {
      gsap.ticker.remove(onTick);
    };
  }, [motionEnabled]);

  return (
    <main id="main-content" className="relative text-[var(--dw-ivory)] bg-transparent">
      {/* D0 · Clapperboard Opener (≤ 3s, skippable, short on repeat visits) */}
      <ClapperboardOpener />

      {/* 2D/2.5D Composite Stage (Atmosphere plate, chandeliers, spotlights, particles, fireworks) */}
      <DhamaakaStage
        activeStoryLine={activeStoryLine}
      />

      {/* D1 · Hero: The Premiere (115vh, pinned) */}
      <section
        ref={d1Ref}
        data-scene="D1"
        aria-label={`${site.diwali.title} — ${site.diwali.subtitle}`}
        className="scene-section scene-d1 relative z-[6]"
      >
        <div className="scene-sticky flex flex-col items-center justify-between pt-14 pb-24 sm:pt-20 sm:pb-10 text-center pointer-events-none">
          {/* Upper / Hero: DhamaakaTitle containing Presenter, Prominent 3D Badge, and DHAMAAKA */}
          <div className="site-container w-full flex flex-col items-center my-auto pointer-events-auto">
            <DhamaakaTitle />
          </div>

          {/* Lower: Date, Venue line & Details chip */}
          <div className="site-container flex flex-col items-center gap-2 sm:gap-3 pb-1 sm:pb-2 pointer-events-auto">
            <p className="font-manrope text-[14px] sm:text-[16px] text-[#FFF6EE]/90 tracking-[0.03em] font-medium drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              {site.diwali.sub}
            </p>

            <a
              href="#diwali-invitation"
              aria-label="Jump to invitation details"
              className="group inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#16080C]/85 border border-[#E5B25D]/40 text-[#E5B25D] font-cinzel text-[11px] uppercase tracking-[0.22em] hover:bg-[#8B0F22]/50 hover:border-[#E5B25D] transition-all shadow-[0_4px_16px_rgba(0,0,0,0.6)]"
            >
              <span>{site.diwali.jump}</span>
              <span className="group-hover:translate-y-0.5 transition-transform">↓</span>
            </a>
          </div>
        </div>
      </section>

      {/* D2 · Story: "Two worlds… Now meet the other." (180vh, pinned) */}
      <section
        ref={d2Ref}
        data-scene="D2"
        aria-label="Diwali story film cards"
        className="scene-section scene-d2 bg-transparent relative z-[6]"
      >
        <div className="scene-sticky flex flex-col items-center justify-center py-20 text-center">
          <div className="site-container flex flex-col items-center gap-6 sm:gap-8 max-w-[820px]">
            {/* Film Title Card Frame */}
            <div className="relative w-full max-w-[680px] p-8 sm:p-12 rounded-xl bg-gradient-to-b from-[#18080C]/90 to-[#0A0305]/95 border border-[#E5B25D]/40 shadow-[0_24px_60px_rgba(0,0,0,0.9),0_0_30px_rgba(139,15,34,0.3)] overflow-hidden">
              {/* Film Sprocket Holes (Top and Bottom) */}
              <div className="absolute top-2 inset-x-6 flex justify-between pointer-events-none opacity-40" aria-hidden="true">
                {Array.from({ length: 14 }).map((_, i) => (
                  <span key={`sproc-top-${i}`} className="w-2.5 h-1.5 rounded-[1px] bg-[#E5B25D]" />
                ))}
              </div>
              <div className="absolute bottom-2 inset-x-6 flex justify-between pointer-events-none opacity-40" aria-hidden="true">
                {Array.from({ length: 14 }).map((_, i) => (
                  <span key={`sproc-bot-${i}`} className="w-2.5 h-1.5 rounded-[1px] bg-[#E5B25D]" />
                ))}
              </div>

              {/* Spotlight beam from above finding the title line */}
              <div
                className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-[radial-gradient(circle,rgba(255,241,201,0.2)_0%,transparent_70%)] blur-xl"
                aria-hidden="true"
              />

              {!motionEnabled ? (
                <div className="flex flex-col gap-4 py-4">
                  {site.diwali.story.map((line) => (
                    <p
                      key={line}
                      className="font-cinzel text-[clamp(20px,2.6vw,32px)] font-bold uppercase tracking-[0.16em] text-[#FFE3A3] drop-shadow-[0_2px_12px_rgba(229,178,93,0.35)]"
                    >
                      {line}
                    </p>
                  ))}
                </div>
              ) : (
                <div className="relative min-h-[140px] sm:min-h-[160px] w-full flex items-center justify-center">
                  {site.diwali.story.map((line, idx) => {
                    const isCurrent = idx === activeStoryLine;
                    const isPast = idx < activeStoryLine;
                    return (
                      <p
                        key={line}
                        aria-hidden={!isCurrent}
                        className={`font-cinzel text-[clamp(22px,3.2vw,44px)] font-bold uppercase tracking-[0.16em] text-[#FFE3A3] drop-shadow-[0_4px_16px_rgba(229,178,93,0.4)] transition-all ${
                          isCurrent
                            ? "duration-[650ms] relative opacity-100 translate-y-0"
                            : isPast
                              ? "duration-[350ms] pointer-events-none absolute inset-x-0 opacity-0 -translate-y-8"
                              : "duration-[350ms] pointer-events-none absolute inset-x-0 opacity-0 translate-y-8"
                        }`}
                      >
                        {line}
                      </p>
                    );
                  })}
                </div>
              )}

            </div>
          </div>
        </div>
      </section>

      {/* D3 · The Premiere Invite (120vh, pinned) */}
      <section
        id="diwali-invitation"
        ref={d3Ref}
        data-scene="D3"
        aria-label={site.diwali.invitation.heading}
        className="scene-section scene-d3 relative z-[6]"
      >
        <div className="scene-sticky flex flex-col items-center justify-center py-20">
          <PremiereInviteCard active={d3Active} />
        </div>
      </section>



      {/* D4 · The Sponsor Wall (Opening credits step-and-repeat); scroll key D4 */}
      <SponsorWall ref={d4Ref} />

      {/* D5 · Now Showing: The Official Poster (Marquee bulb lightbox) */}
      <CinemaLightbox />

      {/* Outro; scroll key D5 (the badge returns here) */}
      <DhamaakaOutro ref={d5Ref} />

      <Footer />
    </main>
  );
}
