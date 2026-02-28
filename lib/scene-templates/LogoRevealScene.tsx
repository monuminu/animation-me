'use client'

import { motion } from 'framer-motion'
import type { SceneProps } from '@/types'
import { clamp, easeOutCubic, spring, SPRING_PRESETS, resolveSceneColors, FONTS } from '@/lib/video'

interface LogoRevealData {
  brandName: string
  tagline?: string
  logoUrl?: string
  colors?: {
    bg: string
    text: string
    accent: string
  }
}

export function LogoRevealScene({ isActive, progress, onComplete, data }: SceneProps) {
  const {
    brandName = 'Brand',
    tagline,
    logoUrl,
    colors,
  } = data as unknown as LogoRevealData

  const { bg, text: textColor, accent } = resolveSceneColors(colors)

  // Timing: logo 0-0.4, brandName types 0.25-0.7, tagline fades 0.65-0.9
  const logoProgress = spring(clamp(progress / 0.4, 0, 1), SPRING_PRESETS.snappy)
  const glowProgress = easeOutCubic(clamp(progress / 0.5, 0, 1))

  // Brand name character-by-character type-out
  const nameStart = 0.25
  const nameEnd = 0.7
  const nameProgress = clamp((progress - nameStart) / (nameEnd - nameStart), 0, 1)
  const visibleChars = Math.floor(nameProgress * brandName.length)
  const showCursor = nameProgress > 0 && nameProgress < 1

  // Tagline fade in
  const taglineProgress = tagline ? easeOutCubic(clamp((progress - 0.65) / 0.25, 0, 1)) : 0

  if (progress >= 1 && isActive) {
    onComplete()
  }

  // Generate a placeholder logo from brand initials when no logoUrl
  const initials = brandName
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')

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
      {/* Background radial glow */}
      <div
        style={{
          position: 'absolute',
          top: '40%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '700px',
          height: '700px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${accent}18 0%, ${accent}08 35%, transparent 65%)`,
          opacity: glowProgress,
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      />

      {/* Expanding ring behind logo */}
      <div
        style={{
          position: 'absolute',
          top: '38%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: `${80 + logoProgress * 60}px`,
          height: `${80 + logoProgress * 60}px`,
          borderRadius: '50%',
          border: `1.5px solid ${accent}${Math.round(logoProgress * 30).toString(16).padStart(2, '0')}`,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '38%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: `${120 + logoProgress * 100}px`,
          height: `${120 + logoProgress * 100}px`,
          borderRadius: '50%',
          border: `1px solid ${accent}${Math.round(logoProgress * 15).toString(16).padStart(2, '0')}`,
          pointerEvents: 'none',
        }}
      />

      {/* Logo */}
      <motion.div
        style={{
          position: 'relative',
          zIndex: 1,
          opacity: logoProgress,
          transform: `scale(${logoProgress})`,
          marginBottom: '2rem',
        }}
      >
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={brandName}
            style={{
              width: '100px',
              height: '100px',
              objectFit: 'contain',
              filter: `drop-shadow(0 0 20px ${accent}40)`,
            }}
          />
        ) : (
          /* Placeholder logo: styled initials */
          <div
            style={{
              width: '100px',
              height: '100px',
              borderRadius: '24px',
              background: `linear-gradient(135deg, ${accent}, ${accent}88)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.5rem',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-0.02em',
              boxShadow: `0 0 40px ${accent}40, 0 8px 30px ${accent}25`,
            }}
          >
            {initials}
          </div>
        )}
      </motion.div>

      {/* Brand Name - character by character */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          fontSize: 'clamp(2rem, 4vw, 3.5rem)',
          fontWeight: 800,
          color: textColor,
          letterSpacing: '-0.03em',
          lineHeight: 1.2,
          textAlign: 'center',
          minHeight: '1.3em',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Visible characters */}
        {brandName.split('').map((char, i) => (
          <span
            key={i}
            style={{
              opacity: i < visibleChars ? 1 : 0,
              display: 'inline-block',
              transform: i < visibleChars ? 'translateY(0)' : 'translateY(8px)',
              transition: 'none',
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}

        {/* Typing cursor — progress-driven blink (deterministic for Remotion export) */}
        {showCursor && (
          <span
            style={{
              display: 'inline-block',
              width: '3px',
              height: '0.85em',
              backgroundColor: accent,
              marginLeft: '3px',
              verticalAlign: 'text-bottom',
              opacity: Math.sin(nameProgress * Math.PI * 8) > 0 ? 1 : 0,
            }}
          />
        )}
      </div>

      {/* Tagline */}
      {tagline && (
        <motion.p
          style={{
            position: 'relative',
            zIndex: 1,
            fontSize: 'clamp(0.9rem, 1.5vw, 1.25rem)',
            fontWeight: 400,
            color: `${textColor}80`,
            textAlign: 'center',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            margin: 0,
            marginTop: '1rem',
            opacity: taglineProgress,
            transform: `translateY(${(1 - taglineProgress) * 15}px)`,
          }}
        >
          {tagline}
        </motion.p>
      )}

      {/* Bottom accent line */}
      <div
        style={{
          position: 'absolute',
          bottom: '12%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: `${easeOutCubic(clamp(progress * 1.5, 0, 1)) * 200}px`,
          height: '2px',
          background: `linear-gradient(90deg, transparent, ${accent}80, transparent)`,
          borderRadius: '1px',
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}
