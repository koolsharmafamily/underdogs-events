"use client";

import React from "react";
import Image from "next/image";
import { site } from "@/content/site";

export function PastArtistsSection() {
  const artists = site.home.pastArtists;
  if (!artists || artists.length === 0) return null;

  return (
    <section aria-label="Artists Who've Played Underdogs" className="py-16 border-t border-[var(--paper)]/15">
      <div className="site-container flex flex-col gap-8">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--magenta)]">
            The Roster
          </span>
          <h2 className="font-cinzel text-h2 font-bold uppercase tracking-wider text-[var(--paper)]">
            Artists Who&apos;ve Played Underdogs
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {artists.map((artist) => (
            <div
              key={artist.name}
              className="flex flex-col items-center text-center gap-2.5 p-4 rounded-lg bg-white/[0.02] border border-white/10"
            >
              {artist.photo && (
                <div className="relative w-24 h-24 rounded-full overflow-hidden bg-black/40">
                  <Image src={artist.photo} alt={artist.name} fill className="object-cover" />
                </div>
              )}
              <h3 className="font-cinzel text-sm font-bold text-white uppercase tracking-wider">
                {artist.name}
              </h3>
              {artist.genre && (
                <p className="font-mono text-[10px] text-white/60 uppercase tracking-widest">
                  {artist.genre}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
