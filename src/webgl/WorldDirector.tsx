'use client';

import React, { Suspense } from 'react';
import { useStore } from '@/state/store';
import { BadgePlaceholder } from './badge/BadgePlaceholder';
import { HomeStage } from './home/HomeStage';
import { RedRoomSet } from './redroom/RedRoomSet';
import { DiwaliSet } from './diwali/DiwaliSet';

export function WorldDirector() {
  const world = useStore((s) => s.world);

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
      <BadgePlaceholder
        skin={world === 'home' ? 'enamel' : world === 'redroom' ? 'neon' : 'jewelled'}
        position={world === 'diwali' ? [0, 1.9, 0] : [0, 1.5, 0]}
      />

      {/* World sets rendered in Suspense per Part 13.3 */}
      <Suspense fallback={null}>
        {world === 'home' && <HomeStage />}
        {world === 'redroom' && <RedRoomSet />}
        {world === 'diwali' && <DiwaliSet />}
      </Suspense>
    </group>
  );
}
