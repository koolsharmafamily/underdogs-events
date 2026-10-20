"use client";
import {useEffect,type RefObject} from "react";
import {afterPaint} from "./afterPaint";
export function useSceneProgress(id:string,ref:RefObject<HTMLElement|null>) { useEffect(() => afterPaint(async () => { if(!ref.current)return; const {installSceneProgress}=await import("./sceneProgressEffect"); return installSceneProgress(ref.current,id); }),[id,ref]); }
