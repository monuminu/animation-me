# Skill: Typography

Use this skill when generating text-heavy animation scenes.

## Text Animation Patterns

### Word-by-Word Reveal
- Split headline into words
- Each word fades in and slides up (translateY: 10px → 0)
- Stagger: 60–100ms per word
- Best for: Headlines, brand statements, hero text

### Typewriter
- Characters appear one at a time
- Speed: 30–60ms per character
- Include blinking cursor (accent color)
- Best for: Code blocks, technical content, taglines

### Fade-Up
- Entire line fades in while sliding up
- Duration: 400–600ms per line
- Stagger between lines: 150–200ms
- Best for: Descriptions, body text, quotes

### Gradient Text
- Text with animated gradient background
- Use `background-clip: text` with `text-transparent`
- Gradient shifts position based on progress
- Best for: Headlines, CTAs, brand names

## Font Pairing
- **Headlines**: Bold (700–900 weight), tight letter-spacing (-0.02em to -0.04em)
- **Body text**: Regular (400 weight), normal letter-spacing
- **Labels/meta**: Medium (500 weight), wide letter-spacing (0.05em), uppercase, smaller size

## Size Guidelines (for animation canvas)
- Hero headline: 3–4rem (48–64px)
- Section title: 2–2.5rem (32–40px)
- Body text: 1–1.125rem (16–18px)
- Caption/label: 0.75–0.875rem (12–14px)

## Rules
- Never animate more than 2 text elements simultaneously
- Headlines should be concise — 3-7 words maximum
- Subtitles should be 1-2 lines maximum
- Use accent color for emphasis words, not entire sentences
- Ensure sufficient contrast: light text on dark backgrounds
