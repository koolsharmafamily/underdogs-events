"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  useMrDogStore,
  getChipsForWorld,
  worldToOutfit,
  ChatMessage,
} from "./store";
import { useStore as useAppStore } from "@/state/store";

export function MrDogChat() {
  const world = useAppStore((s) => s.world);
  const outfit = worldToOutfit(world);

  const messages = useMrDogStore((s) => s.messages);
  const streamingText = useMrDogStore((s) => s.streamingText);
  const isStreaming = useMrDogStore((s) => s.isStreaming);
  const sendMessage = useMrDogStore((s) => s.sendMessage);
  const stopStreaming = useMrDogStore((s) => s.stopStreaming);
  const setExpression = useMrDogStore((s) => s.setExpression);

  const [inputVal, setInputVal] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const chips = getChipsForWorld(world);

  // Auto-scroll to bottom on message updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText]);

  // Handle typing listener for "listening" expression
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (val.length <= 300) {
      setInputVal(val);
      setExpression("listening");
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

  const handleChipClick = (chip: string) => {
    if (isStreaming) return;
    sendMessage(chip);
  };

  const avatarUrl = `/media/mr-dog/${outfit}/avatar.webp`;

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
                {msg.content}
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
              {streamingText || (
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

      {/* Quick-Reply Chips */}
      <div className="px-4 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0 border-t border-white/5">
        {chips.map((chip) => (
          <button
            key={chip}
            type="button"
            disabled={isStreaming}
            onClick={() => handleChipClick(chip)}
            className="shrink-0 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 active:scale-95 text-[12px] font-medium text-white/80 border border-white/10 transition-all disabled:opacity-50"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Composer Section */}
      <div className="p-3 bg-[#0A0D12] border-t border-white/10 shrink-0">
        <div className="relative flex items-end gap-2 bg-white/5 rounded-2xl p-2 border border-white/10 focus-within:border-white/25 transition-colors">
          <textarea
            value={inputVal}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask Mr. Dog…"
            rows={1}
            maxLength={300}
            className="flex-1 max-h-24 bg-transparent text-[14px] text-white placeholder-white/40 resize-none outline-none px-2 py-1 leading-snug"
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

        {/* Counter & Privacy Footer */}
        <div className="flex items-center justify-between px-2 pt-2 text-[11px] text-white/45 select-none">
          <span>Mr. Dog is an AI. He answers from official Underdogs info and chats aren't stored.</span>
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
