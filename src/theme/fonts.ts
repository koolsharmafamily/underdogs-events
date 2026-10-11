import {
  Unbounded,
  Cinzel,
  Cinzel_Decorative,
  Cormorant_Garamond,
  Bodoni_Moda,
  Tiro_Devanagari_Hindi,
  Manrope,
  JetBrains_Mono,
} from 'next/font/google'

export const unbounded = Unbounded({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-unbounded',
  preload: true,
  adjustFontFallback: true,
})

export const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-cinzel',
  preload: false,
  adjustFontFallback: true,
})

export const cinzelDecorative = Cinzel_Decorative({
  subsets: ['latin'],
  weight: ['700', '900'],
  display: 'swap',
  variable: '--font-cinzel-decorative',
  preload: false,
  adjustFontFallback: true,
})

export const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-cormorant',
  preload: false,
  adjustFontFallback: true,
})

export const bodoniModa = Bodoni_Moda({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-bodoni',
  preload: false,
  adjustFontFallback: true,
})

export const tiroDevanagari = Tiro_Devanagari_Hindi({
  subsets: ['devanagari', 'latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-devanagari',
  preload: false,
  adjustFontFallback: false,
})

export const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-manrope',
  preload: false,
  adjustFontFallback: true,
})

export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
  variable: '--font-mono',
  preload: false,
  adjustFontFallback: true,
})

export const coreFontVariables = [
  unbounded.variable,
  cinzel.variable,
  manrope.variable,
  jetbrainsMono.variable,
].join(' ')

export const redRoomFontVariables = [
  cinzelDecorative.variable,
  cormorantGaramond.variable,
].join(' ')

export const diwaliFontVariables = [
  bodoniModa.variable,
  tiroDevanagari.variable,
].join(' ')
