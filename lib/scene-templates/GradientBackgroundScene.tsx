'use client'

import { motion } from 'framer-motion'

interface SceneProps {
  isActive: boolean
  progress: number
  onComplete: () => void
  data: Record<string, unknown>
}

interface GradientBackgroundData {
  headline?: string
  subtitle?: string
  gradientColors?: string[]
  colors?: {
    bg: string
    text: string
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3)
}

function springInterpolation(t: number) {
  if (t <= 0) return 0
  if (t >= 1) return 1
  const decay = Math.exp(-6 * t)
  return 1 - decay * Math.cos(12 * t * Math.PI * 0.15)
}

export function GradientBackgroundScene({ isActive, progress, onComplete, data }: SceneProps) {
  const {
    headline,
    subtitle,
    gradientColors,
    colors,
  } = data as unknown as GradientBackgroundData

  const bg = colors?.bg ?? '#0d1117'
  const textColor = colors?.text ?? '#e6edf3'

  const gc = gradientColors && gradientColors.length >= 2
    ? gradientColors
    : ['#7c3aed', '#06b6d4', '#ec4899']

  // Timing: blobs fade in 0-0.3, movement 0-1.0, headline 0.15-0.5, subtitle 0.35-0.7
  const blobFadeIn = easeOutCubic(clamp(progress / 0.3, 0, 1))
  const headlineProgress = springInterpolation(clamp((progress - 0.15) / 0.35, 0, 1))
  const subtitleProgress = easeOutCubic(clamp((progress - 0.35) / 0.35, 0, 1))

  // Blob movement driven by progress — each blob moves on a unique path
  const blob1X = 30 + Math.sin(progress * Math.PI * 2.5) * 20
  const blob1Y = 25 + Math.cos(progress * Math.PI * 1.8) * 20
  const blob1Scale = 1 + Math.sin(progress * Math.PI * 3) * 0.15

  const blob2X = 65 + Math.sin(progress * Math.PI * 2 + 1.2) * 18
  const blob2Y = 60 + Math.cos(progress * Math.PI * 2.3 + 0.8) * 22
  const blob2Scale = 1 + Math.sin(progress * Math.PI * 2.5 + 0.5) * 0.2

  const blob3X = 50 + Math.sin(progress * Math.PI * 1.8 + 2.4) * 25
  const blob3Y = 40 + Math.cos(progress * Math.PI * 2.8 + 1.6) * 18
  const blob3Scale = 1 + Math.sin(progress * Math.PI * 2 + 1) * 0.18

  const blob4X = 75 + Math.sin(progress * Math.PI * 2.2 + 3.5) * 15
  const blob4Y = 30 + Math.cos(progress * Math.PI * 1.5 + 2.1) * 25
  const blob4Scale = 1 + Math.sin(progress * Math.PI * 3.2 + 1.8) * 0.12

  if (progress >= 1 && isActive) {
    onComplete()
  }

  const blobs = [
    { x: blob1X, y: blob1Y, scale: blob1Scale, color: gc[0], size: 400 },
    { x: blob2X, y: blob2Y, scale: blob2Scale, color: gc[1 % gc.length], size: 350 },
    { x: blob3X, y: blob3Y, scale: blob3Scale, color: gc[2 % gc.length], size: 380 },
    { x: blob4X, y: blob4Y, scale: blob4Scale, color: gc[0], size: 300 },
  ]

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
      {/* Gradient blobs */}
      {blobs.map((blob, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${blob.x}%`,
            top: `${blob.y}%`,
            transform: `translate(-50%, -50%) scale(${blob.scale})`,
            width: `${blob.size}px`,
            height: `${blob.size}px`,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${blob.color}35 0%, ${blob.color}15 40%, transparent 70%)`,
            filter: 'blur(60px)',
            opacity: blobFadeIn * (0.7 + i * 0.1),
            pointerEvents: 'none',
            mixBlendMode: 'screen',
          }}
        />
      ))}

      {/* Extra aurora streak */}
      <div
        style={{
          position: 'absolute',
          top: `${35 + Math.sin(progress * Math.PI * 2) * 10}%`,
          left: '10%',
          right: '10%',
          height: '200px',
          background: `linear-gradient(90deg, transparent, ${gc[0]}15, ${gc[1 % gc.length]}20, ${gc[2 % gc.length]}15, transparent)`,
          filter: 'blur(40px)',
          opacity: blobFadeIn * 0.6,
          transform: `rotate(${-5 + progress * 10}deg)`,
          pointerEvents: 'none',
        }}
      />

      {/* Noise texture overlay for grain effect */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.03,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          pointerEvents: 'none',
        }}
      />

      {/* Text content */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.25rem',
          maxWidth: '800px',
        }}
      >
        {headline && (
          <motion.h1
            style={{
              fontSize: 'clamp(2.5rem, 6vw, 5rem)',
              fontWeight: 900,
              color: textColor,
              textAlign: 'center',
              letterSpacing: '-0.04em',
              lineHeight: 1.05,
              margin: 0,
              opacity: headlineProgress,
              transform: `translateY(${(1 - headlineProgress) * 50}px) scale(${0.9 + headlineProgress * 0.1})`,
              textShadow: `0 0 60px ${gc[0]}30, 0 0 120px ${gc[1 % gc.length]}15`,
            }}
          >
            {headline}
          </motion.h1>
        )}

        {subtitle && (
          <motion.p
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.5rem)',
              fontWeight: 400,
              color: `${textColor}aa`,
              textAlign: 'center',
              lineHeight: 1.6,
              maxWidth: '600px',
              margin: 0,
              opacity: subtitleProgress,
              transform: `translateY(${(1 - subtitleProgress) * 25}px)`,
            }}
          >
            {subtitle}
          </motion.p>
        )}
      </div>

      {/* Bottom vignette */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '150px',
          background: `linear-gradient(to top, ${bg}, transparent)`,
          pointerEvents: 'none',
        }}
      />

      {/* Top vignette */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '100px',
          background: `linear-gradient(to bottom, ${bg}80, transparent)`,
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}
