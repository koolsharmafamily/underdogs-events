"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useMrDogStore, worldToOutfit } from "./store";
import { useStore as useAppStore } from "@/state/store";

export function MrDogLauncher() {
  const pathname = usePathname();
  const isOpen = useMrDogStore((s) => s.isOpen);
  const openMrDog = useMrDogStore((s) => s.openMrDog);
  const phase = useAppStore((s) => s.phase);
  const isTransitioning = useAppStore((s) => s.isTransitioning);
  const world = useAppStore((s) => s.world);
  const outfit = worldToOutfit(world);

  const [avatarState, setAvatarState] = useState<"avatar" | "avatar-wink">("avatar");
  const [showNudge, setShowNudge] = useState(false);
  const [footerOffset, setFooterOffset] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const launcherRef = useRef<HTMLButtonElement>(null);

  // Winking timer every ~20 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setAvatarState("avatar-wink");
      setTimeout(() => setAvatarState("avatar"), 300);
    }, 20000);

    return () => clearInterval(interval);
  }, []);

  // One nudge per session after 20s on /the-red-room or /diwali
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (pathname === "/" || pathname === "/events") return;

    const alreadyNudged = sessionStorage.getItem("mrdog_nudged");
    if (alreadyNudged) return;

    const timer = setTimeout(() => {
      setShowNudge(true);
      sessionStorage.setItem("mrdog_nudged", "1");

      // Auto dismiss after 6s
      setTimeout(() => {
        setShowNudge(false);
      }, 6000);
    }, 20000);

    return () => clearTimeout(timer);
  }, [pathname]);

  // Footer collision avoidance: track footer visibility
  useEffect(() => {
    if (typeof window === "undefined") return;

    const footer = document.querySelector("footer");
    if (!footer) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          const rect = entry.boundingClientRect;
          const overlap = Math.max(0, window.innerHeight - rect.top);
          setFooterOffset(overlap);
        } else {
          setFooterOffset(0);
        }
      },
      { threshold: [0, 0.1, 0.2, 0.5, 1] }
    );

    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  const handlePointerEnter = useCallback(() => {
    setIsHovered(true);
    // Preload model on hover/focus
    if (typeof window !== "undefined") {
      void import("@react-three/drei").then(({ useGLTF }) => {
        useGLTF.preload("/models/mr-dog.glb");
      });
    }
  }, []);

  const handlePointerLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  // Hide while loader is active, during route transitions, or if panel is already open
  if (phase !== "complete" || isTransitioning || isOpen) {
    return null;
  }

  const accentColor =
    world === "redroom"
      ? "#FF1A35"
      : world === "diwali"
        ? "#E5B25D"
        : "#EA28C1";

  const avatarSrc = `/media/mr-dog/${outfit}/${avatarState}.webp`;

  return (
    <div
      className="fixed bottom-6 right-6 z-40 hidden md:flex flex-col items-end transition-transform duration-200"
      style={{
        transform: footerOffset > 0 ? `translateY(-${footerOffset + 8}px)` : "none",
      }}
    >
      {/* Nudge Bubble */}
      {showNudge && (
        <div
          role="status"
          aria-live="polite"
          className="mb-3 mr-2 px-3.5 py-2 rounded-2xl bg-[#090A0E]/95 border border-white/10 text-white font-manrope text-[12px] shadow-[0_8px_24px_rgba(0,0,0,0.6)] backdrop-blur-xl flex items-center gap-2 animate-fadeIn"
        >
          <span>Got questions? I'm right here.</span>
          <button
            type="button"
            onClick={() => setShowNudge(false)}
            aria-label="Dismiss message"
            className="text-white/40 hover:text-white p-0.5"
          >
            ×
          </button>
        </div>
      )}

      {/* Launcher Pill */}
      <button
        ref={launcherRef}
        type="button"
        onClick={openMrDog}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onFocus={handlePointerEnter}
        onBlur={handlePointerLeave}
        aria-label="Ask Mr. Dog, AI concierge"
        className="group relative flex items-center gap-3.5 pl-2 pr-5 py-2 rounded-full bg-[#090A0E]/88 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.55)] transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
        style={{
          boxShadow: `0 8px 32px rgba(0,0,0,0.55), 0 0 20px ${accentColor}25`,
        }}
      >
        {/* Glow rim */}
        <div
          className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            border: `1.5px solid ${accentColor}60`,
          }}
        />

        {/* 56px Avatar Disc */}
        <div
          className="relative w-14 h-14 rounded-full overflow-hidden bg-[#10171F] flex items-center justify-center shrink-0 border border-white/10 transition-transform duration-300"
          style={{
            transform: isHovered ? "rotate(8deg) scale(1.05)" : "rotate(0deg) scale(1)",
          }}
        >
          <Image
            src={avatarSrc}
            alt="Mr. Dog"
            width={56}
            height={56}
            className="w-full h-full object-cover select-none"
            priority
          />
        </div>

        {/* Pill Label */}
        <div className="flex flex-col items-start select-none">
          <span className="font-manrope text-[12px] font-bold uppercase tracking-[0.08em] text-white/90 group-hover:text-white transition-colors">
            Ask Mr. Dog
          </span>
          <span className="font-mono text-[9px] uppercase tracking-wider text-white/50">
            AI Concierge
          </span>
        </div>
      </button>
    </div>
  );
}
