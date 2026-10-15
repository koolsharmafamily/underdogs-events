"use client";

import React, { useEffect, useRef } from "react";
import { useStore } from "@/state/store";

interface DhamaakaParticlesCanvasProps {
  activeStoryLine?: number;
}

interface BokehOrb {
  x: number;
  y: number;
  radius: number;
  color: string;
  vx: number;
  vy: number;
  baseAlpha: number;
  pulseSpeed: number;
  phase: number;
}

interface DustParticle {
  x: number;
  y: number;
  size: number;
  alpha: number;
  baseAlpha: number;
  twinkleSpeed: number;
  phase: number;
  vy: number;
}

interface PaparazziFlash {
  x: number;
  y: number;
  radius: number;
  life: number;
  maxLife: number;
}

interface FireworkParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  decay: number;
  size: number;
}

export function DhamaakaParticlesCanvas({
  activeStoryLine = 0,
}: DhamaakaParticlesCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const motionEnabled = useStore((s) => s.motionEnabled);
  const lastFireworkLineRef = useRef<number>(-1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const isMobile = width < 768;
    const dustCount = isMobile ? 35 : 85;
    const bokehCount = isMobile ? 12 : 24;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Initialise Bokeh Orbs
    const bokehColors = [
      "rgba(255, 227, 163, ", // Champagne Gold
      "rgba(242, 92, 154, ",  // Rose
      "rgba(224, 33, 122, ",  // Rani Pink
      "rgba(229, 178, 93, ",  // Gold
    ];

    const bokehOrbs: BokehOrb[] = [];
    for (let i = 0; i < bokehCount; i++) {
      bokehOrbs.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: isMobile ? 12 + Math.random() * 22 : 18 + Math.random() * 38,
        color: bokehColors[i % bokehColors.length],
        vx: (Math.random() - 0.5) * 0.25,
        vy: -0.15 - Math.random() * 0.35,
        baseAlpha: 0.12 + Math.random() * 0.18,
        pulseSpeed: 0.008 + Math.random() * 0.015,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // Initialise Gold Dust Shimmer
    const dustParticles: DustParticle[] = [];
    for (let i = 0; i < dustCount; i++) {
      dustParticles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 1 + Math.random() * 1.5,
        alpha: Math.random(),
        baseAlpha: 0.25 + Math.random() * 0.55,
        twinkleSpeed: 0.02 + Math.random() * 0.04,
        phase: Math.random() * Math.PI * 2,
        vy: -0.1 - Math.random() * 0.2,
      });
    }

    // Paparazzi Camera Flashes (Tiny, WCAG safe, max 1 every 2.5s)
    const flashes: PaparazziFlash[] = [];
    let nextFlashTime = Date.now() + 2000;

    // Fireworks Particles
    const fireworkParticles: FireworkParticle[] = [];

    const spawnFirework = (targetX: number, targetY: number, colorScheme: "gold" | "rani") => {
      const colors =
        colorScheme === "gold"
          ? ["#FFF1C9", "#FFE3A3", "#E5B25D", "#C69442"]
          : ["#FFFFFF", "#F25C9A", "#E0217A", "#8B0F22"];

      const count = isMobile ? 32 : 55;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.2 + Math.random() * 3.8;
        fireworkParticles.push({
          x: targetX,
          y: targetY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1,
          decay: 0.012 + Math.random() * 0.018,
          size: 1.5 + Math.random() * 2,
        });
      }
    };

    let lastTime = performance.now();

    const render = (now: number) => {
      animId = requestAnimationFrame(render);
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      ctx.clearRect(0, 0, width, height);

      // Check if story line changed to trigger firework
      if (
        motionEnabled &&
        activeStoryLine > 0 &&
        activeStoryLine !== lastFireworkLineRef.current
      ) {
        lastFireworkLineRef.current = activeStoryLine;
        const fx = width * (0.25 + (activeStoryLine % 3) * 0.25);
        const fy = height * 0.25;
        spawnFirework(fx, fy, activeStoryLine % 2 === 0 ? "gold" : "rani");
      }

      // 1. Draw Bokeh Orbs
      ctx.save();
      for (let i = 0; i < bokehOrbs.length; i++) {
        const orb = bokehOrbs[i];
        if (motionEnabled) {
          orb.phase += orb.pulseSpeed;
          orb.x += orb.vx;
          orb.y += orb.vy;
          if (orb.y < -orb.radius * 2) orb.y = height + orb.radius;
          if (orb.x < -orb.radius * 2) orb.x = width + orb.radius;
          if (orb.x > width + orb.radius * 2) orb.x = -orb.radius;
        }

        const alpha =
          orb.baseAlpha * (0.7 + 0.3 * Math.sin(orb.phase));
        ctx.fillStyle = `${orb.color}${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // 2. Draw Gold Dust Shimmer
      ctx.save();
      for (let i = 0; i < dustParticles.length; i++) {
        const p = dustParticles[i];
        if (motionEnabled) {
          p.phase += p.twinkleSpeed;
          p.y += p.vy;
          if (p.y < 0) p.y = height;
        }

        const alpha = p.baseAlpha * (0.5 + 0.5 * Math.sin(p.phase));
        ctx.fillStyle = `rgba(255, 241, 201, ${Math.max(0, alpha).toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // 3. Draw Paparazzi Flashes (tiny localized flash in background crowd, max 1 every 2.5s)
      if (motionEnabled) {
        const currentMs = Date.now();
        if (currentMs > nextFlashTime && flashes.length < 2) {
          flashes.push({
            x: width * 0.15 + Math.random() * (width * 0.7),
            y: height * 0.55 + Math.random() * (height * 0.35),
            radius: 8 + Math.random() * 14,
            life: 0,
            maxLife: 14, // frames (~230ms)
          });
          nextFlashTime = currentMs + 2400 + Math.random() * 1800;
        }

        for (let i = flashes.length - 1; i >= 0; i--) {
          const f = flashes[i];
          f.life++;
          const progress = f.life / f.maxLife;
          const alpha = (1 - progress) * 0.75;

          // Tiny radial burst
          const grad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.radius);
          grad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
          grad.addColorStop(0.35, `rgba(255, 241, 201, ${alpha * 0.6})`);
          grad.addColorStop(1, "rgba(255, 241, 201, 0)");

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
          ctx.fill();

          if (f.life >= f.maxLife) {
            flashes.splice(i, 1);
          }
        }
      }

      // 4. Draw Fireworks
      if (fireworkParticles.length > 0) {
        ctx.save();
        for (let i = fireworkParticles.length - 1; i >= 0; i--) {
          const p = fireworkParticles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.04; // gravity
          p.vx *= 0.98;
          p.alpha -= p.decay;

          if (p.alpha <= 0) {
            fireworkParticles.splice(i, 1);
            continue;
          }

          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, [motionEnabled, activeStoryLine]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[4] select-none"
    />
  );
}
