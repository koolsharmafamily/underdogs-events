'use client'

import React from 'react'
import type { WorldId } from '@/theme/tokens'

export const LETTER_PATHS = [
  'M 432.063,763.638 L 431.863,851.652 L 453.000,852.258 L 453.000,838.750 L 466.250,852.000 L 496.277,852.000 L 474.122,829.537 L 497.422,831.090 L 498.266,764.873 Z M 453.413,786.000 L 477.000,786.000 L 477.000,809.000 L 452.847,809.000 Z',
  'M 556.632,752.463 L 513.954,763.030 L 535.275,848.035 L 578.342,837.030 L 593.688,811.417 L 583.356,768.529 Z M 562.166,773.210 L 573.471,816.965 L 550.788,822.723 L 539.601,778.244 Z',
  'M 353.629,744.487 L 330.347,829.346 L 393.848,845.960 L 399.082,826.372 L 355.021,813.817 L 360.531,803.005 L 402.478,814.412 L 408.113,794.001 L 366.727,782.711 L 366.647,770.149 L 411.199,781.964 L 417.244,761.893 Z',
  'M 649.973,709.742 L 592.329,741.456 L 634.678,818.690 L 692.549,787.175 Z M 641.038,737.888 L 663.697,778.348 L 643.110,790.185 L 621.818,750.615 Z',
  'M 282.267,705.506 L 238.066,781.525 L 276.073,803.532 L 306.010,795.596 L 328.121,757.459 L 320.396,727.239 Z M 290.434,734.103 L 310.333,746.488 L 286.753,785.767 L 267.213,773.290 Z',
  'M 228.000,656.387 L 167.275,719.232 L 181.721,733.279 L 208.000,707.000 L 208.000,759.121 L 269.263,695.263 L 254.775,680.775 L 228.000,709.495 Z',
  'M 710.450,655.450 L 662.711,700.374 L 723.101,764.747 L 771.212,719.467 L 741.141,687.764 L 725.839,702.531 L 740.913,718.087 L 724.295,734.705 L 692.962,701.544 L 725.562,670.562 Z',
  'M 183.287,587.485 L 108.681,634.253 L 143.477,689.895 L 218.515,643.184 L 206.584,625.563 L 150.409,660.489 L 140.122,645.460 L 140.484,639.445 L 194.610,605.495 Z',
  'M 755.180,587.847 L 720.478,643.206 L 766.695,672.053 L 792.471,632.034 L 799.394,643.136 L 777.154,678.541 L 795.153,689.961 L 830.003,634.135 L 784.211,605.329 L 758.224,644.843 L 750.820,634.823 L 773.613,598.582 Z',
  'M 795.024,206.131 L 748.981,234.839 L 774.918,277.269 L 760.669,276.684 L 738.587,241.326 L 720.866,252.664 L 755.367,308.595 L 801.659,279.638 L 778.882,242.720 L 787.416,234.585 L 812.208,272.637 L 830.213,262.100 Z',
  'M 143.739,206.065 L 132.096,223.672 L 188.141,259.368 L 176.684,279.058 L 119.770,243.728 L 108.671,261.718 L 183.308,308.352 L 218.317,252.521 Z',
  'M 208.160,136.840 L 193.720,151.280 L 218.663,178.000 L 168.429,178.000 L 228.578,240.422 L 243.451,225.549 L 217.197,198.992 L 269.079,200.376 Z',
  'M 723.298,131.207 L 662.739,195.256 L 710.633,240.599 L 740.810,208.490 L 724.714,194.369 L 709.690,210.690 L 693.117,194.117 L 724.109,161.376 L 756.354,191.998 L 771.245,176.537 Z',
  'M 276.147,92.670 L 238.266,114.372 L 282.224,190.524 L 320.300,168.577 L 327.962,138.112 L 306.669,101.065 Z M 287.361,110.197 L 310.169,149.945 L 290.142,161.569 L 267.222,122.348 Z',
  'M 634.510,77.590 L 592.372,154.490 L 650.108,186.243 L 692.239,108.874 Z M 643.109,106.220 L 663.512,117.281 L 641.337,157.529 L 621.386,145.556 Z',
  'M 393.911,49.314 L 330.404,66.880 L 353.736,151.515 L 417.254,133.880 L 410.996,113.636 L 371.857,124.741 L 366.000,118.000 L 407.923,101.947 L 402.361,81.817 L 359.985,93.378 L 355.389,82.283 L 399.062,69.610 Z',
  'M 535.343,47.659 L 514.061,132.726 L 556.618,143.527 L 583.290,127.336 L 593.688,84.346 L 577.954,58.527 Z M 550.575,73.439 L 573.579,78.982 L 562.324,122.978 L 539.814,117.695 Z',
  'M 431.950,44.000 L 432.026,132.129 L 454.000,131.337 L 454.000,118.000 L 467.000,131.000 L 498.138,131.000 L 474.586,109.000 L 498.353,109.000 L 496.681,44.000 Z M 453.000,65.000 L 476.282,65.000 L 477.414,88.000 L 453.000,88.000 Z',
] as const

export const EYE_L_PATH =
  'M 354.941,308.059 L 332.901,330.099 L 363.143,360.857 L 333.000,391.000 L 355.043,413.043 L 385.018,382.781 L 415.230,413.220 L 437.485,390.839 L 407.175,360.825 L 437.556,330.444 L 415.455,308.344 L 385.210,338.727 Z'

export const EYE_R_PATH =
  'M 523.260,308.260 L 501.263,330.263 L 531.500,360.500 L 501.010,390.990 L 523.213,412.750 L 553.549,382.549 L 584.000,413.000 L 606.000,391.000 L 575.500,360.500 L 606.000,330.000 L 584.000,308.000 L 553.500,338.500 Z'

export const TONGUE_PATH =
  'M 373.6,498.1 H 570.5 V 530.7 H 530.1 V 560.6 C 530.1,595.9 505.5,620.8 472.0,620.8 C 438.4,620.8 412.9,596.0 412.9,560.6 V 530.7 H 373.6 Z M 445.8,530.7 V 559.9 C 445.8,577.4 455.6,588.4 472.0,588.4 C 488.0,588.4 498.0,577.5 498.0,559.9 V 530.7 Z'

interface UnderdogsBadgeSvgProps {
  skin?: WorldId
  size?: number | string
  className?: string
  blinkingLeft?: boolean
  blinkingRight?: boolean
  tongueAngle?: number
  ringProgress?: number // 0..1 for loader clockwise trace
  eyesProgress?: number // 0..1 for eyes draw in
  tongueProgress?: number // 0..1 for tongue draw in
}

export function UnderdogsBadgeSvg({
  skin = 'home',
  size = 28,
  className = '',
  blinkingLeft = false,
  blinkingRight = false,
  tongueAngle = 0,
  ringProgress,
  eyesProgress,
  tongueProgress,
}: UnderdogsBadgeSvgProps) {
  const palette =
    skin === 'redroom'
      ? {
          ring: '#120203',
          ringStroke: '#FF2A1F',
          innerRing: '#FF2A1F',
          face: '#050102',
          letters: '#FF2A1F',
          features: '#FF2A1F',
        }
      : skin === 'diwali'
        ? {
            ring: '#C5287B',
            ringStroke: '#C6A76A',
            innerRing: '#F2D38B',
            face: '#15181C',
            letters: '#FFF6EE',
            features: '#F2D38B',
          }
        : {
            ring: '#D73EBC',
            ringStroke: '#D9DCE3',
            innerRing: '#FCF9FC',
            face: '#10171F',
            letters: '#FCF9FC',
            features: '#FCF9FC',
          }

  const circumference = 2 * Math.PI * 440

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="20 -1 899 899"
      aria-hidden="true"
      className={className}
    >
      {/* Outer Ring */}
      {ringProgress !== undefined ? (
        <>
          <circle
            cx="469.35"
            cy="447.95"
            r="440"
            fill="none"
            stroke="rgba(252,249,252,0.12)"
            strokeWidth="12"
          />
          <circle
            cx="469.35"
            cy="447.95"
            r="440"
            fill="none"
            stroke={palette.ring}
            strokeWidth="14"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - Math.max(0, Math.min(1, ringProgress)))}
            transform="rotate(-90 469.35 447.95)"
          />
        </>
      ) : (
        <circle
          cx="469.35"
          cy="447.95"
          r="446.65"
          fill={palette.ring}
          stroke={palette.ringStroke}
          strokeWidth={skin === 'home' ? 0 : 12}
        />
      )}

      {/* Inner Line & Face */}
      <circle
        cx="469.35"
        cy="447.95"
        r="276.3"
        fill={ringProgress !== undefined ? 'none' : palette.innerRing}
        stroke={ringProgress !== undefined ? palette.innerRing : 'none'}
        strokeWidth={ringProgress !== undefined ? 8 : 0}
        opacity={ringProgress !== undefined ? Math.min(1, ringProgress * 1.4) : 1}
      />
      <circle cx="469.35" cy="447.95" r="262.0" fill={palette.face} />

      {/* Lettering */}
      <g
        fill={palette.letters}
        fillRule="evenodd"
        opacity={ringProgress !== undefined ? Math.max(0, (ringProgress - 0.25) / 0.75) : 1}
      >
        {LETTER_PATHS.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>

      {/* Left X Eye (pivot at 385.2, 360.6) */}
      <g
        fill={palette.features}
        fillRule="evenodd"
        style={{
          transformOrigin: '385.2px 360.6px',
          transform: `scale(${eyesProgress !== undefined ? eyesProgress : 1}) ${
            blinkingLeft ? 'scaleY(0.08)' : 'scaleY(1)'
          }`,
          opacity: eyesProgress !== undefined && eyesProgress < 0.05 ? 0 : 1,
          transition: 'transform 90ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <path d={EYE_L_PATH} />
      </g>

      {/* Right X Eye (pivot at 553.5, 360.5) */}
      <g
        fill={palette.features}
        fillRule="evenodd"
        style={{
          transformOrigin: '553.5px 360.5px',
          transform: `scale(${eyesProgress !== undefined ? eyesProgress : 1}) ${
            blinkingRight ? 'scaleY(0.08)' : 'scaleY(1)'
          }`,
          opacity: eyesProgress !== undefined && eyesProgress < 0.05 ? 0 : 1,
          transition: 'transform 90ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <path d={EYE_R_PATH} />
      </g>

      {/* Mouth Bar + Tongue (pivot at top centre of bar: 472.0, 498.1) */}
      <g
        fill={palette.features}
        fillRule="evenodd"
        style={{
          transformOrigin: '472px 498.1px',
          transform: `scale(${tongueProgress !== undefined ? tongueProgress : 1}) rotate(${tongueAngle}deg)`,
          opacity: tongueProgress !== undefined && tongueProgress < 0.05 ? 0 : 1,
          transition: 'transform 160ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <path d={TONGUE_PATH} />
      </g>
    </svg>
  )
}
