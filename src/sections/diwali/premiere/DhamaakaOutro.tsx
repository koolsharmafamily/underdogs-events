"use client";

import React from "react";
import { site } from "@/content/site";
import { TransitionLink } from "@/ui/TransitionLink";

export function DhamaakaOutro({ ref }: { ref?: React.Ref<HTMLElement> }) {
  return (
    <section
      ref={ref}
      data-scene="D5"
      aria-label="Diwali Dhamaka Outro"
      className="relative z-30 w-full max-w-[840px] mx-auto px-4 py-20 sm:py-28 text-center select-none"
    >
      <div className="flex flex-col items-center gap-6">
        {/* Tagline */}
        <p className="font-cinzel text-[24px] sm:text-[38px] font-bold uppercase tracking-[0.28em] text-[#E5B25D] drop-shadow-[0_4px_20px_rgba(229,178,93,0.3)] balance-heading">
          {site.diwali.outro.tagline}
        </p>

        {/* Wish */}
        <p
          lang="hi"
          className="font-devanagari text-[32px] sm:text-[46px] font-normal text-[#FFF6EE] drop-shadow-[0_2px_12px_rgba(224,33,122,0.4)]"
        >
          {site.diwali.outro.wish}
        </p>

        <div className="flex items-center gap-3 w-40 text-[#E5B25D]/60 text-[9px]" aria-hidden="true">
          <span className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#E5B25D]" />
          <span className="text-[#E0217A]">✦</span>
          <span className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#E5B25D]" />
        </div>

        {/* Navigation Links with ≥48px Tap Targets */}
        <div className="mt-6 relative z-40 flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-8 pointer-events-auto">
          <TransitionLink
            href={site.diwali.outro.other.href}
            transitionType="T3"
            origin="gate"
            className="group inline-flex min-h-[48px] items-center gap-3 border border-[#E5B25D]/50 bg-[#1B060E]/90 px-6 py-3 font-cinzel text-[12px] sm:text-[13px] font-semibold uppercase tracking-[0.24em] text-[#FFF6EE] hover:border-[#E5B25D] hover:text-[#FFE3A3] transition-colors"
          >
            <span>{site.diwali.outro.other.label}</span>
            <span className="group-hover:translate-x-1 transition-transform duration-[140ms]">→</span>
          </TransitionLink>

          <TransitionLink
            href={site.diwali.outro.back.href}
            transitionType="T4"
            origin="gate"
            className="group inline-flex min-h-[48px] items-center gap-3 px-4 py-3 font-cinzel text-[12px] sm:text-[13px] font-semibold uppercase tracking-[0.24em] text-[#FFF6EE]/80 hover:text-[#E5B25D] transition-colors"
          >
            <span className="group-hover:-translate-x-1 transition-transform duration-[140ms]">←</span>
            <span>{site.diwali.outro.back.label}</span>
          </TransitionLink>
        </div>
      </div>
    </section>
  );
}
