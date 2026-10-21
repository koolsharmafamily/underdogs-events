"use client";

import { assetUrl } from "@/utils/assetUrl";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  useMrDogStore,
  worldToOutfit,
  ChatMessage,
} from "./store";
import { getChipsForWorld } from "./chips";
import { useStore as useAppStore } from "@/state/store";

function formatChatMessage(text: string, accentColor: string) {
  const regex = /(https?:\/\/[^\s]+|@underdogs_nagpur|\+91[\s\u00A0]?\d{5}[\s\u00A0]?\d{5}|\+91[\s\u00A0]?\d{10})/g;
  const parts: (string | React.ReactNode)[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith("http") || token === "@underdogs_nagpur") {
      const url = token.startsWith("http") ? token : "https://instagram.com/underdogs_nagpur";
      parts.push(
        <a
          key={match.index}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold underline decoration-1 hover:text-white transition-colors cursor-pointer inline-flex items-center gap-0.5"
          style={{ color: accentColor }}
        >
          {token}
        </a>
      );
    } else if (token.startsWith("+91")) {
      const cleanTel = token.replace(/[\s\u00A0]/g, "");
      parts.push(
        <a
          key={match.index}
          href={`tel:${cleanTel}`}
          className="font-mono font-semibold underline decoration-emerald-500/60 text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
        >
          {token}
        </a>
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

export function MrDogChat({
  keyboardOpen,
  isDedicatedPage = false,
}: {
  keyboardOpen?: boolean;
  isDedicatedPage?: boolean;
} = {}) {
  const world = useAppStore((s) => s.world);
  const outfit = worldToOutfit(world);

  const messages = useMrDogStore((s) => s.messages);
  const streamingText = useMrDogStore((s) => s.streamingText);
  const isStreaming = useMrDogStore((s) => s.isStreaming);
  const sendMessage = useMrDogStore((s) => s.sendMessage);
  const stopStreaming = useMrDogStore((s) => s.stopStreaming);
  const setExpression = useMrDogStore((s) => s.setExpression);

  const [inputVal, setInputVal] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const activeFollowUps = useMrDogStore((s) => s.activeFollowUps);
  const chips = getChipsForWorld(world, activeFollowUps);

  // Auto-scroll to bottom on message updates or keyboard resize
  useEffect(() => {
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 40);
    return () => clearTimeout(timer);
  }, [messages, streamingText, keyboardOpen]);

  // Handle typing listener for "listening" expression
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (val.length <= 300) {
      setInputVal(val);
      if (useMrDogStore.getState().expression !== "listening") {
        setExpression("listening");
      }
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => {
        setExpression("idle");
      }, 1200);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    const text = inputVal.trim();
    if (!text || isStreaming) return;
    setInputVal("");
    sendMessage(text);
  };

  const handleChipClick = (question: string) => {
    if (isStreaming) return;
    sendMessage(question);
  };

  const avatarUrl =
    outfit === "home"
      ? assetUrl("/media/mr-dog/party-coin-disc.webp")
      : assetUrl(`/media/mr-dog/${outfit}/avatar.webp`);

  const accentColor =
    world === "redroom"
      ? "#FF1A35"
      : world === "diwali"
        ? "#E5B25D"
        : "#EA28C1";

  return (
    <div className="flex flex-col h-full select-text">
      {/* Live region for accessibility */}
      <div className="sr-only" aria-live="polite">
        {messages[messages.length - 1]?.role === "assistant"
          ? messages[messages.length - 1].content
          : ""}
      </div>

      {/* Message List */}
      <div
        data-lenis-prevent
        onClick={() => textareaRef.current?.blur()}
        className="flex-1 overflow-y-auto px-4 py-3 space-y-3.5 scroll-smooth overscroll-contain"
        tabIndex={0}
        role="log"
        aria-label="Conversation with Mr. Dog"
      >
        {messages.map((msg: ChatMessage) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${
                isUser ? "justify-end" : "justify-start"
              }`}
            >
              {!isUser && (
                <div className="relative w-6 h-6 shrink-0 mt-0.5 rounded-full overflow-hidden bg-black/40 border border-white/10">
                  <Image
                    src={avatarUrl}
                    alt="Mr. Dog"
                    width={24}
                    height={24}
                    unoptimized
                    className="object-cover"
                  />
                </div>
              )}
              <div
                className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-[14px] sm:text-[15px] leading-[1.45] tracking-wide whitespace-pre-wrap break-words ${
                  isUser
                    ? "bg-white/15 text-white rounded-br-sm border border-white/10"
                    : "bg-[#11161F] text-[#FCF9FC] rounded-bl-sm border border-white/5"
                }`}
                style={
                  isUser
                    ? { backgroundColor: `${accentColor}25`, borderColor: `${accentColor}40` }
                    : {}
                }
              >
                {isUser ? msg.content : formatChatMessage(msg.content, accentColor)}
              </div>
            </div>
          );
        })}

        {/* Streaming message bubble */}
        {isStreaming && (
          <div className="flex items-start gap-2.5 justify-start">
            <div className="relative w-6 h-6 shrink-0 mt-0.5 rounded-full overflow-hidden bg-black/40 border border-white/10">
              <Image
                src={avatarUrl}
                alt="Mr. Dog"
                width={24}
                height={24}
                unoptimized
                className="object-cover"
              />
            </div>
            <div className="max-w-[82%] px-3.5 py-2.5 rounded-2xl rounded-bl-sm bg-[#11161F] text-[#FCF9FC] border border-white/5 text-[14px] sm:text-[15px] leading-[1.45] whitespace-pre-wrap break-words">
              {streamingText ? (
                formatChatMessage(streamingText, accentColor)
              ) : (
                <span className="inline-flex items-center gap-1 py-1">
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-bounce"
                    style={{ backgroundColor: accentColor, animationDelay: "0ms" }}
                  />
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-bounce"
                    style={{ backgroundColor: accentColor, animationDelay: "150ms" }}
                  />
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-bounce"
                    style={{ backgroundColor: accentColor, animationDelay: "300ms" }}
                  />
                </span>
              )}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick-Reply Chips Row */}
      <div className="px-4 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0 border-t border-white/5">
        <span className="text-[10px] uppercase tracking-wider text-white/40 font-mono shrink-0 pr-1">
          {messages.length <= 1 ? "Questions:" : "Next:"}
        </span>
        {chips.map((chip) => (
          <button
            key={chip.id}
            type="button"
            disabled={isStreaming}
            onClick={() => handleChipClick(chip.userQuestion)}
            className="shrink-0 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 active:scale-95 text-[12px] font-medium text-white/90 border border-white/10 hover:border-white/20 transition-all disabled:opacity-50"
            style={{
              borderColor: `${accentColor}30`,
            }}
          >
            {chip.chipLabel}
          </button>
        ))}
      </div>

      {/* Composer Section */}
      <div
        className={`p-3 bg-[#0A0D12] border-t border-white/10 shrink-0 ${
          keyboardOpen
            ? "pb-2.5"
            : isDedicatedPage
              ? "pb-[calc(76px+max(env(safe-area-inset-bottom,0px),8px))] md:pb-3"
              : "pb-[max(env(safe-area-inset-bottom,0px),12px)] md:pb-3"
        }`}
      >
        <div className="relative flex items-end gap-2 bg-white/5 rounded-2xl p-2 border border-white/10 focus-within:border-white/25 transition-colors">
          <textarea
            ref={textareaRef}
            value={inputVal}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask Mr. Dog a question…"
            rows={1}
            maxLength={300}
            style={{ fontSize: "16px" }}
            className="flex-1 max-h-24 bg-transparent text-[16px] text-white placeholder-white/40 resize-none outline-none px-2 py-1 leading-snug tracking-normal"
          />

          {isStreaming ? (
            <button
              type="button"
              onClick={stopStreaming}
              aria-label="Stop reply"
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[12px] font-semibold text-white/80 transition-colors"
            >
              Stop
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSend}
              disabled={!inputVal.trim()}
              aria-label="Send message"
              className="p-2 rounded-xl text-white disabled:opacity-30 disabled:pointer-events-none transition-transform active:scale-90"
              style={{ backgroundColor: accentColor }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          )}
        </div>

        {/* Counter & Footer */}
        <div className="flex items-center justify-between px-2 pt-2 text-[11px] text-white/45 select-none">
          <span>Mr. Dog · Underdogs Concierge. Official facts & answers.</span>
          {inputVal.length >= 260 && (
            <span className={inputVal.length >= 295 ? "text-red-400 font-bold" : ""}>
              {inputVal.length}/300
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
