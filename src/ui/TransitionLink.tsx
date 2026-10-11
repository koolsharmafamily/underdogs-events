'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { determineTransitionType, runRouteTransition } from '@/motion/transitions'
import type { TransitionType } from '@/state/frame'

interface TransitionLinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  href: '/' | '/the-red-room' | '/diwali'
  transitionType?: TransitionType
  rollText?: string
  underline?: boolean
  children?: React.ReactNode
}

export const TransitionLink = React.forwardRef<HTMLAnchorElement, TransitionLinkProps>(
  function TransitionLink(
    {
      href,
      transitionType,
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
  const pathname = usePathname()

  const handlePrefetch = () => {
    router.prefetch(href)
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

    if (pathname === href) return

    router.prefetch(href)
    const type = transitionType ?? determineTransitionType(pathname, href)

    runRouteTransition(type, () => {
      router.push(href)
    })
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
})

TransitionLink.displayName = 'TransitionLink'
