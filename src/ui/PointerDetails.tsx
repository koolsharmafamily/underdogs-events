"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { spring } from "@/motion/spring";
import { useStore } from "@/state/store";

export function PointerDetails() {
  const pathname = usePathname(),
    motion = useStore((s) => s.motionEnabled);
  useEffect(() => {
    if (!motion || !matchMedia("(hover:hover) and (pointer:fine)").matches)
      return;
    const elements = [
      ...document.querySelectorAll<HTMLElement>(
        "header a, a[data-door-caption]",
      ),
    ];
    const states = elements.map((el) => ({
      el,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      tx: 0,
      ty: 0,
    }));
    const move = (e: PointerEvent) => {
      for (const state of states) {
        const box = state.el.getBoundingClientRect();
        const x = e.clientX - (box.left + box.width / 2) + state.x;
        const y = e.clientY - (box.top + box.height / 2) + state.y;
        const near =
          Math.abs(x) < box.width / 2 + 72 && Math.abs(y) < box.height / 2 + 72;
        state.tx = near ? Math.max(-18, Math.min(18, x * 0.2)) : 0;
        state.ty = near ? Math.max(-12, Math.min(12, y * 0.2)) : 0;
      }
    };
    const tick = (_: number, delta: number) => {
      const dt = Math.min(delta / 1000, 0.05);
      for (const state of states) {
        [state.x, state.vx] = spring(state.x, state.vx, state.tx, dt);
        [state.y, state.vy] = spring(state.y, state.vy, state.ty, dt);
        state.el.style.translate = `${state.x.toFixed(2)}px ${state.y.toFixed(2)}px`;
      }
    };
    window.addEventListener("pointermove", move, { passive: true });
    gsap.ticker.add(tick);
    return () => {
      window.removeEventListener("pointermove", move);
      gsap.ticker.remove(tick);
      states.forEach((s) => s.el.style.removeProperty("translate"));
    };
  }, [pathname, motion]);
  return null;
}
