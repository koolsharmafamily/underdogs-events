"use client";

import React from "react";
import { site } from "@/content/site";
import { TransitionLink } from "@/ui/TransitionLink";

export function DhamaakaOutro() {
  return (
    <section
      aria-label="Diwali Dhamaka Outro"
      className="relative z-10 w-full max-w-[840px] mx-auto px-4 py-20 sm:py-28 text-center select-none"
    >
      <div className="flex flex-col items-center gap-6">
        {/* Tagline */}
        <p className="font-cinzel text-[24px] sm:text-[38px] font-bold uppercase tracking-[0.28em] text-[#E5B25D] drop-shadow-[0_4px_20px_rgba(229,178,93,0.3)]">
          {site.diwali.outro.tagline}
        </p>

        {/* Wish */}
        <p className="font-devanagari text-[32px] sm:text-[46px] font-normal text-[#FFF6EE] drop-shadow-[0_2px_12px_rgba(224,33,122,0.4)]">
          {site.diwali.outro.wish}
        </p>

        <div className="flex items-center gap-3 w-40 text-[#E5B25D]/60 text-[9px]">
          <span className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#E5B25D]" />
          <span className="text-[#E0217A]">✦</span>
          <span className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#E5B25D]" />
        </div>

        {/* Navigation Links */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12">
          <TransitionLink
            href={site.diwali.outro.other.href}
            transitionType="T3"
            origin="gate"
            className="group inline-flex items-center gap-3 font-cinzel text-[13px] sm:text-[14px] font-semibold uppercase tracking-[0.22em] text-[#FFF6EE] hover:text-[#E0217A] transition-colors"
          >
            <span>{site.diwali.outro.other.label}</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </TransitionLink>

          <span className="hidden sm:inline text-[#E5B25D]/40 text-xs">|</span>

          <TransitionLink
            href={site.diwali.outro.back.href}
            transitionType="T4"
            origin="gate"
            className="group inline-flex items-center gap-3 font-cinzel text-[13px] sm:text-[14px] font-semibold uppercase tracking-[0.22em] text-[#FFF6EE]/80 hover:text-[#E5B25D] transition-colors"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            <span>{site.diwali.outro.back.label}</span>
          </TransitionLink>
        </div>
      </div>
    </section>
  );
}
