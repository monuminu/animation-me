'use client'

import { motion } from 'framer-motion'

interface SceneProps {
  isActive: boolean
  progress: number
  onComplete: () => void
  data: Record<string, unknown>
}

interface Milestone {
  year?: string
  title: string
  description?: string
}

interface TimelineData {
  title?: string
  milestones: Milestone[]
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

function MilestoneItem({
  milestone,
  index,
  itemProgress,
  textColor,
  accent,
  isLast,
}: {
  milestone: Milestone
  index: number
  itemProgress: number
  textColor: string
  accent: string
  isLast: boolean
}) {
  const eased = easeOutCubic(itemProgress)

  return (
    <div
      style={{
        display: 'flex',
        gap: '1.5rem',
        position: 'relative',
        paddingBottom: isLast ? 0 : '2rem',
      }}
    >
      {/* Timeline column: dot + connector line */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          width: '20px',
          flexShrink: 0,
        }}
      >
        {/* Dot */}
        <div
          style={{
            width: '14px',
            height: '14px',
            borderRadius: '50%',
            background: accent,
            border: `3px solid ${accent}40`,
            boxShadow: `0 0 12px ${accent}40`,
            flexShrink: 0,
            opacity: eased,
            transform: `scale(${eased})`,
            position: 'relative',
            zIndex: 2,
          }}
        />

        {/* Connector line (drawn as the item reveals) */}
        {!isLast && (
          <div
            style={{
              width: '2px',
              flex: 1,
              background: `linear-gradient(180deg, ${accent}50, ${accent}15)`,
              opacity: eased,
              transformOrigin: 'top',
              transform: `scaleY(${eased})`,
            }}
          />
        )}
      </div>

      {/* Content */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.35rem',
          paddingTop: '0px',
          opacity: eased,
          transform: `translateX(${(1 - eased) * 30}px)`,
        }}
      >
        {/* Year badge */}
        {milestone.year && (
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: accent,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              background: `${accent}15`,
              padding: '0.2rem 0.6rem',
              borderRadius: '4px',
              alignSelf: 'flex-start',
            }}
          >
            {milestone.year}
          </span>
        )}

        {/* Title */}
        <h3
          style={{
            fontSize: 'clamp(1rem, 1.5vw, 1.25rem)',
            fontWeight: 700,
            color: textColor,
            margin: 0,
            letterSpacing: '-0.01em',
            lineHeight: 1.3,
          }}
        >
          {milestone.title}
        </h3>

        {/* Description */}
        {milestone.description && (
          <p
            style={{
              fontSize: '0.9rem',
              fontWeight: 400,
              color: `${textColor}70`,
              margin: 0,
              lineHeight: 1.6,
              maxWidth: '400px',
            }}
          >
            {milestone.description}
          </p>
        )}
      </div>
    </div>
  )
}

export function TimelineScene({ isActive, progress, onComplete, data }: SceneProps) {
  const {
    title,
    milestones = [],
    colors,
  } = data as unknown as TimelineData

  const bg = colors?.bg ?? '#0d1117'
  const textColor = colors?.text ?? '#e6edf3'
  const accent = colors?.accent ?? '#7c3aed'

  // Title: 0-0.2, milestones stagger: 0.15-0.9
  const titleProgress = easeOutCubic(clamp(progress / 0.2, 0, 1))
  const totalMilestones = milestones.length

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
      {/* Background accent glow */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '25%',
          transform: 'translate(-50%, -50%)',
          width: '400px',
          height: '600px',
          borderRadius: '50%',
          background: `radial-gradient(ellipse, ${accent}06 0%, transparent 70%)`,
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
            marginBottom: '2.5rem',
            opacity: titleProgress,
            transform: `translateY(${(1 - titleProgress) * 30}px)`,
          }}
        >
          {title}
        </motion.h2>
      )}

      {/* Timeline */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          maxWidth: '550px',
          width: '100%',
          maxHeight: '70%',
          overflowY: 'hidden',
        }}
      >
        {milestones.map((milestone, i) => {
          const itemDelay = 0.15 + (i / totalMilestones) * 0.65
          const itemProgress = clamp((progress - itemDelay) / 0.15, 0, 1)

          return (
            <MilestoneItem
              key={i}
              milestone={milestone}
              index={i}
              itemProgress={itemProgress}
              textColor={textColor}
              accent={accent}
              isLast={i === totalMilestones - 1}
            />
          )
        })}
      </div>
    </div>
  )
}
