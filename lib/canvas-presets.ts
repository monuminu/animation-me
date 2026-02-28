import type { CanvasPreset } from '@/types'

export const CANVAS_PRESETS: CanvasPreset[] = [
  // Standard
  { id: 'full-size', label: 'Full size', width: 1920, height: 1080, category: 'standard' },
  { id: '16-9', label: '16:9', width: 1920, height: 1080, category: 'standard' },
  { id: '9-16', label: '9:16', width: 1080, height: 1920, category: 'standard' },
  { id: '4-3', label: '4:3', width: 1440, height: 1080, category: 'standard' },
  { id: '1-1', label: '1:1', width: 1080, height: 1080, category: 'standard' },

  // iPhone
  { id: 'iphone-se', label: 'iPhone SE', width: 375, height: 667, category: 'iphone' },
  { id: 'iphone-air', label: 'iPhone Air', width: 430, height: 932, category: 'iphone' },
  { id: 'iphone-17', label: 'iPhone 17', width: 393, height: 852, category: 'iphone' },
  { id: 'iphone-17-pro', label: 'iPhone 17 Pro', width: 402, height: 874, category: 'iphone' },
  { id: 'iphone-17-pro-max', label: 'iPhone 17 Pro Max', width: 440, height: 956, category: 'iphone' },

  // Pixel
  { id: 'pixel-10', label: 'Pixel 10', width: 412, height: 915, category: 'pixel' },
  { id: 'pixel-10-pro', label: 'Pixel 10 Pro', width: 412, height: 915, category: 'pixel' },
  { id: 'pixel-10-pro-xl', label: 'Pixel 10 Pro XL', width: 448, height: 998, category: 'pixel' },

  // Samsung
  { id: 'samsung-galaxy-s25', label: 'Samsung Galaxy S25', width: 412, height: 915, category: 'samsung' },
  { id: 'samsung-galaxy-s25-plus', label: 'Samsung Galaxy S25+', width: 412, height: 915, category: 'samsung' },
  { id: 'samsung-galaxy-s25-ultra', label: 'Samsung Galaxy S25 Ultra', width: 412, height: 915, category: 'samsung' },
]

export const PRESET_CATEGORIES = [
  { id: 'standard', label: 'Standard' },
  { id: 'iphone', label: 'iPhone' },
  { id: 'pixel', label: 'Pixel' },
  { id: 'samsung', label: 'Samsung' },
] as const

export function getPresetById(id: string): CanvasPreset {
  return CANVAS_PRESETS.find((p) => p.id === id) ?? CANVAS_PRESETS[0]
}
