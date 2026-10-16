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

      {/* 1. Top Row: Powered By (Film Credits Lead) */}
      {poweredBy && (
        <div className="mb-14 sm:mb-18 flex flex-col items-center">
          <span className="font-cinzel text-[11px] sm:text-[13px] font-semibold uppercase tracking-[0.38em] text-[#E5B25D]">
            {poweredBy.role}
          </span>
          <p className="mt-2 font-cinzel text-[22px] sm:text-[30px] font-bold uppercase tracking-[0.2em] text-[#FFF6EE] drop-shadow-[0_2px_14px_rgba(229,178,93,0.4)]">
            {poweredBy.name}
          </p>
          <div className="mt-6 w-36 h-[1px] bg-gradient-to-r from-transparent via-[#E5B25D]/40 to-transparent" />
        </div>
      )}

      {/* 2. Opening Credits Roles (Clean elegant film-credits typography, no boxes) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-10 sm:gap-y-12">
        {otherPartners.map((partner) => (
          <div
            key={partner.role}
            className="flex flex-col items-center text-center gap-1.5"
          >
            <span className="font-cinzel text-[10.5px] sm:text-[11.5px] uppercase tracking-[0.3em] text-[#E5B25D]/80">
              {partner.role}
            </span>
            <p className="font-cinzel text-[15px] sm:text-[17px] font-semibold uppercase tracking-[0.16em] text-[#FFF6EE]">
              {partner.name}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
