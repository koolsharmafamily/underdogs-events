'use client'

import React, { useRef } from 'react'
import { useLineReveal } from '@/motion/useLineReveal'

interface SplitHeadingProps {
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'div'
  children: React.ReactNode
  className?: string
  delay?: number
  triggerOnMount?: boolean
  srPrefix?: string
}

export function SplitHeading({
  as: Tag = 'h2',
  children,
  className = '',
  delay = 0,
  triggerOnMount = false,
  srPrefix,
}: SplitHeadingProps) {
  const ref = useRef<HTMLElement>(null)
  useLineReveal(ref, { delay, triggerOnMount })

  return (
    <Tag
      ref={ref as React.RefObject<HTMLHeadingElement>}
      className={`balance-heading ${className}`}
    >
      {srPrefix && <span className="sr-only">{srPrefix}</span>}
      {children}
    </Tag>
  )
}
