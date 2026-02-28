'use client'

import { useCallback } from 'react'
import { useProjectStore } from '@/stores/project-store'
import { generateId } from '@/lib/utils'
import type { ChatMessage, AnimationConfig, FileTreeNode } from '@/types'

export function useAnimate() {
  const {
    messages,
    addMessage,
    updateMessage,
    setIsGenerating,
    setAnimationConfig,
    setProjectTitle,
    setFileTree,
    setPlayback,
  } = useProjectStore()

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

      // Process the animation config
      if (animConfig) {
        setAnimationConfig(animConfig)
        setProjectTitle(animConfig.title || 'Untitled Animation')
        updateMessage(assistantId, {
          content: fullContent,
          animationConfig: animConfig,
          isStreaming: false,
        })

        // Build file tree from config
        const tree = buildFileTree(animConfig)
        setFileTree(tree)

        // Start playback
        setPlayback({
          isPlaying: true,
          currentTime: 0,
          totalDuration: animConfig.totalDuration,
          currentSceneIndex: 0,
        })
      } else {
        // Try to parse config from the response text
        const extracted = extractConfigFromText(fullContent)
        if (extracted) {
          setAnimationConfig(extracted)
          setProjectTitle(extracted.title || 'Untitled Animation')
          updateMessage(assistantId, {
            content: fullContent,
            animationConfig: extracted,
            isStreaming: false,
          })
          const tree = buildFileTree(extracted)
          setFileTree(tree)
          setPlayback({
            isPlaying: true,
            currentTime: 0,
            totalDuration: extracted.totalDuration,
            currentSceneIndex: 0,
          })
        } else {
          updateMessage(assistantId, { isStreaming: false })
        }
      }
    } catch (error) {
      console.error('Animation generation error:', error)
      updateMessage(assistantId, {
        content: 'Sorry, there was an error generating your animation. Please try again.',
        isStreaming: false,
      })
    } finally {
      setIsGenerating(false)
    }
  }, [messages, addMessage, updateMessage, setIsGenerating, setAnimationConfig, setProjectTitle, setFileTree, setPlayback])

  return { generate }
}

function extractConfigFromText(text: string): AnimationConfig | null {
  // Try to find JSON block in the response
  const jsonMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/)
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1])
      if (parsed.scenes && Array.isArray(parsed.scenes)) {
        return parsed as AnimationConfig
      }
    } catch {}
  }

  // Try to find raw JSON object with scenes
  const rawMatch = text.match(/\{[\s\S]*"scenes"[\s\S]*\}/)
  if (rawMatch) {
    try {
      const parsed = JSON.parse(rawMatch[0])
      if (parsed.scenes && Array.isArray(parsed.scenes)) {
        return parsed as AnimationConfig
      }
    } catch {}
  }

  return null
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

function generateSceneCode(scene: { id: string; template: string; duration: number; data: Record<string, unknown> }): string {
  return `// Scene: ${scene.id}
// Template: ${scene.template}
// Duration: ${scene.duration}ms

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
