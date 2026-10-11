'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/state/store';
import { TransitionLink } from '@/ui/TransitionLink';
import { preloadWorldAssets } from '@/webgl/preload';
import { domTwinRefs } from './DoorProjector';

/**
 * DOM Twins for H5 Doors per BRIEF.md Part 7 H5:
 * - Real <a href> overlays positioned every frame over the 3D doors' projected bounds.
 * - aria-label="Enter World One: The Red Room, Halloween, Saturday 24 October 2026" / Diwali equivalent.
 * - On hover or focus:
 *   - Active door opens 10° (spring.door), light spill grows x2.5
 *   - Other door dims 40%
 *   - Target route preloads via router.prefetch() and preloadWorldAssets()
 *   - Cursor changes to world cursor
 *   - Protagonist badge looks at door
 * - Keyboard operability: Tab focus, Enter trigger.
 */
export function DomTwins() {
  const router = useRouter();
  const setHoverDoor = useStore((s) => s.setHoverDoor);

  const handleEnterRed = () => {
    setHoverDoor('redroom');
    router.prefetch('/the-red-room');
    preloadWorldAssets('redroom');
  };

  const handleEnterDiwali = () => {
    setHoverDoor('diwali');
    router.prefetch('/diwali');
    preloadWorldAssets('diwali');
  };

  const handleLeave = () => {
    setHoverDoor(null);
  };

  return (
    <div
      aria-label="Interactive 3D World Doors"
      className="fixed inset-0 pointer-events-none z-20 overflow-hidden"
    >
      {/* DOM Twin 1: The Red Room */}
      <TransitionLink
        ref={(el) => {
          domTwinRefs.red = el;
        }}
        href="/the-red-room"
        transitionType="T1"
        origin="door"
        aria-label="Enter World One: The Red Room, Halloween, Saturday 24 October 2026"
        onMouseEnter={handleEnterRed}
        onMouseLeave={handleLeave}
        onFocus={handleEnterRed}
        onBlur={handleLeave}
        className="fixed top-0 left-0 block opacity-0 pointer-events-none cursor-pointer rounded-t-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--paper)] focus-visible:outline-offset-4 focus-visible:opacity-100 focus-visible:bg-[#FF2A1F]/10 transition-colors duration-300"
      >
        <span className="sr-only">Enter World One: The Red Room</span>
      </TransitionLink>

      {/* DOM Twin 2: Diwali */}
      <TransitionLink
        ref={(el) => {
          domTwinRefs.diwali = el;
        }}
        href="/diwali"
        transitionType="T2"
        origin="door"
        aria-label="Enter World Two: Diwali, Saturday 7 November 2026"
        onMouseEnter={handleEnterDiwali}
        onMouseLeave={handleLeave}
        onFocus={handleEnterDiwali}
        onBlur={handleLeave}
        className="fixed top-0 left-0 block opacity-0 pointer-events-none cursor-pointer rounded-t-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--paper)] focus-visible:outline-offset-4 focus-visible:opacity-100 focus-visible:bg-[#F2D38B]/10 transition-colors duration-300"
      >
        <span className="sr-only">Enter World Two: Diwali</span>
      </TransitionLink>
    </div>
  );
}
