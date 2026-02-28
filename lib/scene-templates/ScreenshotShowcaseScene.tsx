'use client'

import { motion } from 'framer-motion'

interface SceneProps {
  isActive: boolean
  progress: number
  onComplete: () => void
  data: Record<string, unknown>
}

interface ScreenshotShowcaseData {
  title?: string
  description?: string
  imageUrl?: string
  mockupType?: 'browser' | 'phone' | 'clean'
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

function BrowserFrame({
  imageUrl,
  frameProgress,
  accent,
  floatOffset,
}: {
  imageUrl?: string
  frameProgress: number
  accent: string
  floatOffset: number
}) {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: 'min(700px, 100%)',
        borderRadius: '12px',
        overflow: 'hidden',
        background: '#1a1f2e',
        border: `1px solid ${accent}20`,
        boxShadow: `0 25px 80px rgba(0,0,0,0.5), 0 0 40px ${accent}08`,
        transform: `perspective(1200px) rotateX(${(1 - frameProgress) * 8}deg) translateY(${floatOffset}px)`,
        transformOrigin: 'center bottom',
      }}
    >
      {/* Browser chrome */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 16px',
          background: '#161b22',
          borderBottom: '1px solid #21262d',
        }}
      >
        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f57' }} />
        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#febc2e' }} />
        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#28c840' }} />
        <div
          style={{
            flex: 1,
            height: '28px',
            borderRadius: '6px',
            background: '#0d1117',
            marginLeft: '12px',
            display: 'flex',
            alignItems: 'center',
            paddingLeft: '12px',
          }}
        >
          <span style={{ fontSize: '0.7rem', color: '#484f58', fontFamily: 'monospace' }}>
            app.example.com
          </span>
        </div>
      </div>

      {/* Content area */}
      <div style={{ aspectRatio: '16 / 10', position: 'relative', overflow: 'hidden' }}>
        {imageUrl ? (
          <img src={imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              background: `linear-gradient(180deg, #0d1117, #161b22)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: '60%',
                height: '60%',
                borderRadius: '8px',
                background: `linear-gradient(135deg, ${accent}15, ${accent}05)`,
                border: `1px dashed ${accent}25`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: `${accent}50`,
                fontSize: '0.9rem',
              }}
            >
              Screenshot
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function PhoneFrame({
  imageUrl,
  frameProgress,
  accent,
  floatOffset,
}: {
  imageUrl?: string
  frameProgress: number
  accent: string
  floatOffset: number
}) {
  return (
    <div
      style={{
        width: 'min(280px, 100%)',
        borderRadius: '36px',
        overflow: 'hidden',
        background: '#1a1f2e',
        border: `3px solid #2d333b`,
        boxShadow: `0 25px 80px rgba(0,0,0,0.5), 0 0 40px ${accent}08`,
        padding: '12px',
        transform: `perspective(1200px) rotateX(${(1 - frameProgress) * 8}deg) translateY(${floatOffset}px)`,
        transformOrigin: 'center bottom',
      }}
    >
      {/* Notch */}
      <div
        style={{
          width: '120px',
          height: '28px',
          borderRadius: '0 0 16px 16px',
          background: '#1a1f2e',
          margin: '0 auto',
          position: 'relative',
          top: '-12px',
          zIndex: 2,
        }}
      />

      {/* Screen */}
      <div
        style={{
          borderRadius: '24px',
          overflow: 'hidden',
          aspectRatio: '9 / 19',
          marginTop: '-16px',
        }}
      >
        {imageUrl ? (
          <img src={imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              background: `linear-gradient(180deg, #0d1117, #161b22)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: '60%',
                height: '40%',
                borderRadius: '8px',
                background: `linear-gradient(135deg, ${accent}15, ${accent}05)`,
                border: `1px dashed ${accent}25`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: `${accent}50`,
                fontSize: '0.8rem',
              }}
            >
              Screenshot
            </div>
          </div>
        )}
      </div>

      {/* Home indicator */}
      <div
        style={{
          width: '100px',
          height: '4px',
          borderRadius: '2px',
          background: '#2d333b',
          margin: '8px auto 4px',
        }}
      />
    </div>
  )
}

export function ScreenshotShowcaseScene({ isActive, progress, onComplete, data }: SceneProps) {
  const {
    title,
    description,
    imageUrl,
    mockupType = 'browser',
    colors,
  } = data as unknown as ScreenshotShowcaseData

  const bg = colors?.bg ?? '#0d1117'
  const textColor = colors?.text ?? '#e6edf3'
  const accent = colors?.accent ?? '#7c3aed'

  // Timing: title 0-0.25, description 0.15-0.4, frame entrance 0.2-0.7, float loop 0.7-1.0
  const titleProgress = easeOutCubic(clamp(progress / 0.25, 0, 1))
  const descProgress = easeOutCubic(clamp((progress - 0.15) / 0.25, 0, 1))
  const frameProgress = easeOutQuint(clamp((progress - 0.2) / 0.5, 0, 1))

  // Subtle float animation after frame is fully in
  const floatPhase = clamp((progress - 0.7) / 0.3, 0, 1)
  const floatOffset = floatPhase > 0 ? Math.sin(floatPhase * Math.PI * 2) * 6 : 0

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
        padding: 'clamp(1.5rem, 3vw, 2.5rem) clamp(1.5rem, 3vw, 3rem)',
        overflow: 'hidden',
        fontFamily:
          "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* Background glow under the mockup */}
      <div
        style={{
          position: 'absolute',
          top: '55%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          height: '400px',
          borderRadius: '50%',
          background: `radial-gradient(ellipse, ${accent}12 0%, transparent 70%)`,
          opacity: frameProgress,
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
            marginBottom: '0.5rem',
            opacity: titleProgress,
            transform: `translateY(${(1 - titleProgress) * 25}px)`,
          }}
        >
          {title}
        </motion.h2>
      )}

      {/* Description */}
      {description && (
        <motion.p
          style={{
            position: 'relative',
            zIndex: 1,
            fontSize: 'clamp(0.9rem, 1.5vw, 1.15rem)',
            fontWeight: 400,
            color: `${textColor}80`,
            textAlign: 'center',
            lineHeight: 1.6,
            maxWidth: '550px',
            margin: 0,
            marginBottom: '2rem',
            opacity: descProgress,
            transform: `translateY(${(1 - descProgress) * 15}px)`,
          }}
        >
          {description}
        </motion.p>
      )}

      {/* Mockup frame */}
      <motion.div
        style={{
          position: 'relative',
          zIndex: 1,
          opacity: frameProgress,
          transform: `translateY(${(1 - frameProgress) * 60}px)`,
        }}
      >
        {mockupType === 'phone' ? (
          <PhoneFrame
            imageUrl={imageUrl}
            frameProgress={frameProgress}
            accent={accent}
            floatOffset={floatOffset}
          />
        ) : mockupType === 'clean' ? (
          <div
            style={{
              maxWidth: 'min(700px, 100%)',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: `0 25px 80px rgba(0,0,0,0.5), 0 0 40px ${accent}08`,
              border: `1px solid ${accent}15`,
              transform: `perspective(1200px) rotateX(${(1 - frameProgress) * 8}deg) translateY(${floatOffset}px)`,
              transformOrigin: 'center bottom',
            }}
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt=""
                style={{ width: '100%', display: 'block', objectFit: 'cover' }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  aspectRatio: '16 / 10',
                  background: `linear-gradient(135deg, ${accent}15, ${accent}05)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: `${accent}50`,
                  fontSize: '1rem',
                }}
              >
                Screenshot
              </div>
            )}
          </div>
        ) : (
          <BrowserFrame
            imageUrl={imageUrl}
            frameProgress={frameProgress}
            accent={accent}
            floatOffset={floatOffset}
          />
        )}
      </motion.div>

      {/* Reflection effect */}
      <div
        style={{
          position: 'absolute',
          bottom: '5%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '60%',
          height: '80px',
          background: `radial-gradient(ellipse, ${accent}08 0%, transparent 70%)`,
          filter: 'blur(30px)',
          opacity: frameProgress,
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}
