'use client'

import { motion } from 'framer-motion'
import { clamp, easeOutCubic, easeOutExpo, resolveSceneColors, FONTS } from '@/lib/video'
import type { SceneProps } from '@/types'

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
        gap: '0.35rem',
        padding: 'clamp(1rem, 2vw, 2rem) clamp(1rem, 1.5vw, 1.5rem)',
        opacity: eased,
        transform: `translateY(${(1 - eased) * 40}px) scale(${0.9 + eased * 0.1})`,
      }}
    >
      {/* Number */}
      <div
        style={{
          fontSize: 'clamp(1.5rem, 3.5vw, 3rem)',
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
          fontSize: 'clamp(0.7rem, 1.1vw, 1rem)',
          fontWeight: 500,
          color: `${textColor}70`,
          margin: 0,
          marginTop: '0.5rem',
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

  const { bg, text: textColor, accent } = resolveSceneColors(colors)

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
        padding: 'clamp(1.5rem, 3vw, 3rem) clamp(1.5rem, 4vw, 4rem)',
        overflow: 'hidden',
        fontFamily: FONTS.primary,
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
            marginBottom: 'clamp(1.5rem, 3vw, 3rem)',
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
          gap: 'clamp(1.5rem, 3vw, 3rem)',
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
