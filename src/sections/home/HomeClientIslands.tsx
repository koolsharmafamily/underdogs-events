"use client";

import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { afterPaint } from "@/motion/afterPaint";
import { site } from "@/content/site";
import { frame } from "@/state/frame";
import { useStore } from "@/state/store";
import { useSceneProgress } from "@/motion/useSceneProgress";
import { useLineReveal } from "@/motion/useLineReveal";
import { useEnterTransition } from "@/motion/transitions";
import { BadgeDomHost } from "@/ui/BadgeDomHost";
import { useDaysToGo } from "@/utils/useDaysToGo";
import { assetUrl } from "@/utils/assetUrl";

const OfficialFlyerLightbox = dynamic(
  () => import("@/ui/OfficialFlyerLightbox").then((m) => m.OfficialFlyerLightbox),
  { ssr: false }
);

export function HomeStageController() {
  const titleRef = useRef<HTMLElement | null>(null);
  const h1Ref = useRef<HTMLElement | null>(null);
  const h2Ref = useRef<HTMLElement | null>(null);
  const h5Ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    h1Ref.current = document.querySelector<HTMLElement>('[data-scene="H1"]');
    h2Ref.current = document.querySelector<HTMLElement>('[data-scene="H2"]');
    h5Ref.current = document.querySelector<HTMLElement>('[data-scene="H5"]');
    titleRef.current = document.querySelector<HTMLElement>('[data-scene="H1"] h1');
  }, []);

  useLineReveal(titleRef, { triggerOnMount: true, delay: 0.06 });
  useSceneProgress("H1", h1Ref);
  useSceneProgress("H2", h2Ref);
  useSceneProgress("H5", h5Ref);

  const motionEnabled = useStore((s) => s.motionEnabled);
  const setWorld = useStore((s) => s.setWorld);

  useEnterTransition("home");

  useEffect(() => {
    setWorld("home");
    document.documentElement.setAttribute("data-world", "home");
  }, [setWorld]);

  useEffect(() => {
    const heroTextEl = document.querySelector<HTMLElement>("[data-hero-text]");
    const heroCueEl = document.querySelector<HTMLElement>("[data-hero-cue]");

    const setHeroText = (visible: boolean) => {
      if (!heroTextEl) return;
      if (visible) {
        heroTextEl.classList.remove("duration-[280ms]", "opacity-0", "-translate-y-6", "pointer-events-none");
        heroTextEl.classList.add("duration-[680ms]", "opacity-100", "translate-y-0");
      } else {
        heroTextEl.classList.remove("duration-[680ms]", "opacity-100", "translate-y-0");
        heroTextEl.classList.add("duration-[280ms]", "opacity-0", "-translate-y-6", "pointer-events-none");
      }
    };

    const setHeroCue = (visible: boolean) => {
      if (!heroCueEl) return;
      if (visible) {
        heroCueEl.classList.remove("opacity-0", "pointer-events-none");
        heroCueEl.classList.add("opacity-90");
      } else {
        heroCueEl.classList.remove("opacity-90");
        heroCueEl.classList.add("opacity-0", "pointer-events-none");
      }
    };

    if (!motionEnabled) {
      setHeroText(true);
      setHeroCue(true);
      return;
    }

    const prev = { heroText: true, cue: true };

    const onTick = () => {
      const p1 = frame.progress.H1 ?? 0;
      if (p1 > 0.12 && prev.cue) {
        prev.cue = false;
        setHeroCue(false);
      } else if (p1 < 0.08 && !prev.cue) {
        prev.cue = true;
        setHeroCue(true);
      }

      if (p1 > 0.9 && prev.heroText) {
        prev.heroText = false;
        setHeroText(false);
      } else if (p1 < 0.85 && !prev.heroText) {
        prev.heroText = true;
        setHeroText(true);
      }
    };

    return afterPaint(async () => {
      const { default: gsap } = await import("gsap");
      gsap.ticker.add(onTick);
      return () => {
        gsap.ticker.remove(onTick);
      };
    });
  }, [motionEnabled]);

  return null;
}

export function HomeAboutSection() {
  const motionEnabled = useStore((s) => s.motionEnabled);
  const [activeStatement, setActiveStatement] = useState(0);
  const [showAboutBody, setShowAboutBody] = useState(false);

  useEffect(() => {
    if (!motionEnabled) {
      setActiveStatement(0);
      setShowAboutBody(true);
      return;
    }

    const prev = { stmt: 0, about: false };
    const onTick = () => {
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

    return afterPaint(async () => {
      const { default: gsap } = await import("gsap");
      gsap.ticker.add(onTick);
      return () => {
        gsap.ticker.remove(onTick);
      };
    });
  }, [motionEnabled]);

  return (
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
  );
}

export function DoorColumn({
  door,
  children,
}: {
  door: "redroom" | "diwali";
  children: React.ReactNode;
}) {
  const hoverDoor = useStore((s) => s.hoverDoor);
  const setHoverDoor = useStore((s) => s.setHoverDoor);
  const otherDoor = door === "redroom" ? "diwali" : "redroom";

  return (
    <div
      onMouseEnter={() => setHoverDoor(door)}
      onMouseLeave={() => setHoverDoor(null)}
      onFocus={() => setHoverDoor(door)}
      onBlur={() => setHoverDoor(null)}
      className={`col-span-4 md:col-span-4 lg:col-span-6 flex flex-col justify-end transition-opacity duration-[280ms] ${
        hoverDoor === otherDoor ? "opacity-45" : "opacity-100"
      }`}
    >
      {children}
    </div>
  );
}

export function FlyerTriggerButton({
  world,
  className,
}: {
  world: "redroom" | "diwali";
  className: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        className={className}
      >
        <span>View official flyer</span>
      </button>
      {open && (
        <OfficialFlyerLightbox
          isOpen={open}
          onClose={() => setOpen(false)}
          flyer={
            world === "redroom"
              ? {
                  src: assetUrl("/media/red-room-poster.webp"),
                  alt: site.redRoom.poster.alt,
                  title: site.home.worlds.one.name,
                  subtitle: `${site.home.worlds.one.occasion} · ${site.home.worlds.one.date}`,
                  world: "redroom",
                }
              : {
                  src: assetUrl("/media/dhamaaka-flyer.webp"),
                  alt: site.diwali.poster.alt,
                  title: site.home.worlds.two.name,
                  subtitle: `${site.home.worlds.two.occasion} · ${site.home.worlds.two.date}`,
                  world: "diwali",
                }
          }
        />
      )}
    </>
  );
}

export function DaysToGoBadge({
  isoDate,
  className,
}: {
  isoDate: string;
  className: string;
}) {
  const days = useDaysToGo(isoDate);
  if (!days) return null;
  return <span className={className}>{days}</span>;
}

export function MobileAboutRunway() {
  const [activeIndex, setActiveIndex] = useState(0);
  const swipeContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (!swipeContainerRef.current) return;
    const container = swipeContainerRef.current;
    const { scrollLeft, clientWidth } = container;
    const cardWidth = clientWidth * 0.84 + 16;
    const newIdx = Math.round(scrollLeft / cardWidth);
    const bounded = Math.min(Math.max(0, newIdx), site.home.about.statements.length - 1);
    if (bounded !== activeIndex) {
      setActiveIndex(bounded);
    }
  };

  const scrollToCard = (idx: number) => {
    if (!swipeContainerRef.current) return;
    const container = swipeContainerRef.current;
    const cards = container.children;
    if (cards[idx]) {
      (cards[idx] as HTMLElement).scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
      setActiveIndex(idx);
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(8);
      }
    }
  };

  return (
    <section className="py-12 border-t border-white/10 flex flex-col gap-6">
      <div className="px-5 flex items-center justify-between">
        <h2 className="font-cinzel text-lg font-bold uppercase tracking-[0.2em] text-white">
          {site.home.about.label}
        </h2>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50">
          0{activeIndex + 1} / 0{site.home.about.statements.length}
        </span>
      </div>

      {/* Liquid Glass Runway with Apple iOS Snap Physics */}
      <div
        ref={swipeContainerRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto no-scrollbar px-5 gap-4 snap-x snap-mandatory scroll-smooth overscroll-x-contain touch-pan-x"
        style={{
          WebkitOverflowScrolling: "touch",
          scrollPaddingLeft: "1.25rem",
          scrollPaddingRight: "1.25rem",
        }}
      >
        {site.home.about.statements.map((stmt: string, idx: number) => (
          <div
            key={idx}
            onClick={() => scrollToCard(idx)}
            className="ui-liquid-glass group relative shrink-0 w-[84vw] max-w-[330px] snap-center p-6 sm:p-7 rounded-[28px] overflow-hidden flex flex-col justify-between gap-6 transition-transform duration-150 active:scale-[0.985] cursor-pointer"
          >
            <div
              className="pointer-events-none absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br from-[#EA28C1]/25 to-transparent blur-2xl"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/50 to-transparent"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute inset-0 rounded-[28px] bg-gradient-to-tr from-transparent via-white/[0.03] to-transparent"
              aria-hidden="true"
            />

            <div className="flex items-center justify-between relative z-10">
              <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#EA28C1] font-bold">
                0{idx + 1} / 0{site.home.about.statements.length}
              </span>
              <span
                className="w-2 h-2 rounded-full bg-[#EA28C1] shadow-[0_0_10px_#EA28C1]"
                aria-hidden="true"
              />
            </div>

            <p className="font-cinzel text-[16px] sm:text-[17px] font-bold leading-[1.45] tracking-wide text-[#FCF9FC] drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)] relative z-10 balance-heading">
              {stmt}
            </p>

            <div className="flex items-center justify-between pt-1 relative z-10">
              <div
                className="w-10 h-[1.5px] rounded-full bg-gradient-to-r from-white/40 to-transparent group-hover:w-16 group-hover:from-[#EA28C1] transition-all duration-300"
                aria-hidden="true"
              />
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/45">
                Swipe →
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Apple Liquid Glass Capsule Indicator */}
      <div className="flex justify-center items-center pt-1" aria-hidden="true">
        <div
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full"
          style={{
            background: "rgba(255, 255, 255, 0.08)",
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
            border: "1px solid rgba(255, 255, 255, 0.16)",
            boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.3), 0 8px 24px rgba(0, 0, 0, 0.45)",
          }}
        >
          {site.home.about.statements.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => scrollToCard(i)}
              aria-label={`Jump to statement ${i + 1}`}
              className={`transition-all duration-300 rounded-full cursor-pointer touch-manipulation ${
                activeIndex === i
                  ? "w-7 h-1.5 bg-gradient-to-r from-[#EA28C1] to-[#FF6EC7] shadow-[0_0_10px_rgba(234,40,193,0.8)]"
                  : "w-2 h-1.5 bg-white/30 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Body Paragraph */}
      <div className="px-5 pt-1">
        <p className="font-manrope text-[14px] leading-[1.65] text-[#FCF9FC]/80 font-normal pretty-copy">
          {site.home.about.body}
        </p>
      </div>
    </section>
  );
}
