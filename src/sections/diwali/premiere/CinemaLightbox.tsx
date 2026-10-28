"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { site } from "@/content/site";
import { useStore } from "@/state/store";
import { OfficialFlyerLightbox } from "@/ui/OfficialFlyerLightbox";

const BULB_COUNT_HORIZ = 18;
const BULB_COUNT_VERT = 24;

export function CinemaLightbox() {
  const motionEnabled = useStore((s) => s.motionEnabled);
  const [lit, setLit] = useState(!motionEnabled);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!motionEnabled) {
      setLit(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLit(true);
        }
      },
      { threshold: 0.25 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [motionEnabled]);

  const poster = site.diwali.poster;

  return (
    <>
      <section
        ref={containerRef}
        aria-label={`${site.diwali.nowShowing.kicker}: ${site.diwali.nowShowing.label}`}
        className="relative z-10 w-full max-w-[620px] mx-auto px-4 py-16 sm:py-24 text-center select-none"
      >
        {/* Lightbox Caption */}
        <div className="flex flex-col items-center gap-2 mb-8">
          <span className="font-cinzel text-[11px] sm:text-[12px] uppercase tracking-[0.38em] text-[#E5B25D]">
            {site.diwali.nowShowing.label}
          </span>
          <h2 className="font-cinzel font-bold text-[20px] sm:text-[24px] uppercase tracking-[0.26em] text-[#FFF6EE]">
            {site.diwali.nowShowing.kicker}
          </h2>
          <div className="flex items-center gap-2 text-[#E0217A] text-[8px]" aria-hidden="true">
            <span>✦</span>
            <span className="h-[1px] w-16 bg-[#E5B25D]/50" />
            <span>✦</span>
          </div>
        </div>

        {/* Gold Marquee Bulb Ring Frame */}
        <div className="relative p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#2B1B10] via-[#150B0D] to-[#0A0506] border-2 border-[#E5B25D] shadow-[0_24px_70px_rgba(0,0,0,0.95),0_0_35px_rgba(229,178,93,0.25)]">
          {/* Marquee Bulbs - Top edge */}
          <div className="absolute top-1.5 inset-x-5 flex justify-between pointer-events-none" aria-hidden="true">
            {Array.from({ length: BULB_COUNT_HORIZ }).map((_, i) => (
              <MarqueeBulb key={`top-${i}`} index={i} lit={lit} motion={motionEnabled} />
            ))}
          </div>

          {/* Marquee Bulbs - Bottom edge */}
          <div className="absolute bottom-1.5 inset-x-5 flex justify-between pointer-events-none" aria-hidden="true">
            {Array.from({ length: BULB_COUNT_HORIZ }).map((_, i) => (
              <MarqueeBulb key={`bot-${i}`} index={i + 30} lit={lit} motion={motionEnabled} />
            ))}
          </div>

          {/* Marquee Bulbs - Left edge */}
          <div className="absolute left-1.5 inset-y-5 flex flex-col justify-between pointer-events-none" aria-hidden="true">
            {Array.from({ length: BULB_COUNT_VERT }).map((_, i) => (
              <MarqueeBulb key={`left-${i}`} index={i + 50} lit={lit} motion={motionEnabled} />
            ))}
          </div>

          {/* Marquee Bulbs - Right edge */}
          <div className="absolute right-1.5 inset-y-5 flex flex-col justify-between pointer-events-none" aria-hidden="true">
            {Array.from({ length: BULB_COUNT_VERT }).map((_, i) => (
              <MarqueeBulb key={`right-${i}`} index={i + 80} lit={lit} motion={motionEnabled} />
            ))}
          </div>

          {/* Inner Lightbox Poster Display (Uncropped with click to enlarge) */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => setLightboxOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setLightboxOpen(true);
              }
            }}
            aria-label="Enlarge official DHAMAAKA poster"
            className="group relative rounded-lg overflow-hidden border border-[#E5B25D]/40 aspect-[1206/1496] w-full bg-[#0A0606] cursor-zoom-in focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#E5B25D]"
          >
            <Image
              src={poster.src}
              alt={poster.alt}
              fill
              sizes="(max-width: 640px) 94vw, 560px"
              className="object-contain object-center transition-transform duration-500 group-hover:scale-[1.01]"
            />

            {/* Glossy Glass Reflection Overlay */}
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-transparent"
              aria-hidden="true"
            />

            {/* Tap to Enlarge Pill */}
            <div className="absolute inset-x-0 bottom-3 flex justify-center pointer-events-none">
              <span className="px-3 py-1 rounded-full bg-black/75 border border-[#E5B25D]/60 font-cinzel text-[10.5px] uppercase tracking-[0.2em] text-[#FFE3A3] backdrop-blur-md font-semibold">
                Tap to Enlarge
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Enlarged Lightbox Viewer */}
      <OfficialFlyerLightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        flyer={{
          src: poster.fullSrc || poster.src,
          alt: poster.alt,
          title: "DHAMAAKA — The Karan Johar Edition",
          subtitle: "NO CTRL presents · Saturday 7 November 2026 · Centre Point, Nagpur",
          world: "diwali",
        }}
      />
    </>
  );
}

function MarqueeBulb({
  index,
  lit,
  motion,
}: {
  index: number;
  lit: boolean;
  motion: boolean;
}) {
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full transition-all duration-500 ${
        lit
          ? "bg-[#FFF1C9] shadow-[0_0_8px_#FFF1C9]"
          : "bg-[#4D3A24] opacity-40"
      } ${
        motion && lit ? "animate-[bulbTwinkle_2.4s_infinite_ease-in-out]" : ""
      }`}
      style={{
        animationDelay: `${(index * 0.05) % 2.4}s`,
      }}
    />
  );
}
