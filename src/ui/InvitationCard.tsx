"use client";

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { AnnouncingSoon } from './AnnouncingSoon'
import { Divider } from './Divider'
import { BookingDetails } from './BookingDetails'
import { site } from '@/content/site'

export interface InvitationRow {
  readonly label: string
  readonly value: string
  readonly sub?: string
}

interface InvitationCardProps {
  variant: 'redroom' | 'diwali'
  heading: string
  rows: readonly InvitationRow[]
  className?: string
}

export function InvitationCard({
  variant,
  heading,
  rows,
  className = '',
}: InvitationCardProps) {
  const isRedRoom = variant === 'redroom'

  return (
    <article
      aria-label={heading}
      className={`relative mx-auto w-full max-w-[640px] ${
        isRedRoom
          ? 'bg-[#EFD9CD] text-[#2A0403] border border-[#2A0403]/35 p-6 sm:p-10'
          : 'bg-[#FFF6EE] text-[#2A0E1B] border border-[#AD7F42] p-6 sm:p-10'
      } ${className}`}
    >
      {/* Inner ceremonial border */}
      <div
        className={`pointer-events-none absolute inset-2.5 border ${
          isRedRoom ? 'border-[#95120E]/40' : 'border-[#7E1347]/45'
        }`}
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col gap-5">
        <h2
          className={
            isRedRoom
              ? 'text-center font-cinzel-decorative text-heading font-bold uppercase tracking-tight text-[#510805]'
              : 'text-center font-bodoni italic text-heading font-medium tracking-tight text-[#7E1347]'
          }
        >
          {heading}
        </h2>

        <Divider
          variant={isRedRoom ? 'diamond' : 'sparkle'}
          className={isRedRoom ? 'text-[#95120E]' : 'text-[#7E1347]'}
        />

        <dl className="divide-y divide-current/15">
          {rows.map((row) => (
            <div
              key={row.label}
              className="grid grid-cols-1 gap-1.5 py-3.5 sm:grid-cols-[170px_1fr] sm:items-baseline sm:gap-6"
            >
              <dt
                className={`font-cinzel text-[12px] font-semibold uppercase tracking-[0.2em] ${
                  isRedRoom ? 'text-[#95120E]' : 'text-[#7E1347]'
                }`}
              >
                {row.label}
              </dt>
              <dd
                className={`font-manrope text-body font-medium ${
                  isRedRoom ? 'text-[#2A0403]' : 'text-[#2A0E1B]'
                }`}
                style={
                  isRedRoom
                    ? ({ '--world-accent': '#95120E' } as React.CSSProperties)
                    : ({ '--world-accent': '#AD7F42' } as React.CSSProperties)
                }
              >
                <div>
                  <AnnouncingSoon value={row.value} />
                </div>
                {row.sub && (
                  <p
                    className={`mt-1 font-manrope text-[14px] leading-snug ${
                      isRedRoom ? 'text-[#510805]' : 'text-[#7E1347]'
                    }`}
                  >
                    {row.sub}
                  </p>
                )}
              </dd>
            </div>
          ))}
        </dl>

        {isRedRoom ? (
          /* Red Room Past Event Section: Thank-You Note, Rise India Credit & Link to DHAMAAKA */
          <div className="pt-5 border-t border-[#95120E]/25 flex flex-col gap-4 text-center">
            {/* Classy Thank-You Note */}
            <p className="font-cormorant italic text-[18px] sm:text-[21px] font-semibold text-[#510805] leading-snug">
              &ldquo;{site.redRoom.thankYou}&rdquo;
            </p>

            {/* Décor & Production by Rise India credit */}
            <div className="flex flex-col items-center gap-2 pt-2 pb-1">
              <span className="font-cinzel text-[10.5px] uppercase tracking-[0.24em] text-[#95120E] font-semibold">
                {site.redRoom.decorProduction.credit}
              </span>
              <div className="relative w-36 h-12 rounded bg-[#0A0203] p-1.5 flex items-center justify-center border border-[#95120E]/30 shadow-inner">
                <Image
                  src={site.redRoom.decorProduction.logo}
                  alt={site.redRoom.decorProduction.alt}
                  width={140}
                  height={45}
                  className="object-contain max-h-full"
                />
              </div>
            </div>

            {/* Next Gate Onward Link to DHAMAAKA */}
            <div className="pt-2">
              <Link
                href={site.redRoom.nextGate.href}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-sm bg-[#510805] text-[#EFD9CD] hover:bg-[#8B1414] transition-colors font-cinzel text-xs uppercase tracking-[0.24em] font-semibold shadow-md"
              >
                <span>{site.redRoom.nextGate.label}</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="pt-4 border-t border-current/15">
            <BookingDetails variant="diwali" />
          </div>
        )}
      </div>
    </article>
  )
}
