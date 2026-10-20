"use client";
import {useEffect,type RefObject} from "react";import {useStore} from "@/state/store";import {afterPaint} from "./afterPaint";
export function useLineReveal(ref:RefObject<HTMLElement|null>, options?:{delay?:number;triggerOnMount?:boolean}) {
 const motion=useStore(s=>s.motionEnabled), delay=options?.delay??0, onMount=options?.triggerOnMount??false;
 useEffect(()=>afterPaint(async()=>{if(!ref.current)return; const m=await import("./revealEffects");return m.lineReveal(ref.current,motion,delay,onMount);}),[ref,motion,delay,onMount]);
}
export function useWordBlurReveal(ref:RefObject<HTMLElement|null>,options?:{active?:boolean}) {
 const motion=useStore(s=>s.motionEnabled), active=options?.active??true;
 useEffect(()=>afterPaint(async()=>{if(!ref.current)return;const m=await import("./revealEffects");return m.wordReveal(ref.current,motion,active);}),[ref,motion,active]);
}
