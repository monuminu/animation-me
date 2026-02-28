// ─── Inter-Scene Transitions ─────────────────────────────────────────────────
// 18 progress-driven transition effects for switching between scenes.
// Each transition provides enter(p) and exit(p) functions that return
// CSSProperties for the incoming and outgoing scenes respectively.
//
// The AnimationPlayer renders BOTH current and next scene during the transition
// window, applying exit() to the current scene and enter() to the next.

import type { CSSProperties } from 'react'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface TransitionStyle {
  /** CSS for the incoming (next) scene. p goes from 0 → 1. */
  enter: (p: number) => CSSProperties
  /** CSS for the outgoing (current) scene. p goes from 0 → 1. */
  exit: (p: number) => CSSProperties
  /** Default duration in ms if not specified per-scene. */
  defaultDuration: number
}

/** All available transition type names. */
export type TransitionType =
  | 'none'
  | 'fade'
  | 'fadeBlur'
  | 'scaleFade'
  | 'slideLeft'
  | 'slideRight'
  | 'slideUp'
  | 'slideDown'
  | 'wipe'
  | 'zoomThrough'
  | 'crossDissolve'
  | 'clipCircle'
  | 'perspectiveFlip'
  | 'morphExpand'
  | 'splitHorizontal'
  | 'splitVertical'
  | 'pushLeft'
  | 'pushRight'
  // Backward-compat aliases
  | 'slide'
  | 'morph'

// ─── Transition Definitions ──────────────────────────────────────────────────

const TRANSITIONS: Record<string, TransitionStyle> = {
  // ── No transition ──────────────────────────────────────────────────────
  none: {
    enter: () => ({ opacity: 1 }),
    exit: () => ({ opacity: 1 }),
    defaultDuration: 0,
  },

  // ── Fade ───────────────────────────────────────────────────────────────
  fade: {
    enter: (p) => ({ opacity: p }),
    exit: (p) => ({ opacity: 1 - p }),
    defaultDuration: 300,
  },

  // ── Fade + Blur ────────────────────────────────────────────────────────
  fadeBlur: {
    enter: (p) => ({
      opacity: p,
      filter: `blur(${(1 - p) * 12}px)`,
    }),
    exit: (p) => ({
      opacity: 1 - p,
      filter: `blur(${p * 12}px)`,
    }),
    defaultDuration: 400,
  },

  // ── Scale + Fade ───────────────────────────────────────────────────────
  scaleFade: {
    enter: (p) => ({
      opacity: p,
      transform: `scale(${0.92 + p * 0.08})`,
    }),
    exit: (p) => ({
      opacity: 1 - p,
      transform: `scale(${1 + p * 0.08})`,
    }),
    defaultDuration: 400,
  },

  // ── Slide Left (next comes from right) ─────────────────────────────────
  slideLeft: {
    enter: (p) => ({
      transform: `translateX(${(1 - p) * 100}%)`,
    }),
    exit: (p) => ({
      transform: `translateX(${-p * 100}%)`,
    }),
    defaultDuration: 500,
  },

  // ── Slide Right (next comes from left) ─────────────────────────────────
  slideRight: {
    enter: (p) => ({
      transform: `translateX(${-(1 - p) * 100}%)`,
    }),
    exit: (p) => ({
      transform: `translateX(${p * 100}%)`,
    }),
    defaultDuration: 500,
  },

  // ── Slide Up (next comes from bottom) ──────────────────────────────────
  slideUp: {
    enter: (p) => ({
      transform: `translateY(${(1 - p) * 100}%)`,
    }),
    exit: (p) => ({
      transform: `translateY(${-p * 100}%)`,
    }),
    defaultDuration: 500,
  },

  // ── Slide Down (next comes from top) ───────────────────────────────────
  slideDown: {
    enter: (p) => ({
      transform: `translateY(${-(1 - p) * 100}%)`,
    }),
    exit: (p) => ({
      transform: `translateY(${p * 100}%)`,
    }),
    defaultDuration: 500,
  },

  // ── Wipe (left-to-right reveal via clip-path) ──────────────────────────
  wipe: {
    enter: (p) => ({
      clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`,
    }),
    exit: (p) => ({
      clipPath: `inset(0 0 0 ${p * 100}%)`,
    }),
    defaultDuration: 600,
  },

  // ── Zoom Through (current zooms in and fades, next scales up) ──────────
  zoomThrough: {
    enter: (p) => ({
      opacity: p,
      transform: `scale(${0.6 + p * 0.4})`,
    }),
    exit: (p) => ({
      opacity: 1 - p,
      transform: `scale(${1 + p * 0.5})`,
    }),
    defaultDuration: 500,
  },

  // ── Cross Dissolve (extended overlap fade) ─────────────────────────────
  crossDissolve: {
    enter: (p) => ({
      opacity: Math.min(p * 1.5, 1),
    }),
    exit: (p) => ({
      opacity: Math.max(1 - p * 1.5, 0),
    }),
    defaultDuration: 500,
  },

  // ── Clip Circle (radial reveal from center) ────────────────────────────
  clipCircle: {
    enter: (p) => ({
      clipPath: `circle(${p * 150}% at 50% 50%)`,
    }),
    exit: (p) => ({
      opacity: 1 - p,
    }),
    defaultDuration: 600,
  },

  // ── Perspective Flip (3D card flip) ────────────────────────────────────
  perspectiveFlip: {
    enter: (p) => ({
      transform: `perspective(1200px) rotateY(${(1 - p) * -90}deg)`,
      backfaceVisibility: 'hidden' as const,
      opacity: p > 0.5 ? 1 : 0,
    }),
    exit: (p) => ({
      transform: `perspective(1200px) rotateY(${p * 90}deg)`,
      backfaceVisibility: 'hidden' as const,
      opacity: p < 0.5 ? 1 : 0,
    }),
    defaultDuration: 600,
  },

  // ── Morph Expand (scale from center point) ─────────────────────────────
  morphExpand: {
    enter: (p) => ({
      opacity: p,
      transform: `scale(${p})`,
      transformOrigin: '50% 50%',
    }),
    exit: (p) => ({
      opacity: 1 - p,
      transform: `scale(${1 - p * 0.3})`,
      transformOrigin: '50% 50%',
    }),
    defaultDuration: 500,
  },

  // ── Split Horizontal (curtain open/close) ──────────────────────────────
  splitHorizontal: {
    enter: (p) => ({
      clipPath: `inset(${(1 - p) * 50}% 0)`,
    }),
    exit: (p) => ({
      clipPath: `inset(0 ${p * 50}% 0 ${p * 50}%)`,
    }),
    defaultDuration: 500,
  },

  // ── Split Vertical (vertical curtain) ──────────────────────────────────
  splitVertical: {
    enter: (p) => ({
      clipPath: `inset(0 ${(1 - p) * 50}%)`,
    }),
    exit: (p) => ({
      clipPath: `inset(${p * 50}% 0 ${p * 50}% 0)`,
    }),
    defaultDuration: 500,
  },

  // ── Push Left (both scenes move together) ──────────────────────────────
  pushLeft: {
    enter: (p) => ({
      transform: `translateX(${(1 - p) * 100}%)`,
    }),
    exit: (p) => ({
      transform: `translateX(${-p * 30}%)`,
      opacity: 1 - p * 0.5,
    }),
    defaultDuration: 500,
  },

  // ── Push Right ─────────────────────────────────────────────────────────
  pushRight: {
    enter: (p) => ({
      transform: `translateX(${-(1 - p) * 100}%)`,
    }),
    exit: (p) => ({
      transform: `translateX(${p * 30}%)`,
      opacity: 1 - p * 0.5,
    }),
    defaultDuration: 500,
  },
}

// ── Backward-compat aliases ──────────────────────────────────────────────────
TRANSITIONS.slide = TRANSITIONS.slideLeft
TRANSITIONS.morph = TRANSITIONS.morphExpand

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Look up a transition style by name. Falls back to `fade` for unknown types.
 */
export function getTransition(type: string | undefined): TransitionStyle {
  if (!type || type === 'none') return TRANSITIONS.none
  return TRANSITIONS[type] ?? TRANSITIONS.fade
}

/**
 * Get the full transitions map (for iteration / listing).
 */
export function getAllTransitions(): Record<string, TransitionStyle> {
  return TRANSITIONS
}
