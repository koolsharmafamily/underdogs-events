'use client'

import React, { useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { determineTransitionType, runRouteTransition } from '@/motion/transitions'
import { preloadRouteWorld } from '@/webgl/preload'
import type { TransitionType } from '@/state/frame'

export type TransitionHref = '/' | '/the-red-room' | '/diwali' | '/events'

/**
 * Navigates through the transition system (cover, preload, badge continuity),
 * for buttons and taps that are not links. Same route: does nothing.
 */
export function useTransitionNavigate() {
  const router = useRouter()
  const pathname = usePathname()
  return useCallback(
    (href: TransitionHref, options: { transitionType?: TransitionType; origin?: 'door' | 'gate' | 'nav' } = {}) => {
      if (pathname === href) return
      router.prefetch(href)
      preloadRouteWorld(href)
      runRouteTransition(
        options.transitionType ?? determineTransitionType(pathname, href),
        () => router.push(href),
        { fromPath: pathname, toPath: href, origin: options.origin }
      )
    },
    [router, pathname]
  )
}

interface TransitionLinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  href: TransitionHref
  transitionType?: TransitionType
  origin?: 'door' | 'gate' | 'nav'
  rollText?: string
  underline?: boolean
  children?: React.ReactNode
}

export const TransitionLink = React.forwardRef<HTMLAnchorElement, TransitionLinkProps>(
  function TransitionLink(
    {
      href,
      transitionType,
      origin,
      rollText,
      underline = false,
      className = '',
      onClick,
      onMouseEnter,
      onFocus,
      children,
      ...rest
    },
    ref
  ) {
    const router = useRouter()
    const navigate = useTransitionNavigate()

    const handlePrefetch = () => {
      router.prefetch(href)
      preloadRouteWorld(href)
    }

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      onClick?.(e)
      if (e.defaultPrevented) return

      // Modifier-clicks and middle-clicks behave natively (Part 13.6)
      if (
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return
      }

      e.preventDefault()

      navigate(href, { transitionType, origin })
    }

    return (
      <Link
        ref={ref}
        href={href}
        onClick={handleClick}
        onMouseEnter={(e) => {
          handlePrefetch()
          onMouseEnter?.(e)
        }}
        onFocus={(e) => {
          handlePrefetch()
          onFocus?.(e)
        }}
        // Phones have no hover: start loading the moment a finger lands.
        onTouchStart={handlePrefetch}
        className={`${rollText ? 'nav-roll-link' : ''} ${underline ? 'draw-underline' : ''} ${className}`}
        {...rest}
      >
        {rollText ? (
          <span className="nav-roll-inner">
            <span className="nav-roll-line">{rollText}</span>
            <span className="nav-roll-line" aria-hidden="true">
              {rollText}
            </span>
          </span>
        ) : (
          children
        )}
      </Link>
    )
  }
)

TransitionLink.displayName = 'TransitionLink'
