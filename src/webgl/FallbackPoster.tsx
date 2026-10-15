'use client';

import React from 'react';
import Image from 'next/image';
import { useStore } from '@/state/store';
import { site } from '@/content/site';

interface FallbackPosterProps {
  showAssetNotice?: boolean;
}

/**
 * Part 13.8 Fallbacks and resilience:
 * - T0 (no WebGL 2, or context creation fails): no canvas.
 *   Each page uses a poster still as a fixed background:
 *   Home a badge capture, Red Room the official poster, Diwali the teaser.
 * - Context lost: pause, show the poster and try one restore. On a second loss, drop to T0.
 * - Asset failure: show a quiet mono notice ("Some visuals couldn't load — showing stills.") and that scene's still.
 */
export function FallbackPoster({ showAssetNotice = false }: FallbackPosterProps) {
  const world = useStore((s) => s.world);

  const posterConfig =
    world === 'redroom'
      ? {
          src: site.redRoom.poster.src,
          alt: site.redRoom.poster.alt,
          bg: '#060203',
        }
      : world === 'diwali'
        ? {
            src: site.diwali.poster.src,
            alt: site.diwali.poster.alt,
            bg: '#140812',
          }
        : {
            src: '/media/home-poster.webp',
            alt: 'Underdogs Entertainment Enamel Badge',
            bg: '#07090D',
          };

  return (
    <div
      data-testid="t0-fallback-poster"
      data-world={world}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      style={{ backgroundColor: posterConfig.bg }}
    >
      <div className="relative w-full h-full opacity-55">
        <Image
          src={posterConfig.src}
          alt={posterConfig.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 50% 45%, rgba(7, 9, 13, 0.25) 0%, rgba(7, 9, 13, 0.82) 100%)',
          }}
        />
      </div>

      {showAssetNotice && (
        <div
          role="status"
          data-testid="asset-failure-notice"
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 px-3 py-1.5 bg-[#07090D]/85 border border-white/10 font-mono text-[11px] tracking-[0.06em] text-[var(--fog)] whitespace-nowrap"
        >
          Some visuals couldn&apos;t load — showing stills.
        </div>
      )}
    </div>
  );
}
