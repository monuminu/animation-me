import Anthropic from '@anthropic-ai/sdk'
import { loadSkills } from './skills'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

const TEMPLATE_SCHEMAS = `
## Available Scene Templates

You MUST output a valid JSON animation config using ONLY these template names. Each scene has a "template" key and a "data" object matching the schema below.

### 1. TextRevealScene
data: { headline: string, subtitle?: string, style?: "word-by-word" | "typewriter" | "fade-up", colors?: { bg: string, text: string, accent: string } }

### 2. HeroScene
data: { headline: string, subheadline?: string, cta?: string, colors?: { bg: string, text: string, accent: string } }

### 3. FeatureGridScene
data: { title?: string, features: [{ title: string, description?: string, icon?: string }], colors?: { bg: string, text: string, accent: string, cardBg?: string } }

### 4. CTAScene
data: { headline: string, subtext?: string, buttonText?: string, colors?: { bg: string, text: string, accent: string, gradientFrom?: string, gradientTo?: string } }

### 5. LogoRevealScene
data: { brandName: string, tagline?: string, logoUrl?: string, colors?: { bg: string, text: string, accent: string } }

### 6. SplitScreenScene
data: { headline: string, description?: string, imageUrl?: string, direction?: "left-text" | "right-text", colors?: { bg: string, text: string, accent: string } }

### 7. StatsScene
data: { title?: string, stats: [{ value: number, label: string, prefix?: string, suffix?: string }], colors?: { bg: string, text: string, accent: string } }

### 8. TestimonialScene
data: { quote: string, author: string, role?: string, company?: string, colors?: { bg: string, text: string, accent: string } }

### 9. TimelineScene
data: { title?: string, milestones: [{ year?: string, title: string, description?: string }], colors?: { bg: string, text: string, accent: string } }

### 10. ScreenshotShowcaseScene
data: { title?: string, description?: string, imageUrl?: string, mockupType?: "browser" | "phone" | "clean", colors?: { bg: string, text: string, accent: string } }

### 11. ComparisonScene
data: { title?: string, before: { label: string, items: string[] }, after: { label: string, items: string[] }, colors?: { bg: string, text: string, accent: string } }

### 12. CodeBlockScene
data: { title?: string, code: string, language?: string, colors?: { bg: string, text: string, accent: string } }

### 13. GradientBackgroundScene
data: { headline?: string, subtitle?: string, gradientColors?: string[], colors?: { bg: string, text: string } }

### 14. LogoGridScene
data: { title?: string, logos: [{ name: string, logoUrl?: string }], colors?: { bg: string, text: string, accent: string } }

### 15. PricingTableScene
data: { title?: string, plans: [{ name: string, price: string, period?: string, features: string[], highlighted?: boolean }], colors?: { bg: string, text: string, accent: string } }
`

function buildSystemPrompt(): string {
  // Load available skills
  const skillContent = loadSkills([
    'scene-builder',
    'motion-style',
    'typography',
    'color-palette',
    'transitions',
    'visual-analysis',
  ])

  return `You are the animation engine for animation.me — a text-to-animation platform. Your job is to convert natural language descriptions into structured animation configs.

## How You Work

When a user describes an animation they want, you:
1. Analyze what type of animation they want (product launch, logo reveal, demo, etc.)
2. Choose the best scene templates and sequence them into a compelling animation
3. Output a brief description of what you're creating, followed by the animation config JSON

## Output Format

You MUST always respond with:
1. A brief (2-3 sentence) description of the animation you're creating
2. Then the animation config in a JSON code block

The JSON config format:
\`\`\`json
{
  "title": "Animation Title",
  "totalDuration": 20000,
  "scenes": [
    {
      "id": "unique-scene-id",
      "template": "TemplateName",
      "duration": 4000,
      "data": { ... }
    }
  ]
}
\`\`\`

${TEMPLATE_SCHEMAS}

## Rules

1. **Always output valid JSON** in a code block — this is parsed by the frontend
2. **Use variety** — don't repeat the same template twice in a row unless it makes sense
3. **Cinematic pacing** — start with a strong intro (LogoRevealScene or TextRevealScene), build through features/content, end with a CTA or tagline
4. **Dark by default** — use dark backgrounds (#0d1117, #0f172a, #1a1a2e) with vibrant accent colors
5. **Realistic durations** — short videos: 10-15s, standard: 20-30s, detailed: 40-60s
6. **Scene durations**: intro 3-5s, content scenes 4-6s, CTA 3-4s
7. **totalDuration** MUST equal the sum of all scene durations
8. **Color consistency** — use the same color palette across all scenes
9. **Content quality** — write compelling, realistic copy for headlines and descriptions
10. **3-7 scenes** is the sweet spot for most animations

## Iteration

When the user asks to modify an existing animation:
- Keep the overall structure unless they ask to change it
- Only modify the specific scenes or properties they mention
- Output the FULL updated config (not just the changed parts)

${skillContent ? `\n## Skill Reference\n\n${skillContent}` : ''}
`
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export async function* streamAnimation(
  prompt: string,
  messageHistory: ChatMessage[]
): AsyncGenerator<{ type: 'text' | 'animation-config'; content?: string; config?: Record<string, unknown> }> {
  const systemPrompt = buildSystemPrompt()

  const messages: Anthropic.MessageParam[] = [
    ...messageHistory.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user', content: prompt },
  ]

  const stream = anthropic.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: systemPrompt,
    messages,
  })

  let fullText = ''

  for await (const event of stream) {
    if (event.type === 'content_block_delta') {
      const delta = event.delta
      if ('text' in delta) {
        fullText += delta.text
        yield { type: 'text', content: delta.text }
      }
    }
  }

  // After streaming, try to extract the animation config from the full text
  const jsonMatch = fullText.match(/```(?:json|animation-config)?\s*\n([\s\S]*?)\n```/)
  if (jsonMatch) {
    try {
      const config = JSON.parse(jsonMatch[1])
      if (config.scenes && Array.isArray(config.scenes)) {
        yield { type: 'animation-config', config }
      }
    } catch {
      // Failed to parse JSON
    }
  }
}

export { anthropic, buildSystemPrompt }
