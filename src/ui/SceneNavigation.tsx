"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { runFadeCutJump } from "@/motion/transitions";
import { getLenis } from "@/motion/clock";

export function SceneNavigation() {
  const pathname = usePathname();
  const [scenes, setScenes] = useState<{ id: string; label: string }[]>([]);
  const [active, setActive] = useState("");
  useEffect(() => {
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>("main [data-scene]"),
    );
    setScenes(
      elements.map((el) => ({
        id: el.dataset.scene!,
        label:
          el.getAttribute("aria-label") ||
          el.querySelector("h2")?.textContent ||
          el.dataset.scene!,
      })),
    );
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting)
            setActive((entry.target as HTMLElement).dataset.scene!);
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [pathname]);
  if (!scenes.length) return null;
  return (
    <nav aria-label="Scenes" className="scene-navigation hidden lg:flex">
      {scenes.map((scene) => (
        <button
          key={scene.id}
          aria-label={scene.label}
          aria-current={active === scene.id ? "step" : undefined}
          title={scene.label}
          onClick={() => {
            const el = document.querySelector<HTMLElement>(
              `[data-scene="${scene.id}"]`,
            );
            if (!el) return;
            const top = el.getBoundingClientRect().top + window.scrollY;
            if (Math.abs(top - window.scrollY) > window.innerHeight * 1.5)
              runFadeCutJump(top);
            else if (getLenis()) getLenis()!.scrollTo(top, { duration: 0.9 });
            else window.scrollTo({ top, behavior: "smooth" });
          }}
        >
          <span />
        </button>
      ))}
    </nav>
  );
}
