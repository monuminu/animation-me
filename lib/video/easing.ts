// ─── Easing & Spring Functions ───────────────────────────────────────────────
// Shared animation utilities extracted from scene templates.
// Every function here is mathematically identical to the inline versions
// that were previously duplicated across all 15 scene templates.

// ─── Core Utility ────────────────────────────────────────────────────────────

/**
 * Clamp a value between min and max.
 * Extracted from all 15 scene templates.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

/**
 * Compute sub-progress within a window of the overall scene progress.
 * Replaces the ubiquitous pattern: `easing(clamp((progress - start) / (end - start), 0, 1))`
 *
 * @param progress - The overall scene progress (0–1)
 * @param start    - When this sub-animation begins (0–1)
 * @param end      - When this sub-animation ends (0–1)
 * @param easing   - Optional easing function applied to the windowed progress
 * @returns        - Eased progress value (0–1), or beyond 1 for spring easings
 */
export function subProgress(
  progress: number,
  start: number,
  end: number,
  easing?: (t: number) => number
): number {
  const raw = clamp((progress - start) / (end - start), 0, 1)
  return easing ? easing(raw) : raw
}

// ─── Easing Functions ────────────────────────────────────────────────────────

/** Cubic ease-out: decelerating from full speed. Used in all 15 templates. */
export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

/** Quartic ease-out: slightly more pronounced deceleration. Used in ComparisonScene, TestimonialScene. */
export function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4)
}

/** Quintic ease-out: heavy deceleration. Used in SplitScreenScene, ScreenshotShowcaseScene. */
export function easeOutQuint(t: number): number {
  return 1 - Math.pow(1 - t, 5)
}

/** Exponential ease-out: very sharp deceleration. Used in StatsScene for counter animations. */
export function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
}

/** Cubic ease-in: accelerating from rest. */
export function easeInCubic(t: number): number {
  return Math.pow(t, 3)
}

/** Cubic ease-in-out: smooth acceleration then deceleration. */
export function easeInOutCubic(t: number): number {
  return t < 0.5
    ? 4 * Math.pow(t, 3)
    : 1 - Math.pow(-2 * t + 2, 3) / 2
}

/** Quartic ease-in-out: more pronounced S-curve. */
export function easeInOutQuart(t: number): number {
  return t < 0.5
    ? 8 * Math.pow(t, 4)
    : 1 - Math.pow(-2 * t + 2, 4) / 2
}

// ─── Spring ──────────────────────────────────────────────────────────────────

export interface SpringConfig {
  /** Exponential decay rate (higher = faster settle). Default: 6 */
  decay: number
  /** Frequency of oscillation. Default: 12 */
  frequency: number
  /** Frequency multiplier (applied as `frequency * t * Math.PI * multiplier`). Default: 0.15 */
  multiplier: number
}

const DEFAULT_SPRING_CONFIG: SpringConfig = {
  decay: 6,
  frequency: 12,
  multiplier: 0.15,
}

/**
 * Parameterized spring interpolation that overshoots and settles.
 * Default params match HeroScene, CTAScene, GradientBackgroundScene, PricingTableScene:
 *   `decay=6, frequency=12, multiplier=0.15`
 *
 * LogoRevealScene uses the "snappy" preset:
 *   `decay=8, frequency=14, multiplier=0.12`
 */
export function spring(t: number, config?: Partial<SpringConfig>): number {
  if (t <= 0) return 0
  if (t >= 1) return 1
  const { decay, frequency, multiplier } = { ...DEFAULT_SPRING_CONFIG, ...config }
  const d = Math.exp(-decay * t)
  return 1 - d * Math.cos(frequency * t * Math.PI * multiplier)
}

// ─── Presets ─────────────────────────────────────────────────────────────────

/**
 * 7 named spring presets.
 * `default` matches HeroScene/CTAScene/GradientBackgroundScene/PricingTableScene.
 * `snappy` matches LogoRevealScene.
 */
export const SPRING_PRESETS = {
  /** Standard spring — decay: 6, freq: 12, mult: 0.15 (from HeroScene) */
  default: { decay: 6, frequency: 12, multiplier: 0.15 } as SpringConfig,
  /** Tighter overshoot, faster settle (from LogoRevealScene) */
  snappy: { decay: 8, frequency: 14, multiplier: 0.12 } as SpringConfig,
  /** Soft, slow spring for gentle entrances */
  gentle: { decay: 4, frequency: 8, multiplier: 0.15 } as SpringConfig,
  /** Pronounced bounce */
  bouncy: { decay: 5, frequency: 16, multiplier: 0.2 } as SpringConfig,
  /** Very quick settle, minimal overshoot */
  stiff: { decay: 12, frequency: 10, multiplier: 0.1 } as SpringConfig,
  /** Micro-interaction: ultra-fast, barely visible spring */
  micro: { decay: 14, frequency: 18, multiplier: 0.08 } as SpringConfig,
  /** Dramatic, slow spring for hero moments */
  cinematic: { decay: 3, frequency: 6, multiplier: 0.2 } as SpringConfig,
} as const

// ─── Named Easing Map ────────────────────────────────────────────────────────

/**
 * Name → function lookup for all easings.
 * Includes spring variants via partial application.
 */
export const EASING = {
  linear: (t: number) => t,
  easeOutCubic,
  easeOutQuart,
  easeOutQuint,
  easeOutExpo,
  easeInCubic,
  easeInOutCubic,
  easeInOutQuart,
  spring: (t: number) => spring(t),
  springSnappy: (t: number) => spring(t, SPRING_PRESETS.snappy),
  springGentle: (t: number) => spring(t, SPRING_PRESETS.gentle),
  springBouncy: (t: number) => spring(t, SPRING_PRESETS.bouncy),
  springStiff: (t: number) => spring(t, SPRING_PRESETS.stiff),
  springMicro: (t: number) => spring(t, SPRING_PRESETS.micro),
  springCinematic: (t: number) => spring(t, SPRING_PRESETS.cinematic),
} as const

export type EasingName = keyof typeof EASING
