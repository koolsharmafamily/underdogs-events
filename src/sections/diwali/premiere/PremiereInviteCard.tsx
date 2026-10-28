"use client";

import React from "react";
import { site } from "@/content/site";
import { useStore } from "@/state/store";
import { UnderdogsBadgeSvg } from "@/ui/UnderdogsBadgeSvg";
import { BookingDetails } from "@/ui/BookingDetails";

interface PremiereInviteCardProps {
  active?: boolean;
}

export function PremiereInviteCard({ active = true }: PremiereInviteCardProps) {
  const motionEnabled = useStore((s) => s.motionEnabled);
  const diwali = site.diwali;

  return (
    <div
      role="region"
      aria-label="Official Premiere Invitation Card Details"
      className="relative z-10 w-full max-w-[660px] mx-auto px-4 select-none perspective-[1200px]"
    >
      {/* Spotlight beam shining directly onto the invitation card */}
      <div
        className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[440px] h-[520px] rounded-full bg-[radial-gradient(circle_at_50%_0%,rgba(255,241,201,0.18)_0%,rgba(229,178,93,0.06)_45%,transparent_70%)] blur-2xl"
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
            {diwali.presenter}
          </span>

          <h2 className="font-playfair font-black text-[24px] sm:text-[32px] uppercase tracking-[0.06em] text-[#FFF6EE] drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            {diwali.title}
          </h2>

          <span className="font-cinzel text-[11px] sm:text-[13px] uppercase tracking-[0.24em] text-[#FFE3A3]/90">
            {diwali.subtitle}
          </span>

          {/* Fine Gold Divider */}
          <div className="flex items-center gap-3 w-40 mt-1 text-[#E5B25D]/60 text-[8px]">
            <span className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#E5B25D]" />
            <span className="text-[#E0217A]">✦</span>
            <span className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#E5B25D]" />
          </div>
        </div>

        {/* Invitation Event Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 pt-3 border-t border-[#E5B25D]/20 text-left">
          {/* Date */}
          <div className="flex flex-col gap-0.5">
            <span className="font-cinzel text-[10px] uppercase tracking-[0.24em] text-[#E5B25D]">
              Date
            </span>
            <span className="font-manrope text-[14px] sm:text-[15px] font-semibold text-[#FFF6EE]">
              {diwali.date}
            </span>
          </div>

          {/* Time & Gates Close Notice */}
          <div className="flex flex-col gap-0.5">
            <span className="font-cinzel text-[10px] uppercase tracking-[0.24em] text-[#E5B25D]">
              Time
            </span>
            <span className="font-manrope text-[14px] sm:text-[15px] font-semibold text-[#FFF6EE]">
              {diwali.time}
            </span>
            <span className="font-manrope text-[11px] font-medium text-[#E0217A]">
              {diwali.gatesClose}
            </span>
          </div>

          {/* Venue */}
          <div className="sm:col-span-2 flex flex-col gap-0.5">
            <span className="font-cinzel text-[10px] uppercase tracking-[0.24em] text-[#E5B25D]">
              Venue
            </span>
            <span className="font-manrope text-[14px] sm:text-[15px] font-semibold text-[#FFF6EE]">
              {diwali.invitation.rows[2].value}
            </span>
          </div>
        </div>

        {/* Phase 1 Rates Box */}
        <div className="mt-6 pt-5 border-t border-[#E5B25D]/25">
          <div className="flex items-center justify-between mb-3">
            <span className="font-cinzel text-[11px] sm:text-[12px] uppercase tracking-[0.26em] text-[#FFE3A3] font-bold">
              {diwali.pricing.title}
            </span>
            <span className="px-2.5 py-0.5 rounded text-[9.5px] font-mono uppercase tracking-wider bg-[#E5B25D]/15 border border-[#E5B25D]/40 text-[#FFE3A3]">
              Limited Passes
            </span>
          </div>

          {/* Rate Tiers: Couple & Stag */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {diwali.pricing.rates.map((rate) => (
              <div
                key={rate.tier}
                className="flex flex-col p-3.5 rounded-lg bg-[#180A10]/80 border border-[#E5B25D]/30"
              >
                <div className="flex items-center justify-between">
                  <span className="font-cinzel text-[11px] uppercase tracking-[0.22em] text-[#FFE3A3] font-semibold">
                    {rate.tier}
                  </span>
                  <span className="font-manrope text-[16px] sm:text-[17px] font-extrabold text-white">
                    {rate.price}
                  </span>
                </div>
                {/* Cover on a separate line beneath it */}
                <span className="font-manrope text-[12px] text-[#E5B25D] font-medium pt-1">
                  {rate.cover}
                </span>
              </div>
            ))}
          </div>

          {/* Gates Close Notice */}
          <p className="font-manrope text-[12px] text-[#FFF6EE]/75 font-medium mt-2.5 text-center">
            {diwali.pricing.notice}
          </p>
        </div>

        {/* VIP Enclosures Sold Out Notice (Styled in world's pink/gold) */}
        <div className="mt-5 p-3 rounded-lg bg-[#240A15]/90 border border-[#E0217A]/50 flex items-center justify-center gap-2.5 text-center shadow-[0_4px_16px_rgba(224,33,122,0.2)]">
          <span className="w-2 h-2 rounded-full bg-[#E0217A] animate-pulse" aria-hidden="true" />
          <span className="font-cinzel text-[11px] sm:text-[12px] uppercase tracking-[0.22em] text-[#FFE3A3] font-bold">
            {diwali.vipEnclosures.notice}
          </span>
        </div>

        {/* Hidden Diwali QR slot (hidden until asset supplied) */}
        {diwali.qrEntry.enabled && (
          <div className="mt-6 pt-5 border-t border-[#E5B25D]/20 flex flex-col items-center gap-2">
            <span className="font-cinzel text-xs uppercase tracking-widest text-[#E5B25D]">
              Fast-Track Entry QR
            </span>
            {/* Slot prepared for client QR asset */}
            <div className="w-48 h-48 border border-white/20 bg-black/40 rounded flex items-center justify-center">
              <span className="font-mono text-xs text-white/60">QR Slot</span>
            </div>
          </div>
        )}

        {/* Tickets, tables & enclosures enquiries */}
        <div className="mt-6 pt-5 border-t border-[#E5B25D]/20">
          <BookingDetails variant="diwali" />
        </div>

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
