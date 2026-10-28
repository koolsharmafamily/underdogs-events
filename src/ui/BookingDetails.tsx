"use client";

import React from "react";
import { site } from "@/content/site";

interface BookingDetailsProps {
  variant?: "redroom" | "diwali" | "neutral";
  compact?: boolean;
  className?: string;
}

export function BookingDetails({
  variant = "neutral",
  compact = false,
  className = "",
}: BookingDetailsProps) {
  const isRedRoom = variant === "redroom";
  const isDiwali = variant === "diwali";

  const theme = isRedRoom
    ? {
        accent: "text-[#95120E]",
        border: "border-[#8B1414]/30",
        btnBorder: "border-[#8B1414]/60 hover:border-[#E81414]",
        btnBg: "bg-[#2A0403] hover:bg-[#3D0605] active:bg-[#1E0202]",
        btnText: "text-[#FFF6EE]",
        chipBorder: "border-[#8B1414]/40 hover:border-[#E81414]/80",
        chipBg: "bg-[#2A0403]/90 hover:bg-[#3D0605]",
        chipText: "text-[#FFF6EE]",
        subText: "text-[#E81414]/90",
        highlight: "rgba(149,18,14,0.3)",
      }
    : isDiwali
    ? {
        accent: "text-[#E5B25D]",
        border: "border-[#E5B25D]/30",
        btnBorder: "border-[#E5B25D]/60 hover:border-[#FFE3A3]",
        btnBg: "bg-gradient-to-r from-[#2E0A14] via-[#3A0D1A] to-[#2E0A14] hover:from-[#42050E] hover:to-[#42050E]",
        btnText: "text-[#FFF6EE]",
        chipBorder: "border-[#E5B25D]/40 hover:border-[#FFE3A3]",
        chipBg: "bg-[#1A060E]/80 hover:bg-[#2E0A14]",
        chipText: "text-[#FFF6EE]",
        subText: "text-[#FFE3A3]/90",
        highlight: "rgba(229,178,93,0.35)",
      }
    : {
        accent: "text-[#EA28C1]",
        border: "border-white/20",
        btnBorder: "border-white/30 hover:border-white/60",
        btnBg: "bg-white/10 hover:bg-white/15",
        btnText: "text-white",
        chipBorder: "border-white/20 hover:border-white/40",
        chipBg: "bg-white/5 hover:bg-white/10",
        chipText: "text-white",
        subText: "text-white/80",
        highlight: "rgba(234,40,193,0.3)",
      };

  return (
    <div
      className={`w-full flex flex-col ${compact ? "gap-2.5" : "gap-4"} ${className}`}
      aria-label="Booking Details & Table Inquiries"
    >
      {/* Section Header */}
      <div className="flex items-center justify-between border-b pb-2 pt-1 border-current/15">
        <div className="flex flex-col gap-0.5 text-left">
          <span
            className={`font-cinzel text-[10px] sm:text-[11px] uppercase tracking-[0.24em] font-bold ${theme.accent}`}
          >
            {isDiwali ? "Tickets, tables & enclosures enquiries" : "Booking Details & Inquiries"}
          </span>
          <span className="font-manrope text-[11px] sm:text-[12px] opacity-75">
            {isDiwali ? "Official Passes & Enquiries" : "Official Table Reservations & Guestlist"}
          </span>
        </div>
        <span
          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider bg-current/10 font-medium"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Direct Line
        </span>
      </div>

      {/* Official Instagram Button */}
      <a
        href={site.booking.instagram.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Follow Underdogs on Instagram for official passes and booking updates"
        className={`group relative flex items-center justify-between px-4 py-3 sm:py-3.5 rounded-lg border ${theme.btnBorder} ${theme.btnBg} ${theme.btnText} shadow-md transition-all duration-200 active:scale-[0.98] cursor-pointer pointer-events-auto`}
        style={{
          boxShadow: `0 4px 18px ${theme.highlight}`,
        }}
      >
        <div className="flex items-center gap-3">
          {/* Instagram glyph */}
          <div className="w-8 h-8 rounded-md bg-gradient-to-tr from-[#FD5949] via-[#D6249F] to-[#285AEB] flex items-center justify-center text-white shrink-0 shadow-sm">
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
          </div>

          <div className="flex flex-col text-left">
            <span className="font-cinzel text-[11px] sm:text-[12px] font-bold tracking-[0.16em] uppercase">
              {site.booking.instagram.handle}
            </span>
            <span className="font-manrope text-[10px] sm:text-[11px] opacity-80">
              Official Instagram · DM for Passes & Tables
            </span>
          </div>
        </div>

        <span className="font-mono text-xs opacity-75 group-hover:translate-x-1 group-hover:opacity-100 transition-all">
          ↗
        </span>
      </a>

      {/* 4 Phone Numbers (Click to Call on iPhone & Android) */}
      <div className="flex flex-col gap-1.5 text-left">
        <span className="font-cinzel text-[9.5px] uppercase tracking-[0.22em] opacity-70">
          Call for Passes & VIP Reservations
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {site.booking.phones.map((p) => (
            <a
              key={p.tel}
              href={`tel:${p.tel}`}
              aria-label={`Call Underdogs at ${p.display}`}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-md border ${theme.chipBorder} ${theme.chipBg} ${theme.chipText} transition-all duration-200 active:scale-[0.98] hover:shadow-sm cursor-pointer pointer-events-auto touch-manipulation`}
            >
              <div className="flex items-center gap-2.5">
                <svg
                  className={`w-3.5 h-3.5 shrink-0 ${theme.accent}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <span className="font-mono text-[12px] sm:text-[13px] font-semibold tracking-wider">
                  {p.display}
                </span>
              </div>

              <span
                className={`font-cinzel text-[9px] uppercase tracking-[0.18em] px-2 py-0.5 rounded border border-current/25 ${theme.subText}`}
              >
                Call
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
