"use client";
import { assetUrl } from "@/utils/assetUrl";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useStore } from "@/state/store";
import { badgeScreenBounds } from "@/webgl/badge/screenBounds";

export function HomeHeroStill() {
  const pathname = usePathname();
  const ready = useStore((s) => s.renderedWorlds.home);
  const tier = useStore((s) => s.tier);
  const transitioning = useStore((s) => s.isTransitioning);
  const [scrolledPastHero, setScrolledPastHero] = useState(false);
  const image = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (pathname !== "/" || ready) return;
    let raf = 0;
    const onScroll = () => {
      setScrolledPastHero(window.scrollY > window.innerHeight * 0.45);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const track = () => {
      const el = image.current;
      const b = badgeScreenBounds;
      if (el && b.ready && b.readySkin === "enamel") {
        el.style.left = b.x + "px";
        el.style.top = b.y + "px";
        el.style.width = (b.size * 512) / 340 + "px";
      }
      raf = requestAnimationFrame(track);
    };
    raf = requestAnimationFrame(track);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, [pathname, ready]);

  if (pathname !== "/" || tier === "T0") return null;
  return (
    <img
      ref={image}
      data-home-hero-still
      src={assetUrl("/media/badge-enamel-still-512.webp")}
      alt=""
      aria-hidden="true"
      width={512}
      height={512}
      fetchPriority="high"
      className="home-hero-still"
      style={{ opacity: ready || transitioning || scrolledPastHero ? 0 : 1 }}
    />
  );
}
