"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { site } from "@/content/site";
import { useStore } from "@/state/store";
import { UnderdogsBadgeSvg } from "./UnderdogsBadgeSvg";
import { TransitionLink } from "./TransitionLink";
import { MobileTopBar } from "./mobile/MobileTopBar";
import { MobileTabBar } from "./mobile/MobileTabBar";
import { useMrDogStore } from "@/features/mrdog/store";

export function Nav() {
  const pathname = usePathname();
  const world = useStore((s) => s.world);

  const isRedRoom = pathname === "/the-red-room";
  const isDiwali = pathname === "/diwali";

  const brandTextColor = isRedRoom
    ? "text-[#EFD9CD] hover:text-[#FF2A1F]"
    : isDiwali
      ? "text-[#FFF6EE] hover:text-[#E5B25D]"
      : "text-[#D73EBC] hover:brightness-125";

  const navItemClass = (active: boolean) => {
    if (isRedRoom) {
      return active
        ? "text-[#FF2A1F] border-b-2 border-[#FF2A1F] pb-0.5"
        : "text-[#EFD9CD]/80 hover:text-[#FF2A1F]";
    }
    if (isDiwali) {
      return active
        ? "text-[#E5B25D] border-b-2 border-[#E5B25D] pb-0.5"
        : "text-[#FFF6EE]/80 hover:text-[#E5B25D]";
    }
    return active
      ? "text-[#D73EBC] border-b-2 border-[#D73EBC] pb-0.5"
      : "text-[#FCF9FC]/85 hover:text-[#D73EBC]";
  };

  const dotColor = isRedRoom
    ? "text-[#8B1414]"
    : isDiwali
      ? "text-[#E5B25D]/50"
      : "text-[#D73EBC]/70";

  return (
    <>
      {/* 1. Mobile App Shell (< 768px) */}
      <MobileTopBar />
      <MobileTabBar />

      {/* 2. Desktop & Tablet Header (≥ 768px) */}
      <header className="fixed inset-x-0 top-0 z-40 pointer-events-none hidden md:block">
        <div className="site-container flex h-20 items-center justify-between">
          {/* Left: Prominent Underdogs badge + text */}
          <TransitionLink
            href="/"
            transitionType="T4"
            origin="nav"
            aria-label={`${site.brand.name} — ${site.redRoom.outro.back.label}`}
            className={`pointer-events-auto inline-flex min-h-[44px] min-w-[44px] items-center gap-3 transition-all duration-200 hover:scale-[1.03] ${brandTextColor}`}
          >
            <UnderdogsBadgeSvg skin={world} size={36} />
            <span className="font-cinzel text-[14px] sm:text-[16px] font-bold uppercase tracking-[0.24em] inline">
              {site.brand.name}
            </span>
          </TransitionLink>

          {/* Right (Desktop): "The Red Room" · "DHAMAAKA" */}
          <nav
            aria-label="Primary"
            className="pointer-events-auto flex items-center gap-6"
          >
            <TransitionLink
              href="/the-red-room"
              origin="nav"
              rollText={site.home.worlds.one.name}
              aria-current={isRedRoom ? "page" : undefined}
              className={`min-h-[44px] inline-flex items-center px-1 font-cinzel text-[14px] sm:text-[15px] font-semibold uppercase tracking-[0.22em] transition-all ${navItemClass(
                isRedRoom,
              )}`}
            />
            <span
              aria-hidden="true"
              className={`font-bold text-[14px] ${dotColor}`}
            >
              ·
            </span>
            <TransitionLink
              href="/diwali"
              origin="nav"
              rollText={site.home.worlds.two.name}
              aria-current={isDiwali ? "page" : undefined}
              className={`min-h-[44px] inline-flex items-center px-1 font-cinzel text-[14px] sm:text-[15px] font-semibold uppercase tracking-[0.22em] transition-all ${navItemClass(
                isDiwali,
              )}`}
            />
            <span
              aria-hidden="true"
              className={`font-bold text-[14px] ${dotColor}`}
            >
              ·
            </span>
            <button
              type="button"
              onClick={() => useMrDogStore.getState().openMrDog()}
              className={`min-h-[44px] nav-roll-link inline-flex items-center px-1 font-cinzel text-[14px] sm:text-[15px] font-semibold uppercase tracking-[0.22em] transition-all ${brandTextColor}`}
            >
              <span className="nav-roll-inner">
                <span className="nav-roll-line">Ask Mr. Dog</span>
                <span className="nav-roll-line" aria-hidden="true">
                  Ask Mr. Dog
                </span>
              </span>
            </button>
          </nav>
        </div>
      </header>
    </>
  );
}
