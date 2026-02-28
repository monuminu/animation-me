'use client'

import { motion } from 'framer-motion'

interface SceneProps {
  isActive: boolean
  progress: number
  onComplete: () => void
  data: Record<string, unknown>
}

interface HeroData {
  headline: string
  subheadline?: string
  cta?: string
  colors?: {
    bg: string
    text: string
    accent: string
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3)
}

function springInterpolation(t: number) {
  // Simulates a spring overshoot: goes past 1.0 then settles
  if (t <= 0) return 0
  if (t >= 1) return 1
  const decay = Math.exp(-6 * t)
  return 1 - decay * Math.cos(12 * t * Math.PI * 0.15)
}

export function HeroScene({ isActive, progress, onComplete, data }: SceneProps) {
  const {
    headline = 'Welcome',
    subheadline,
    cta,
    colors,
  } = data as unknown as HeroData

  const bg = colors?.bg ?? '#0d1117'
  const textColor = colors?.text ?? '#e6edf3'
  const accent = colors?.accent ?? '#7c3aed'

  // Staggered timing: headline 0-0.4, subheadline 0.2-0.6, CTA 0.4-0.8, settle 0.8-1.0
  const headlineProgress = easeOutCubic(clamp(progress / 0.4, 0, 1))
  const subheadlineProgress = easeOutCubic(clamp((progress - 0.2) / 0.4, 0, 1))
  const ctaProgress = springInterpolation(clamp((progress - 0.4) / 0.4, 0, 1))
  const glowProgress = clamp(progress / 0.6, 0, 1)

  if (progress >= 1 && isActive) {
    onComplete()
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        backgroundColor: bg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(1.5rem, 3vw, 2rem) clamp(1.5rem, 4vw, 4rem)',
        overflow: 'hidden',
        fontFamily:
          "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* Gradient accent glow behind headline */}
      <div
        style={{
          position: 'absolute',
          top: '35%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '800px',
          height: '400px',
          borderRadius: '50%',
          background: `radial-gradient(ellipse, ${accent}30 0%, ${accent}10 40%, transparent 70%)`,
          opacity: glowProgress,
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      />

      {/* Secondary glow ring */}
      <div
        style={{
          position: 'absolute',
          top: '40%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          border: `1px solid ${accent}20`,
          opacity: glowProgress * 0.5,
          pointerEvents: 'none',
        }}
      />

      {/* Headline */}
      <motion.h1
        style={{
          position: 'relative',
          zIndex: 1,
          fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
          fontWeight: 800,
          color: textColor,
          textAlign: 'center',
          letterSpacing: '-0.03em',
          lineHeight: 1.1,
          maxWidth: '900px',
          margin: 0,
          opacity: headlineProgress,
          transform: `translateY(${(1 - headlineProgress) * 50}px) scale(${0.9 + headlineProgress * 0.1})`,
        }}
      >
        {headline}
      </motion.h1>

      {/* Subheadline */}
      {subheadline && (
        <motion.p
          style={{
            position: 'relative',
            zIndex: 1,
            fontSize: 'clamp(1rem, 2vw, 1.5rem)',
            fontWeight: 400,
            color: `${textColor}99`,
            textAlign: 'center',
            lineHeight: 1.6,
            maxWidth: '650px',
            margin: 0,
            marginTop: '1.5rem',
            opacity: subheadlineProgress,
            transform: `translateY(${(1 - subheadlineProgress) * 30}px)`,
          }}
        >
          {subheadline}
        </motion.p>
      )}

      {/* CTA Button */}
      {cta && (
        <motion.div
          style={{
            position: 'relative',
            zIndex: 1,
            marginTop: '2.5rem',
            opacity: ctaProgress,
            transform: `scale(${ctaProgress})`,
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.9rem 2.5rem',
              borderRadius: '100px',
              background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
              color: '#ffffff',
              fontSize: '1.1rem',
              fontWeight: 600,
              letterSpacing: '-0.01em',
              boxShadow: `0 0 30px ${accent}40, 0 4px 15px ${accent}30`,
              cursor: 'pointer',
            }}
          >
            {cta}
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>

          {/* Button glow */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '120%',
              height: '200%',
              borderRadius: '100px',
              background: `radial-gradient(ellipse, ${accent}25 0%, transparent 70%)`,
              filter: 'blur(15px)',
              pointerEvents: 'none',
              zIndex: -1,
            }}
          />
        </motion.div>
      )}

      {/* Bottom gradient fade */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '120px',
          background: `linear-gradient(to top, ${bg}, transparent)`,
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}
