import type { AnimationConfig } from '@/types'

/**
 * Parse Claude's response to extract description text and animation config JSON
 */
export function parseAnimationResponse(text: string): {
  description: string
  config: AnimationConfig | null
} {
  // Try to find the animation-config JSON block (```json or ```animation-config)
  const jsonBlockRegex = /```(?:json|animation-config)?\s*\n([\s\S]*?)\n```/g
  let match
  let config: AnimationConfig | null = null
  let description = text

  while ((match = jsonBlockRegex.exec(text)) !== null) {
    try {
      const parsed = JSON.parse(match[1])
      if (parsed.scenes && Array.isArray(parsed.scenes)) {
        config = validateConfig(parsed)
        // Remove the JSON block from the description
        description = text.replace(match[0], '').trim()
        break
      }
    } catch {
      // Not valid JSON, continue searching
    }
  }

  // If no code block found, try to find raw JSON with scenes array
  if (!config) {
    const rawJsonRegex = /\{[\s\S]*?"scenes"\s*:\s*\[[\s\S]*?\]\s*\}/g
    while ((match = rawJsonRegex.exec(text)) !== null) {
      try {
        const parsed = JSON.parse(match[0])
        if (parsed.scenes && Array.isArray(parsed.scenes)) {
          config = validateConfig(parsed)
          description = text.replace(match[0], '').trim()
          break
        }
      } catch {
        // Continue searching
      }
    }
  }

  // Clean up description
  description = description
    .replace(/^[\s\n]+/, '')
    .replace(/[\s\n]+$/, '')
    .replace(/\n{3,}/g, '\n\n')

  return { description, config }
}

function validateConfig(raw: Record<string, unknown>): AnimationConfig {
  const scenes = (raw.scenes as Array<Record<string, unknown>>).map((scene, index) => ({
    id: (scene.id as string) || `scene-${index}`,
    template: (scene.template as string) || 'TextRevealScene',
    duration: (scene.duration as number) || 6000,
    data: (scene.data as Record<string, unknown>) || {},
    transition: scene.transition as { type: 'fade' | 'slide' | 'wipe' | 'morph' | 'none'; duration?: number } | undefined,
  }))

  const totalDuration = (raw.totalDuration as number) || scenes.reduce((sum, s) => sum + s.duration, 0)

  return {
    title: (raw.title as string) || 'Untitled Animation',
    totalDuration,
    scenes,
    metadata: {
      prompt: '',
      model: 'claude-sonnet-4-20250514',
      generatedAt: new Date().toISOString(),
    },
  }
}
