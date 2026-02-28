// ─── Design Tokens ───────────────────────────────────────────────────────────
// Centralized color, font, spacing, and style tokens extracted from all 15 scene
// templates. Replaces the hardcoded defaults duplicated in every template file.

// ─── Colors ──────────────────────────────────────────────────────────────────

/**
 * Master color palette. Every hardcoded color from the scene templates is here.
 * Default dark theme follows the GitHub-style dark palette.
 */
export const COLORS = {
  // Core scene backgrounds
  bg: '#0d1117',
  bgCard: '#161b22',
  bgElevated: '#1c2129',

  // Text
  text: '#e6edf3',
  textMuted: '#8b949e',
  textSubtle: '#6e7681',

  // Accent (purple)
  accent: '#7c3aed',
  accentMuted: '#7c3aed99',

  // Borders & dividers
  border: '#21262d',
  borderSubtle: '#30363d',

  // Browser chrome dots (ScreenshotShowcaseScene)
  chromeDotRed: '#ff5f57',
  chromeDotYellow: '#febc2e',
  chromeDotGreen: '#28c840',

  // Status / semantic
  success: '#28c840',
  warning: '#febc2e',
  error: '#ff5f57',
  info: '#58a6ff',

  // Common gradients
  gradientAccentCyan: '#06b6d4',
  gradientAccentPink: '#ec4899',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  white: '#ffffff',
} as const

export type ColorToken = keyof typeof COLORS

// ─── Scene Color Resolution ──────────────────────────────────────────────────

export interface SceneColors {
  bg: string
  text: string
  accent: string
  [key: string]: string
}

/**
 * Resolve scene colors from optional per-scene overrides.
 * Replaces the 3-line pattern in every template:
 *   const bg = colors?.bg ?? '#0d1117'
 *   const textColor = colors?.text ?? '#e6edf3'
 *   const accent = colors?.accent ?? '#7c3aed'
 *
 * Accepts any additional color keys (cardBg, gradientFrom, gradientTo, etc.)
 * and passes them through.
 */
export function resolveSceneColors(
  overrides?: Partial<SceneColors> | Record<string, string>
): SceneColors {
  return {
    bg: COLORS.bg,
    text: COLORS.text,
    accent: COLORS.accent,
    ...overrides,
  }
}

// ─── Fonts ───────────────────────────────────────────────────────────────────

/**
 * Font stacks used across all templates.
 * `primary` is the Inter stack used everywhere.
 * `mono` is the JetBrains Mono stack from CodeBlockScene.
 * `monoAlt` is the SF Mono stack from TextRevealScene typewriter mode.
 * `serif` is from TestimonialScene quotation marks.
 */
export const FONTS = {
  primary: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
  mono: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
  monoAlt: "'SF Mono', 'Fira Code', 'Consolas', monospace",
  serif: 'Georgia, "Times New Roman", serif',
} as const

export type FontToken = keyof typeof FONTS

// ─── Font Weights ────────────────────────────────────────────────────────────

export const FONT_WEIGHTS = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
} as const

// ─── Letter Spacing ──────────────────────────────────────────────────────────

export const LETTER_SPACING = {
  tight: '-0.03em',
  snug: '-0.02em',
  normal: '-0.01em',
  wide: '0.05em',
} as const

// ─── Border Radii ────────────────────────────────────────────────────────────

export const RADII = {
  none: '0',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  pill: '100px',
  circle: '50%',
} as const

// ─── Shadows ─────────────────────────────────────────────────────────────────

export const SHADOWS = {
  /** Subtle card shadow */
  card: '0 2px 8px rgba(0, 0, 0, 0.3)',
  /** Elevated element */
  elevated: '0 8px 24px rgba(0, 0, 0, 0.4)',
  /** Glow effect using accent color */
  glow: (color: string, intensity: number = 40) =>
    `0 0 30px ${color}${Math.round((intensity / 100) * 255).toString(16).padStart(2, '0')}`,
  /** Button glow (from HeroScene, CTAScene) */
  buttonGlow: (color: string) =>
    `0 0 30px ${color}40, 0 4px 15px ${color}30`,
  /** Logo glow (from LogoRevealScene) */
  logoGlow: (color: string) =>
    `0 0 40px ${color}40, 0 8px 30px ${color}25`,
} as const
