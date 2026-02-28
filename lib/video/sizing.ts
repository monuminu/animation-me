// ─── Viewport-Relative Sizing Tokens ─────────────────────────────────────────
// Centralized responsive sizing scale using CSS clamp() and min() for
// resolution independence. Replaces scattered hardcoded pixel values.

// ─── Text Sizes ──────────────────────────────────────────────────────────────

/**
 * 12 named text sizes using CSS clamp() for responsive scaling.
 * Extracted from and matching the values used across scene templates.
 */
export const TEXT = {
  /** Hero headline — e.g., HeroScene main heading */
  heroHeadline: 'clamp(2.5rem, 5vw, 4.5rem)',
  /** Standard headline — e.g., CTAScene, LogoRevealScene */
  headline: 'clamp(2rem, 4vw, 3.5rem)',
  /** CTA headline — slightly smaller than hero */
  ctaHeadline: 'clamp(2.5rem, 5vw, 4rem)',
  /** Section title — e.g., FeatureGridScene, StatsScene */
  sectionTitle: 'clamp(1.5rem, 3vw, 2.5rem)',
  /** Subtitle / subheadline */
  subtitle: 'clamp(1rem, 2vw, 1.5rem)',
  /** CTA subtitle — slightly smaller */
  ctaSubtitle: 'clamp(1rem, 1.8vw, 1.35rem)',
  /** Body text */
  body: 'clamp(0.875rem, 1.5vw, 1.125rem)',
  /** Tagline / uppercase labels — e.g., LogoRevealScene tagline */
  tagline: 'clamp(0.9rem, 1.5vw, 1.25rem)',
  /** Small text / labels */
  small: 'clamp(0.75rem, 1.2vw, 0.875rem)',
  /** Code text */
  code: 'clamp(0.8rem, 1.3vw, 0.95rem)',
  /** Stat numbers — large display numerals */
  statValue: 'clamp(2rem, 4vw, 3.5rem)',
  /** Button text */
  button: '1.1rem',
  /** Large button text (CTA) */
  buttonLg: '1.2rem',
} as const

// ─── Spacing ─────────────────────────────────────────────────────────────────

/**
 * Scene padding and gap scale.
 * Values match the clamp() paddings used in scene templates.
 */
export const SPACE = {
  /** Standard scene padding (all templates) */
  scenePadding: 'clamp(1.5rem, 3vw, 2rem) clamp(1.5rem, 4vw, 4rem)',
  /** Scene padding (vertical only) */
  scenePaddingY: 'clamp(1.5rem, 3vw, 2rem)',
  /** Scene padding (horizontal only) */
  scenePaddingX: 'clamp(1.5rem, 4vw, 4rem)',

  // Gap scale
  gap: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '2.5rem',
    '3xl': '3rem',
  },

  // Margin helpers
  sectionGap: '1.5rem',
  elementGap: '1rem',
  buttonMarginTop: '2.5rem',
} as const

// ─── Glow Dimensions ────────────────────────────────────────────────────────

/**
 * Glow/blur effect dimensions using min() for resolution independence.
 * Extracted from the radial gradient overlays in scene templates.
 */
export const GLOW = {
  /** Small glow — button halos */
  sm: {
    width: 'min(300px, 40vw)',
    height: 'min(300px, 40vw)',
    blur: '15px',
  },
  /** Medium glow — behind text blocks */
  md: {
    width: 'min(500px, 60vw)',
    height: 'min(500px, 60vw)',
    blur: '30px',
  },
  /** Large glow — hero accent backgrounds */
  lg: {
    width: 'min(800px, 80vw)',
    height: 'min(400px, 40vw)',
    blur: '40px',
  },
  /** Extra large glow — CTA burst backgrounds */
  xl: {
    width: 'min(1000px, 90vw)',
    height: 'min(1000px, 90vw)',
    blur: '60px',
  },
} as const

// ─── Max Widths ──────────────────────────────────────────────────────────────

/**
 * Max-width constraints for content areas.
 */
export const MAX_WIDTH = {
  /** Headline text — prevents overly wide text blocks */
  text: '900px',
  /** Subheadline / body text */
  textNarrow: '650px',
  /** CTA text block */
  ctaText: '800px',
  /** Feature grid container */
  grid: '1000px',
  /** Browser mockup frame */
  browser: '800px',
  /** Phone mockup frame */
  phone: '320px',
  /** Comparison columns */
  comparison: '900px',
  /** Testimonial quote */
  quote: '700px',
} as const

// ─── Icon Sizes ──────────────────────────────────────────────────────────────

/**
 * Standard icon sizing scale.
 */
export const ICON = {
  sm: '16px',
  md: '24px',
  lg: '32px',
  xl: '48px',
  logo: '100px',
} as const
