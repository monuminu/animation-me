'use client'

import { motion } from 'framer-motion'

interface SceneProps {
  isActive: boolean
  progress: number
  onComplete: () => void
  data: Record<string, unknown>
}

interface FeatureItem {
  title: string
  description?: string
  icon?: string
}

interface FeatureGridData {
  title?: string
  features: FeatureItem[]
  colors?: {
    bg: string
    text: string
    accent: string
    cardBg: string
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3)
}

function FeatureCard({
  feature,
  index,
  cardProgress,
  textColor,
  accent,
  cardBg,
}: {
  feature: FeatureItem
  index: number
  cardProgress: number
  textColor: string
  accent: string
  cardBg: string
}) {
  const eased = easeOutCubic(cardProgress)

  // Default icon: first letter of title, or the provided emoji/icon string
  const iconContent = feature.icon ?? feature.title.charAt(0).toUpperCase()
  const isEmoji =
    feature.icon != null &&
    feature.icon.length <= 2 &&
    !/^[a-zA-Z0-9]$/.test(feature.icon)

  return (
    <motion.div
      style={{
        background: cardBg,
        borderRadius: '16px',
        padding: 'clamp(1.25rem, 2.5vw, 2rem)',
        border: `1px solid ${accent}18`,
        opacity: eased,
        transform: `translateY(${(1 - eased) * 40}px) scale(${0.92 + eased * 0.08})`,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Card top accent line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: `linear-gradient(90deg, transparent, ${accent}${Math.round(eased * 80).toString(16).padStart(2, '0')}, transparent)`,
        }}
      />

      {/* Icon */}
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          background: `${accent}18`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: isEmoji ? '1.5rem' : '1.25rem',
          fontWeight: 700,
          color: accent,
          flexShrink: 0,
        }}
      >
        {iconContent}
      </div>

      {/* Title */}
      <h3
        style={{
          fontSize: '1.15rem',
          fontWeight: 700,
          color: textColor,
          margin: 0,
          letterSpacing: '-0.01em',
          lineHeight: 1.3,
        }}
      >
        {feature.title}
      </h3>

      {/* Description */}
      {feature.description && (
        <p
          style={{
            fontSize: '0.9rem',
            fontWeight: 400,
            color: `${textColor}80`,
            margin: 0,
            lineHeight: 1.6,
          }}
        >
          {feature.description}
        </p>
      )}
    </motion.div>
  )
}

export function FeatureGridScene({ isActive, progress, onComplete, data }: SceneProps) {
  const {
    title,
    features = [],
    colors,
  } = data as unknown as FeatureGridData

  const bg = colors?.bg ?? '#0d1117'
  const textColor = colors?.text ?? '#e6edf3'
  const accent = colors?.accent ?? '#7c3aed'
  const cardBg = colors?.cardBg ?? '#161b22'

  // Title animates in from 0-0.2, cards stagger from 0.15-0.9
  const titleProgress = easeOutCubic(clamp(progress / 0.2, 0, 1))
  const cardsStartAt = 0.15
  const cardsEndAt = 0.9
  const totalCards = features.length
  // Determine grid layout
  const columns = totalCards <= 4 ? 2 : 3

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
      {/* Background mesh gradient */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(ellipse at 20% 80%, ${accent}08 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, ${accent}08 0%, transparent 50%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Section Title */}
      {title && (
        <motion.h2
          style={{
            position: 'relative',
            zIndex: 1,
            fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
            fontWeight: 800,
            color: textColor,
            textAlign: 'center',
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
            margin: 0,
            marginBottom: '2.5rem',
            opacity: titleProgress,
            transform: `translateY(${(1 - titleProgress) * 30}px)`,
          }}
        >
          {title}
        </motion.h2>
      )}

      {/* Feature Grid */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fit, minmax(min(250px, 100%), 1fr))`,
          gap: '1.25rem',
          maxWidth: '900px',
          width: '100%',
        }}
      >
        {features.map((feature, i) => {
          // Stagger: each card gets an evenly distributed slice of the cards progress window
          const cardDelay = cardsStartAt + (i / totalCards) * (cardsEndAt - cardsStartAt - 0.15)
          const cardDuration = 0.2
          const cardProgress = clamp((progress - cardDelay) / cardDuration, 0, 1)

          return (
            <FeatureCard
              key={i}
              feature={feature}
              index={i}
              cardProgress={cardProgress}
              textColor={textColor}
              accent={accent}
              cardBg={cardBg}
            />
          )
        })}
      </div>
    </div>
  )
}
