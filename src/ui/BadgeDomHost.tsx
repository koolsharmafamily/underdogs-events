'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useStore } from '@/state/store'
import type { WorldId } from '@/theme/tokens'
import { UnderdogsBadgeSvg } from './UnderdogsBadgeSvg'

interface BadgeDomHostProps {
  skin: WorldId
  sizeClass?: string
  label?: string
  showSvgPreview?: boolean
  className?: string
}

export function BadgeDomHost({
  skin,
  sizeClass = 'w-[240px] h-[240px] sm:w-[340px] sm:h-[340px] lg:w-[420px] lg:h-[420px]',
  label = 'Underdogs emblem — activate to blink',
  showSvgPreview,
  className = '',
}: BadgeDomHostProps) {
  const motionEnabled = useStore((s) => s.motionEnabled)
  const hoverDoor = useStore((s) => s.hoverDoor)
  const blinkTrigger = useStore((s) => s.blinkTrigger)
  const triggerBlink = useStore((s) => s.triggerBlink)

  const isSvgVisible = Boolean(showSvgPreview)

  const [blinkL, setBlinkL] = useState(false)
  const [blinkR, setBlinkR] = useState(false)
  const [tongueAngle, setTongueAngle] = useState(0)
  const blinkCountRef = useRef(0)

  const performBlink = useCallback(() => {
    blinkCountRef.current += 1
    // One blink in six is a wink (left eye only) — Part 5.2
    const isWink = blinkCountRef.current % 6 === 0
    setBlinkL(true)
    setBlinkR(!isWink)
    window.setTimeout(() => {
      setBlinkL(false)
      setBlinkR(false)
    }, 140)
  }, [])

  const performWag = useCallback(() => {
    if (!motionEnabled) return
    const sequence = [12, -10, 7, -4, 0]
    sequence.forEach((angle, idx) => {
      window.setTimeout(() => {
        setTongueAngle(angle)
      }, idx * 180)
    })
  }, [motionEnabled])

  useEffect(() => {
    if (blinkTrigger > 0) {
      performBlink()
    }
  }, [blinkTrigger, performBlink])

  useEffect(() => {
    if (!motionEnabled) return
    const blinkInterval = window.setInterval(() => {
      performBlink()
    }, 4800)

    const wagInterval = window.setInterval(() => {
      performWag()
    }, 9000)

    return () => {
      window.clearInterval(blinkInterval)
      window.clearInterval(wagInterval)
    }
  }, [motionEnabled, performBlink, performWag])

  const lookRotateY =
    hoverDoor === 'redroom' ? -10 : hoverDoor === 'diwali' ? 10 : 0

  return (
    <button
      type="button"
      onClick={() => {
        performBlink()
        triggerBlink()
      }}
      onMouseEnter={performWag}
      aria-label={label}
      className={`group relative inline-flex items-center justify-center bg-transparent p-2 transition-transform duration-500 ${sizeClass} ${className}`}
      style={{
        transform: motionEnabled
          ? `perspective(800px) rotateY(${lookRotateY}deg)`
          : undefined,
      }}
    >
      {isSvgVisible && (
        <UnderdogsBadgeSvg
          skin={skin}
          size="100%"
          blinkingLeft={blinkL}
          blinkingRight={blinkR}
          tongueAngle={tongueAngle}
          className="drop-shadow-[0_0_48px_rgba(215,62,188,0.18)]"
        />
      )}
    </button>
  )
}
