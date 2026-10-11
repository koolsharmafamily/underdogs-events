'use client'

import React, { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { site } from '@/content/site'
import { useStore } from '@/state/store'
import { TransitionLink } from './TransitionLink'
import { MotionToggle } from './MotionToggle'
import { Divider } from './Divider'

export function Menu() {
  const pathname = usePathname()
  const menuOpen = useStore((s) => s.menuOpen)
  const setMenuOpen = useStore((s) => s.setMenuOpen)
  const world = useStore((s) => s.world)
  const overlayRef = useRef<HTMLDivElement>(null)
  const closeBtnRef = useRef<HTMLButtonElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname, setMenuOpen])

  useEffect(() => {
    if (!menuOpen) {
      previousFocusRef.current?.focus()
      return
    }

    previousFocusRef.current = document.activeElement as HTMLElement | null
    closeBtnRef.current?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        setMenuOpen(false)
        return
      }

      if (e.key === 'Tab' && overlayRef.current) {
        const focusable = overlayRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [menuOpen, setMenuOpen])

  if (!menuOpen) return null

  const dividerVariant =
    world === 'redroom' ? 'diamond' : world === 'diwali' ? 'sparkle' : 'x'

  return (
    <div
      id="mobile-menu-overlay"
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label="Site navigation"
      className="fixed inset-0 z-50 flex flex-col justify-between bg-[var(--world-bg)] text-[var(--world-text)] p-5"
    >
      <div className="flex h-16 items-center justify-between">
        <span className="font-cinzel text-[11px] uppercase tracking-[0.28em] text-[var(--world-muted)]">
          {site.brand.legalName}
        </span>
        <button
          ref={closeBtnRef}
          type="button"
          onClick={() => setMenuOpen(false)}
          aria-label="Close navigation menu"
          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 font-cinzel text-[12px] uppercase tracking-[0.28em]"
        >
          <span>Close</span>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M1.5 1.5L10.5 10.5M10.5 1.5L1.5 10.5" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </button>
      </div>

      <nav aria-label="Mobile pages" className="my-auto flex flex-col gap-6 py-8">
        <TransitionLink
          href="/"
          origin="nav"
          onClick={() => setMenuOpen(false)}
          aria-current={pathname === '/' ? 'page' : undefined}
          className={`font-unbounded text-4xl font-extrabold uppercase tracking-tight ${
            pathname === '/' ? 'text-[var(--world-accent)]' : 'text-[var(--world-text)]'
          }`}
        >
          {site.brand.line}
        </TransitionLink>

        <Divider variant={dividerVariant} />

        <TransitionLink
          href="/the-red-room"
          origin="nav"
          onClick={() => setMenuOpen(false)}
          aria-current={pathname === '/the-red-room' ? 'page' : undefined}
          className={`font-cinzel-decorative text-4xl font-bold uppercase tracking-tight ${
            pathname === '/the-red-room' ? 'text-[var(--world-accent)]' : 'text-[var(--world-text)]'
          }`}
        >
          {site.home.worlds.one.name}
        </TransitionLink>

        <Divider variant={dividerVariant} />

        <TransitionLink
          href="/diwali"
          origin="nav"
          onClick={() => setMenuOpen(false)}
          aria-current={pathname === '/diwali' ? 'page' : undefined}
          className={`font-bodoni italic text-4xl font-medium tracking-tight ${
            pathname === '/diwali' ? 'text-[var(--world-accent)]' : 'text-[var(--world-text)]'
          }`}
        >
          {site.home.worlds.two.name}
        </TransitionLink>
      </nav>

      <div className="flex items-center justify-between border-t border-current/20 pt-4">
        <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--world-muted)]">
          {site.brand.city}
        </span>
        <MotionToggle />
      </div>
    </div>
  )
}
