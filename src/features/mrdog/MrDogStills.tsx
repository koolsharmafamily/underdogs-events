"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useMrDogStore, MrDogExpression, worldToOutfit } from "./store";
import { useStore as useAppStore } from "@/state/store";

interface MrDogStillsProps {
  size?: number;
  className?: string;
  isAvatarOnly?: boolean;
}

export function MrDogStills({
  size = 280,
  className = "",
  isAvatarOnly = false,
}: MrDogStillsProps) {
  const world = useAppStore((s) => s.world);
  const motion = useAppStore((s) => s.motionEnabled);
  const outfit = worldToOutfit(world);
  const expression = useMrDogStore((s) => s.expression);

  const [activeStill, setActiveStill] = useState<string>("idle");
  const [blinking, setBlinking] = useState(false);
  const blinkTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Periodic natural blinking in idle
  useEffect(() => {
    if (!motion || expression !== "idle") {
      setBlinking(false);
      return;
    }

    const scheduleNextBlink = () => {
      const delay = Math.random() * 3000 + 3000; // 3 to 6 seconds
      blinkTimerRef.current = setTimeout(() => {
        setBlinking(true);
        setTimeout(() => {
          setBlinking(false);
          scheduleNextBlink();
        }, 120);
      }, delay);
    };

    scheduleNextBlink();

    return () => {
      if (blinkTimerRef.current) clearTimeout(blinkTimerRef.current);
    };
  }, [expression, motion]);

  // Determine current still file name
  let effectiveName = expression;
  if (isAvatarOnly) {
    if (expression === "rage") effectiveName = "avatar-x" as MrDogExpression;
    else if (expression === "wink") effectiveName = "avatar-wink" as MrDogExpression;
    else if (blinking) effectiveName = "avatar-blink" as MrDogExpression;
    else effectiveName = "avatar" as MrDogExpression;
  } else {
    if (blinking && expression === "idle") {
      effectiveName = "wink" as MrDogExpression; // soft blink expression
    }
  }

  // Update still
  useEffect(() => {
    setActiveStill(effectiveName);
  }, [effectiveName]);

  const stillPath = `/media/mr-dog/${outfit}/${activeStill}.webp`;

  return (
    <div
      className={`relative select-none flex items-center justify-center overflow-hidden ${className}`}
      style={{
        width: size,
        height: size,
      }}
    >
      <div
        className={`relative w-full h-full transition-transform duration-500 ease-out ${
          motion && expression === "idle" && !isAvatarOnly ? "animate-[bounce_4s_infinite_ease-in-out]" : ""
        }`}
      >
        <Image
          src={stillPath}
          alt={`Mr. Dog (${outfit} - ${activeStill})`}
          fill
          priority
          sizes={`${size}px`}
          className="object-contain drop-shadow-md transition-opacity duration-200"
        />
      </div>
    </div>
  );
}
