// ─── Barrel Export ────────────────────────────────────────────────────────────
// Re-exports all shared animation infrastructure from a single import path.
//
// Usage in scene templates:
//   import { clamp, subProgress, easeOutCubic, spring, SPRING_PRESETS } from '@/lib/video'
//   import { COLORS, resolveSceneColors, FONTS } from '@/lib/video'
//   import { getTransition } from '@/lib/video'
//   import { TEXT, SPACE, GLOW, MAX_WIDTH, ICON } from '@/lib/video'

// Easing & Springs
export {
  clamp,
  subProgress,
  easeOutCubic,
  easeOutQuart,
  easeOutQuint,
  easeOutExpo,
  easeInCubic,
  easeInOutCubic,
  easeInOutQuart,
  spring,
  SPRING_PRESETS,
  EASING,
  type SpringConfig,
  type EasingName,
} from './easing'

// Design Tokens
export {
  COLORS,
  resolveSceneColors,
  FONTS,
  FONT_WEIGHTS,
  LETTER_SPACING,
  RADII,
  SHADOWS,
  type ColorToken,
  type FontToken,
  type SceneColors,
} from './tokens'

// Inter-Scene Transitions
export {
  getTransition,
  getAllTransitions,
  type TransitionStyle,
  type TransitionType,
} from './transitions'

// Viewport-Relative Sizing
export {
  TEXT,
  SPACE,
  GLOW,
  MAX_WIDTH,
  ICON,
} from './sizing'
