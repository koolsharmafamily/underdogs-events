"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { HomeHeroStill } from "./HomeHeroStill";
import { MrDogLauncher } from "@/features/mrdog/MrDogLauncher";
import { useMrDogStore } from "@/features/mrdog/store";
import { useStore, isSceneRoute } from "@/state/store";
import { pathToWorld, loadTransitionRuntime } from "@/motion/transitions";
import { afterPaint } from "@/motion/afterPaint";
const Experience = dynamic(() => import("@/webgl/Experience").then(m => m.Experience), { ssr:false });
const MotionRuntime = dynamic(() => import("./MotionRuntime").then(m => m.MotionRuntime), { ssr:false });
const MrDogPanel = dynamic(() => import("@/features/mrdog/MrDogPanel").then(m => m.MrDogPanel), { ssr:false });
export function Providers({children}: {children: React.ReactNode}) {
  const [enhance,setEnhance] = useState(false);
  const dogOpen = useMrDogStore(s => s.isOpen);
  const pathname = usePathname();
  useEffect(() => { const s=useStore.getState(); s.setWorld(pathToWorld(pathname)); s.setSceneRoute(isSceneRoute(pathname)); }, [pathname]);
  useEffect(() => afterPaint(async () => { await loadTransitionRuntime(); setEnhance(true); setTimeout(() => { if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {}); }, 2500); }), []);
  return <><HomeHeroStill />{children}<MrDogLauncher />{enhance && <><MotionRuntime /><Experience /></>}{dogOpen && <MrDogPanel />}</>;
}
