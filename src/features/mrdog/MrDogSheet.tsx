"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useMrDogStore, worldToOutfit } from "./store";
import { useStore as useAppStore } from "@/state/store";
import { MrDogStills } from "./MrDogStills";
import { MrDogStage3D } from "./MrDogStage3D";
import { MrDogChat } from "./MrDogChat";
import { getLenis } from "@/motion/clock";

export function MrDogSheet() {
  const isOpen = useMrDogStore((s) => s.isOpen);
  const closeMrDog = useMrDogStore((s) => s.closeMrDog);
  const clearChat = useMrDogStore((s) => s.clearChat);
  const setChatCovering = useMrDogStore((s) => s.setChatCovering);

  const world = useAppStore((s) => s.world);
  const motion = useAppStore((s) => s.motionEnabled);
  const outfit = worldToOutfit(world);

  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [viewportBottomOffset, setViewportBottomOffset] = useState(0);
  const sheetRef = useRef<HTMLDivElement>(null);
  const pushedHistoryRef = useRef(false);

  // Sync chatCovering to app store (pauses world canvas on mobile while sheet is open)
  useEffect(() => {
    if (isOpen) {
      setChatCovering(true);
      getLenis()?.stop();
    } else {
      setChatCovering(false);
      getLenis()?.start();
    }
  }, [isOpen, setChatCovering]);

  // Android Back Gesture & Popstate Handling
  useEffect(() => {
    if (isOpen) {
      if (!pushedHistoryRef.current) {
        window.history.pushState({ mrDog: true }, "");
        pushedHistoryRef.current = true;
      }

      const handlePopState = (e: PopStateEvent) => {
        if (pushedHistoryRef.current) {
          pushedHistoryRef.current = false;
          closeMrDog();
        }
      };

      window.addEventListener("popstate", handlePopState);
      return () => {
        window.removeEventListener("popstate", handlePopState);
      };
    } else {
      if (pushedHistoryRef.current) {
        pushedHistoryRef.current = false;
        // If history entry is still ours on explicit close, clean it up
        if (window.history.state?.mrDog) {
          window.history.back();
        }
      }
    }
  }, [isOpen, closeMrDog]);

  // Visual Viewport Keyboard Handling
  useEffect(() => {
    if (!isOpen || typeof window === "undefined" || !window.visualViewport) return;

    const handleResize = () => {
      const vv = window.visualViewport;
      if (!vv) return;
      const heightDiff = window.innerHeight - vv.height;
      if (heightDiff > 120) {
        setKeyboardOpen(true);
        setViewportBottomOffset(heightDiff);
      } else {
        setKeyboardOpen(false);
        setViewportBottomOffset(0);
      }
    };

    window.visualViewport.addEventListener("resize", handleResize);
    window.visualViewport.addEventListener("scroll", handleResize);
    return () => {
      window.visualViewport?.removeEventListener("resize", handleResize);
      window.visualViewport?.removeEventListener("scroll", handleResize);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const worldLabel =
    world === "redroom"
      ? "The Red Room · Halloween"
      : world === "diwali"
        ? "DHAMAAKA · Diwali"
        : "Gate to Rage";

  const accentColor =
    world === "redroom"
      ? "#FF1A35"
      : world === "diwali"
        ? "#E5B25D"
        : "#EA28C1";

  return (
    <div
      ref={sheetRef}
      role="dialog"
      aria-modal="true"
      aria-label="Mr. Dog AI Concierge Sheet"
      className="fixed inset-x-0 top-0 z-[48] md:hidden flex flex-col bg-[#07090D] text-white overflow-hidden transition-all duration-300"
      style={{
        top: 0,
        bottom: keyboardOpen
          ? `${viewportBottomOffset}px`
          : "calc(50px + max(env(safe-area-inset-bottom, 0px), 8px))",
        paddingTop: "env(safe-area-inset-top, 0px)",
      }}
    >
      {/* Sheet Top Header */}
      <div className="flex items-center justify-between px-4 h-13 border-b border-white/10 shrink-0 bg-[#0A0D12]">
        <div className="flex items-center gap-2">
          <span className="font-cinzel text-[14px] font-bold tracking-wider text-white">
            MR. DOG
          </span>
          <span className="text-white/30 text-[12px]">·</span>
          <span className="font-manrope text-[11px] font-medium text-white/60">
            AI Concierge
          </span>
          <span
            className="px-2 py-0.5 rounded-full text-[10px] font-semibold border"
            style={{
              borderColor: `${accentColor}40`,
              color: accentColor,
              backgroundColor: `${accentColor}15`,
            }}
          >
            {outfit}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={clearChat}
            aria-label="Clear chat"
            className="p-2 text-white/60 hover:text-white active:scale-95 transition-transform"
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
        </div>
      </div>

      {/* Stage: 3D Stage (T2+ with Motion ON) or 2D Stills (or collapsed avatar row when keyboard is open) */}
      <div
        className={`flex items-center justify-center bg-gradient-to-b from-[#0F141C] to-[#07090D] border-b border-white/5 transition-all duration-300 overflow-hidden ${
          keyboardOpen ? "h-16 py-1 shrink-0" : "h-[28vh] shrink-0"
        }`}
      >
        {keyboardOpen ? (
          <MrDogStills size={56} isAvatarOnly={true} />
        ) : (
          <MrDogStage3D size={180} />
        )}
      </div>

      {/* Shared Chat UI */}
      <div className="flex-1 min-h-0 flex flex-col">
        <MrDogChat />
      </div>
    </div>
  );
}
