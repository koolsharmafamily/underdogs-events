"use client";
import { assetUrl } from "@/utils/assetUrl";
import { useEffect, useRef } from "react";
import { useStore } from "@/state/store";

/** An optional brand intro, never an asset/readiness gate. CSS also ends it without JS. */
export function DomLoader() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const store = useStore.getState();
    store.setLoaderPopped(true);
    store.setPhase("complete");
    document.documentElement.dataset.hydrated = "true";
    performance.mark("home-ui-hydrated");
    let repeat = false;
    try { repeat = sessionStorage.getItem("underdogs-loader-seen") === "1"; sessionStorage.setItem("underdogs-loader-seen", "1"); } catch {}
    const el = root.current;
    if (!el) return;
    const finish = () => { el.style.visibility = "hidden"; performance.mark("intro-dismissed"); };
    if (repeat || getComputedStyle(el).visibility === "hidden") { finish(); return; }
    const animation = el.animate([{ opacity: getComputedStyle(el).opacity }, { opacity: 0 }], { duration: 150, fill: "forwards", easing: "cubic-bezier(.16,1,.3,1)" });
    animation.onfinish = finish;
    return () => animation.cancel();
  }, []);
  return <div ref={root} data-intro aria-hidden="true" className="brand-intro fixed inset-0 z-[100] flex items-center justify-center select-none pointer-events-none" style={{ background: "radial-gradient(ellipse,#170915,#07070B 70%)" }}>
    <div className="relative w-[210px] h-[210px] sm:w-[280px] sm:h-[280px]">
      <img src={assetUrl("/media/badge-enamel-still-512.webp")} alt="" width={512} height={512} fetchPriority="high" className="w-full h-full object-contain" />
    </div>
  </div>;
}
