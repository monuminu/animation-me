'use client'

import { motion } from 'framer-motion'

interface SceneProps {
  isActive: boolean
  progress: number
  onComplete: () => void
  data: Record<string, unknown>
}

interface StatItem {
  value: number
  label: string
  prefix?: string
  suffix?: string
}

interface StatsData {
  title?: string
  stats: StatItem[]
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

function easeOutExpo(t: number) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
}

function formatNumber(value: number): string {
  if (Number.isInteger(value)) {
    return value.toLocaleString()
  }
  return value.toFixed(1)
}

function StatCard({
  stat,
  cardProgress,
  countProgress,
  textColor,
  accent,
}: {
  stat: StatItem
  cardProgress: number
  countProgress: number
  textColor: string
  accent: string
}) {
  const eased = easeOutCubic(cardProgress)
  const currentValue = stat.value * countProgress

  return (
    <motion.div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '2rem 1.5rem',
        opacity: eased,
        transform: `translateY(${(1 - eased) * 40}px) scale(${0.9 + eased * 0.1})`,
      }}
    >
      {/* Number */}
      <div
        style={{
          fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
          fontWeight: 800,
          color: textColor,
          letterSpacing: '-0.04em',
          lineHeight: 1,
          fontVariantNumeric: 'tabular-nums',
          position: 'relative',
        }}
      >
        {stat.prefix ?? ''}
        {formatNumber(currentValue)}
        {stat.suffix ?? ''}

        {/* Underline accent */}
        <div
          style={{
            position: 'absolute',
            bottom: '-8px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: `${eased * 40}px`,
            height: '3px',
            borderRadius: '2px',
            background: `linear-gradient(90deg, ${accent}, ${accent}80)`,
          }}
        />
      </div>

      {/* Label */}
      <p
        style={{
          fontSize: 'clamp(0.85rem, 1.2vw, 1.1rem)',
          fontWeight: 500,
          color: `${textColor}70`,
          margin: 0,
          marginTop: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          textAlign: 'center',
        }}
      >
        {stat.label}
      </p>
    </motion.div>
  )
}

export function StatsScene({ isActive, progress, onComplete, data }: SceneProps) {
  const {
    title,
    stats = [],
    colors,
  } = data as unknown as StatsData

  const bg = colors?.bg ?? '#0d1117'
  const textColor = colors?.text ?? '#e6edf3'
  const accent = colors?.accent ?? '#7c3aed'

  // Title: 0-0.25, Cards stagger: 0.1-0.5, Counter: 0.2-0.85
  const titleProgress = easeOutCubic(clamp(progress / 0.25, 0, 1))
  const totalStats = stats.length
  const counterProgress = easeOutExpo(clamp((progress - 0.2) / 0.65, 0, 1))

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
        padding: '3rem 4rem',
        overflow: 'hidden',
        fontFamily:
          "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '800px',
          height: '400px',
          borderRadius: '50%',
          background: `radial-gradient(ellipse, ${accent}10 0%, transparent 70%)`,
          opacity: titleProgress,
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />

      {/* Title */}
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
            marginBottom: '3rem',
            opacity: titleProgress,
            transform: `translateY(${(1 - titleProgress) * 30}px)`,
          }}
        >
          {title}
        </motion.h2>
      )}

      {/* Stats Row */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '3rem',
          maxWidth: '1000px',
          width: '100%',
        }}
      >
        {stats.map((stat, i) => {
          const cardDelay = 0.1 + (i / totalStats) * 0.35
          const cardProgress = clamp((progress - cardDelay) / 0.2, 0, 1)

          return (
            <StatCard
              key={i}
              stat={stat}
              cardProgress={cardProgress}
              countProgress={counterProgress}
              textColor={textColor}
              accent={accent}
            />
          )
        })}
      </div>

      {/* Decorative bottom line */}
      <div
        style={{
          position: 'absolute',
          bottom: '12%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: `${clamp(progress * 1.5, 0, 1) * 200}px`,
          height: '1px',
          background: `linear-gradient(90deg, transparent, ${accent}40, transparent)`,
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}
