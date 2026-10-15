"use client";

import React from "react";
import { useStore } from "@/state/store";

export function StudioSpotlights() {
  const motionEnabled = useStore((s) => s.motionEnabled);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[3] overflow-hidden select-none"
    >
      {/* Left Fresnel Spotlight & Beam */}
      <div className="absolute top-[18%] -left-6 sm:left-4 w-64 sm:w-80 h-[800px] pointer-events-none origin-top-left">
        {/* Volumetric Beam sweeping across the ballroom */}
        <div
          className={`absolute top-8 left-12 w-[600px] sm:w-[900px] h-[500px] origin-top-left -rotate-12 ${
            motionEnabled ? "animate-[fresnelSweepLeft_20s_infinite_ease-in-out]" : ""
          }`}
          style={{
            background:
              "conic-gradient(from 40deg at 0% 0%, rgba(255,241,201,0.11) 0deg, rgba(255,227,163,0.06) 18deg, transparent 32deg)",
            filter: "blur(24px)",
          }}
        />

        {/* Black Fresnel Housing (2D SVG) */}
        <svg
          viewBox="0 0 100 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-16 sm:w-20 h-auto drop-shadow-[0_12px_24px_rgba(0,0,0,0.9)]"
        >
          {/* Barn Doors */}
          <path d="M20 20L4 0H70L54 20H20Z" fill="#1C1417" stroke="#3A2228" strokeWidth="1" />
          <path d="M20 70L4 90H70L54 70H20Z" fill="#1C1417" stroke="#3A2228" strokeWidth="1" />
          <path d="M15 25L0 12V78L15 65V25Z" fill="#160E12" stroke="#3A2228" strokeWidth="1" />
          <path d="M60 25L75 12V78L60 65V25Z" fill="#160E12" stroke="#3A2228" strokeWidth="1" />

          {/* Lamp Barrel */}
          <rect x="20" y="24" width="36" height="42" rx="4" fill="#0D0709" stroke="#E5B25D" strokeWidth="1" strokeOpacity="0.5" />
          {/* Cooling Ribs */}
          <line x1="24" y1="32" x2="52" y2="32" stroke="#3A2228" strokeWidth="1.5" />
          <line x1="24" y1="40" x2="52" y2="40" stroke="#3A2228" strokeWidth="1.5" />
          <line x1="24" y1="48" x2="52" y2="48" stroke="#3A2228" strokeWidth="1.5" />

          {/* Hot White / Gold Fresnel Lens Core */}
          <ellipse cx="38" cy="45" rx="10" ry="14" fill="#FFF1C9" />
          <ellipse cx="38" cy="45" rx="6" ry="9" fill="#FFFFFF" />

          {/* Mounting Yoke */}
          <path d="M14 45H20M56 45H62" stroke="#8B0F22" strokeWidth="2" />
          <path d="M14 45V85H62V45" stroke="#42050E" strokeWidth="2" fill="none" />
          <rect x="34" y="85" width="8" height="25" fill="#1C1417" />
        </svg>
      </div>

      {/* Right Fresnel Spotlight & Beam */}
      <div className="absolute top-[18%] -right-6 sm:right-4 w-64 sm:w-80 h-[800px] pointer-events-none origin-top-right">
        {/* Volumetric Beam sweeping across the ballroom */}
        <div
          className={`absolute top-8 right-12 w-[600px] sm:w-[900px] h-[500px] origin-top-right rotate-12 ${
            motionEnabled ? "animate-[fresnelSweepRight_20s_infinite_ease-in-out]" : ""
          }`}
          style={{
            background:
              "conic-gradient(from 280deg at 100% 0%, transparent 0deg, rgba(255,227,163,0.06) 14deg, rgba(255,241,201,0.11) 32deg)",
            filter: "blur(24px)",
          }}
        />

        {/* Black Fresnel Housing (2D SVG, mirrored) */}
        <svg
          viewBox="0 0 100 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-16 sm:w-20 h-auto ml-auto drop-shadow-[0_12px_24px_rgba(0,0,0,0.9)] -scale-x-100"
        >
          {/* Barn Doors */}
          <path d="M20 20L4 0H70L54 20H20Z" fill="#1C1417" stroke="#3A2228" strokeWidth="1" />
          <path d="M20 70L4 90H70L54 70H20Z" fill="#1C1417" stroke="#3A2228" strokeWidth="1" />
          <path d="M15 25L0 12V78L15 65V25Z" fill="#160E12" stroke="#3A2228" strokeWidth="1" />
          <path d="M60 25L75 12V78L60 65V25Z" fill="#160E12" stroke="#3A2228" strokeWidth="1" />

          {/* Lamp Barrel */}
          <rect x="20" y="24" width="36" height="42" rx="4" fill="#0D0709" stroke="#E5B25D" strokeWidth="1" strokeOpacity="0.5" />
          {/* Cooling Ribs */}
          <line x1="24" y1="32" x2="52" y2="32" stroke="#3A2228" strokeWidth="1.5" />
          <line x1="24" y1="40" x2="52" y2="40" stroke="#3A2228" strokeWidth="1.5" />
          <line x1="24" y1="48" x2="52" y2="48" stroke="#3A2228" strokeWidth="1.5" />

          {/* Hot White / Gold Fresnel Lens Core */}
          <ellipse cx="38" cy="45" rx="10" ry="14" fill="#FFF1C9" />
          <ellipse cx="38" cy="45" rx="6" ry="9" fill="#FFFFFF" />

          {/* Mounting Yoke */}
          <path d="M14 45H20M56 45H62" stroke="#8B0F22" strokeWidth="2" />
          <path d="M14 45V85H62V45" stroke="#42050E" strokeWidth="2" fill="none" />
          <rect x="34" y="85" width="8" height="25" fill="#1C1417" />
        </svg>
      </div>
    </div>
  );
}
