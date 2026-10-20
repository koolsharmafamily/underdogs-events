"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { site } from "@/content/site";
import { useEnterTransition } from "@/motion/transitions";
import { MrDogChat } from "@/features/mrdog/MrDogChat";
import { useMrDogStore, worldToOutfit, getChipsForWorld, getWorldGreeting } from "@/features/mrdog/store";
import { useStore as useAppStore } from "@/state/store";
import { UnderdogsBadgeSvg } from "@/ui/UnderdogsBadgeSvg";

export function MrDogView() {
  useEnterTransition("home");
  const world = useAppStore((s) => s.world);
  const outfit = worldToOutfit(world);
  const messages = useMrDogStore((s) => s.messages);
  const clearChat = useMrDogStore((s) => s.clearChat);

  const [keyboardOpen, setKeyboardOpen] = useState(false);

  // Initialize conversation greeting if empty
  useEffect(() => {
    if (messages.length === 0) {
      const greeted = useMrDogStore.getState().hasGreetedSession;
      useMrDogStore.setState({
        messages: [
          {
            id: "initial-greeting",
            role: "assistant",
            content: getWorldGreeting(world),
          },
        ],
        expression: greeted ? "idle" : "greet",
      });
    }
  }, [messages.length, world]);

  // Track virtual keyboard on mobile
  useEffect(() => {
    if (typeof window === "undefined" || !window.visualViewport) return;
    const vv = window.visualViewport;
    const handleResize = () => {
      const isKb = window.innerHeight - vv.height > 120;
      setKeyboardOpen(isKb);
    };
    vv.addEventListener("resize", handleResize);
    return () => vv.removeEventListener("resize", handleResize);
  }, []);

  const chips = getChipsForWorld(world);

  return (
    <>
      {/* 1. MOBILE DEDICATED SECTION (< 768px) */}
      <div className="flex md:hidden flex-col h-[100dvh] w-full pt-14 bg-[#07090D] overflow-hidden">
        <MrDogChat keyboardOpen={keyboardOpen} isDedicatedPage />
      </div>

      {/* 2. DESKTOP DEDICATED SECTION (≥ 768px) */}
      <div className="hidden md:flex flex-col w-full min-h-[100dvh] bg-[#07090D] pt-36 pb-16">
        <div className="site-container flex flex-col gap-8 max-w-6xl mx-auto flex-1">
          {/* Editorial Header */}
          <header className="flex flex-col items-center text-center gap-2">
            <div className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--steel)]">
              <span>AI CONCIERGE</span>
              <span className="text-[#EA28C1]" aria-hidden="true">·</span>
              <span>OFFICIAL UNDERDOGS KNOWLEDGE</span>
            </div>
            <h1 className="font-cinzel text-3xl lg:text-4xl font-bold uppercase tracking-[0.18em] text-[var(--paper)]">
              MR. DOG CONCIERGE
            </h1>
            <p className="font-manrope text-[13px] text-white/60 max-w-md">
              Ask anything about our nights, door policy, ticket drops, music curation, or invitations.
            </p>
          </header>

          {/* Main 2-column Container */}
          <div className="grid grid-cols-12 gap-8 items-stretch flex-1 min-h-[640px]">
            {/* Left Column: Mr. Dog Identity & Info */}
            <div className="col-span-4 rounded-2xl bg-[#0A0D12] border border-white/10 p-6 flex flex-col justify-between shadow-2xl">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="relative w-36 h-36 rounded-full bg-[#10171F]/80 border-2 border-[#EA28C1]/50 shadow-[0_0_36px_rgba(234,40,193,0.35)] flex items-center justify-center overflow-visible">
                  <Image
                    src="/media/mr-dog/party-coin.webp"
                    alt="Mr. Dog Party Coin"
                    width={140}
                    height={180}
                    priority
                    unoptimized
                    className="object-contain -translate-y-2 drop-shadow-[0_8px_24px_rgba(0,0,0,0.8)]"
                  />
                </div>
                <div>
                  <h2 className="font-cinzel text-xl font-bold uppercase tracking-wider text-white">
                    Mr. Dog
                  </h2>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.9)] animate-pulse" />
                    <span className="font-mono text-[11px] text-emerald-400 font-semibold uppercase tracking-wider">
                      Live AI Concierge
                    </span>
                  </div>
                </div>

                <p className="font-manrope text-[12px] leading-relaxed text-white/70 text-center px-2">
                  Trained directly on all Underdogs event facts, door policies, DJ lineups, passes, and venue details.
                </p>
              </div>

              {/* Quick Topics */}
              <div className="flex flex-col gap-2 pt-4 border-t border-white/10">
                <span className="font-mono text-[10px] uppercase tracking-wider text-white/40">
                  Recommended Questions:
                </span>
                <div className="flex flex-col gap-1.5">
                  {chips.slice(0, 3).map((chip) => (
                    <button
                      key={chip.id}
                      type="button"
                      onClick={() => useMrDogStore.getState().sendMessage(chip.userQuestion)}
                      className="text-left px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[12px] text-white/85 transition-all text-ellipsis overflow-hidden whitespace-nowrap active:scale-[0.98]"
                    >
                      {chip.chipLabel}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear chat button */}
              <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                <span className="font-mono text-[10px] uppercase tracking-wider text-white/40">
                  Session
                </span>
                <button
                  type="button"
                  onClick={clearChat}
                  className="font-manrope text-[11px] text-white/50 hover:text-white transition-colors underline cursor-pointer"
                >
                  Reset Chat
                </button>
              </div>
            </div>

            {/* Right Column: Interactive Chat Feed */}
            <div className="col-span-8 rounded-2xl bg-[#090C11] border border-white/10 flex flex-col h-[640px] overflow-hidden shadow-2xl">
              <MrDogChat />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
