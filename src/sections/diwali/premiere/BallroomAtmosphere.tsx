"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { useStore } from "@/state/store";

interface BallroomAtmosphereProps {
  parallaxY?: number;
}

export function BallroomAtmosphere({ parallaxY = 0 }: BallroomAtmosphereProps) {
  const motionEnabled = useStore((s) => s.motionEnabled);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!motionEnabled) return;

    const handlePointerMove = (e: PointerEvent) => {
      if (!containerRef.current) return;
      const xRatio = (e.clientX / window.innerWidth - 0.5) * 16;
      const yRatio = (e.clientY / window.innerHeight - 0.5) * 12;
      containerRef.current.style.transform = `translate3d(${xRatio}px, ${yRatio + parallaxY}px, 0) scale(1.04)`;
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, [motionEnabled, parallaxY]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none"
    >
      {/* Moving Atmosphere Container */}
      <div
        ref={containerRef}
        className="absolute -inset-[5%] w-[110%] h-[110%] transition-transform duration-500 ease-out"
        style={{
          transform: `translate3d(0, ${parallaxY}px, 0) scale(1.04)`,
        }}
      >
        <Image
          src="/media/dhamaaka-ballroom-plate.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-40 brightness-[0.42] contrast-[1.12]"
        />
      </div>

      {/* Deep Grand Palace Ballroom Vignette & Crimson Velvet Tint */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(10,6,6,0.65)_60%,#0A0606_92%)]" />

      {/* Warm Ambient Stage Lighting Floor Leak */}
      <div className="absolute bottom-0 inset-x-0 h-[45%] bg-gradient-to-t from-[#0A0606] via-[#2A0408]/30 to-transparent" />
      <div className="absolute top-0 inset-x-0 h-[30%] bg-gradient-to-b from-[#0A0606] via-[#0A0606]/75 to-transparent" />
    </div>
  );
}
