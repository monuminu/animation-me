'use client'

import { motion } from 'framer-motion'
import { clamp, easeOutCubic, easeOutQuart, resolveSceneColors, FONTS } from '@/lib/video'
import type { SceneProps } from '@/types'

interface ComparisonSide {
  label: string
  items: string[]
}

interface ComparisonData {
  title?: string
  before: ComparisonSide
  after: ComparisonSide
  colors?: {
    bg: string
    text: string
    accent: string
  }
}

function ComparisonCard({
  side,
  sideProgress,
  itemsBaseDelay,
  progress,
  textColor,
  accent,
  isBefore,
}: {
  side: ComparisonSide
  sideProgress: number
  itemsBaseDelay: number
  progress: number
  textColor: string
  accent: string
  isBefore: boolean
}) {
  const eased = easeOutCubic(sideProgress)
  const totalItems = side.items.length
  const cardBg = isBefore ? '#161b22' : '#0f1a15'
  const itemColor = isBefore ? '#f85149' : '#3fb950'

  return (
    <motion.div
      style={{
        flex: 1,
        background: cardBg,
        borderRadius: '16px',
        padding: 'clamp(1.25rem, 2.5vw, 2rem)',
        border: `1px solid ${isBefore ? '#f8514920' : `${accent}20`}`,
        opacity: eased,
        transform: `translateX(${(1 - eased) * (isBefore ? -50 : 50)}px)`,
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        minWidth: '200px',
      }}
    >
      {/* Label */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: itemColor,
            boxShadow: `0 0 8px ${itemColor}60`,
          }}
        />
        <span
          style={{
            fontSize: '0.85rem',
            fontWeight: 700,
            color: itemColor,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          {side.label}
        </span>
      </div>

      {/* Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {side.items.map((item, i) => {
          const itemDelay = itemsBaseDelay + (i / totalItems) * 0.2
          const itemProgress = easeOutCubic(clamp((progress - itemDelay) / 0.12, 0, 1))

          return (
            <motion.div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                opacity: itemProgress,
                transform: `translateX(${(1 - itemProgress) * 20}px)`,
              }}
            >
              {/* Icon */}
              <span
                style={{
                  fontSize: '0.9rem',
                  lineHeight: '1.6',
                  flexShrink: 0,
                  color: itemColor,
                }}
              >
                {isBefore ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={itemColor} strokeWidth="2.5" strokeLinecap="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={itemColor} strokeWidth="2.5" strokeLinecap="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                )}
              </span>

              {/* Text */}
              <span
                style={{
                  fontSize: '0.95rem',
                  fontWeight: 400,
                  color: `${textColor}${isBefore ? '70' : 'cc'}`,
                  lineHeight: 1.5,
                  textDecoration: isBefore ? 'line-through' : 'none',
                  textDecorationColor: `${textColor}30`,
                }}
              >
                {item}
              </span>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}

export function ComparisonScene({ isActive, progress, onComplete, data }: SceneProps) {
  const {
    title,
    before = { label: 'Before', items: [] },
    after = { label: 'After', items: [] },
    colors,
  } = data as unknown as ComparisonData

  const { bg, text: textColor, accent } = resolveSceneColors(colors)

  // Title: 0-0.2, Before card: 0.1-0.4, VS badge: 0.35-0.55, After card: 0.4-0.7
  // Before items: 0.25-0.55, After items: 0.5-0.85
  const titleProgress = easeOutCubic(clamp(progress / 0.2, 0, 1))
  const beforeProgress = easeOutQuart(clamp((progress - 0.1) / 0.3, 0, 1))
  const vsBadgeProgress = easeOutCubic(clamp((progress - 0.35) / 0.2, 0, 1))
  const afterProgress = easeOutQuart(clamp((progress - 0.4) / 0.3, 0, 1))

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
        padding: 'clamp(1.5rem, 3vw, 3rem) clamp(1.5rem, 3vw, 3rem)',
        overflow: 'hidden',
        fontFamily: FONTS.primary,
      }}
    >
      {/* Background gradient */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(ellipse at 25% 50%, #f8514908 0%, transparent 50%),
            radial-gradient(ellipse at 75% 50%, ${accent}08 0%, transparent 50%)
          `,
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
            marginBottom: '2.5rem',
            opacity: titleProgress,
            transform: `translateY(${(1 - titleProgress) * 30}px)`,
          }}
        >
          {title}
        </motion.h2>
      )}

      {/* Comparison row */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          alignItems: 'stretch',
          flexWrap: 'wrap',
          gap: 'clamp(1rem, 2vw, 2rem)',
          maxWidth: '850px',
          width: '100%',
        }}
      >
        {/* Before */}
        <ComparisonCard
          side={before}
          sideProgress={beforeProgress}
          itemsBaseDelay={0.25}
          progress={progress}
          textColor={textColor}
          accent={accent}
          isBefore={true}
        />

        {/* VS Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <motion.div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '0.05em',
              boxShadow: `0 0 24px ${accent}40`,
              opacity: vsBadgeProgress,
              transform: `scale(${vsBadgeProgress}) rotate(${(1 - vsBadgeProgress) * 180}deg)`,
              flexShrink: 0,
            }}
          >
            VS
          </motion.div>

          {/* Arrow from before to after */}
          <svg
            width="48"
            height="20"
            viewBox="0 0 48 20"
            fill="none"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, 30px)',
              opacity: vsBadgeProgress * 0.4,
            }}
          >
            <path
              d="M4 10h36m0 0l-6-6m6 6l-6 6"
              stroke={accent}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="50"
              strokeDashoffset={50 - vsBadgeProgress * 50}
            />
          </svg>
        </div>

        {/* After */}
        <ComparisonCard
          side={after}
          sideProgress={afterProgress}
          itemsBaseDelay={0.5}
          progress={progress}
          textColor={textColor}
          accent={accent}
          isBefore={false}
        />
      </div>
    </div>
  )
}
