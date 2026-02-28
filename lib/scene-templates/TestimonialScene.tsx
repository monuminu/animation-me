'use client'

import { motion } from 'framer-motion'

interface SceneProps {
  isActive: boolean
  progress: number
  onComplete: () => void
  data: Record<string, unknown>
}

interface TestimonialData {
  quote: string
  author: string
  role?: string
  company?: string
  avatarUrl?: string
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

function easeOutQuart(t: number) {
  return 1 - Math.pow(1 - t, 4)
}

export function TestimonialScene({ isActive, progress, onComplete, data }: SceneProps) {
  const {
    quote = '',
    author = '',
    role,
    company,
    avatarUrl,
    colors,
  } = data as unknown as TestimonialData

  const bg = colors?.bg ?? '#0d1117'
  const textColor = colors?.text ?? '#e6edf3'
  const accent = colors?.accent ?? '#7c3aed'

  // Timing: quotation mark 0-0.2, quote text 0.1-0.55, attribution 0.45-0.75, line 0.3-0.6
  const quoteMarkProgress = easeOutCubic(clamp(progress / 0.2, 0, 1))
  const quoteTextProgress = easeOutQuart(clamp((progress - 0.1) / 0.45, 0, 1))
  const lineProgress = easeOutCubic(clamp((progress - 0.3) / 0.3, 0, 1))
  const attributionProgress = easeOutCubic(clamp((progress - 0.45) / 0.3, 0, 1))
  const avatarProgress = easeOutCubic(clamp((progress - 0.4) / 0.3, 0, 1))

  if (progress >= 1 && isActive) {
    onComplete()
  }

  const attribution = [role, company].filter(Boolean).join(', ')

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
      {/* Background glow */}
      <div
        style={{
          position: 'absolute',
          top: '40%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '700px',
          height: '500px',
          borderRadius: '50%',
          background: `radial-gradient(ellipse, ${accent}08 0%, transparent 60%)`,
          opacity: quoteMarkProgress,
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }}
      />

      {/* Large decorative quotation mark */}
      <motion.div
        style={{
          position: 'absolute',
          top: '15%',
          left: '10%',
          fontSize: 'clamp(8rem, 15vw, 14rem)',
          fontWeight: 900,
          lineHeight: 1,
          color: accent,
          opacity: quoteMarkProgress * 0.12,
          transform: `scale(${0.8 + quoteMarkProgress * 0.2}) rotate(${(1 - quoteMarkProgress) * -10}deg)`,
          pointerEvents: 'none',
          userSelect: 'none',
          fontFamily: 'Georgia, "Times New Roman", serif',
        }}
      >
        {'\u201C'}
      </motion.div>

      {/* Quote container */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: '750px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2rem',
        }}
      >
        {/* Inline quote mark (smaller, functional) */}
        <motion.span
          style={{
            fontSize: '3rem',
            fontWeight: 700,
            color: accent,
            lineHeight: 1,
            opacity: quoteMarkProgress,
            transform: `translateY(${(1 - quoteMarkProgress) * 20}px)`,
            fontFamily: 'Georgia, "Times New Roman", serif',
          }}
        >
          {'\u201C'}
        </motion.span>

        {/* Quote text */}
        <motion.blockquote
          style={{
            fontSize: 'clamp(1.2rem, 2.5vw, 1.8rem)',
            fontWeight: 400,
            color: textColor,
            textAlign: 'center',
            lineHeight: 1.7,
            letterSpacing: '-0.01em',
            margin: 0,
            fontStyle: 'italic',
            opacity: quoteTextProgress,
            transform: `translateY(${(1 - quoteTextProgress) * 30}px)`,
          }}
        >
          {quote}
        </motion.blockquote>

        {/* Divider line */}
        <div
          style={{
            width: `${lineProgress * 60}px`,
            height: '2px',
            background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
            borderRadius: '1px',
          }}
        />

        {/* Attribution row */}
        <motion.div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            opacity: attributionProgress,
            transform: `translateY(${(1 - attributionProgress) * 20}px)`,
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              overflow: 'hidden',
              background: avatarUrl ? 'transparent' : `linear-gradient(135deg, ${accent}40, ${accent}20)`,
              border: `2px solid ${accent}30`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              opacity: avatarProgress,
              transform: `scale(${avatarProgress})`,
            }}
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt=""
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <span
                style={{
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  color: accent,
                }}
              >
                {author.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          {/* Name & role */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.15rem',
            }}
          >
            <span
              style={{
                fontSize: '1.05rem',
                fontWeight: 700,
                color: textColor,
                letterSpacing: '-0.01em',
              }}
            >
              {author}
            </span>
            {attribution && (
              <span
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 400,
                  color: `${textColor}60`,
                }}
              >
                {attribution}
              </span>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
