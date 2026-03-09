'use client'

import { useCallback } from 'react'
import { useProjectStore } from '@/stores/project-store'
import { generateId } from '@/lib/utils'
import { useNarration } from '@/hooks/useNarration'
import { getResolvedDuration } from '@/lib/scene-utils'
import type { ChatMessage, AnimationConfig, FileTreeNode, Scene } from '@/types'

export function useAnimate() {
  const {
    messages,
    projectId,
    addMessage,
    updateMessage,
    setIsGenerating,
    setAnimationConfig,
    setProjectTitle,
    setFileTree,
    setPlayback,
    setTTSPhase,
  } = useProjectStore()

  const { generateNarration } = useNarration()

  const generate = useCallback(async (prompt: string) => {
    // Add user message
    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: prompt,
      timestamp: new Date().toISOString(),
    }
    addMessage(userMessage)

    // Add assistant placeholder
    const assistantId = generateId()
    const assistantMessage: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      isStreaming: true,
    }
    addMessage(assistantMessage)
    setIsGenerating(true)

    try {
      const allMessages = [...messages, userMessage]
      const response = await fetch('/api/animate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          messages: allMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate animation')
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response stream')

      const decoder = new TextDecoder()
      let fullContent = ''
      let animConfig: AnimationConfig | null = null

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue

            try {
              const parsed = JSON.parse(data)

              if (parsed.type === 'text') {
                fullContent += parsed.content
                updateMessage(assistantId, { content: fullContent })
              } else if (parsed.type === 'animation-config') {
                animConfig = parsed.config
              }
            } catch {
              // Skip invalid JSON chunks
            }
          }
        }
      }

      // Normalize the config (handle both old and new format)
      const rawConfig = animConfig || extractConfigFromText(fullContent)

      if (rawConfig) {
        // Set project title and file tree immediately (visible during TTS phase)
        setProjectTitle(rawConfig.title || 'Untitled Animation')
        const tree = buildFileTree(rawConfig)
        setFileTree(tree)

        updateMessage(assistantId, {
          content: fullContent,
          animationConfig: rawConfig,
          isStreaming: false,
        })

        // DO NOT start playback yet — wait for TTS
        setTTSPhase('generating')

        // Get the current project ID
        const currentProjectId = projectId || generateId()

        // BLOCKING: Generate ALL TTS and get finalized config with durations
        const finalConfig = await generateNarration(rawConfig, currentProjectId)

        // Now set the config with TTS-derived durations (preserve narration state)
        setAnimationConfig(finalConfig, { preserveNarration: true })

        // Update the message with the finalized config
        updateMessage(assistantId, {
          animationConfig: finalConfig,
        })

        // Update file tree with finalized durations
        setFileTree(buildFileTree(finalConfig))

        // NOW start playback
        setPlayback({
          isPlaying: true,
          currentTime: 0,
          totalDuration: finalConfig.totalDuration,
          currentSceneIndex: 0,
        })
      } else {
        updateMessage(assistantId, { isStreaming: false })
      }
    } catch (error) {
      console.error('Animation generation error:', error)
      updateMessage(assistantId, {
        content: 'Sorry, there was an error generating your animation. Please try again.',
        isStreaming: false,
      })
      setTTSPhase('error')
    } finally {
      setIsGenerating(false)
    }
  }, [messages, projectId, addMessage, updateMessage, setIsGenerating, setAnimationConfig, setProjectTitle, setFileTree, setPlayback, setTTSPhase, generateNarration])

  return { generate }
}

/**
 * Extract animation config from response text.
 * Strips any LLM-provided duration/delay fields since TTS sets them.
 */
function extractConfigFromText(text: string): AnimationConfig | null {
  // Try to find JSON block in the response
  const jsonMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/)
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1])
      if (parsed.scenes && Array.isArray(parsed.scenes)) {
        return normalizeConfig(parsed)
      }
    } catch {}
  }

  // Try to find raw JSON object with scenes
  const rawMatch = text.match(/\{[\s\S]*"scenes"[\s\S]*\}/)
  if (rawMatch) {
    try {
      const parsed = JSON.parse(rawMatch[0])
      if (parsed.scenes && Array.isArray(parsed.scenes)) {
        return normalizeConfig(parsed)
      }
    } catch {}
  }

  return null
}

/**
 * Normalize a parsed config.
 * Strips duration/delay/defaultDuration — TTS pass will set duration.
 */
function normalizeConfig(parsed: Record<string, unknown>): AnimationConfig {
  const scenes = (parsed.scenes as Record<string, unknown>[]).map((s) => {
    const scene = { ...s } as Record<string, unknown>

    // Clear duration, delay, defaultDuration — TTS pass will set duration
    delete scene.duration
    delete scene.defaultDuration
    scene.delay = 0

    return scene as unknown as Scene
  })

  return {
    title: (parsed.title as string) || 'Untitled Animation',
    totalDuration: 0, // Will be computed after TTS
    scenes,
    metadata: parsed.metadata as AnimationConfig['metadata'],
  }
}

function buildFileTree(config: AnimationConfig): FileTreeNode[] {
  const scenes: FileTreeNode[] = config.scenes.map((scene) => ({
    name: `${scene.template}.tsx`,
    type: 'file' as const,
    path: `scenes/${scene.template}.tsx`,
    content: generateSceneCode(scene),
    language: 'tsx',
  }))

  return [
    {
      name: 'animation.json',
      type: 'file',
      path: 'animation.json',
      content: JSON.stringify(config, null, 2),
      language: 'json',
    },
    {
      name: 'scenes',
      type: 'folder',
      path: 'scenes',
      children: scenes,
    },
  ]
}

function generateSceneCode(scene: Scene): string {
  const duration = getResolvedDuration(scene)
  return `// Scene: ${scene.id}
// Template: ${scene.template}
// Duration: ${duration}ms (set by TTS audio length)

import { motion } from 'framer-motion'

export default function ${scene.template}({ isActive, progress, data }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isActive ? 1 : 0 }}
      className="w-full h-full flex items-center justify-center"
      style={{ background: data.colors?.bg || '#0d1117' }}
    >
      ${scene.data.headline ? `<h1 className="text-4xl font-bold">${scene.data.headline}</h1>` : `{/* ${scene.template} content */}`}
    </motion.div>
  )
}
`
}
