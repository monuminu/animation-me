'use client'

import { motion } from 'framer-motion'
import type { SceneProps } from '@/types'
import { clamp, easeOutCubic, resolveSceneColors, FONTS } from '@/lib/video'

interface TextRevealData {
  headline: string
  subtitle?: string
  style?: 'word-by-word' | 'typewriter' | 'fade-up'
  colors?: {
    bg: string
    text: string
    accent: string
  }
}

function WordByWordReveal({
  text,
  progress,
  textColor,
  accentColor,
  isSubtitle = false,
}: {
  text: string
  progress: number
  textColor: string
  accentColor: string
  isSubtitle?: boolean
}) {
  const words = text.split(' ')
  const totalWords = words.length

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '0.4em',
        fontSize: isSubtitle ? 'clamp(1rem, 2.5vw, 1.5rem)' : 'clamp(1.8rem, 5vw, 3.5rem)',
        fontWeight: isSubtitle ? 400 : 700,
        lineHeight: 1.3,
        letterSpacing: '-0.02em',
      }}
    >
      {words.map((word, i) => {
        const wordProgress = clamp((progress * totalWords - i) * 1.5, 0, 1)
        const isLastRevealed =
          i === Math.floor(progress * totalWords) && wordProgress > 0 && wordProgress < 1

        return (
          <motion.span
            key={i}
            style={{
              opacity: wordProgress,
              transform: `translateY(${(1 - wordProgress) * 20}px)`,
              color: isLastRevealed ? accentColor : textColor,
              display: 'inline-block',
            }}
          >
            {word}
          </motion.span>
        )
      })}
    </div>
  )
}

function TypewriterReveal({
  text,
  progress,
  textColor,
  accentColor,
  isSubtitle = false,
}: {
  text: string
  progress: number
  textColor: string
  accentColor: string
  isSubtitle?: boolean
}) {
  const charCount = Math.floor(progress * text.length)
  const visibleText = text.slice(0, charCount)
  const showCursor = progress > 0 && progress < 1

  return (
    <div
      style={{
        fontSize: isSubtitle ? 'clamp(1rem, 2.5vw, 1.5rem)' : 'clamp(1.8rem, 5vw, 3.5rem)',
        fontWeight: isSubtitle ? 400 : 700,
        fontFamily: FONTS.monoAlt,
        color: textColor,
        letterSpacing: '-0.01em',
        lineHeight: 1.3,
        textAlign: 'center',
        minHeight: isSubtitle ? '2em' : '1.5em',
      }}
    >
      {visibleText}
      {showCursor && (
        <span
          style={{
            display: 'inline-block',
            width: '3px',
            height: '1em',
            backgroundColor: accentColor,
            marginLeft: '2px',
            verticalAlign: 'text-bottom',
            opacity: Math.sin(progress * Math.PI * 10) > 0 ? 1 : 0,
          }}
        />
      )}
    </div>
  )
}

function FadeUpReveal({
  text,
  progress,
  textColor,
  isSubtitle = false,
}: {
  text: string
  progress: number
  textColor: string
  isSubtitle?: boolean
}) {
  const lines = text.split('\n').length > 1 ? text.split('\n') : [text]

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.3em',
      }}
    >
      {lines.map((line, i) => {
        const lineProgress = clamp((progress * lines.length - i) * 1.2, 0, 1)
        const eased = easeOutCubic(lineProgress)

        return (
          <div
            key={i}
            style={{
              fontSize: isSubtitle ? 'clamp(1rem, 2.5vw, 1.5rem)' : 'clamp(1.8rem, 5vw, 3.5rem)',
              fontWeight: isSubtitle ? 400 : 700,
              color: textColor,
              letterSpacing: '-0.02em',
              lineHeight: 1.3,
              opacity: eased,
              transform: `translateY(${(1 - eased) * 40}px)`,
            }}
          >
            {line}
          </div>
        )
      })}
    </div>
  )
}

export function TextRevealScene({ isActive, progress, onComplete, data }: SceneProps) {
  const {
    headline = 'Hello World',
    subtitle,
    style = 'word-by-word',
    colors,
  } = data as unknown as TextRevealData

  const { bg, text: textColor, accent } = resolveSceneColors(colors)

  // Split progress: headline gets 0-0.65, subtitle gets 0.55-1.0 (overlap for smooth feel)
  const headlineProgress = subtitle ? clamp(progress / 0.65, 0, 1) : progress
  const subtitleProgress = subtitle ? clamp((progress - 0.55) / 0.45, 0, 1) : 0

  if (progress >= 1 && isActive) {
    onComplete()
  }

  const renderReveal = (
    text: string,
    p: number,
    isSub: boolean
  ) => {
    switch (style) {
      case 'typewriter':
        return (
          <TypewriterReveal
            text={text}
            progress={p}
            textColor={isSub ? `${textColor}99` : textColor}
            accentColor={accent}
            isSubtitle={isSub}
          />
        )
      case 'fade-up':
        return (
          <FadeUpReveal
            text={text}
            progress={p}
            textColor={isSub ? `${textColor}99` : textColor}
            isSubtitle={isSub}
          />
        )
      case 'word-by-word':
      default:
        return (
          <WordByWordReveal
            text={text}
            progress={p}
            textColor={isSub ? `${textColor}99` : textColor}
            accentColor={accent}
            isSubtitle={isSub}
          />
        )
    }
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
        padding: 'clamp(1rem, 3vw, 2rem) clamp(1.5rem, 4vw, 4rem)',
        overflow: 'hidden',
        fontFamily: FONTS.primary,
      }}
    >
      {/* Subtle radial glow */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${accent}15 0%, transparent 70%)`,
          opacity: clamp(progress * 3, 0, 1),
          pointerEvents: 'none',
        }}
      />

      {/* Headline */}
      <div style={{ position: 'relative', zIndex: 1, maxWidth: '900px' }}>
        {renderReveal(headline, headlineProgress, false)}
      </div>

      {/* Subtitle */}
      {subtitle && (
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            maxWidth: '700px',
            marginTop: '1.5rem',
          }}
        >
          {renderReveal(subtitle, subtitleProgress, true)}
        </div>
      )}
    </div>
  )
}
