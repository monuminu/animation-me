'use client'

import { motion } from 'framer-motion'

interface SceneProps {
  isActive: boolean
  progress: number
  onComplete: () => void
  data: Record<string, unknown>
}

interface CodeBlockData {
  title?: string
  code: string
  language?: string
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

// Simple syntax highlighting by token type
const KEYWORDS = new Set([
  'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while',
  'import', 'export', 'from', 'default', 'class', 'extends', 'new', 'this',
  'async', 'await', 'try', 'catch', 'throw', 'typeof', 'interface', 'type',
  'enum', 'implements', 'static', 'public', 'private', 'protected', 'readonly',
  'def', 'self', 'None', 'True', 'False', 'in', 'not', 'and', 'or', 'is',
  'fn', 'pub', 'mod', 'use', 'struct', 'impl', 'trait', 'where', 'mut', 'ref',
])

interface TokenSpan {
  text: string
  color: string
}

function tokenizeLine(line: string, accent: string): TokenSpan[] {
  const tokens: TokenSpan[] = []
  const defaultColor = '#e6edf3'
  const keywordColor = accent
  const stringColor = '#7ee787'
  const commentColor = '#484f58'
  const numberColor = '#79c0ff'
  const punctuationColor = '#8b949e'

  // Check for comments
  const commentIndex = line.indexOf('//')
  const hashComment = line.indexOf('#')
  const activeCommentIdx = commentIndex >= 0 ? commentIndex : hashComment

  let codePart = line
  let commentPart = ''

  if (activeCommentIdx >= 0) {
    codePart = line.substring(0, activeCommentIdx)
    commentPart = line.substring(activeCommentIdx)
  }

  // Tokenize code part
  const regex = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`|\b\d+\.?\d*\b|\b[a-zA-Z_]\w*\b|[{}()[\];,.:=<>+\-*/!&|?@#]|\s+)/g
  let match

  while ((match = regex.exec(codePart)) !== null) {
    const token = match[0]

    if (/^\s+$/.test(token)) {
      tokens.push({ text: token, color: defaultColor })
    } else if (/^["'`]/.test(token)) {
      tokens.push({ text: token, color: stringColor })
    } else if (/^\d/.test(token)) {
      tokens.push({ text: token, color: numberColor })
    } else if (KEYWORDS.has(token)) {
      tokens.push({ text: token, color: keywordColor })
    } else if (/^[{}()[\];,.:=<>+\-*/!&|?@#]$/.test(token)) {
      tokens.push({ text: token, color: punctuationColor })
    } else {
      tokens.push({ text: token, color: defaultColor })
    }
  }

  // Add comment part
  if (commentPart) {
    tokens.push({ text: commentPart, color: commentColor })
  }

  return tokens
}

export function CodeBlockScene({ isActive, progress, onComplete, data }: SceneProps) {
  const {
    title,
    code = '',
    language = 'typescript',
    colors,
  } = data as unknown as CodeBlockData

  const bg = colors?.bg ?? '#0d1117'
  const textColor = colors?.text ?? '#e6edf3'
  const accent = colors?.accent ?? '#7c3aed'

  const lines = code.split('\n')
  const totalChars = code.length
  const titleProgress = easeOutCubic(clamp(progress / 0.15, 0, 1))

  // Frame slides in: 0.05-0.25, typing: 0.15-0.9, cursor blink: 0.9-1.0
  const frameProgress = easeOutCubic(clamp((progress - 0.05) / 0.2, 0, 1))
  const typingProgress = clamp((progress - 0.15) / 0.75, 0, 1)
  const charsToShow = Math.floor(typingProgress * totalChars)

  // Cursor blink
  const cursorPhase = progress > 0.15 ? Math.sin(progress * Math.PI * 12) : 0
  const showCursor = cursorPhase > 0 && progress < 0.95

  if (progress >= 1 && isActive) {
    onComplete()
  }

  // Build visible lines with character limit
  let charCount = 0
  const visibleLines: { lineNum: number; tokens: TokenSpan[]; cursorHere: boolean }[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineStartChar = charCount
    charCount += line.length + 1 // +1 for newline

    if (lineStartChar > charsToShow) break

    const fullTokens = tokenizeLine(line, accent)
    const charsAvailable = charsToShow - lineStartChar

    if (charsAvailable >= line.length) {
      visibleLines.push({ lineNum: i + 1, tokens: fullTokens, cursorHere: false })
    } else {
      // Partial line - truncate tokens
      let remaining = charsAvailable
      const partialTokens: TokenSpan[] = []
      for (const token of fullTokens) {
        if (remaining <= 0) break
        if (token.text.length <= remaining) {
          partialTokens.push(token)
          remaining -= token.text.length
        } else {
          partialTokens.push({ text: token.text.substring(0, remaining), color: token.color })
          remaining = 0
        }
      }
      visibleLines.push({ lineNum: i + 1, tokens: partialTokens, cursorHere: true })
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
        padding: '2.5rem 3rem',
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
          width: '600px',
          height: '400px',
          borderRadius: '50%',
          background: `radial-gradient(ellipse, ${accent}08 0%, transparent 70%)`,
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
            fontSize: 'clamp(1.3rem, 2.5vw, 2rem)',
            fontWeight: 800,
            color: textColor,
            textAlign: 'center',
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
            margin: 0,
            marginBottom: '1.5rem',
            opacity: titleProgress,
            transform: `translateY(${(1 - titleProgress) * 20}px)`,
          }}
        >
          {title}
        </motion.h2>
      )}

      {/* Code editor frame */}
      <motion.div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: '750px',
          borderRadius: '12px',
          overflow: 'hidden',
          background: '#161b22',
          border: `1px solid ${accent}15`,
          boxShadow: `0 20px 60px rgba(0,0,0,0.4), 0 0 30px ${accent}06`,
          opacity: frameProgress,
          transform: `translateY(${(1 - frameProgress) * 30}px) scale(${0.95 + frameProgress * 0.05})`,
        }}
      >
        {/* Terminal header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 16px',
            background: '#0d1117',
            borderBottom: '1px solid #21262d',
          }}
        >
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f57' }} />
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#febc2e' }} />
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#28c840' }} />
          <span
            style={{
              marginLeft: '12px',
              fontSize: '0.75rem',
              color: '#484f58',
              fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
            }}
          >
            {language}
          </span>
        </div>

        {/* Code content */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
            fontSize: 'clamp(0.7rem, 1vw, 0.85rem)',
            lineHeight: 1.8,
            minHeight: '200px',
            maxHeight: '380px',
            overflowY: 'hidden',
          }}
        >
          {visibleLines.map((vl) => (
            <div
              key={vl.lineNum}
              style={{
                display: 'flex',
                whiteSpace: 'pre',
              }}
            >
              {/* Line number */}
              <span
                style={{
                  color: '#484f58',
                  minWidth: '2.5em',
                  textAlign: 'right',
                  marginRight: '1.5em',
                  userSelect: 'none',
                  flexShrink: 0,
                }}
              >
                {vl.lineNum}
              </span>

              {/* Code tokens */}
              <span>
                {vl.tokens.map((token, ti) => (
                  <span key={ti} style={{ color: token.color }}>
                    {token.text}
                  </span>
                ))}
                {/* Cursor */}
                {vl.cursorHere && showCursor && (
                  <span
                    style={{
                      display: 'inline-block',
                      width: '2px',
                      height: '1.1em',
                      background: accent,
                      verticalAlign: 'text-bottom',
                      boxShadow: `0 0 6px ${accent}80`,
                    }}
                  />
                )}
              </span>
            </div>
          ))}

          {/* Cursor on last visible line if not partial */}
          {visibleLines.length > 0 &&
            !visibleLines[visibleLines.length - 1].cursorHere &&
            showCursor && (
              <div style={{ display: 'flex', whiteSpace: 'pre' }}>
                <span style={{ minWidth: '2.5em', marginRight: '1.5em' }} />
                <span
                  style={{
                    display: 'inline-block',
                    width: '2px',
                    height: '1.1em',
                    background: accent,
                    verticalAlign: 'text-bottom',
                    boxShadow: `0 0 6px ${accent}80`,
                  }}
                />
              </div>
            )}
        </div>
      </motion.div>
    </div>
  )
}
