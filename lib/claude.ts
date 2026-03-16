import AnthropicFoundry from '@anthropic-ai/foundry-sdk'
import type Anthropic from '@anthropic-ai/sdk'
import { loadSkills } from './skills'

// Lazy-init: avoid instantiating at module scope so the build doesn't
// crash when ANTHROPIC_FOUNDRY_API_KEY is not set (CI / SWA deploy).
let _anthropic: AnthropicFoundry | null = null
function getClient(): AnthropicFoundry {
  if (!_anthropic) {
    _anthropic = new AnthropicFoundry({
      apiKey: process.env.ANTHROPIC_FOUNDRY_API_KEY || '',
      baseURL: process.env.ANTHROPIC_FOUNDRY_BASE_URL || '',
    })
  }
  return _anthropic
}

const TEMPLATE_SCHEMAS = `
## Available Scene Templates

You MUST output a valid JSON animation config using ONLY these template names. Each scene has a "template" key, a "data" object matching the schema below, and an optional "transition" object.

### 1. TextRevealScene
data: { headline: string, subtitle?: string, style?: "word-by-word" | "typewriter" | "fade-up", colors?: { bg: string, text: string, accent: string } }

### 2. HeroScene
data: { headline: string, subheadline?: string, cta?: string, colors?: { bg: string, text: string, accent: string } }

### 3. CTAScene
data: { headline: string, subtext?: string, buttonText?: string, colors?: { bg: string, text: string, accent: string, gradientFrom?: string, gradientTo?: string } }

### 4. LogoRevealScene
data: { brandName: string, tagline?: string, logoUrl?: string, colors?: { bg: string, text: string, accent: string } }

### 5. SplitScreenScene
data: { headline: string, description?: string, imageUrl?: string, direction?: "left-text" | "right-text", colors?: { bg: string, text: string, accent: string } }

### 6. StatsScene
data: { title?: string, stats: [{ value: number, label: string, prefix?: string, suffix?: string }], colors?: { bg: string, text: string, accent: string } }

### 7. TestimonialScene
data: { quote: string, author: string, role?: string, company?: string, colors?: { bg: string, text: string, accent: string } }

### 8. TimelineScene
data: { title?: string, milestones: [{ year?: string, title: string, description?: string }], colors?: { bg: string, text: string, accent: string } }

### 9. ScreenshotShowcaseScene
data: { title?: string, description?: string, imageUrl?: string, mockupType?: "browser" | "phone" | "clean", colors?: { bg: string, text: string, accent: string } }

### 10. ComparisonScene
data: { title?: string, before: { label: string, items: string[] }, after: { label: string, items: string[] }, colors?: { bg: string, text: string, accent: string } }

### 11. CodeBlockScene
data: { title?: string, code: string, language?: string, colors?: { bg: string, text: string, accent: string } }

### 12. GradientBackgroundScene
data: { headline?: string, subtitle?: string, gradientColors?: string[], colors?: { bg: string, text: string } }

### 13. LogoGridScene
data: { title?: string, logos: [{ name: string, logoUrl?: string }], colors?: { bg: string, text: string, accent: string } }

### 14. PricingTableScene
data: { title?: string, plans: [{ name: string, price: string, period?: string, features: string[], highlighted?: boolean }], colors?: { bg: string, text: string, accent: string } }

### 15. FeatureGridScene
data: { title?: string, features: [{ title: string, description?: string, icon?: string }], colors?: { bg: string, text: string, accent: string, cardBg?: string } } (Features can be maximum 4)

## Scene Transitions

Each scene can include an optional "transition" property that controls how it transitions to the NEXT scene. If omitted, a simple fade is used.

\`\`\`
"transition": { "type": "fadeBlur", "duration": 500 }
\`\`\`

### Available Transition Types

| Type | Effect | Default Duration | Best For |
|------|--------|-----------------|----------|
| \`none\` | Instant cut | 0ms | Music-driven cuts, same visual style continues |
| \`fade\` | Simple opacity crossfade | 300ms | Safe default, thematically different scenes |
| \`fadeBlur\` | Fade + blur | 400ms | Dreamy, cinematic feel |
| \`scaleFade\` | Scale + fade | 400ms | Zoom-style transitions |
| \`slideLeft\` | Next slides in from right | 500ms | Sequential content, timeline progression |
| \`slideRight\` | Next slides in from left | 500ms | Going back, reverse progression |
| \`slideUp\` | Next slides in from bottom | 500ms | Revealing content below, upward energy |
| \`slideDown\` | Next slides in from top | 500ms | Dropdown reveals |
| \`wipe\` | Left-to-right clip-path reveal | 600ms | Dramatic reveals, before/after |
| \`zoomThrough\` | Current zooms in, next scales up | 500ms | Diving deeper into content |
| \`crossDissolve\` | Extended overlap dissolve | 500ms | Smooth mood shifts |
| \`clipCircle\` | Radial circle reveal from center | 600ms | Spotlight reveals, dramatic moments |
| \`perspectiveFlip\` | 3D card flip | 600ms | Playful, comparing two sides |
| \`morphExpand\` | Scale from center point | 500ms | Expanding content, zoom into detail |
| \`splitHorizontal\` | Horizontal curtain open | 500ms | Theatrical reveals |
| \`splitVertical\` | Vertical curtain | 500ms | Theatrical reveals |
| \`pushLeft\` | Both scenes push together left | 500ms | Strong directional flow |
| \`pushRight\` | Both scenes push together right | 500ms | Strong directional flow |

### Transition Best Practices

- **The first scene should NOT have a transition** (it's the starting state)
- **Use 1-2 transition types max** per animation for consistency
- **fade is always safe** — use it when in doubt
- **fadeBlur** is great for cinematic/premium feel
- **slideLeft** works well for sequential content (features, timeline)
- **wipe** is perfect for before/after comparisons
- **clipCircle** creates dramatic focal reveals — use sparingly
- **Transition duration** should be 10-15% of the shorter scene's duration
- **Never exceed 800ms** for transitions

## Scene Narration (Voiceover)

Every scene MUST include a \`"narration"\` property — a short voiceover script that will be converted to speech via TTS and played during the scene. The scene's duration is determined entirely by the narration audio length.

\`\`\`
"narration": "Building great products shouldn't mean wrestling with infrastructure."
\`\`\`

### Narration Guidelines

- **Every scene MUST have narration** — including LogoRevealScene, TestimonialScene, CodeBlockScene, and the intro scene. No exceptions.
- **1–3 sentences** per scene — write narration naturally; scene timing is derived from audio length automatically
- **Complement on-screen text** — don't just repeat the headline; add context, explain why
- **Active voice, present tense, conversational tone**
- **Bridge between scenes** — each narration should flow naturally from the previous one
- Write narration that feels complete and well-paced — the system will measure the TTS audio and set scene duration to match
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
    'narration',
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
  "scenes": [
    {
      "id": "unique-scene-id",
      "template": "TemplateName",
      "narration": "Voiceover script for this scene.",
      "data": { ... },
      "transition": { "type": "fade", "duration": 400 }
    }
  ]
}
\`\`\`

**Note:** The "transition" on each scene controls how it transitions to the NEXT scene. The first scene typically has no transition. Every scene MUST have a "narration" field — the system converts it to TTS audio and sets the scene duration to match the audio length. Do NOT include "duration", "delay", or "totalDuration" — those are computed by the system after TTS generation. See the sections below for details.

${TEMPLATE_SCHEMAS}

## Rules

1. **Always output valid JSON** in a code block — this is parsed by the frontend
2. **Use variety** — don't repeat the same template twice in a row unless it makes sense
3. **Cinematic pacing** — start with a strong intro (LogoRevealScene or TextRevealScene), build through features/content, end with a CTA or tagline
4. **Dark by default** — use dark backgrounds (#0d1117, #0f172a, #1a1a2e) with vibrant accent colors
5. **Do NOT output** \`duration\`, \`delay\`, \`defaultDuration\`, or \`totalDuration\` — those are system-computed after TTS generation
6. **Color consistency** — use the same color palette across all scenes
7. **Content quality** — write compelling, realistic copy for headlines and descriptions
8. **3-7 scenes** is the sweet spot for most animations
9. **Narration is REQUIRED** — every scene MUST include a \`narration\` field with a voiceover script. No scene should be without narration. Write naturally and conversationally, complement the on-screen text rather than repeating it. The system measures the TTS audio and sets each scene's duration to match.

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

  const stream = getClient().messages.stream({
    model: process.env.ANTHROPIC_FOUNDRY_DEPLOYMENT || 'claude-sonnet-4-6',
    max_tokens: 32000,
    // thinking: {
    //     "type": "adaptive"
    // },
    system: systemPrompt,
    messages 
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
  const message = await stream.finalMessage();
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

export { getClient as anthropic, buildSystemPrompt }
