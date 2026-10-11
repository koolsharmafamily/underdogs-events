import { tokens, type WorldId } from './tokens'

export interface WorldActConfig {
  id: WorldId
  clearColor: string
  fogColor: string
  fogDensity: number
  grainOpacity: number
  vignette: number
  exposure: number
  bloom: {
    intensity: number
    threshold: number
  }
}

export const acts: Record<WorldId, WorldActConfig> = {
  home: {
    id: 'home',
    clearColor: tokens.home.void,
    fogColor: '#0B0E14',
    fogDensity: 0.06,
    grainOpacity: 0.04,
    vignette: 0.45,
    exposure: 1.0,
    bloom: {
      intensity: 0.35,
      threshold: 0.85,
    },
  },
  redroom: {
    id: 'redroom',
    clearColor: tokens.redroom.void,
    fogColor: '#1A0202',
    fogDensity: 0.09,
    grainOpacity: 0.05,
    vignette: 0.65,
    exposure: 0.95,
    bloom: {
      intensity: 0.6,
      threshold: 0.75,
    },
  },
  diwali: {
    id: 'diwali',
    clearColor: '#3A0A22',
    fogColor: '#2A0A1C',
    fogDensity: 0.04,
    grainOpacity: 0.03,
    vignette: 0.35,
    exposure: 1.1,
    bloom: {
      intensity: 0.5,
      threshold: 0.8,
    },
  },
}
