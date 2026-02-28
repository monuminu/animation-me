'use client'

import { motion } from 'framer-motion'

interface SceneProps {
  isActive: boolean
  progress: number
  onComplete: () => void
  data: Record<string, unknown>
}

interface PricingPlan {
  name: string
  price: string
  period?: string
  features: string[]
  highlighted?: boolean
}

interface PricingTableData {
  title?: string
  plans: PricingPlan[]
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

function springInterpolation(t: number) {
  if (t <= 0) return 0
  if (t >= 1) return 1
  const decay = Math.exp(-6 * t)
  return 1 - decay * Math.cos(12 * t * Math.PI * 0.15)
}

function PricingCard({
  plan,
  cardProgress,
  featuresBaseDelay,
  progress,
  textColor,
  accent,
}: {
  plan: PricingPlan
  cardProgress: number
  featuresBaseDelay: number
  progress: number
  textColor: string
  accent: string
}) {
  const eased = plan.highlighted
    ? springInterpolation(cardProgress)
    : easeOutCubic(cardProgress)

  const isHighlighted = plan.highlighted ?? false
  const cardBg = isHighlighted ? '#1a1a2e' : '#161b22'
  const totalFeatures = plan.features.length

  return (
    <motion.div
      style={{
        flex: 1,
        minWidth: 'min(220px, 100%)',
        maxWidth: '320px',
        background: cardBg,
        borderRadius: '16px',
        padding: '2rem 1.75rem',
        border: isHighlighted
          ? `2px solid ${accent}60`
          : '1px solid #21262d',
        boxShadow: isHighlighted
          ? `0 0 40px ${accent}20, 0 20px 60px rgba(0,0,0,0.3)`
          : '0 10px 40px rgba(0,0,0,0.2)',
        opacity: eased,
        transform: `translateY(${(1 - eased) * 50}px) scale(${isHighlighted ? 0.9 + eased * 0.1 : 0.95 + eased * 0.05})`,
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Highlighted glow effect */}
      {isHighlighted && (
        <>
          <div
            style={{
              position: 'absolute',
              top: '-1px',
              left: '-1px',
              right: '-1px',
              height: '3px',
              background: `linear-gradient(90deg, ${accent}80, ${accent}, ${accent}80)`,
              borderRadius: '16px 16px 0 0',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '200px',
              height: '120px',
              borderRadius: '50%',
              background: `radial-gradient(ellipse, ${accent}15, transparent 70%)`,
              filter: 'blur(30px)',
              pointerEvents: 'none',
            }}
          />
        </>
      )}

      {/* Popular badge */}
      {isHighlighted && (
        <div
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
            color: '#ffffff',
            fontSize: '0.65rem',
            fontWeight: 700,
            padding: '0.25rem 0.6rem',
            borderRadius: '100px',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          Popular
        </div>
      )}

      {/* Plan name */}
      <div>
        <h3
          style={{
            fontSize: '1.1rem',
            fontWeight: 700,
            color: isHighlighted ? accent : `${textColor}cc`,
            margin: 0,
            letterSpacing: '-0.01em',
            textTransform: 'uppercase',
            lineHeight: 1.3,
          }}
        >
          {plan.name}
        </h3>
      </div>

      {/* Price */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
        <span
          style={{
            fontSize: 'clamp(2rem, 3.5vw, 3rem)',
            fontWeight: 800,
            color: textColor,
            letterSpacing: '-0.03em',
            lineHeight: 1,
          }}
        >
          {plan.price}
        </span>
        {plan.period && (
          <span
            style={{
              fontSize: '0.9rem',
              fontWeight: 400,
              color: `${textColor}50`,
            }}
          >
            /{plan.period}
          </span>
        )}
      </div>

      {/* Divider */}
      <div
        style={{
          width: '100%',
          height: '1px',
          background: isHighlighted
            ? `linear-gradient(90deg, transparent, ${accent}30, transparent)`
            : '#21262d',
        }}
      />

      {/* Features */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
        {plan.features.map((feature, i) => {
          const featureDelay = featuresBaseDelay + (i / totalFeatures) * 0.15
          const featureProgress = easeOutCubic(clamp((progress - featureDelay) / 0.1, 0, 1))

          return (
            <motion.div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                opacity: featureProgress,
                transform: `translateX(${(1 - featureProgress) * 15}px)`,
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke={isHighlighted ? accent : '#3fb950'}
                strokeWidth="2.5"
                strokeLinecap="round"
                style={{ flexShrink: 0 }}
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
              <span
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 400,
                  color: `${textColor}90`,
                  lineHeight: 1.4,
                }}
              >
                {feature}
              </span>
            </motion.div>
          )
        })}
      </div>

      {/* CTA button */}
      <div
        style={{
          marginTop: 'auto',
          paddingTop: '0.5rem',
        }}
      >
        <div
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: '10px',
            background: isHighlighted
              ? `linear-gradient(135deg, ${accent}, ${accent}cc)`
              : 'transparent',
            border: isHighlighted ? 'none' : `1px solid #30363d`,
            color: isHighlighted ? '#ffffff' : `${textColor}90`,
            fontSize: '0.9rem',
            fontWeight: 600,
            textAlign: 'center',
            cursor: 'pointer',
            boxShadow: isHighlighted ? `0 4px 15px ${accent}30` : 'none',
          }}
        >
          Get Started
        </div>
      </div>
    </motion.div>
  )
}

export function PricingTableScene({ isActive, progress, onComplete, data }: SceneProps) {
  const {
    title,
    plans = [],
    colors,
  } = data as unknown as PricingTableData

  const bg = colors?.bg ?? '#0d1117'
  const textColor = colors?.text ?? '#e6edf3'
  const accent = colors?.accent ?? '#7c3aed'

  // Title: 0-0.2, cards stagger: 0.1-0.65, features: 0.4-0.85
  const titleProgress = easeOutCubic(clamp(progress / 0.2, 0, 1))
  const totalPlans = plans.length

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
        padding: 'clamp(1.5rem, 3vw, 2.5rem) clamp(1rem, 3vw, 3rem)',
        overflow: 'hidden',
        fontFamily:
          "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* Background glow for highlighted plan */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: `radial-gradient(ellipse, ${accent}08 0%, transparent 70%)`,
          filter: 'blur(80px)',
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

      {/* Pricing cards row */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          alignItems: 'stretch',
          justifyContent: 'center',
          gap: '1.25rem',
          maxWidth: '1000px',
          width: '100%',
          flexWrap: 'wrap',
        }}
      >
        {plans.map((plan, i) => {
          const cardDelay = 0.1 + (i / totalPlans) * 0.4
          const cardProgress = clamp((progress - cardDelay) / 0.25, 0, 1)
          const featuresBaseDelay = cardDelay + 0.2

          return (
            <PricingCard
              key={i}
              plan={plan}
              cardProgress={cardProgress}
              featuresBaseDelay={featuresBaseDelay}
              progress={progress}
              textColor={textColor}
              accent={accent}
            />
          )
        })}
      </div>
    </div>
  )
}
