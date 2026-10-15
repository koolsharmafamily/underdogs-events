"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { site } from "@/content/site";
import { useStore } from "@/state/store";
import { UnderdogsBadgeSvg } from "./UnderdogsBadgeSvg";
import { TransitionLink } from "./TransitionLink";
import { MobileTopBar } from "./mobile/MobileTopBar";
import { MobileTabBar } from "./mobile/MobileTabBar";
import { MotionToggle } from "./MotionToggle";

export function Nav() {
  const pathname = usePathname();
  const world = useStore((s) => s.world);

  const isRedRoom = pathname === "/the-red-room";
  const isDiwali = pathname === "/diwali";

  return (
    <>
      {/* 1. Mobile App Shell (< 768px) */}
      <MobileTopBar />
      <MobileTabBar />

      {/* 2. Desktop & Tablet Header (≥ 768px) - Untouched */}
      <header className="fixed inset-x-0 top-0 z-40 pointer-events-none hidden md:block">
        <div className="site-container flex h-20 items-center justify-between">
          {/* Left: Prominent Underdogs badge + text */}
          <TransitionLink
            href="/"
            transitionType="T4"
            origin="nav"
            aria-label={`${site.brand.name} — ${site.redRoom.outro.back.label}`}
            className={`pointer-events-auto inline-flex min-h-[44px] min-w-[44px] items-center gap-3 transition-transform duration-200 hover:scale-[1.03] ${
              isDiwali ? "text-[#FFF6EE]/85 hover:text-[#D9BC7E]" : "text-[#ea28c1]"
            }`}
          >
            <UnderdogsBadgeSvg skin={world} size={36} />
            <span className="font-cinzel text-[14px] sm:text-[16px] font-bold uppercase tracking-[0.24em] inline">
              {site.brand.name}
            </span>
          </TransitionLink>

          {/* Right (Desktop): "The Red Room" · "Diwali" */}
          <nav
            aria-label="Primary"
            className="pointer-events-auto flex items-center gap-6"
          >
            <TransitionLink
              href="/the-red-room"
              origin="nav"
              rollText={site.home.worlds.one.name}
              aria-current={isRedRoom ? "page" : undefined}
              className={`min-h-[44px] inline-flex items-center px-1 font-cinzel text-[14px] sm:text-[15px] font-semibold uppercase tracking-[0.22em] transition-all ${
                isDiwali
                  ? "text-[#FFF6EE]/85 hover:text-[#D9BC7E]"
                  : "text-[#ea28c1] hover:brightness-125"
              } ${isRedRoom ? "active-page-link" : ""}`}
            />
            <span
              aria-hidden="true"
              className={`font-bold text-[14px] ${
                isDiwali ? "text-[#D9BC7E]/50" : "text-[#ea28c1] opacity-75"
              }`}
            >
              ·
            </span>
            <TransitionLink
              href="/diwali"
              origin="nav"
              rollText={site.home.worlds.two.name}
              aria-current={isDiwali ? "page" : undefined}
              className={`min-h-[44px] inline-flex items-center px-1 font-cinzel text-[14px] sm:text-[15px] font-semibold uppercase tracking-[0.22em] transition-all ${
                isDiwali
                  ? "text-[#D9BC7E] border-b-2 border-[#D9BC7E] pb-0.5"
                  : "text-[#ea28c1] hover:brightness-125"
              }`}
            />
            <MotionToggle
              colorClass={
                isDiwali
                  ? "text-[#FFF6EE]/85 hover:text-[#D9BC7E]"
                  : "text-[#ea28c1] hover:brightness-125"
              }
            />
          </nav>
        </div>
      </header>
    </>
  );
}
