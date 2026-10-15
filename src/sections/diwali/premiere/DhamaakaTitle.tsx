"use client";

import React from "react";
import { site } from "@/content/site";
import { useStore } from "@/state/store";
import { BadgeDomHost } from "@/ui/BadgeDomHost";

export function DhamaakaTitle() {
  const motionEnabled = useStore((s) => s.motionEnabled);
  // The entrance is a CSS animation (.hero-enter), so the title paints with the
  // HTML and never waits for JavaScript (LCP).

  // Letters for staggered reveal: D - H - A - M - A - A - K - A
  const letters = ["D", "H", "A", "M", "A", "A", "K", "A"];

  return (
    <div className="relative z-10 flex flex-col items-center text-center px-2 select-none w-full max-w-[1020px] mx-auto">
      {/* Accessible h1 */}
      <h1 className="sr-only">
        {site.diwali.title} — {site.diwali.subtitle}
      </h1>

      {/* Presenter Line */}
      <div
        className="hero-enter flex items-center justify-center gap-3 [--hero-from:translateY(-8px)]"
      >
        <span className="h-[1px] w-8 sm:w-16 bg-gradient-to-r from-transparent to-[#E5B25D]" />
        <span className="font-cinzel text-[11px] sm:text-[13px] font-semibold uppercase tracking-[0.38em] text-[#E5B25D] drop-shadow-[0_2px_10px_rgba(229,178,93,0.35)]">
          {site.diwali.presenter}
        </span>
        <span className="h-[1px] w-8 sm:w-16 bg-gradient-to-l from-transparent to-[#E5B25D]" />
      </div>

      {/* Prominent 3D Jewelled Badge Host (above DHAMAAKA) */}
      <div
        className="hero-enter relative my-2 sm:my-3 [--hero-from:scale(0.95)] [animation-delay:350ms]"
      >
        {/* Soft Warm Halo Glow */}
        <div
          className="pointer-events-none absolute -inset-8 rounded-full bg-[radial-gradient(circle,rgba(255,241,201,0.32)_0%,rgba(224,33,122,0.18)_45%,transparent_70%)] blur-2xl"
          aria-hidden="true"
        />
        <BadgeDomHost
          skin="diwali"
          sizeClass="w-[170px] h-[170px] sm:w-[210px] sm:h-[210px] lg:w-[230px] lg:h-[230px]"
          label="Underdogs Jewelled Badge — prominent crown above Dhamaka"
        />
      </div>

      {/* Jewelled SVG DHAMAAKA Title Artwork */}
      <div className="relative w-full max-w-[940px] mt-1 sm:mt-2 overflow-visible">
        <svg
          viewBox="0 0 1000 240"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto overflow-visible drop-shadow-[0_16px_32px_rgba(0,0,0,0.85)]"
          aria-hidden="true"
        >
          <defs>
            {/* 1. Rhinestone / Faceted Pink Crystal Pattern */}
            <pattern
              id="rhinestonePattern"
              width="14"
              height="14"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(25)"
            >
              {/* Dark velvet gem background */}
              <rect width="14" height="14" fill="#3D0613" />
              {/* Faceted pink crystal bead */}
              <circle cx="7" cy="7" r="5" fill="url(#gemFacet)" />
              {/* Specular White Dot */}
              <circle cx="5" cy="5" r="1.5" fill="#FFFFFF" opacity="0.9" />
              <circle cx="9" cy="9" r="0.8" fill="#FFE3A3" opacity="0.8" />
              {/* Crystal border rim */}
              <circle cx="7" cy="7" r="5" stroke="#FFE3A3" strokeWidth="0.6" strokeOpacity="0.4" fill="none" />
            </pattern>

            {/* Gem Facet Gradient */}
            <radialGradient id="gemFacet" cx="40%" cy="40%" r="65%">
              <stop offset="0%" stopColor="#F25C9A" />
              <stop offset="45%" stopColor="#E0217A" />
              <stop offset="85%" stopColor="#8B0F22" />
              <stop offset="100%" stopColor="#42050E" />
            </radialGradient>

            {/* Gold Bevel Gradient Top */}
            <linearGradient id="goldBevelTop" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFF1C9" />
              <stop offset="40%" stopColor="#FFE3A3" />
              <stop offset="80%" stopColor="#E5B25D" />
              <stop offset="100%" stopColor="#9E6E24" />
            </linearGradient>

            {/* Gold Bevel Gradient Rim */}
            <linearGradient id="goldBevelRim" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#C69442" />
              <stop offset="25%" stopColor="#FFE3A3" />
              <stop offset="50%" stopColor="#E5B25D" />
              <stop offset="75%" stopColor="#FFE3A3" />
              <stop offset="100%" stopColor="#C69442" />
            </linearGradient>

            {/* Subtitle Arc Path: gentle ceremonial curve */}
            <path id="subtitleArc" d="M 160 216 Q 500 248 840 216" fill="none" />

            {/* Diagonal Sheen Sweep Clip Path */}
            <clipPath id="titleTextClip">
              <text
                x="500"
                y="152"
                textAnchor="middle"
                fontFamily="Playfair Display, Bodoni Moda, Didot, Georgia, serif"
                fontWeight="900"
                fontSize="122"
                letterSpacing="0.08em"
              >
                DHAMAAKA
              </text>
            </clipPath>
          </defs>

          {/* 3D Crimson Extrusion Stack (Layered back to front for dimensional depth) */}
          <text
            x="500"
            y="160"
            textAnchor="middle"
            fontFamily="Playfair Display, Bodoni Moda, Didot, Georgia, serif"
            fontWeight="900"
            fontSize="122"
            letterSpacing="0.08em"
            fill="#180206"
          >
            DHAMAAKA
          </text>
          <text
            x="500"
            y="157"
            textAnchor="middle"
            fontFamily="Playfair Display, Bodoni Moda, Didot, Georgia, serif"
            fontWeight="900"
            fontSize="122"
            letterSpacing="0.08em"
            fill="#3B050E"
          >
            DHAMAAKA
          </text>
          <text
            x="500"
            y="155"
            textAnchor="middle"
            fontFamily="Playfair Display, Bodoni Moda, Didot, Georgia, serif"
            fontWeight="900"
            fontSize="122"
            letterSpacing="0.08em"
            fill="#6E0B1B"
          >
            DHAMAAKA
          </text>
          <text
            x="500"
            y="153"
            textAnchor="middle"
            fontFamily="Playfair Display, Bodoni Moda, Didot, Georgia, serif"
            fontWeight="900"
            fontSize="122"
            letterSpacing="0.08em"
            fill="#8B0F22"
          >
            DHAMAAKA
          </text>

          {/* Outer Gold Bevel Rim */}
          <text
            x="500"
            y="152"
            textAnchor="middle"
            fontFamily="Playfair Display, Bodoni Moda, Didot, Georgia, serif"
            fontWeight="900"
            fontSize="122"
            letterSpacing="0.08em"
            stroke="url(#goldBevelRim)"
            strokeWidth="8"
            strokeLinejoin="round"
            fill="none"
          >
            DHAMAAKA
          </text>

          {/* Inner Sharp Gold Contour */}
          <text
            x="500"
            y="152"
            textAnchor="middle"
            fontFamily="Playfair Display, Bodoni Moda, Didot, Georgia, serif"
            fontWeight="900"
            fontSize="122"
            letterSpacing="0.08em"
            stroke="url(#goldBevelTop)"
            strokeWidth="3.5"
            strokeLinejoin="round"
            fill="none"
          >
            DHAMAAKA
          </text>

          {/* Rhinestone Encrusted Face */}
          <text
            x="500"
            y="152"
            textAnchor="middle"
            fontFamily="Playfair Display, Bodoni Moda, Didot, Georgia, serif"
            fontWeight="900"
            fontSize="122"
            letterSpacing="0.08em"
            fill="url(#rhinestonePattern)"
          >
            DHAMAAKA
          </text>

          {/* Diagonal White Sheen Sweep across crystals every 6s */}
          {motionEnabled && (
            <g clipPath="url(#titleTextClip)" className="pointer-events-none">
              <rect
                x="0"
                y="0"
                width="220"
                height="220"
                fill="url(#sheenGradient)"
                className="animate-[diamondSheen_6s_infinite_ease-in-out]"
              />
              <defs>
                <linearGradient id="sheenGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
                  <stop offset="45%" stopColor="#FFFFFF" stopOpacity="0.45" />
                  <stop offset="50%" stopColor="#FFF1C9" stopOpacity="0.85" />
                  <stop offset="55%" stopColor="#FFFFFF" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                </linearGradient>
              </defs>
            </g>
          )}

          {/* Marquee Bulbs along the letter lines (Subtle warm dots) */}
          <g className="marquee-bulbs" pointerEvents="none">
            {/* Strategic bulb coordinates along D-H-A-M-A-A-K-A silhouette */}
            {[
              [140, 72], [140, 108], [140, 144], [186, 108],
              [248, 72], [248, 144], [290, 108], [290, 72], [290, 144],
              [350, 72], [375, 108], [402, 144],
              [445, 72], [476, 108], [504, 72], [532, 108], [558, 72],
              [602, 72], [626, 108], [654, 144],
              [702, 72], [728, 108], [756, 144],
              [802, 72], [802, 144], [838, 92], [846, 144],
              [892, 72], [918, 108], [946, 144],
            ].map(([bx, by], i) => (
              <circle
                key={`bulb-${i}`}
                cx={bx}
                cy={by}
                r={2.2}
                fill="#FFF1C9"
                className={
                  motionEnabled
                    ? i % 4 === 0
                      ? "animate-[bulbChase_1.8s_infinite_ease-in-out]"
                      : "animate-[bulbTwinkle_3.2s_infinite_ease-in-out]"
                    : ""
                }
                style={{
                  animationDelay: `${(i * 0.08) % 2}s`,
                }}
              />
            ))}
          </g>

          {/* Subtitle on Arc: "THE KARAN JOHAR EDITION" */}
          <text fill="url(#goldBevelRim)" letterSpacing="0.32em">
            <textPath
              href="#subtitleArc"
              startOffset="50%"
              textAnchor="middle"
              fontFamily="Cinzel, serif"
              fontSize="16"
              fontWeight="600"
            >
              THE KARAN JOHAR EDITION
            </textPath>
          </text>
        </svg>
      </div>

      {/* Devanagari Accent & Ceremony Line */}
      <div
        className="hero-enter mt-1 flex items-center justify-center gap-3 opacity-90 [--hero-from:translateY(8px)] [animation-delay:450ms]"
      >
        <span className="font-devanagari text-[13px] sm:text-[14px] text-[#E5B25D] tracking-[0.2em] font-normal">
          {site.diwali.accent}
        </span>
      </div>
    </div>
  );
}
