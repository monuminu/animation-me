'use client'

import { motion } from 'framer-motion'
import type { SceneProps } from '@/types'
import { clamp, easeOutCubic, spring, resolveSceneColors, FONTS } from '@/lib/video'

interface CTAData {
  headline: string
  subtext?: string
  buttonText?: string
  colors?: {
    bg: string
    text: string
    accent: string
    gradientFrom?: string
    gradientTo?: string
  }
}

export function CTAScene({ isActive, progress, onComplete, data }: SceneProps) {
  const {
    headline = 'Get Started Today',
    subtext,
    buttonText = 'Start Free',
    colors,
  } = data as unknown as CTAData

  const { bg, text: textColor, accent } = resolveSceneColors(colors)
  const gradientFrom = colors?.gradientFrom ?? accent
  const gradientTo = colors?.gradientTo ?? '#06b6d4'

  // Timing: glow 0-0.3, headline 0.1-0.5, subtext 0.3-0.6, button 0.45-0.75, pulse 0.75-1.0
  const glowProgress = easeOutCubic(clamp(progress / 0.3, 0, 1))
  const headlineProgress = spring(clamp((progress - 0.1) / 0.4, 0, 1))
  const subtextProgress = easeOutCubic(clamp((progress - 0.3) / 0.3, 0, 1))
  const buttonProgress = spring(clamp((progress - 0.45) / 0.3, 0, 1))
  const pulsePhase = clamp((progress - 0.75) / 0.25, 0, 1)

  // Pulsing effect for the button glow after it appears
  const pulseScale = pulsePhase > 0 ? 1 + Math.sin(pulsePhase * Math.PI * 4) * 0.04 : 1
  const pulseGlowOpacity = pulsePhase > 0 ? 0.5 + Math.sin(pulsePhase * Math.PI * 3) * 0.3 : 0.5

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
        fontFamily: FONTS.primary,
      }}
    >
      {/* Central glow burst */}
      <div
        style={{
          position: 'absolute',
          top: '45%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: `${600 + glowProgress * 200}px`,
          height: `${600 + glowProgress * 200}px`,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${gradientFrom}20 0%, ${gradientTo}10 40%, transparent 70%)`,
          opacity: glowProgress,
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />

      {/* Decorative rings */}
      {[1, 2, 3].map((ring) => (
        <div
          key={ring}
          style={{
            position: 'absolute',
            top: '45%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: `${200 + ring * 150}px`,
            height: `${200 + ring * 150}px`,
            borderRadius: '50%',
            border: `1px solid ${accent}${Math.round(glowProgress * (15 - ring * 3)).toString(16).padStart(2, '0')}`,
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* Gradient Headline */}
      <motion.h1
        style={{
          position: 'relative',
          zIndex: 1,
          fontSize: 'clamp(2.5rem, 5vw, 4rem)',
          fontWeight: 800,
          textAlign: 'center',
          letterSpacing: '-0.03em',
          lineHeight: 1.1,
          maxWidth: '800px',
          margin: 0,
          background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          opacity: headlineProgress,
          transform: `translateY(${(1 - headlineProgress) * 40}px) scale(${0.85 + headlineProgress * 0.15})`,
        }}
      >
        {headline}
      </motion.h1>

      {/* Subtext */}
      {subtext && (
        <motion.p
          style={{
            position: 'relative',
            zIndex: 1,
            fontSize: 'clamp(1rem, 1.8vw, 1.35rem)',
            fontWeight: 400,
            color: `${textColor}88`,
            textAlign: 'center',
            lineHeight: 1.6,
            maxWidth: '550px',
            margin: 0,
            marginTop: '1.25rem',
            opacity: subtextProgress,
            transform: `translateY(${(1 - subtextProgress) * 20}px)`,
          }}
        >
          {subtext}
        </motion.p>
      )}

      {/* CTA Button with pulse */}
      {buttonText && (
        <motion.div
          style={{
            position: 'relative',
            zIndex: 1,
            marginTop: '2.5rem',
            opacity: buttonProgress,
            transform: `scale(${buttonProgress * pulseScale})`,
          }}
        >
          {/* Button glow */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '140%',
              height: '250%',
              borderRadius: '100px',
              background: `radial-gradient(ellipse, ${gradientFrom}${Math.round(pulseGlowOpacity * 40).toString(16).padStart(2, '0')} 0%, transparent 70%)`,
              filter: 'blur(20px)',
              pointerEvents: 'none',
            }}
          />

          <div
            style={{
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '1rem 3rem',
              borderRadius: '100px',
              background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
              color: '#ffffff',
              fontSize: '1.2rem',
              fontWeight: 700,
              letterSpacing: '-0.01em',
              boxShadow: `0 0 40px ${gradientFrom}40, 0 8px 25px ${gradientFrom}30`,
              cursor: 'pointer',
            }}
          >
            {buttonText}
            <svg
              width="20"
              height="20"
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
        </motion.div>
      )}

      {/* Bottom spark line */}
      <div
        style={{
          position: 'absolute',
          bottom: '15%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: `${clamp(progress * 2, 0, 1) * 300}px`,
          height: '1px',
          background: `linear-gradient(90deg, transparent, ${accent}60, transparent)`,
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}
