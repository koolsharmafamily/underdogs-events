import React from 'react'
import { AnnouncingSoon } from './AnnouncingSoon'
import { Divider } from './Divider'

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

/**
 * Part 8 R4 & Part 9 D3 Invitation Card DOM Overlay:
 * - Red Room: Card paper is --rr-bone (#EFD9CD), with oxblood hairline borders.
 *   Heading "THE RED ROOM" in Cinzel Decorative, --rr-velvet (#510805), then a diamond divider.
 *   Two-column grid: Cinzel caps labels (12 px, +0.2em, --rr-blood #95120E) and Manrope values (--rr-oxblood #2A0403).
 * - Diwali: Ivory card (--dw-ivory #FFF6EE) with rani-pink inner panel border and gold-foil border.
 *   Heading "Diwali with Underdogs" in Bodoni Moda Italic (--dw-rani-deep #7E1347), then a sparkle divider.
 *   Two-column grid: labels in Cinzel caps (12 px, --dw-rani-deep) and values in Manrope (--dw-plum-ink #2A0E1B).
 */
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
      </div>
    </article>
  )
}
