'use client'

import { motion } from 'framer-motion'

interface SceneProps {
  isActive: boolean
  progress: number
  onComplete: () => void
  data: Record<string, unknown>
}

interface LogoItem {
  name: string
  logoUrl?: string
}

interface LogoGridData {
  title?: string
  logos: LogoItem[]
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

function LogoCell({
  logo,
  cellProgress,
  textColor,
  accent,
}: {
  logo: LogoItem
  cellProgress: number
  textColor: string
  accent: string
}) {
  const eased = easeOutCubic(cellProgress)

  return (
    <motion.div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        borderRadius: '12px',
        background: `#161b22`,
        border: `1px solid ${accent}12`,
        opacity: eased,
        transform: `scale(${0.7 + eased * 0.3})`,
        aspectRatio: '1',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle hover-like glow on reveal */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 50% 50%, ${accent}08, transparent 70%)`,
          opacity: eased,
          pointerEvents: 'none',
        }}
      />

      {logo.logoUrl ? (
        <img
          src={logo.logoUrl}
          alt={logo.name}
          style={{
            maxWidth: '70%',
            maxHeight: '70%',
            objectFit: 'contain',
            filter: 'brightness(0.9)',
          }}
        />
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
          }}
        >
          {/* Letter avatar */}
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '10px',
              background: `linear-gradient(135deg, ${accent}30, ${accent}15)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.3rem',
              fontWeight: 800,
              color: accent,
            }}
          >
            {logo.name.charAt(0).toUpperCase()}
          </div>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: `${textColor}80`,
              textAlign: 'center',
              letterSpacing: '-0.01em',
              lineHeight: 1.2,
              maxWidth: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {logo.name}
          </span>
        </div>
      )}
    </motion.div>
  )
}

export function LogoGridScene({ isActive, progress, onComplete, data }: SceneProps) {
  const {
    title,
    logos = [],
    colors,
  } = data as unknown as LogoGridData

  const bg = colors?.bg ?? '#0d1117'
  const textColor = colors?.text ?? '#e6edf3'
  const accent = colors?.accent ?? '#7c3aed'

  // Title: 0-0.2, logos stagger: 0.15-0.85
  const titleProgress = easeOutCubic(clamp(progress / 0.2, 0, 1))
  const totalLogos = logos.length

  // Determine columns based on count
  const columns = totalLogos <= 4 ? 2 : totalLogos <= 6 ? 3 : 4

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
        padding: 'clamp(1.5rem, 3vw, 3rem) clamp(1.5rem, 4vw, 4rem)',
        overflow: 'hidden',
        fontFamily:
          "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* Background */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(ellipse at 50% 50%, ${accent}06 0%, transparent 60%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Title */}
      {title && (
        <motion.h2
          style={{
            position: 'relative',
            zIndex: 1,
            fontSize: 'clamp(1.3rem, 2.5vw, 2rem)',
            fontWeight: 800,
            color: textColor,
            textAlign: 'center',
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
            margin: 0,
            marginBottom: '2.5rem',
            opacity: titleProgress,
            transform: `translateY(${(1 - titleProgress) * 25}px)`,
          }}
        >
          {title}
        </motion.h2>
      )}

      {/* Logo Grid */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fit, minmax(min(100px, 100%), 1fr))`,
          gap: '1rem',
          maxWidth: '560px',
          width: '100%',
        }}
      >
        {logos.map((logo, i) => {
          // Stagger each logo
          const cellDelay = 0.15 + (i / totalLogos) * 0.6
          const cellProgress = clamp((progress - cellDelay) / 0.15, 0, 1)

          return (
            <LogoCell
              key={i}
              logo={logo}
              cellProgress={cellProgress}
              textColor={textColor}
              accent={accent}
            />
          )
        })}
      </div>

      {/* Decorative bottom accent */}
      <div
        style={{
          position: 'absolute',
          bottom: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: `${clamp(progress * 1.5, 0, 1) * 150}px`,
          height: '1px',
          background: `linear-gradient(90deg, transparent, ${accent}30, transparent)`,
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}
