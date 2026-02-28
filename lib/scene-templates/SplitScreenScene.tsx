'use client'

import { motion } from 'framer-motion'

interface SceneProps {
  isActive: boolean
  progress: number
  onComplete: () => void
  data: Record<string, unknown>
}

interface SplitScreenData {
  headline: string
  description?: string
  imageUrl?: string
  direction?: 'left-text' | 'right-text'
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

function easeOutQuint(t: number) {
  return 1 - Math.pow(1 - t, 5)
}

export function SplitScreenScene({ isActive, progress, onComplete, data }: SceneProps) {
  const {
    headline = 'Split Screen',
    description,
    imageUrl,
    direction = 'left-text',
    colors,
  } = data as unknown as SplitScreenData

  const bg = colors?.bg ?? '#0d1117'
  const textColor = colors?.text ?? '#e6edf3'
  const accent = colors?.accent ?? '#7c3aed'

  const isLeftText = direction === 'left-text'

  // Left side slides in from left, right side from right
  // Text side: 0-0.5, Visual side: 0.15-0.65, description: 0.3-0.7
  const textSideProgress = easeOutQuint(clamp(progress / 0.5, 0, 1))
  const visualSideProgress = easeOutQuint(clamp((progress - 0.15) / 0.5, 0, 1))
  const descriptionProgress = easeOutCubic(clamp((progress - 0.3) / 0.4, 0, 1))
  const accentLineProgress = easeOutCubic(clamp((progress - 0.1) / 0.4, 0, 1))

  if (progress >= 1 && isActive) {
    onComplete()
  }

  const textContent = (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '3rem',
        opacity: textSideProgress,
        transform: `translateX(${(1 - textSideProgress) * (isLeftText ? -80 : 80)}px)`,
      }}
    >
      {/* Accent line */}
      <div
        style={{
          width: `${accentLineProgress * 60}px`,
          height: '3px',
          background: `linear-gradient(90deg, ${accent}, ${accent}80)`,
          marginBottom: '1.5rem',
          borderRadius: '2px',
        }}
      />

      <motion.h2
        style={{
          fontSize: 'clamp(2rem, 4vw, 3.5rem)',
          fontWeight: 800,
          color: textColor,
          letterSpacing: '-0.03em',
          lineHeight: 1.1,
          margin: 0,
        }}
      >
        {headline}
      </motion.h2>

      {description && (
        <motion.p
          style={{
            fontSize: 'clamp(0.95rem, 1.5vw, 1.2rem)',
            fontWeight: 400,
            color: `${textColor}88`,
            lineHeight: 1.7,
            margin: 0,
            marginTop: '1.25rem',
            maxWidth: '450px',
            opacity: descriptionProgress,
            transform: `translateY(${(1 - descriptionProgress) * 20}px)`,
          }}
        >
          {description}
        </motion.p>
      )}
    </div>
  )

  const visualContent = (
    <div
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem',
        opacity: visualSideProgress,
        transform: `translateX(${(1 - visualSideProgress) * (isLeftText ? 80 : -80)}px)`,
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '480px',
          aspectRatio: '4 / 3',
          borderRadius: '16px',
          overflow: 'hidden',
          background: imageUrl ? 'transparent' : `linear-gradient(135deg, ${accent}20, ${accent}08)`,
          border: `1px solid ${accent}25`,
          boxShadow: `0 20px 60px ${bg === '#0d1117' ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.15)'}, 0 0 40px ${accent}10`,
        }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt=""
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          /* Placeholder visual */
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            {/* Decorative circles */}
            <div
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: `radial-gradient(circle, ${accent}30, ${accent}10)`,
                position: 'absolute',
              }}
            />
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                border: `2px solid ${accent}40`,
                position: 'absolute',
              }}
            />
            <div
              style={{
                width: '180px',
                height: '180px',
                borderRadius: '50%',
                border: `1px solid ${accent}15`,
                position: 'absolute',
              }}
            />
          </div>
        )}

        {/* Shine overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(135deg, transparent 40%, ${accent}08 50%, transparent 60%)`,
            pointerEvents: 'none',
          }}
        />
      </div>
    </div>
  )

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        backgroundColor: bg,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'stretch',
        overflow: 'hidden',
        fontFamily:
          "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* Subtle center divider glow */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '1px',
          height: `${textSideProgress * 60}%`,
          background: `linear-gradient(180deg, transparent, ${accent}30, transparent)`,
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />

      {/* Background gradient */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(ellipse at ${isLeftText ? '70%' : '30%'} 50%, ${accent}08 0%, transparent 60%)`,
          pointerEvents: 'none',
        }}
      />

      {isLeftText ? (
        <>
          {textContent}
          {visualContent}
        </>
      ) : (
        <>
          {visualContent}
          {textContent}
        </>
      )}
    </div>
  )
}
