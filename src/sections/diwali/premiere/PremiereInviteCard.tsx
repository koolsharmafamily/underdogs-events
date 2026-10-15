"use client";

import React from "react";
import { site, ANNOUNCING_SOON } from "@/content/site";
import { useStore } from "@/state/store";
import { UnderdogsBadgeSvg } from "@/ui/UnderdogsBadgeSvg";

interface PremiereInviteCardProps {
  active?: boolean;
}

export function PremiereInviteCard({ active = true }: PremiereInviteCardProps) {
  const motionEnabled = useStore((s) => s.motionEnabled);

  return (
    <div
      role="region"
      aria-label="Official Premiere Invitation Card Details"
      className="relative z-10 w-full max-w-[620px] mx-auto px-4 select-none perspective-[1200px]"
    >
      {/* Spotlight beam shining directly onto the invitation card */}
      <div
        className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[420px] h-[520px] rounded-full bg-[radial-gradient(circle_at_50%_0%,rgba(255,241,201,0.18)_0%,rgba(229,178,93,0.06)_45%,transparent_70%)] blur-2xl"
        aria-hidden="true"
      />

      {/* 3D CSS Tilting Invitation Card Container */}
      <div
        style={{
          transform:
            motionEnabled && !active
              ? "rotateX(14deg) translateY(24px) scale(0.96)"
              : "rotateX(0deg) translateY(0) scale(1)",
          transition: "transform 1200ms cubic-bezier(0.16, 1, 0.3, 1), opacity 800ms ease-out",
          opacity: active || !motionEnabled ? 1 : 0.4,
        }}
        className="relative rounded-lg bg-[#0E0709] border border-[#E5B25D]/40 p-6 sm:p-10 shadow-[0_24px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(139,15,34,0.25)] overflow-hidden"
      >
        {/* Rhinestone Gem Border (Faceted crystal dots line) */}
        <div
          className="pointer-events-none absolute inset-2.5 sm:inset-3 rounded border border-dashed border-[#E0217A]/40"
          style={{
            boxShadow: "inset 0 0 12px rgba(224, 33, 122, 0.15)",
          }}
          aria-hidden="true"
        />

        {/* Diagonal Light Sweep across card border */}
        {motionEnabled && (
          <div
            className="pointer-events-none absolute inset-0 -skew-x-12 animate-[diamondSheen_8s_infinite_ease-in-out]"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(255,241,201,0.15) 50%, transparent 100%)",
            }}
            aria-hidden="true"
          />
        )}

        {/* Four Engraved Gold Foil Corner Paisleys / Brackets */}
        <CornerOrnament className="top-2 left-2" />
        <CornerOrnament className="top-2 right-2 rotate-90" />
        <CornerOrnament className="bottom-2 left-2 -rotate-90" />
        <CornerOrnament className="bottom-2 right-2 rotate-180" />

        {/* Top Header: Small Jewelled Badge & Invitation Line */}
        <div className="flex flex-col items-center text-center gap-2 mb-6">
          <div className="w-12 h-12 flex items-center justify-center drop-shadow-[0_4px_12px_rgba(224,33,122,0.4)]">
            <UnderdogsBadgeSvg skin="diwali" size={38} />
          </div>

          <span className="font-cinzel text-[10px] sm:text-[11px] uppercase tracking-[0.34em] text-[#E5B25D]">
            {site.diwali.invitation.kicker}
          </span>

          <h2 className="font-playfair font-black text-[24px] sm:text-[30px] uppercase tracking-[0.06em] text-[#FFF6EE] drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            {site.diwali.title}
          </h2>

          <span className="font-cinzel text-[11px] sm:text-[12px] uppercase tracking-[0.22em] text-[#FFE3A3]/80">
            {site.diwali.subtitle}
          </span>

          {/* Fine Gold Divider */}
          <div className="flex items-center gap-3 w-40 mt-1 text-[#E5B25D]/60 text-[8px]">
            <span className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#E5B25D]" />
            <span className="text-[#E0217A]">✦</span>
            <span className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#E5B25D]" />
          </div>
        </div>

        {/* Invitation Rows: Date, Venue, Time, Dress Code, Entry */}
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 pt-2 border-t border-[#E5B25D]/20 text-left">
          {site.diwali.invitation.rows.map((row) => {
            const isAnnouncing = row.value.includes(ANNOUNCING_SOON);

            return (
              <div
                key={row.label}
                className={
                  row.label === "Venue" ? "sm:col-span-2 flex flex-col gap-1" : "flex flex-col gap-1"
                }
              >
                <dt className="font-cinzel text-[10px] uppercase tracking-[0.24em] text-[#E5B25D]">
                  {row.label}
                </dt>
                <dd className="font-manrope text-[14px] sm:text-[15px] font-medium text-[#FFF6EE] flex items-center gap-2">
                  {isAnnouncing ? (
                    <span className="inline-flex items-center gap-2 text-[#FFE3A3]/75 italic">
                      <span
                        className="inline-block w-2 h-2 rounded-full bg-[#FFF1C9] animate-[bulbTwinkle_2s_infinite_ease-in-out]"
                        style={{ boxShadow: "0 0 6px #FFF1C9" }}
                        aria-hidden="true"
                      />
                      {row.value}
                    </span>
                  ) : (
                    <span>{row.value}</span>
                  )}
                </dd>
                {(row as { sub?: string }).sub && (
                  <p className="font-manrope text-[11px] text-[#FFF6EE]/60 mt-0.5">
                    {(row as { sub?: string }).sub}
                  </p>
                )}
              </div>
            );
          })}
        </dl>

        {/* Footer Note */}
        <div className="mt-8 pt-4 border-t border-[#E5B25D]/20 flex items-center justify-between text-[#FFF6EE]/50 text-[10px] uppercase font-cinzel tracking-[0.2em]">
          <span>{site.brand.legalName}</span>
          <span>{site.brand.city}</span>
        </div>
      </div>
    </div>
  );
}

function CornerOrnament({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute w-5 h-5 text-[#E5B25D]/70 ${className}`} aria-hidden="true">
      <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <path d="M1 1H12M1 1V12" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="5" cy="5" r="1.5" fill="#FFE3A3" />
      </svg>
    </div>
  );
}
