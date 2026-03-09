'use client'

import { useRef, useCallback } from 'react'
import { useProjectStore } from '@/stores/project-store'
import { computeTotalDuration } from '@/lib/scene-utils'
import type { AnimationConfig, SceneAudio } from '@/types'

interface BatchTTSResult {
  sceneId: string
  filePath: string
  durationMs: number
  audioUrl: string
  status: 'success' | 'error'
  error?: string
}

/**
 * useNarration — Orchestrates TTS generation for all scenes.
 *
 * Every scene has narration. The flow:
 * 1. Calls POST /api/tts/generate-all with all scenes
 * 2. Receives audio durations from the server
 * 3. Sets scene.duration = audioDurationMs + paddingMs
 * 4. Sets delay = 0 on all scenes (padding is baked into duration)
 * 5. Computes totalDuration
 * 6. Returns finalized AnimationConfig
 */
export function useNarration() {
  const abortControllerRef = useRef<AbortController | null>(null)

  const generateNarration = useCallback(
    async (config: AnimationConfig, projectId: string): Promise<AnimationConfig> => {
      const store = useProjectStore.getState()
      const paddingMs = store.narration.paddingMs

      // Cancel any in-progress generation
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      const abortController = new AbortController()
      abortControllerRef.current = abortController

      store.setNarrationGenerating(true)
      store.setNarrationProgress(0)
      store.setTTSPhase('generating')

      // Initialize pending state for each scene
      for (const scene of config.scenes) {
        store.setSceneAudio(scene.id, { status: 'pending' })
      }

      try {
        // Call the batch TTS endpoint with all scenes
        const response = await fetch('/api/tts/generate-all', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId,
            voiceId: store.narration.voiceId || undefined,
            scenes: config.scenes.map((s) => ({
              id: s.id,
              narration: s.narration,
            })),
          }),
          signal: abortController.signal,
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `Batch TTS failed with status ${response.status}`)
        }

        const { results } = (await response.json()) as { results: BatchTTSResult[] }

        if (abortController.signal.aborted) {
          store.setNarrationGenerating(false)
          store.setTTSPhase('idle')
          return fallbackConfig(config)
        }

        store.setTTSPhase('measuring')

        // Build duration map from server response
        const durationMap = new Map<string, { durationMs: number; audioUrl: string; filePath: string }>()
        for (const result of results) {
          if (result.status === 'success') {
            durationMap.set(result.sceneId, {
              durationMs: result.durationMs,
              audioUrl: result.audioUrl,
              filePath: result.filePath,
            })
            store.setSceneAudio(result.sceneId, {
              audioUrl: result.audioUrl,
              audioDuration: result.durationMs,
              filePath: result.filePath,
              status: 'ready',
            })
          } else {
            store.setSceneAudio(result.sceneId, {
              status: 'error',
              error: result.error || 'TTS generation failed',
            })
          }
        }

        store.setNarrationProgress(100)
        store.setTTSPhase('finalizing')

        // Set duration on all scenes from TTS audio length
        const finalScenes = config.scenes.map((scene) => {
          const audioResult = durationMap.get(scene.id)
          if (audioResult) {
            return {
              ...scene,
              duration: audioResult.durationMs + paddingMs,
              delay: 0,
            }
          }
          // TTS failed for this scene — use fallback
          return {
            ...scene,
            duration: 5000,
            delay: 0,
          }
        })

        const totalDuration = computeTotalDuration(finalScenes)

        const finalConfig: AnimationConfig = {
          ...config,
          scenes: finalScenes,
          totalDuration,
        }

        store.setNarrationGenerating(false)
        store.setTTSPhase('ready')
        abortControllerRef.current = null

        return finalConfig
      } catch (error) {
        if ((error as Error).name === 'AbortError') {
          store.setNarrationGenerating(false)
          store.setTTSPhase('idle')
          return fallbackConfig(config)
        }

        console.error('Batch TTS generation failed:', error)
        store.setNarrationGenerating(false)
        store.setTTSPhase('error')
        abortControllerRef.current = null

        // Fallback: use 5000ms for all scenes
        return fallbackConfig(config)
      }
    },
    []
  )

  const cancelNarration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    const store = useProjectStore.getState()
    store.setNarrationGenerating(false)
    store.setTTSPhase('idle')
  }, [])

  return { generateNarration, cancelNarration }
}

/**
 * Fallback: assign 5000ms to all scenes when TTS fails or is aborted.
 */
function fallbackConfig(config: AnimationConfig): AnimationConfig {
  const fallbackScenes = config.scenes.map((scene) => ({
    ...scene,
    duration: 5000,
    delay: 0,
  }))
  return {
    ...config,
    scenes: fallbackScenes,
    totalDuration: computeTotalDuration(fallbackScenes),
  }
}
