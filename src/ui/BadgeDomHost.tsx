"use client";

import { assetUrl } from "@/utils/assetUrl";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useStore } from "@/state/store";
import type { WorldId } from "@/theme/tokens";
import { UnderdogsBadgeSvg } from "./UnderdogsBadgeSvg";
import { coinSpin } from "@/webgl/badge/coinPhysics";
import { badgeScreenBounds } from "@/webgl/badge/screenBounds";

interface BadgeDomHostProps {
  skin: WorldId;
  sizeClass?: string;
  label?: string;
  showSvgPreview?: boolean;
  className?: string;
}

export function BadgeDomHost({
  skin,
  sizeClass = "w-[240px] h-[240px] sm:w-[340px] sm:h-[340px] lg:w-[420px] lg:h-[420px]",
  label = "Underdogs emblem — click or swipe to spin",
  showSvgPreview,
  className = "",
}: BadgeDomHostProps) {
  const motionEnabled = useStore((s) => s.motionEnabled);
  const hoverDoor = useStore((s) => s.hoverDoor);
  const blinkTrigger = useStore((s) => s.blinkTrigger);
  const triggerBlink = useStore((s) => s.triggerBlink);
  const tier = useStore((s) => s.tier);
  const isT0 = tier === "T0";
  const isVisible = Boolean(showSvgPreview) || isT0;
  // During a transition the 3D badge is travelling through the cover; a still
  // here would be a second badge in the wrong place.
  const transitioning = useStore((s) => s.isTransitioning);

  const [blinkL, setBlinkL] = useState(false);
  const [blinkR, setBlinkR] = useState(false);
  const [tongueAngle, setTongueAngle] = useState(0);
  const [badge3DReady, setBadge3DReady] = useState(false);
  const blinkCountRef = useRef(0);

  useEffect(() => {
    const target = skin === "diwali" ? "jewelled" : skin === "redroom" ? "halloween" : "enamel";
    let interval: ReturnType<typeof setInterval> | null = null;
    const check = () => {
      if (useStore.getState().renderedWorlds[skin] && badgeScreenBounds.ready && badgeScreenBounds.readySkin === target) {
        setBadge3DReady(true);
        if (interval !== null) {
          clearInterval(interval);
          interval = null;
        }
        return true;
      }
      return false;
    };
    if (!check()) {
      interval = setInterval(check, 50);
    }
    return () => {
      if (interval !== null) clearInterval(interval);
    };
  }, [skin]);

  // Pointer drag/swipe tracking refs
  const pointerActiveRef = useRef(false);
  const pointerStartRef = useRef({ x: 0, y: 0, time: 0 });
  const pointerLastRef = useRef({ x: 0, y: 0, time: 0 });
  const hasDraggedRef = useRef(false);

  const performBlink = useCallback(() => {
    blinkCountRef.current += 1;
    // One blink in six is a wink (left eye only) — Part 5.2
    const isWink = Boolean(showSvgPreview) || blinkCountRef.current % 6 === 0;
    setBlinkL(true);
    setBlinkR(!isWink);
    window.setTimeout(() => {
      setBlinkL(false);
      setBlinkR(false);
    }, 140);
  }, [showSvgPreview]);

  const performWag = useCallback(() => {
    if (!motionEnabled) return;
    const sequence = [12, -10, 7, -4, 0];
    sequence.forEach((angle, idx) => {
      window.setTimeout(() => {
        setTongueAngle(angle);
      }, idx * 180);
    });
  }, [motionEnabled]);

  useEffect(() => {
    if (blinkTrigger > 0) {
      performBlink();
    }
  }, [blinkTrigger, performBlink]);

  useEffect(() => {
    if (!motionEnabled) return;
    const blinkInterval = window.setInterval(() => {
      performBlink();
    }, 4800);

    const wagInterval = window.setInterval(() => {
      performWag();
    }, 9000);

    return () => {
      window.clearInterval(blinkInterval);
      window.clearInterval(wagInterval);
    };
  }, [motionEnabled, performBlink, performWag]);

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    pointerActiveRef.current = true;
    pointerStartRef.current = { x: e.clientX, y: e.clientY, time: e.timeStamp };
    pointerLastRef.current = { x: e.clientX, y: e.clientY, time: e.timeStamp };
    hasDraggedRef.current = false;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    coinSpin.onPointerDown();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!pointerActiveRef.current) return;
    const deltaX = e.clientX - pointerLastRef.current.x;
    const deltaY = e.clientY - pointerLastRef.current.y;
    const dt = e.timeStamp - pointerLastRef.current.time;

    const totalDist = Math.hypot(
      e.clientX - pointerStartRef.current.x,
      e.clientY - pointerStartRef.current.y
    );
    if (totalDist > 5) {
      hasDraggedRef.current = true;
    }

    coinSpin.onPointerMove(deltaX, deltaY, dt);
    pointerLastRef.current = { x: e.clientX, y: e.clientY, time: e.timeStamp };
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!pointerActiveRef.current) return;
    pointerActiveRef.current = false;

    const dt = Math.max(0.008, (e.timeStamp - pointerLastRef.current.time) / 1000);
    const vx = (e.clientX - pointerLastRef.current.x) / dt;
    const totalDist = Math.hypot(
      e.clientX - pointerStartRef.current.x,
      e.clientY - pointerStartRef.current.y
    );
    const elapsed = e.timeStamp - pointerStartRef.current.time;

    const wasClick = !hasDraggedRef.current || (totalDist < 8 && elapsed < 350);

    if (wasClick) {
      performBlink();
      triggerBlink();
      coinSpin.triggerCoinFlip();
    } else {
      // Swiped through: impart velocity
      const swipeSpeed = vx * 0.016;
      coinSpin.onPointerUp(true, swipeSpeed);
    }

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!pointerActiveRef.current) return;
    pointerActiveRef.current = false;
    coinSpin.onPointerUp(false, 0);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
  };

  const lookRotateY =
    hoverDoor === "redroom" ? -10 : hoverDoor === "diwali" ? 10 : 0;

  return (
    <button
      type="button"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onClick={(e) => {
        if (hasDraggedRef.current) {
          e.preventDefault();
          return;
        }
        performBlink();
        triggerBlink();
        coinSpin.triggerCoinFlip();
      }}
      onMouseEnter={() => {
        performWag();
      }}
      aria-label={label}
      className={`group relative inline-flex items-center justify-center bg-transparent p-2 cursor-grab active:cursor-grabbing select-none touch-none transition-transform duration-500 ${sizeClass} ${className}`}
      style={{
        transform: motionEnabled
          ? `perspective(800px) rotateY(${lookRotateY}deg)`
          : undefined,
      }}
    >
      {/* 2D Fallback Stills when 3D WebGL is compiling or when tier === T0 */}
      {((skin !== "home" && !transitioning) || isVisible) && (
        <div
          className={`absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none transition-opacity duration-300 ${
            badge3DReady && !isVisible ? "opacity-0" : "opacity-100"
          }`}
        >
          {skin === "diwali" ? (
            <img
              src={assetUrl("/media/badge-jewelled-still.webp")}
              alt="Underdogs Jewelled Badge"
              width={512}
              height={512}
              className="w-full h-full object-contain select-none drop-shadow-[0_12px_40px_rgba(224,33,122,0.35)]"
            />
          ) : skin === "redroom" ? (
            <img
              src={assetUrl("/media/badge-halloween-still.webp")}
              alt="Underdogs Halloween badge"
              width={512}
              height={512}
              className="w-full h-full object-contain select-none drop-shadow-[0_12px_40px_rgba(255,0,43,0.35)]"
            />
          ) : !showSvgPreview ? (
            <picture className="w-full h-full flex items-center justify-center">
              <source
                srcSet={assetUrl("/media/badge-enamel-still-512.webp")}
                media="(min-width: 769px)"
              />
              <source
                srcSet={assetUrl("/media/badge-enamel-still-512.webp")}
                media="(max-width: 768px)"
              />
              <img
                src={assetUrl("/media/badge-enamel-still-512.webp")}
                alt="Underdogs Enamel Badge"
                className="w-full h-full object-contain select-none drop-shadow-[0_12px_40px_rgba(173,12,128,0.25)]"
              />
            </picture>
          ) : (
            <UnderdogsBadgeSvg
              skin={skin}
              size="100%"
              blinkingLeft={blinkL}
              blinkingRight={blinkR}
              tongueAngle={tongueAngle}
              className="drop-shadow-[0_0_48px_rgba(255,255,255,0.08)] pointer-events-none"
            />
          )}
        </div>
      )}
    </button>
  );
}
