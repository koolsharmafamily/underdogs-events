"use client";

import React from "react";
import { site } from "@/content/site";
import { useStore } from "@/state/store";

export function SponsorWall({ ref }: { ref?: React.Ref<HTMLElement> }) {
  const motionEnabled = useStore((s) => s.motionEnabled);
  const partners = site.diwali.partners?.list || [];

  const poweredBy = partners.find((p) => p.role.toLowerCase().includes("powered by") && !p.role.toLowerCase().includes("co-powered"));
  const otherPartners = partners.filter((p) => p !== poweredBy);

  return (
    <section
      ref={ref}
      data-scene="D4"
      aria-label={site.diwali.partners.label}
      className="relative z-10 w-full max-w-[960px] mx-auto px-4 py-16 sm:py-24 text-center select-none"
    >
      {/* Section Header: Styled like opening credits */}
      <div className="flex flex-col items-center gap-3 mb-12 sm:mb-16">
        <span className="font-cinzel text-[11px] sm:text-[12px] uppercase tracking-[0.38em] text-[#E5B25D]">
          {site.diwali.presenter}
        </span>
        <h2 className="font-cinzel font-bold text-[22px] sm:text-[28px] uppercase tracking-[0.24em] text-[#FFF6EE]">
          {site.diwali.partners.label}
        </h2>
        <div className="flex items-center gap-3 w-48 text-[#E5B25D]/60 text-[9px]">
          <span className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#E5B25D]" />
          <span className="text-[#E0217A]">✦</span>
          <span className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#E5B25D]" />
        </div>
      </div>

      {/* 1. Top Row: Powered By (Prominent, Larger Treatment) */}
      {poweredBy && (
        <div className="mb-12 sm:mb-16 p-6 sm:p-8 rounded-xl bg-gradient-to-b from-[#18080C] to-[#0D0507] border border-[#E5B25D]/40 shadow-[0_12px_32px_rgba(0,0,0,0.8)]">
          <span className="font-cinzel text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.35em] text-[#FFE3A3]">
            {poweredBy.role}
          </span>
          <p className="mt-2 font-cinzel text-[20px] sm:text-[26px] font-bold uppercase tracking-[0.18em] text-[#FFF6EE] drop-shadow-[0_2px_12px_rgba(229,178,93,0.35)]">
            {poweredBy.name}
          </p>
        </div>
      )}

      {/* 2. Grid: 3 columns desktop, 2 columns mobile */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
        {otherPartners.map((partner, idx) => (
          <div
            key={partner.role}
            className="flex flex-col items-center justify-center p-5 sm:p-6 rounded-lg bg-[#11070A]/80 border border-[#E5B25D]/20 hover:border-[#E5B25D]/50 transition-all duration-300"
          >
            <span className="font-cinzel text-[10px] sm:text-[11px] uppercase tracking-[0.28em] text-[#E5B25D]/80">
              {partner.role}
            </span>
            <div className="my-2 flex items-center gap-1.5 text-[#E0217A] text-[7px]" aria-hidden="true">
              <span>✦</span>
            </div>
            <p className="font-cinzel text-[14px] sm:text-[16px] font-semibold uppercase tracking-[0.14em] text-[#FFF6EE]">
              {partner.name}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
