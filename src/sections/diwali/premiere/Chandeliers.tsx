"use client";

import React from "react";

export function Chandeliers() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 h-[280px] sm:h-[340px] z-[2] overflow-hidden hidden sm:flex items-start justify-around px-8 select-none"
    >
      {/* Left Chandelier */}
      <div className="relative w-36 lg:w-44 opacity-75">
        <ChandelierSvg />
      </div>

      {/* Center Grand Chandelier */}
      <div className="relative w-48 lg:w-56 opacity-90 -translate-y-2">
        <ChandelierSvg isGrand />
      </div>

      {/* Right Chandelier */}
      <div className="relative w-36 lg:w-44 opacity-75">
        <ChandelierSvg />
      </div>
    </div>
  );
}

function ChandelierSvg({ isGrand = false }: { isGrand?: boolean }) {
  return (
    <div className="relative flex flex-col items-center">
      {/* Soft warm light halo behind chandelier */}
      <div
        className={`absolute -top-10 left-1/2 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,241,201,0.22)_0%,rgba(229,178,93,0.08)_50%,transparent_70%)] blur-xl pointer-events-none ${
          isGrand ? "w-64 h-64" : "w-48 h-48"
        }`}
      />

      <svg
        viewBox="0 0 160 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto drop-shadow-[0_8px_16px_rgba(229,178,93,0.3)]"
      >
        <defs>
          <linearGradient id="chGold" x1="0" y1="0" x2="160" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#C69442" />
            <stop offset="50%" stopColor="#FFE3A3" />
            <stop offset="100%" stopColor="#C69442" />
          </linearGradient>
          <linearGradient id="chCrystal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFF6EE" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#FFE3A3" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#E0217A" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {/* Hanging Chain */}
        <line x1="80" y1="0" x2="80" y2="28" stroke="url(#chGold)" strokeWidth="2" strokeDasharray="3 2" />

        {/* Crown Canopy */}
        <path d="M70 28H90L85 36H75L70 28Z" fill="url(#chGold)" />

        {/* Tier 1 - Upper Ring */}
        <ellipse cx="80" cy="46" rx="28" ry="6" stroke="url(#chGold)" strokeWidth="1.5" fill="none" />
        {/* Tier 1 Crystal Drops */}
        <path d="M58 48L60 64L58 70L56 64Z" fill="url(#chCrystal)" />
        <path d="M70 50L72 68L70 76L68 68Z" fill="url(#chCrystal)" />
        <path d="M80 52L82 72L80 82L78 72Z" fill="url(#chCrystal)" />
        <path d="M90 50L92 68L90 76L88 68Z" fill="url(#chCrystal)" />
        <path d="M102 48L104 64L102 70L100 64Z" fill="url(#chCrystal)" />

        {/* Tier 2 - Middle Grand Ring */}
        <ellipse cx="80" cy="62" rx="46" ry="9" stroke="url(#chGold)" strokeWidth="1.5" fill="none" />
        {/* Crystal festoons connecting tier 1 to tier 2 */}
        <path d="M52 46Q65 62 80 62" stroke="#FFF1C9" strokeWidth="0.75" strokeOpacity="0.6" fill="none" />
        <path d="M108 46Q95 62 80 62" stroke="#FFF1C9" strokeWidth="0.75" strokeOpacity="0.6" fill="none" />

        {/* Tier 2 Crystal Pendants */}
        <path d="M38 64L40 84L38 92L36 84Z" fill="url(#chCrystal)" />
        <path d="M48 68L50 92L48 102L46 92Z" fill="url(#chCrystal)" />
        <path d="M60 70L62 100L60 112L58 100Z" fill="url(#chCrystal)" />
        <path d="M72 71L74 108L72 122L70 108Z" fill="url(#chCrystal)" />
        <path d="M80 71L82 114L80 130L78 114Z" fill="url(#chCrystal)" />
        <path d="M88 71L90 108L88 122L86 108Z" fill="url(#chCrystal)" />
        <path d="M100 70L102 100L100 112L98 100Z" fill="url(#chCrystal)" />
        <path d="M112 68L114 92L112 102L110 92Z" fill="url(#chCrystal)" />
        <path d="M122 64L124 84L122 92L120 84Z" fill="url(#chCrystal)" />

        {/* Tier 3 - Bottom Ring */}
        <ellipse cx="80" cy="80" rx="24" ry="5" stroke="url(#chGold)" strokeWidth="1.2" fill="none" />
        {/* Bottom Finial Crystal Drop */}
        <path d="M80 82L84 135L80 155L76 135Z" fill="url(#chCrystal)" />

        {/* Twinkling Facet Glints (CSS keyframed) */}
        <circle cx="80" cy="52" r="2" fill="#FFFFFF" className="animate-[chandelierShimmer_4s_infinite_ease-in-out]" />
        <circle cx="62" cy="74" r="2" fill="#FFF1C9" className="animate-[chandelierShimmer_3.5s_infinite_1.2s_ease-in-out]" />
        <circle cx="98" cy="74" r="2" fill="#FFE3A3" className="animate-[chandelierShimmer_4.2s_infinite_2.1s_ease-in-out]" />
        <circle cx="80" cy="130" r="2.5" fill="#FFFFFF" className="animate-[chandelierShimmer_5s_infinite_0.8s_ease-in-out]" />
      </svg>
    </div>
  );
}
