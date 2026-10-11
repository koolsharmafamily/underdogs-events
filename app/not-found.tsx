import React from 'react'
import { site } from '@/content/site'
import { BadgeDomHost } from '@/ui/BadgeDomHost'
import { TransitionLink } from '@/ui/TransitionLink'
import { Footer } from '@/ui/Footer'

export default function NotFound() {
  return (
    <main id="main-content" className="relative z-10 flex min-h-[100svh] flex-col justify-between">
      <section
        aria-label="Page not found"
        className="my-auto site-container flex flex-col items-center justify-center gap-8 py-28 text-center"
      >
        <BadgeDomHost
          skin="home"
          showSvgPreview={true}
          sizeClass="w-[180px] h-[180px] sm:w-[240px] sm:h-[240px]"
          label="Underdogs Enamel Badge — click to blink"
        />

        <h1 className="font-unbounded text-display-l font-extrabold uppercase text-[var(--paper)] balance-heading">
          {site.notFound.title}
        </h1>

        <TransitionLink
          href="/"
          transitionType="T4"
          className="inline-flex min-h-[48px] items-center gap-3 border border-[var(--magenta)] px-6 py-3 font-cinzel text-[12px] uppercase tracking-[0.28em] text-[var(--paper)] hover:bg-[var(--magenta)] hover:text-[#07090D] transition-colors"
        >
          <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true">
            <path
              d="M13 5H1.5M1.5 5L5.5 1M1.5 5L5.5 9"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </svg>
          <span>{site.notFound.link}</span>
        </TransitionLink>
      </section>

      <Footer />
    </main>
  )
}
