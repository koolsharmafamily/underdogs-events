'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useStore } from '@/state/store';
import type { WorldId } from '@/theme/tokens';
import { Badge } from './badge/Badge';
import { HomeStage } from './home/HomeStage';
import { RedRoomSet } from './redroom/RedRoomSet';
import { DiwaliSet } from './diwali/DiwaliSet';
import { Precompile } from './Precompile';
import { preloadWorldAssets } from './preload';

/**
 * WorldDirector manages world sets and fog.
 * Mounts only the active world during initial load so initial download & parse is ~80% smaller and faster.
 * Each world is isolated in its own <Suspense> boundary and kept mounted once loaded so transitions never dispose geometry.
 */
export function WorldDirector() {
  const world = useStore((s) => s.world);
  const previousWorld = useStore((s) => s.previousWorld);
  const phase = useStore((s) => s.phase);

  const [mountedWorlds, setMountedWorlds] = useState<Record<WorldId, boolean>>(() => ({
    home: world === 'home',
    redroom: world === 'redroom',
    diwali: world === 'diwali',
  }));

  // Ensure active and previous worlds are mounted and preloaded immediately
  useEffect(() => {
    preloadWorldAssets(world);
    setMountedWorlds((prev) => {
      const nextHome = prev.home || world === 'home' || previousWorld === 'home';
      const nextRed = prev.redroom || world === 'redroom' || previousWorld === 'redroom';
      const nextDiwali = prev.diwali || world === 'diwali' || previousWorld === 'diwali';
      if (
        nextHome === prev.home &&
        nextRed === prev.redroom &&
        nextDiwali === prev.diwali
      ) {
        return prev;
      }
      return {
        home: nextHome,
        redroom: nextRed,
        diwali: nextDiwali,
      };
    });
  }, [world, previousWorld]);

  // Stagger-preload and mount remaining worlds quietly in the background AFTER initial coin fade-out finishes
  useEffect(() => {
    if (phase !== 'complete') return;

    const otherWorlds: WorldId[] = (['home', 'redroom', 'diwali'] as const).filter(
      (w) => w !== world
    );

    const t1 = window.setTimeout(() => {
      const w1 = otherWorlds[0];
      if (w1) {
        preloadWorldAssets(w1);
        setMountedWorlds((prev) => (prev[w1] ? prev : { ...prev, [w1]: true }));
      }
    }, 1200);

    const t2 = window.setTimeout(() => {
      const w2 = otherWorlds[1];
      if (w2) {
        preloadWorldAssets(w2);
        setMountedWorlds((prev) => (prev[w2] ? prev : { ...prev, [w2]: true }));
      }
    }, 2600);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [phase, world]);

  return (
    <group name="WorldDirector">
      {/* Fog per Part 5.4 */}
      {world === 'redroom' ? (
        <fogExp2 attach="fog" args={['#1A0202', 0.08]} />
      ) : world === 'diwali' ? (
        <fogExp2 attach="fog" args={['#2A0A1C', 0.045]} />
      ) : (
        <fogExp2 attach="fog" args={['#0B0E14', 0.06]} />
      )}

      {/* Protagonist Badge: persistent across worlds per Part 13.3 */}
      <Suspense fallback={null}>
        <Badge position={world === 'diwali' ? [0, 1.9, 0] : [0, 1.5, 0]} />
      </Suspense>

      {/* Isolated Suspense per world so inactive worlds never block active world rendering */}
      <group name="HomeStageGroup" visible={world === 'home'}>
        {mountedWorlds.home && (
          <Suspense fallback={null}>
            <HomeStage />
          </Suspense>
        )}
      </group>
      <group name="RedRoomSetGroup" visible={world === 'redroom'}>
        {mountedWorlds.redroom && (
          <Suspense fallback={null}>
            <RedRoomSet />
          </Suspense>
        )}
      </group>
      <group name="DiwaliSetGroup" visible={world === 'diwali'}>
        {mountedWorlds.diwali && (
          <Suspense fallback={null}>
            <DiwaliSet />
          </Suspense>
        )}
      </group>

      {/* Frame-accurate readiness & shader warm-up per active world */}
      <Precompile />
    </group>
  );
}
