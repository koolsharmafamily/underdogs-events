"use client";
import { lazy, Suspense, useEffect, useRef } from "react";
import { useStore } from "@/state/store";
import { Badge } from "./badge/Badge";
import { Precompile } from "./Precompile";
import { preloadWorldAssets } from "./preload";
import { StudioEnvironment } from "./StudioEnvironment";
import { ForegroundHaze } from "./ForegroundHaze";
import { releaseWorldResources } from "./worldResources";
const HomeStage = lazy(() =>
  import("./home/HomeStage").then((m) => ({ default: m.HomeStage })),
);
const RedRoomSet = lazy(() =>
  import("./redroom/RedRoomSet").then((m) => ({ default: m.RedRoomSet })),
);
const DiwaliSet = lazy(() =>
  import("./diwali/DiwaliSet").then((m) => ({ default: m.DiwaliSet })),
);

export function WorldDirector() {
  const world = useStore((s) => s.world);
  const previousWorld = useStore((s) => s.previousWorld);
  const transitioning = useStore((s) => s.isTransitioning);
  useEffect(() => {
    preloadWorldAssets(world);
  }, [world]);
  const outgoing = useRef(previousWorld);
  useEffect(() => {
    if (previousWorld) outgoing.current = previousWorld;
    if (!transitioning && outgoing.current && outgoing.current !== world) {
      releaseWorldResources(outgoing.current);
      outgoing.current = null;
    }
  }, [transitioning, previousWorld, world]);
  return (
    <group name="WorldDirector">
      <StudioEnvironment />
      <ForegroundHaze />
      <fogExp2
        attach="fog"
        args={
          world === "redroom"
            ? ["#090305", 0.065]
            : world === "diwali"
              ? ["#24101F", 0.065]
              : ["#0B0E14", 0.06]
        }
      />
      <Suspense fallback={null}>
        <Badge position={world === "diwali" ? [0, 1.9, 0] : [0, 1.5, 0]} />
      </Suspense>
      <group name="HomeStageGroup" visible={world === "home"}>
        {world === "home" || (transitioning && previousWorld === "home") ? (
          <Suspense fallback={null}>
            <HomeStage />
          </Suspense>
        ) : null}
      </group>
      <group name="RedRoomSetGroup" visible={world === "redroom"}>
        {world === "redroom" ||
        (transitioning && previousWorld === "redroom") ? (
          <Suspense fallback={null}>
            <RedRoomSet />
          </Suspense>
        ) : null}
      </group>
      <group name="DiwaliSetGroup" visible={world === "diwali"}>
        {world === "diwali" || (transitioning && previousWorld === "diwali") ? (
          <Suspense fallback={null}>
            <DiwaliSet />
          </Suspense>
        ) : null}
      </group>
      <Precompile />
    </group>
  );
}
