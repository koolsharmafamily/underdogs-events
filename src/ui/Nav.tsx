"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { site } from "@/content/site";
import { useStore } from "@/state/store";
import { UnderdogsBadgeSvg } from "./UnderdogsBadgeSvg";
import { TransitionLink } from "./TransitionLink";

import { Menu } from "./Menu";

export function Nav() {
  const pathname = usePathname();
  const world = useStore((s) => s.world);
  const menuOpen = useStore((s) => s.menuOpen);
  const setMenuOpen = useStore((s) => s.setMenuOpen);

  const isRedRoom = pathname === "/the-red-room";
  const isDiwali = pathname === "/diwali";

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 pointer-events-none">
        <div className="site-container flex h-20 items-center justify-between">
          {/* Left: Prominent Underdogs badge + text in logo pink */}
          <TransitionLink
            href="/"
            transitionType="T4"
            origin="nav"
            aria-label={`${site.brand.name} — ${site.redRoom.outro.back.label}`}
            className="pointer-events-auto inline-flex min-h-[44px] min-w-[44px] items-center gap-3 text-[#ea28c1] transition-transform duration-200 hover:scale-[1.03]"
          >
            <UnderdogsBadgeSvg skin={world} size={36} />
            <span className="font-cinzel text-[14px] sm:text-[16px] font-bold uppercase tracking-[0.24em] inline">
              {site.brand.name}
            </span>
          </TransitionLink>

          {/* Right (Desktop): "The Red Room" · "Diwali" in logo pink */}
          <nav
            aria-label="Primary"
            className="pointer-events-auto hidden md:flex items-center gap-6"
          >
            <TransitionLink
              href="/the-red-room"
              origin="nav"
              rollText={site.home.worlds.one.name}
              aria-current={isRedRoom ? "page" : undefined}
              className={`min-h-[44px] inline-flex items-center px-1 font-cinzel text-[14px] sm:text-[15px] font-semibold uppercase tracking-[0.22em] text-[#ea28c1] hover:brightness-125 transition-all ${
                isRedRoom ? "active-page-link" : ""
              }`}
            />
            <span
              aria-hidden="true"
              className="text-[#ea28c1] opacity-75 font-bold text-[14px]"
            >
              ·
            </span>
            <TransitionLink
              href="/diwali"
              origin="nav"
              rollText={site.home.worlds.two.name}
              aria-current={isDiwali ? "page" : undefined}
              className={`min-h-[44px] inline-flex items-center px-1 font-cinzel text-[14px] sm:text-[15px] font-semibold uppercase tracking-[0.22em] text-[#ea28c1] hover:brightness-125 transition-all ${
                isDiwali ? "active-page-link" : ""
              }`}
            />
          </nav>

          {/* Right (Mobile): "Menu" button in logo pink */}
          <div className="pointer-events-auto flex md:hidden">
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu-overlay"
              className="min-h-[44px] min-w-[44px] px-2 font-cinzel text-[14px] font-semibold uppercase tracking-[0.24em] text-[#ea28c1]"
            >
              Menu
            </button>
          </div>
        </div>
      </header>
      <Menu />
    </>
  );
}
