"use client";

import React from "react";
import { site } from "@/content/site";
import { useStore } from "@/state/store";
import { runFadeCutJump } from "@/motion/transitions";

import { UnderdogsBadgeSvg } from "./UnderdogsBadgeSvg";

/**
 * Part 7 H6 · Footer
 * - footer.line
 * - footer.instagram (plain text, NOT a link)
 * - footer.copyright
 * - the Motion toggle
 * - a 28 px 2D SVG badge
 * - "Back to top ↑", which is internal (fade-cut jump if crossing > 2 scenes)
 */
export function Footer() {
  const world = useStore((s) => s.world);

  const handleBackToTop = () => {
    const crossedMoreThanTwoScenes =
      typeof window !== "undefined" && window.scrollY > window.innerHeight * 2;
    if (crossedMoreThanTwoScenes) {
      runFadeCutJump(0);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer
      data-scene="H6"
      className="relative z-10 border-t border-current/20 py-10 text-[var(--world-text)]"
    >
      <div className="site-container flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <UnderdogsBadgeSvg skin={world} size={28} />
          <div className="flex flex-col gap-1">
            <p className="font-cinzel text-[12px] uppercase tracking-[0.28em]">
              {site.footer.line}
            </p>
            <p className="font-mono text-[11px] tracking-[0.08em] text-[var(--world-muted)]">
              {site.footer.instagram}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <span className="font-mono text-[11px] tracking-[0.08em] text-[var(--world-muted)]">
            {site.footer.copyright}
          </span>

          <button
            type="button"
            onClick={handleBackToTop}
            className="nav-roll-link inline-flex min-h-[44px] items-center gap-2 px-2 font-cinzel text-[11px] uppercase tracking-[0.28em] text-[var(--world-text)] hover:text-[var(--world-accent)] transition-colors"
          >
            <span className="nav-roll-inner">
              <span className="nav-roll-line">{site.ui.backToTop}</span>
              <span className="nav-roll-line" aria-hidden="true">
                {site.ui.backToTop}
              </span>
            </span>
            <svg
              width="10"
              height="12"
              viewBox="0 0 10 12"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M5 11V1.5M5 1.5L1.5 5M5 1.5L8.5 5"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
          </button>
        </div>
      </div>
    </footer>
  );
}
