"use client";

import React, { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useMrDogStore, worldToOutfit } from "./store";
import { useStore as useAppStore } from "@/state/store";
import { MrDogStage3D } from "./MrDogStage3D";
import { MrDogChat } from "./MrDogChat";

export function MrDogPanel() {
  const pathname = usePathname();
  const isOpen = useMrDogStore((s) => s.isOpen);
  const closeMrDog = useMrDogStore((s) => s.closeMrDog);
  const clearChat = useMrDogStore((s) => s.clearChat);

  const world = useAppStore((s) => s.world);
  const outfit = worldToOutfit(world);
  const panelRef = useRef<HTMLDivElement>(null);

  // Esc key closes panel
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeMrDog();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeMrDog]);

  // Focus input upon opening
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        const input = panelRef.current?.querySelector<HTMLInputElement>("input[type='text']");
        input?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen || pathname === "/mr-dog") return null;

  const accentColor =
    world === "redroom"
      ? "#FF1A35"
      : world === "diwali"
        ? "#E5B25D"
        : "#EA28C1";

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="false"
      aria-label="Mr. Dog AI Concierge"
      className="fixed bottom-6 right-6 z-40 hidden md:flex flex-col w-[360px] h-[480px] max-h-[calc(100vh-210px)] rounded-[24px] bg-[#090A0E]/95 backdrop-blur-2xl border border-white/10 shadow-[0_16px_48px_rgba(0,0,0,0.7)] origin-bottom-right transition-all duration-320 ease-out overflow-visible"
      style={{
        boxShadow: `0 16px 48px rgba(0,0,0,0.7), 0 0 32px ${accentColor}25`,
        borderColor: `${accentColor}35`,
      }}
    >
      {/* 3D Coin Mascot Floating Proudly on Top of Panel - 100% Fully Visible */}
      <div className="absolute -top-[140px] inset-x-0 h-[155px] flex items-center justify-center pointer-events-none overflow-visible z-30">
        <MrDogStage3D size={160} isPeeking={true} />
      </div>

      {/* Panel Header */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-3.5 pb-2.5 border-b border-white/10 bg-[#0A0D12]/90 rounded-t-[24px]">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-cinzel text-[16px] font-bold tracking-wider text-white">
              MR. DOG
            </span>
            <span
              className="px-2 py-0.5 rounded-full text-[10px] font-semibold border uppercase"
              style={{
                borderColor: `${accentColor}40`,
                color: accentColor,
                backgroundColor: `${accentColor}15`,
              }}
            >
              {outfit}
            </span>
          </div>
          <span className="font-manrope text-[11px] font-medium text-white/55">
            Underdogs concierge · AI
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Clear conversation */}
          <button
            type="button"
            onClick={clearChat}
            aria-label="Clear chat"
            className="p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            title="Reset conversation"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>

          {/* Close Panel */}
          <button
            type="button"
            onClick={closeMrDog}
            aria-label="Close Mr. Dog panel"
            className="p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Shared Chat UI Component */}
      <div className="relative z-10 flex-1 min-h-0 flex flex-col overflow-hidden">
        <MrDogChat />
      </div>
    </div>
  );
}
