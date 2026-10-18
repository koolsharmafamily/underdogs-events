"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";

export interface FlyerDetails {
  src: string;
  alt: string;
  title: string;
  subtitle?: string;
  world: "redroom" | "diwali";
}

interface OfficialFlyerLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  flyer: FlyerDetails | null;
}

export function OfficialFlyerLightbox({
  isOpen,
  onClose,
  flyer,
}: OfficialFlyerLightboxProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Focus management, Esc key listener & WebGL pause hint
  useEffect(() => {
    if (!isOpen || !flyer) return;

    previousFocusRef.current = document.activeElement as HTMLElement;
    document.documentElement.dataset.lightbox = "open";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      // Focus trap
      if (e.key === "Tab" && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    // Lock body scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    // Initial focus on close button
    const closeBtn = modalRef.current?.querySelector<HTMLElement>("button");
    closeBtn?.focus();

    return () => {
      delete document.documentElement.dataset.lightbox;
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [isOpen, flyer, onClose]);

  if (!isOpen || !flyer) return null;

  const isRed = flyer.world === "redroom";
  const accentBorder = isRed
    ? "border-[#FF2A1F]/50 shadow-[0_0_50px_rgba(255,42,31,0.3)]"
    : "border-[#E5B25D]/50 shadow-[0_0_50px_rgba(229,178,93,0.3)]";
  const accentText = isRed ? "text-[#FF2A1F]" : "text-[#E5B25D]";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${flyer.title} — Official Flyer`}
      ref={modalRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/94 backdrop-blur-xl transition-opacity duration-[280ms]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative flex flex-col items-center max-w-[94vw] max-h-[96vh] w-auto">
        {/* Header / Info bar */}
        <div className="w-full flex items-center justify-between pb-3 px-1 gap-4">
          <div className="flex flex-col text-left">
            <span
              className={`font-cinzel text-[11px] sm:text-[12px] uppercase tracking-[0.28em] font-semibold ${accentText}`}
            >
              {flyer.title}
            </span>
            {flyer.subtitle && (
              <span className="font-manrope text-[12px] sm:text-[13px] text-white/75">
                {flyer.subtitle}
              </span>
            )}
          </div>

          {/* 44px+ Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close official flyer lightbox"
            className="group min-h-[44px] min-w-[44px] flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white/90 hover:text-white transition-all text-xs font-mono tracking-wider focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          >
            <span>CLOSE</span>
            <span className="text-sm font-bold group-hover:scale-110 transition-transform">
              ✕
            </span>
          </button>
        </div>

        {/* Poster Frame with Next/Image and Fixed Aspect Ratio */}
        <div
          className={`relative overflow-hidden rounded-md border bg-black/80 flex items-center justify-center ${accentBorder}`}
          style={{ maxHeight: "calc(86vh - 48px)" }}
        >
          <Image
            src={flyer.src}
            alt={flyer.alt}
            width={800}
            height={1000}
            sizes="(max-width: 768px) 90vw, 560px"
            className="max-h-[calc(86vh-52px)] max-w-[90vw] w-auto h-auto object-contain select-none shadow-2xl"
          />
        </div>
      </div>
    </div>
  );
}
