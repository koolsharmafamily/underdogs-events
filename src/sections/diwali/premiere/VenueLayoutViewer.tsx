"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { site } from "@/content/site";
import { getLenis } from "@/motion/clock";

export function VenueLayoutViewer() {
  const [isOpen, setIsOpen] = useState(false);
  const layout = site.diwali.layout;

  return (
    <section
      aria-label={layout.title}
      className="relative z-10 w-full max-w-[840px] mx-auto px-4 py-16 sm:py-24 text-center select-none"
    >
      {/* Section Header */}
      <div className="flex flex-col items-center gap-2 mb-8">
        <span className="font-cinzel text-[11px] sm:text-[12px] uppercase tracking-[0.38em] text-[#E5B25D]">
          Hotel Centre Point · Nagpur
        </span>
        <h2 className="font-cinzel font-bold text-[22px] sm:text-[28px] uppercase tracking-[0.24em] text-[#FFF6EE]">
          {layout.title}
        </h2>
        <div className="flex items-center gap-3 w-40 text-[#E5B25D]/60 text-[8px]" aria-hidden="true">
          <span className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#E5B25D]" />
          <span className="text-[#E0217A]">✦</span>
          <span className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#E5B25D]" />
        </div>
      </div>

      {/* Prominent VIP Sold Out badge if near layout */}
      <div className="mb-6 inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-[#2A0E1A]/90 border border-[#E0217A]/60 shadow-[0_4px_20px_rgba(224,33,122,0.3)]">
        <span className="w-2 h-2 rounded-full bg-[#E0217A] animate-pulse" aria-hidden="true" />
        <span className="font-cinzel text-[11px] sm:text-[12px] uppercase tracking-[0.22em] text-[#FFE3A3] font-bold">
          {site.diwali.vipEnclosures.notice}
        </span>
      </div>

      {/* Layout Card preview with click to enlarge */}
      <div className="relative group p-3 sm:p-5 rounded-2xl bg-gradient-to-b from-[#2B1B10]/80 via-[#150B0D]/90 to-[#0A0506]/95 border border-[#E5B25D]/40 shadow-[0_24px_70px_rgba(0,0,0,0.85),0_0_35px_rgba(229,178,93,0.15)] transition-all duration-300 hover:border-[#E5B25D]/80">
        <div
          role="button"
          tabIndex={0}
          onClick={() => setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setIsOpen(true);
            }
          }}
          aria-label="Enlarge venue layout into interactive zoom viewer"
          className="relative w-full overflow-hidden rounded-xl bg-[#080405] cursor-zoom-in focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#E5B25D]"
        >
          {/* Uncropped layout image in natural proportion */}
          <div className="relative w-full max-w-[620px] mx-auto aspect-[901/1600]">
            <Image
              src={layout.src}
              alt={layout.alt}
              fill
              sizes="(max-width: 768px) 94vw, 620px"
              priority={false}
              className="object-contain object-center transition-transform duration-500 group-hover:scale-[1.01]"
            />
          </div>

          {/* Hover / Tap Hint Overlay */}
          <div className="absolute inset-x-0 bottom-0 py-4 px-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex items-center justify-center gap-2 text-white/95 transition-opacity">
            <span className="px-3.5 py-1.5 rounded-full bg-[#E5B25D]/20 border border-[#E5B25D]/60 font-cinzel text-[11px] uppercase tracking-[0.2em] text-[#FFE3A3] backdrop-blur-md font-semibold flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="11" y1="8" x2="11" y2="14" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
              Tap / Click to Zoom & Pan
            </span>
          </div>
        </div>

        {/* Short exact caption */}
        <p className="font-manrope text-[13px] sm:text-[14px] text-[#FFF6EE]/80 font-medium pt-5 pb-2 px-2 pretty-copy text-center">
          {layout.caption}
        </p>
      </div>

      {/* Fullscreen Interactive Zoom & Pan Modal */}
      {isOpen && (
        <FullscreenLayoutModal
          src={layout.fullSrc || layout.src}
          alt={layout.alt}
          caption={layout.caption}
          onClose={() => setIsOpen(false)}
        />
      )}
    </section>
  );
}

interface FullscreenLayoutModalProps {
  src: string;
  alt: string;
  caption: string;
  onClose: () => void;
}

function FullscreenLayoutModal({ src, alt, caption, onClose }: FullscreenLayoutModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, initialX: 0, initialY: 0 });
  const touchStartDistRef = useRef<number | null>(null);
  const initialTouchScaleRef = useRef(1);

  // Stop Lenis & Lock Body Scroll
  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement;
    const lenis = getLenis();
    lenis?.stop();
    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      // Focus trap
      if (e.key === "Tab" && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
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

    window.addEventListener("keydown", handleKeyDown);
    const closeBtn = modalRef.current?.querySelector<HTMLElement>("button");
    closeBtn?.focus();

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      lenis?.start();
      document.body.style.overflow = origOverflow;
      previousFocusRef.current?.focus();
    };
  }, [onClose]);

  // Zoom helpers
  const zoomIn = useCallback(() => {
    setScale((s) => Math.min(4, Math.round((s + 0.4) * 10) / 10));
  }, []);

  const zoomOut = useCallback(() => {
    setScale((s) => {
      const next = Math.max(1, Math.round((s - 0.4) * 10) / 10);
      if (next === 1) setTranslate({ x: 0, y: 0 });
      return next;
    });
  }, []);

  const resetZoom = useCallback(() => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  }, []);

  // Wheel listener for desktop zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const delta = -e.deltaY;
    if (delta > 0) {
      setScale((s) => Math.min(4, s + 0.25));
    } else {
      setScale((s) => {
        const next = Math.max(1, s - 0.25);
        if (next === 1) setTranslate({ x: 0, y: 0 });
        return next;
      });
    }
  };

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initialX: translate.x,
      initialY: translate.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || scale <= 1) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setTranslate({
      x: dragStartRef.current.initialX + dx,
      y: dragStartRef.current.initialY + dy,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile pinch-zoom and pan
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dist = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
      touchStartDistRef.current = dist;
      initialTouchScaleRef.current = scale;
    } else if (e.touches.length === 1 && scale > 1) {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        initialX: translate.x,
        initialY: translate.y,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchStartDistRef.current !== null) {
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dist = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
      const ratio = dist / touchStartDistRef.current;
      const nextScale = Math.min(4, Math.max(1, initialTouchScaleRef.current * ratio));
      setScale(nextScale);
      if (nextScale === 1) setTranslate({ x: 0, y: 0 });
    } else if (e.touches.length === 1 && isDragging && scale > 1) {
      e.preventDefault();
      const dx = e.touches[0].clientX - dragStartRef.current.x;
      const dy = e.touches[0].clientY - dragStartRef.current.y;
      setTranslate({
        x: dragStartRef.current.initialX + dx,
        y: dragStartRef.current.initialY + dy,
      });
    }
  };

  const handleTouchEnd = () => {
    touchStartDistRef.current = null;
    setIsDragging(false);
  };

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-label="Venue Layout Full-Screen Viewer"
      className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-black/95 backdrop-blur-2xl text-white select-none overflow-hidden touch-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Top Controls Bar */}
      <div className="w-full max-w-4xl flex items-center justify-between px-4 py-3 sm:py-4 z-20 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex flex-col text-left">
          <span className="font-cinzel text-xs uppercase tracking-[0.26em] text-[#E5B25D] font-bold">
            Venue Layout
          </span>
          <span className="font-manrope text-[11px] text-white/70 hidden sm:inline">
            Use pinch or mouse wheel to zoom, drag to pan
          </span>
        </div>

        {/* Zoom Action Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white/10 rounded-full border border-white/15 px-1 py-0.5">
            <button
              type="button"
              onClick={zoomOut}
              disabled={scale <= 1}
              aria-label="Zoom out"
              className="min-h-[38px] min-w-[38px] flex items-center justify-center text-white/90 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed text-base font-bold transition-all"
            >
              −
            </button>
            <span className="font-mono text-[11px] px-2 text-white/80 min-w-[3rem] text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              type="button"
              onClick={zoomIn}
              disabled={scale >= 4}
              aria-label="Zoom in"
              className="min-h-[38px] min-w-[38px] flex items-center justify-center text-white/90 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed text-base font-bold transition-all"
            >
              +
            </button>
          </div>

          {scale > 1 && (
            <button
              type="button"
              onClick={resetZoom}
              aria-label="Reset zoom"
              className="min-h-[40px] px-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-[10px] font-mono tracking-wider transition-all"
            >
              RESET
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            aria-label="Close layout viewer"
            className="min-h-[44px] min-w-[44px] px-3.5 py-1.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 text-white font-mono text-xs tracking-wider flex items-center gap-1.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white transition-all ml-1"
          >
            <span>CLOSE</span>
            <span className="text-sm font-bold">✕</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Pan/Zoom Canvas */}
      <div
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`relative flex-1 w-full flex items-center justify-center overflow-hidden p-2 sm:p-6 ${
          scale > 1 ? (isDragging ? "cursor-grabbing" : "cursor-grab") : "cursor-default"
        }`}
        style={{ touchAction: "none" }}
      >
        <div
          style={{
            transform: `translate3d(${translate.x}px, ${translate.y}px, 0) scale(${scale})`,
            transformOrigin: "center center",
            transition: isDragging ? "none" : "transform 140ms ease-out",
          }}
          className="relative max-w-full max-h-[82vh] aspect-[901/1600] w-auto h-auto flex items-center justify-center select-none"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            draggable={false}
            className="max-h-[80vh] max-w-[94vw] w-auto h-auto object-contain rounded-md shadow-[0_0_60px_rgba(0,0,0,0.9)] pointer-events-none select-none"
          />
        </div>
      </div>

      {/* Bottom Caption Bar */}
      <div className="w-full max-w-3xl px-4 py-3 bg-gradient-to-t from-black/90 to-transparent text-center z-20">
        <p className="font-manrope text-[12px] sm:text-[13px] text-white/80 font-medium pretty-copy">
          {caption}
        </p>
      </div>
    </div>
  );
}
